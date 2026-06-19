'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/userDAO');

// Strategia di autenticazione locale (email o username + password)
passport.use(new LocalStrategy({
    usernameField: 'usernameOrMail',
    passwordField: 'password'
}, async (usernameOrMail, password, done) => {
    try {
        const [perEmail, perUsername] = await Promise.all([
            User.trovaPerEmail(usernameOrMail),
            User.trovaPerUsername(usernameOrMail)
        ]);
        const utente = perEmail || perUsername;
        if (!utente) return done(null, false, { message: 'La mail o lo username inserito non esiste.' });
        if (utente.is_banned) return done(null, false, { message: 'Account sospeso dall\'amministratore.' });

        const isValid = await bcrypt.compare(password, utente.password);
        if (!isValid) return done(null, false, { message: 'Password errata.' });

        return done(null, utente);
    } catch (err) {
        return done(err);
    }
}));

// Serializza l'utente nella sessione (salva solo l'id)
passport.serializeUser((user, done) => done(null, user.id));

// Deserializza l'utente dalla sessione (recupera il record completo)
passport.deserializeUser(async (id, done) => {
    try {
        const utente = await User.trovaPerId(id);
        done(null, utente);
    } catch (err) {
        done(err, null);
    }
});

// GET /login — Pagina di login
exports.getLogin = (req, res) => {
    if (req.isAuthenticated()) {
        const url = req.user.role === 'admin' ? '/admin/dashboard' : '/chef/dashboard';
        return res.redirect(url);
    }
    res.render('login', { error: req.query.error });
};

// POST /login — Autenticazione tramite Passport
exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/login?error=' + encodeURIComponent(info.message || 'Login fallito.'));

        req.logIn(user, (err) => {
            if (err) return next(err);
            const url = user.role === 'admin' ? '/admin/dashboard' : '/chef/dashboard';
            return res.redirect(url);
        });
    })(req, res, next);
};

// GET /registrazione — Pagina di registrazione
exports.getRegistrazione = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/chef/dashboard');
    }
    res.render('register', { error: req.query.error });
};

// POST /registrazione — Crea un nuovo account chef e avvia la sessione
exports.postRegistrazione = async (req, res) => {
    try {
        const { username, full_name, email, password } = req.body;

        const [mailEsistente, usernameEsistente] = await Promise.all([
            User.trovaPerEmail(email),
            User.trovaPerUsername(username)
        ]);

        if (mailEsistente) {
            return res.redirect('/registrazione?error=' + encodeURIComponent('La mail inserita esiste già.'));
        }
        if (usernameEsistente) {
            return res.redirect('/registrazione?error=' + encodeURIComponent('Lo username inserito esiste già.'));
        }

        const idNuovoUtente = await User.crea({ username, full_name, email, password });
        const nuovoUtente = await User.trovaPerId(idNuovoUtente);

        req.logIn(nuovoUtente, (err) => {
            if (err) throw err;
            return res.redirect('/chef/dashboard');
        });
    } catch (err) {
        console.error('Errore durante la registrazione:', err);
        return res.redirect('/registrazione?error=' + encodeURIComponent('Registrazione fallita. Riprovare.'));
    }
};

// POST /logout — Termina la sessione e reindirizza alla home
exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
};

// Middleware — Verifica che l'utente sia autenticato
exports.ensureAutenticato = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login');
exports.ensureAdmin = (req, res, next) => (req.isAuthenticated() && req.user.role === 'admin') ? next() : res.redirect('/login');
exports.ensureChef = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'chef') return next();
    if (req.isAuthenticated() && req.user.role === 'admin') return res.redirect('/admin/dashboard');
    res.redirect('/login');
};
