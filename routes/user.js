'use strict';

// setup express router
const express = require('express');
const router = express.Router();

// controllers e middleware
const controllerRaccolte = require('../controllers/librariesController');
const controllerUtente = require('../controllers/userController');
const { ensureAutenticato, ensureAdmin } = require('../controllers/authController');

// Route GET per la dashboard del chef (protetta)
router.get('/chef/dashboard', ensureAutenticato, controllerUtente.getDashboardChef);

// Route GET per la dashboard dell'admin (protetta, solo admin)
router.get('/admin/dashboard', ensureAdmin, controllerUtente.getDashboardAdmin);

router.post('/ricette/:id/toggle-ban', ensureAdmin, controllerUtente.toggleBanRicetta);

// Route POST per bannare/sbannare un utente (protetta, solo admin)
router.post('/utenti/:id/toggle-ban', ensureAdmin, controllerUtente.toggleBanUtente);

// ── Route Raccolte (protette, solo utenti autenticati) ──
router.get('/raccolte', ensureAutenticato, controllerRaccolte.getPaginaRaccolte);
router.post('/raccolte/crea', ensureAutenticato, controllerRaccolte.postCreaRaccolta);
router.get('/raccolte/:id', ensureAutenticato, controllerRaccolte.getPaginaDettaglioRaccolta);
router.post('/raccolte/:id/aggiungi', ensureAutenticato, controllerRaccolte.postAggiungiARaccolta);
router.post('/raccolte/:id/rimuovi', ensureAutenticato, controllerRaccolte.postRimuoviDaRaccolta);
router.post('/raccolte/:id/elimina', ensureAutenticato, controllerRaccolte.postEliminaRaccolta);

module.exports = router;