'use strict';

// setup express router
const express = require('express');
const router = express.Router();

// controller autenticazione
const controllerAutenticazione = require('../controllers/authController');

// Route GET per la pagina di login
router.get('/login', controllerAutenticazione.getLogin);

// Route POST per il submit del form di login
router.post('/login', controllerAutenticazione.postLogin);

// Route GET per la pagina di registrazione
router.get('/registrazione', controllerAutenticazione.getRegistrazione);
// Route POST per il submit del form di registrazione
router.post('/registrazione', controllerAutenticazione.postRegistrazione);

// Route GET per il logout
router.get('/logout', controllerAutenticazione.logout);

module.exports = router;
