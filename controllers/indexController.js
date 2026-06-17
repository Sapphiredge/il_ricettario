'use strict';

const Ricetta = require('../models/recipeDAO');

// GET / — Index
exports.getPaginaIndex = async (req, res) => {
    try {
        const [recentRecipes, topRatedRecipes] = await Promise.all([
            Ricetta.getRicetteRecenti24H(),
            Ricetta.getRicetteTopRating()
        ]);

        const cats = [
            { name: 'Antipasti', icon: 'tapas', delay: 0 },
            { name: 'Primi', icon: 'fork_spoon', delay: 80 },
            { name: 'Secondi', icon: 'dining', delay: 160 },
            { name: 'Contorni', icon: 'okonomiyaki', delay: 240 },
            { name: 'Dolci', icon: 'icecream', delay: 320 },
            { name: 'Condimenti', icon: 'avocado_bean', delay: 400 }
        ];

        res.render('index', { recentRecipes: recentRecipes || [], topRatedRecipes: topRatedRecipes || [], user: req.user, cats });
    } catch (errore) {
        console.error('Errore durante il caricamento della homepage:', errore);
        res.render('index', { error: 'Errore durante il caricamento delle ricette.', recentRecipes: [], topRatedRecipes: [], user: req.user, cats: [] });
    }
};

// GET /cerca — Ricerca avanzata con filtri opzionali
exports.getPaginaRicerca = async (req, res) => {
    try {
        const term = (req.query.q || '').trim();
        const category = (req.query.category || '').trim();
        const cooking_method = (req.query.cooking_method || '').trim();
        const difficulty = (req.query.difficulty || '').trim();

        let allergens_exclude = req.query.allergens || [];
        if (typeof allergens_exclude === 'string') allergens_exclude = [allergens_exclude];

        const hasFiltri = term || category || cooking_method || difficulty || allergens_exclude.length > 0;

        let ricette = [];
        if (hasFiltri) {
            ricette = await Ricetta.cercaConFiltri({ term, category, cooking_method, difficulty, allergens_exclude });
        }

        res.render('search', {
            query: term,
            recipes: ricette,
            user: req.user,
            currentPage: '/cerca',
            filtri: { category, cooking_method, difficulty, allergens_exclude }
        });
    } catch (errore) {
        console.error('Errore durante la ricerca:', errore);
        res.render('search', {
            error: 'Errore durante la ricerca.',
            query: req.query.q || '',
            recipes: [],
            user: req.user,
            currentPage: '/cerca',
            filtri: { category: '', cooking_method: '', difficulty: '', allergens_exclude: [] }
        });
    }
};

// GET /presentazione - pagina di presentazione del team/progetto
exports.getPresentation = (req, res) => {
    res.render('presentation', { user: req.user });
};

// GET /contatti - pagina dei contatti
exports.getContacts = (req, res) => {
    res.render('contacts', { user: req.user });
};
