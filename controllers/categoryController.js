'use strict';

const Recipe = require('../models/recipeDAO');

// Mappa immagini di copertina per categoria
const CATEGORY_IMAGES = {
    'Antipasti': '/images/antipasto.jpg',
    'Primi': '/images/primo.jpg',
    'Secondi': '/images/secondo.jpg',
    'Contorni': '/images/contorno.jpg',
    'Dolci': '/images/dolce.jpg',
    'Condimenti': '/images/condimento.jpg',
};

// GET /categoria/:name — Pagina di elenco ricette per categoria
exports.getPaginaCategoria = async (req, res) => {
    const nome = req.params.name;

    if (!nome) {
        return res.redirect('/');
    }

    const nomeCategoria = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

    if (!CATEGORY_IMAGES[nomeCategoria]) {
        return res.redirect('/');
    }

    try {
        const ricette = await Recipe.getRicettePerCategoria(nomeCategoria);

        const categoria = {
            name: nomeCategoria,
            description: 'Scopri le migliori ricette di questa categoria.',
            image_url: CATEGORY_IMAGES[nomeCategoria]
        };

        res.render('category', { category: categoria, recipes: ricette || [], user: req.user });
    } catch (err) {
        console.error('Errore durante il caricamento della categoria:', err);
        res.redirect('/');
    }
};
