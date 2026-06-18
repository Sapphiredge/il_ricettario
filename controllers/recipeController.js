'use strict';

const Recipe = require('../models/recipeDAO');
const User = require('../models/userDAO');

// Limiti massimi per ricetta
const MAX_INGREDIENTI = 15;
const MAX_PASSAGGI = 10;
const MAX_CHARS_QUANTITA = 6;
const MAX_CHARS_NOME_ING = 30;
const MAX_CHARS_PASSAGGIO = 500;

// Helper - parse ingredienti e istruzioni dal corpo della richiesta
function parseCorpoRicetta(body) {
    const quantitaIngredienti = [].concat(body.ingredient_amounts || []);
    const nomiIngredienti = [].concat(body.ingredient_names || []);

    if (quantitaIngredienti.length !== nomiIngredienti.length) {
        return { error: 'Dati degli ingredienti non validi: il numero di nomi e quantità non coincide.' };
    }

    const ingredients = nomiIngredienti.reduce((acc, nome, i) => {
        if (nome?.trim()) {
            acc.push({ amount: (quantitaIngredienti[i] || '').trim(), name: nome.trim() });
        }
        return acc;
    }, []);

    if (ingredients.length > MAX_INGREDIENTI) {
        return { error: `Puoi inserire al massimo ${MAX_INGREDIENTI} ingredienti.` };
    }

    for (const ing of ingredients) {
        if (ing.amount.length > MAX_CHARS_QUANTITA) {
            return { error: `La quantità di un ingrediente non può superare ${MAX_CHARS_QUANTITA} caratteri.` };
        }
        if (ing.name.length > MAX_CHARS_NOME_ING) {
            return { error: `Il nome di un ingrediente non può superare ${MAX_CHARS_NOME_ING} caratteri.` };
        }
    }

    const instructions = [].concat(body.instruction_descriptions || []).filter(p => p?.trim());

    if (instructions.length > MAX_PASSAGGI) {
        return { error: `Puoi inserire al massimo ${MAX_PASSAGGI} passaggi.` };
    }

    for (const testo of instructions) {
        if (testo.length > MAX_CHARS_PASSAGGIO) {
            return { error: `Ogni passaggio non può superare ${MAX_CHARS_PASSAGGIO} caratteri.` };
        }
    }

    return { ingredients, instructions };
}

// GET /ricette/:id - pagina di una ricetta
exports.getPaginaRicetta = async (req, res) => {
    try {
        const idRicetta = req.params.id;
        const ricetta = await Recipe.trovaRicettaPerId(idRicetta);

        if (!ricetta) {
            return res.status(404).render('recipe', { error: 'Ricetta non trovata.', recipe: null, user: req.user, reviews: [], raccolte: [] });
        }

        const [ricettaSalvata, recensioni, raccolte] = await Promise.all([
            req.user ? User.ricettaInQualcheRaccolta(req.user.id, idRicetta) : false,
            Recipe.getRecensioni(idRicetta),
            req.user ? User.getRaccoltePerRicetta(req.user.id, idRicetta) : []
        ]);

        return res.render('recipe', { recipe: ricetta, ricettaSalvata, reviews: recensioni, user: req.user, raccolte });
    } catch (err) {
        console.error('Errore durante il recupero della ricetta:', err);
        if (res.headersSent) return;
        return res.render('recipe', { error: 'Errore durante il recupero della ricetta', recipe: null, user: req.user, reviews: [], raccolte: [] });
    }
};

// POST /ricette/:id/recensione - aggiunge una recensione alla ricetta
exports.postRecensione = async (req, res) => {
    try {
        const idRicetta = req.params.id;
        const valutazione = parseInt(req.body.rating, 10);
        let commento = req.body.comment?.trim() || null;

        if (commento && commento.length > 500) {
            return res.redirect(`/ricette/${idRicetta}`);
        }

        if (isNaN(valutazione) || valutazione < 1 || valutazione > 5) {
            return res.redirect(`/ricette/${idRicetta}`);
        }

        await Recipe.aggiungiRecensione(req.user.id, idRicetta, valutazione, commento);

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({
                success: true,
                message: 'Recensione aggiunta',
                review: {
                    rating: valutazione,
                    comment: commento,
                    author_name: req.user.full_name,
                    created_at: new Date().toISOString()
                }
            });
        }
        return res.redirect(`/ricette/${idRicetta}`);
    } catch (err) {
        console.error('Errore durante l\'aggiunta della recensione:', err);
        if (res.headersSent) return;
        return res.status(500).send('Errore server');
    }
};

// POST /ricette/:id/cancella - elimina una ricetta
exports.postEliminaRicetta = async (req, res) => {
    try {
        const idRicetta = req.params.id;
        const ricetta = await Recipe.trovaTuttiDatiRicettaPerId(idRicetta);

        if (!ricetta) return res.status(404).send('Ricetta non trovata');
        if (ricetta.author_id !== req.user.id) return res.status(403).send('Permesso negato.');

        await Recipe.eliminaRicetta(idRicetta);

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Ricetta eliminata' });
        }
        return res.redirect('/chef/dashboard');
    } catch (err) {
        console.error('Errore durante l\'eliminazione della ricetta:', err);
        if (res.headersSent) return;
        return res.status(500).send('Errore server');
    }
};

// GET /ricette/:id/modifica - pagina per modificare una ricetta
exports.getPaginaModificaRicetta = async (req, res) => {
    try {
        const idRicetta = req.params.id;
        const ricetta = await Recipe.trovaTuttiDatiRicettaPerId(idRicetta);

        if (!ricetta) return res.status(404).send('Ricetta non trovata');
        if (ricetta.author_id !== req.user.id) return res.status(403).send('Permesso negato.');

        res.render('edit_recipe', { recipe: ricetta, user: req.user });
    } catch (err) {
        console.error('Errore durante il caricamento della pagina di modifica:', err);
        res.status(500).send('Errore server');
    }
};

// POST /ricette/:id/modifica - salva le modifiche a una ricetta
exports.postModificaRicetta = async (req, res) => {
    try {
        const idRicetta = req.params.id;
        const ricetta = await Recipe.trovaTuttiDatiRicettaPerId(idRicetta);

        if (!ricetta) return res.status(404).send('Ricetta non trovata');
        if (ricetta.author_id !== req.user.id) return res.status(403).send('Permesso negato.');

        const { title, description, category, difficulty, prep_time, cook_time, servings, calories, cooking_method, tags, suggested_drink } = req.body;

        const { ingredients, instructions, error: parseError } = parseCorpoRicetta(req.body);
        if (parseError) return res.status(400).send(parseError);

        await Recipe.aggiornaRicetta(idRicetta, {
            title, description, category, difficulty,
            prep_time, cook_time, servings, calories, cooking_method, suggested_drink,
            ingredients, instructions, tags
        });

        return res.redirect(`/ricette/${idRicetta}`);
    } catch (err) {
        console.error('Errore durante la modifica della ricetta:', err);
        if (res.headersSent) return;
        return res.status(500).send('Errore server');
    }
};

// GET /ricette/creaRicetta - pagina per creare una nuova ricetta
exports.getPaginaCreaRicetta = (req, res) => res.render('create_recipe', { user: req.user });

// POST /ricette/creaRicetta - crea una nuova ricetta
exports.postCreaRicetta = async (req, res) => {
    try {
        const { title, description, category, difficulty, prep_time, cook_time, servings, calories, cooking_method, tags, suggested_drink } = req.body;

        const { ingredients, instructions, error: parseError } = parseCorpoRicetta(req.body);
        if (parseError) return res.status(400).send(parseError);

        await Recipe.creaRicetta({
            author_id: req.user.id,
            title, description, category, difficulty,
            prep_time, cook_time, servings, calories, cooking_method, suggested_drink,
            ingredients, instructions, tags
        });

        return res.redirect('/chef/dashboard');
    } catch (err) {
        console.error('Errore durante la creazione della ricetta:', err);
        if (res.headersSent) return;
        return res.status(500).send('Errore server');
    }
};
