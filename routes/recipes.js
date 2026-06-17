'use strict';

// setup express router
const express = require('express');
const router = express.Router();

// controller per le ricette e middleware di autenticazione
const controllerRicette = require('../controllers/recipeController');
const { ensureAutenticato, ensureChef } = require('../controllers/authController');

// Route GET per il form di creazione di una nuova ricetta (protetta - solo chef)
router.get('/ricette/creaRicetta', ensureChef, controllerRicette.getPaginaCreaRicetta);
// Route POST per salvare una nuova ricetta (protetta - solo chef)
router.post('/ricette/creaRicetta', ensureChef, controllerRicette.postCreaRicetta);

// Route GET per la visualizzazione di una ricetta
router.get('/ricette/:id', controllerRicette.getPaginaRicetta);

// Route POST per aggiungere una valutazione (protetta)
router.post('/ricette/:id/recensione', ensureAutenticato, controllerRicette.postRecensione);

// Route POST per eliminare una ricetta (protetta - solo l'autore può farlo, check nel controller)
router.post('/ricette/:id/cancella', ensureAutenticato, controllerRicette.postEliminaRicetta);

// Route GET per la pagina di modifica di una ricetta (protetta - solo chef)
router.get('/ricette/:id/modifica', ensureChef, controllerRicette.getPaginaModificaRicetta);
// Route POST per salvare le modifiche a una ricetta (protetta - solo chef)
router.post('/ricette/:id/modifica', ensureChef, controllerRicette.postModificaRicetta);

module.exports = router;
