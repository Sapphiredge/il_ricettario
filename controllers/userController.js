'use strict';

const Recipe = require('../models/recipeDAO');
const User = require('../models/userDAO');
const AiutiGenerali = require('../helpers/general-helper');

// saluti casuali per la dashboard chef
const SALUTI = ['Ciao', 'Buongiorno', 'Guarda un po\' chi è tornato', 'Salve'];
function salutoCasuale() {
    return SALUTI[Math.floor(Math.random() * SALUTI.length)];
}

// GET /admin/dashboard - pagina dashboard dell'amministratore
exports.getDashboardAdmin = async (req, res) => {
    try {
        const [ricette, utenti] = await Promise.all([
            Recipe.getTutteLeRicetteAdmin(),
            User.getTuttiGliUtenti()
        ]);

        const mapRicette = (ricette || []).map(recipe => ({
            ...recipe
        }));

        const mapUtenti = (utenti || []).map(u => ({
            ...u
        }));

        res.render('admin_dashboard', {
            user: req.user,
            recipes: mapRicette,
            users: mapUtenti
        });
    } catch (err) {
        console.error('Errore durante il caricamento del dashboard dell\'admin:', err);
        res.render('admin_dashboard', { user: req.user, recipes: [], users: [] });
    }
};

// GET /chef/dashboard - pagina dashboard dello chef
exports.getDashboardChef = async (req, res) => {
    try {
        const [ricette, statistiche] = await Promise.all([
            Recipe.getRicettePerAutore(req.user.id),
            Recipe.getStatisticheDashboard(req.user.id)
        ]);

        const saluto = salutoCasuale();
        const stats = statistiche || { saved_count: 0, avg_rating: null };

        res.render('user_dashboard', { user: req.user, recipes: ricette, _stats: stats, _saluto: saluto });
    } catch (err) {
        console.error('Errore durante il caricamento del dashboard dello chef:', err);
        res.render('user_dashboard', {
            user: req.user,
            recipes: [],
            _stats: { saved_count: 0, avg_rating: null },
            _saluto: salutoCasuale()
        });
    }
};

// POST /admin/ricette/:id/ban - banna/sbanna una ricetta a seconda dello stato
exports.toggleBanRicetta = async (req, res) => {
    try {
        const idRicetta = req.params.id;
        const ricetta = await Recipe.trovaTuttiDatiRicettaPerId(idRicetta);

        if (!ricetta) {
            return res.redirect('/admin/dashboard?error=Ricetta non trovata');
        }

        const nuovoStato = !ricetta.is_banned;
        await Recipe.toggleBanRicetta(idRicetta, nuovoStato);

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, is_banned: nuovoStato });
        }

        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Errore toggle ban ricetta:', err);
        res.redirect('/admin/dashboard?error=Errore durante l\'aggiornamento della ricetta');
    }
};

// POST /admin/utenti/:id/ban - banna/sbanna un utente a seconda dello stato
exports.toggleBanUtente = async (req, res) => {
    try {
        const idUtente = req.params.id;
        const utente = await User.trovaPerId(idUtente);

        if (!utente) {
            return res.redirect('/admin/dashboard?error=Utente non trovato');
        }

        if (utente.role === 'admin') {
            return res.redirect('/admin/dashboard?error=Impossibile bannare un amministratore');
        }

        const nuovoStato = !utente.is_banned;
        await User.toggleBanUtente(idUtente, nuovoStato);

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, is_banned: nuovoStato });
        }
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Errore toggle ban utente:', err);
        res.redirect('/admin/dashboard?error=Errore durante l\'aggiornamento dell\'utente');
    }
};
