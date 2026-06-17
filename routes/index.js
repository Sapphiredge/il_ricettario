'use strict';

// setup express router
const express = require('express');
const router = express.Router();

// controller per le pagine principali
const controllerHome = require('../controllers/indexController');

// Route GET per la homepage
router.get('/', controllerHome.getPaginaIndex);

// Route GET per la pagina di ricerca
router.get('/cerca', controllerHome.getPaginaRicerca);

// Route statiche footer
router.get('/chi-siamo', controllerHome.getPresentation);
router.get('/contatti', controllerHome.getContacts);

module.exports = router;
