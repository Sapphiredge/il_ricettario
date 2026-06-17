const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.db');

// Delete existing database file
const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connessione al database stabilita per il reset.');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    db.serialize(() => {
        // Disabilitiamo le foreign keys temporaneamente per eliminare le tabelle
        db.run('PRAGMA foreign_keys = OFF;');

        db.run('DROP TABLE IF EXISTS collection_recipes;');
        db.run('DROP TABLE IF EXISTS collections;');
        db.run('DROP TABLE IF EXISTS reviews;');
        db.run('DROP TABLE IF EXISTS recipe_tags;');
        db.run('DROP TABLE IF EXISTS instructions;');
        db.run('DROP TABLE IF EXISTS ingredients;');
        db.run('DROP TABLE IF EXISTS recipes;');
        db.run('DROP TABLE IF EXISTS users;');

        db.run('PRAGMA foreign_keys = ON;');

        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(255) NOT NULL UNIQUE,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'chef' CHECK(role IN ('admin', 'chef')),
            is_banned INTEGER NOT NULL DEFAULT 0 CHECK(is_banned IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            difficulty VARCHAR(50) CHECK(difficulty IN ('facile', 'media', 'difficile', 'Facile', 'Media', 'Difficile')),
            prep_time INTEGER,
            cook_time INTEGER,
            servings INTEGER,
            calories INTEGER,
            cooking_method VARCHAR(100),
            suggested_drink VARCHAR(255),
            is_banned INTEGER NOT NULL DEFAULT 0 CHECK(is_banned IN (0, 1)),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            amount VARCHAR(100),
            name VARCHAR(255) NOT NULL,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE instructions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            step_number INTEGER NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE recipe_tags (
            recipe_id INTEGER NOT NULL,
            tag_name VARCHAR(100) NOT NULL,
            PRIMARY KEY (recipe_id, tag_name),
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE reviews (
            user_id INTEGER NOT NULL,
            recipe_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            comment TEXT CHECK(length(comment) <= 500),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, recipe_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE collection_recipes (
            collection_id INTEGER NOT NULL,
            recipe_id INTEGER NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (collection_id, recipe_id),
            FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
            FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
        )`);

        console.log('Tutte le tabelle create con successo!');

        // Create default admin user
        db.run('INSERT INTO users (username, full_name, email, password, role) VALUES (\'admin\', \'Amministratore\', \'admin@example.com\', ?, \'admin\')', [hashedPassword], () => {
            console.log('Account admin di default inserito (admin@example.com / admin123)');
            db.close((err) => {
                if (err) console.error('Errore durante la chiusura del database:', err.message);
                else console.log('Connessione al database chiusa con successo.');
            });
        });
    });
});
