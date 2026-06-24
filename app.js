'use strict';

// Dipendenze principali
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const AiutiGenerali = require('./helpers/general-helper');

// Creazione app Express
const app = express();

// Connessione al database SQLite
require('./models/db');

// Config del motore EJS e dei file statici
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts/page', express.static(path.join(__dirname, 'node_modules/page')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurazione della sessione utente
app.use(session({
    secret: 'chiave_complessa_segreta',
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    secure: true
}));

app.use(passport.initialize());
app.use(passport.session());

// La config delle strategie di passport è gestita dal file authController
require('./controllers/authController');

// Middleware per rendere disponibili user, currentPage e AiutiCard in tutte le viste
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.currentPage = req.path;
    res.locals.AiutiCard = AiutiGenerali;
    next();
});

app.use(function (req, res, next) {
    console.log('Richiesta: ' + req.url + ' - Risposta: ' + res.statusCode);
    next();
});

// Registrazione delle route modulari
app.use('/', require('./routes/index'));       // Homepage e ricerca
app.use('/', require('./routes/auth'));        // Login, registro, logout
app.use('/', require('./routes/recipes'));     // Ricette (CRUD)
app.use('/', require('./routes/user'));        // Dashboard, preferiti, ban
app.use('/categoria', require('./routes/category')); // Pagine di categoria

module.exports = app;
