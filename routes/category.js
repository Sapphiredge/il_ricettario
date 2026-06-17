'use strict';

// setup express router
const express = require('express');
const router = express.Router();

// controller per le categorie
const controllerCategorie = require('../controllers/categoryController');

// Route GET per la pagina di una categoria (es. /category/dolci)
router.get('/:name', controllerCategorie.getPaginaCategoria);

module.exports = router;
