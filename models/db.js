'use strict';

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// path del database
const dbPath = path.resolve(__dirname, '../database.db');

// apertura connessione al database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Errore nell/apertura della connessione al database:', err.message);
    } else {
        console.log('Connessione al database stabilita con successo.');
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) console.error('Errore nell/abilitazione dei foreign keys:', err.message);
        });

    }
});


// --- Funzioni helper per le query ---

// Funzione per eseguire query che danno più risultati
db.query = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

// Funzione per eseguire query sul db che danno un solo risultato
db.queryOne = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

// Funzione per eseguire query sul db che non restituiscono risultati
db.execute = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); });
});


module.exports = db;
