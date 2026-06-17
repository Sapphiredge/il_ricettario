'use strict';

const User = require('../models/userDAO');

// GET /raccolte - pagina con la lista delle raccolte dell'utente
exports.getPaginaRaccolte = async (req, res) => {
    try {
        const raccolte = await User.getRaccolteUtente(req.user.id);
        res.render('collections', { user: req.user, raccolte });
    } catch (err) {
        console.error('Errore pagina raccolte:', err);
        res.render('collections', { user: req.user, raccolte: [] });
    }
};

// POST /raccolte/crea — crea una nuova raccolta
exports.postCreaRaccolta = async (req, res) => {
    try {
        const name = (req.body.name || '').trim();

        if (!name) {
            return res.status(400).json({ success: false, error: 'Il nome della raccolta è obbligatorio.' });
        }

        const id = await User.creaRaccolta(req.user.id, name);
        return res.json({ success: true, id, name });
    } catch (err) {
        console.error('Errore creazione raccolta:', err);
        return res.status(500).json({ success: false, error: 'Errore durante la creazione della raccolta.' });
    }
};

// GET /raccolte/:id - pagina di una raccolta dell'utente
exports.getPaginaDettaglioRaccolta = async (req, res) => {
    try {
        const raccolta = await User.getRaccoltaConRicette(req.params.id, req.user.id);
        if (!raccolta) {
            return res.redirect('/raccolte');
        }
        res.render('collection_detail', { user: req.user, raccolta });
    } catch (err) {
        console.error('Errore dettaglio raccolta:', err);
        res.redirect('/raccolte');
    }
};

// POST /raccolte/:id/aggiungi - aggiunge una ricetta alla raccolta
exports.postAggiungiARaccolta = async (req, res) => {
    try {
        const recipeId = req.body.recipeId;
        if (!recipeId) return res.status(400).json({ success: false, error: 'ID ricetta mancante.' });

        const aggiunto = await User.aggiungiARaccolta(req.params.id, recipeId, req.user.id);
        return res.json({ success: true, aggiunto });
    } catch (err) {
        console.error('Errore aggiungi a raccolta:', err);
        return res.status(500).json({ success: false, error: 'Errore server.' });
    }
};

// POST /raccolte/:id/rimuovi - rimuove una ricetta dalla raccolta in cui si è presenti
exports.postRimuoviDaRaccolta = async (req, res) => {
    try {
        const recipeId = req.body.recipeId;
        if (!recipeId) return res.status(400).json({ success: false, error: 'ID ricetta mancante.' });

        const rimosso = await User.rimuoviDaRaccolta(req.params.id, recipeId, req.user.id);
        return res.json({ success: true, rimosso });
    } catch (err) {
        console.error('Errore rimuovi da raccolta:', err);
        return res.status(500).json({ success: false, error: 'Errore server.' });
    }
};

// POST /raccolte/:id/elimina - elimina uan raccolta creata da un utente
exports.postEliminaRaccolta = async (req, res) => {
    try {
        await User.eliminaRaccolta(req.params.id, req.user.id);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true });
        }
        return res.redirect('/raccolte');
    } catch (err) {
        console.error('Errore elimina raccolta:', err);
        return res.status(500).json({ success: false, error: 'Errore server.' });
    }
};
