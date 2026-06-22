const db = require('./db');
const bcrypt = require('bcryptjs');

class UserDAO {
    static trovaPerId(id) {
        return db.queryOne('SELECT * FROM users WHERE id = ?', [id]); // trova utente per id
    }

    static trovaPerEmail(email) {
        return db.queryOne('SELECT * FROM users WHERE email = ?', [email]); // trova utente per email
    }

    static trovaPerUsername(username) {
        return db.queryOne('SELECT * FROM users WHERE username = ?', [username]); // trova utente per username
    }

    // crea un nuovo utente
    static async crea({ username, full_name, email, password, role = 'chef' }) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const stmt = await db.execute(
            'INSERT INTO users (username, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, full_name, email, hash, role]
        );

        return stmt.lastID; //ritorna l'id del nuovo utente se la query ha successo
    }

    // controlla se una ricetta è presente in almeno una raccolta dell'utente
    static async ricettaInQualcheRaccolta(userId, recipeId) {
        const row = await db.queryOne(`
            SELECT 1 FROM collection_recipes cr
            JOIN collections c ON cr.collection_id = c.id
            WHERE c.user_id = ? AND cr.recipe_id = ?
        `, [userId, recipeId]);
        return !!row;
    }

    // trova tutti gli utenti chef
    static getTuttiGliUtenti() {
        return db.query("SELECT id, username, full_name, email, role, created_at, is_banned FROM users WHERE role = 'chef' ORDER BY created_at DESC");
    }

    // banna o sblocca un utente
    static async toggleBanUtente(id, is_banned) {
        const stmt = await db.execute('UPDATE users SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, id]);
        return stmt.changes > 0;
    }

    // Crea una nuova raccolta per l'utente
    static async creaRaccolta(userId, name) {
        const stmt = await db.execute(
            'INSERT INTO collections (user_id, name) VALUES (?, ?)',
            [userId, name]
        );
        return stmt.lastID;
    }

    // Restituisce tutte le raccolte dell'utente con il conteggio delle ricette
    static getRaccolteUtente(userId) {
        const query = `
            SELECT c.*, COUNT(cr.recipe_id) as recipe_count
            FROM collections c
            LEFT JOIN collection_recipes cr ON c.id = cr.collection_id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        return db.query(query, [userId]);
    }

    // Restituisce il dettaglio di una raccolta con le ricette (solo se appartiene all'utente)
    static async getRaccoltaConRicette(collectionId, userId) {
        const raccolta = await db.queryOne(
            'SELECT * FROM collections WHERE id = ? AND user_id = ?',
            [collectionId, userId]
        );
        if (!raccolta) return null;

        const ricette = await db.query(`
            SELECT r.*, u.username as author_name, u.role as author_role,
                   (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as review_count
            FROM recipes r
            JOIN collection_recipes cr ON r.id = cr.recipe_id
            JOIN users u ON r.author_id = u.id
            WHERE cr.collection_id = ? AND r.is_banned = 0
            ORDER BY cr.added_at DESC
        `, [collectionId]);

        raccolta.recipes = ricette;
        return raccolta;
    }

    // Aggiunge una ricetta a una raccolta (con ownership check)
    static async aggiungiARaccolta(collectionId, recipeId, userId) {
        // Verifica che la raccolta appartenga all'utente
        const raccolta = await db.queryOne('SELECT id FROM collections WHERE id = ? AND user_id = ?', [collectionId, userId]);
        if (!raccolta) return false;

        const stmt = await db.execute(
            'INSERT OR IGNORE INTO collection_recipes (collection_id, recipe_id) VALUES (?, ?)',
            [collectionId, recipeId]
        );
        return stmt.changes > 0;
    }

    // Rimuove una ricetta da una raccolta (con ownership check)
    static async rimuoviDaRaccolta(collectionId, recipeId, userId) {
        const raccolta = await db.queryOne('SELECT id FROM collections WHERE id = ? AND user_id = ?', [collectionId, userId]);
        if (!raccolta) return false;

        const stmt = await db.execute(
            'DELETE FROM collection_recipes WHERE collection_id = ? AND recipe_id = ?',
            [collectionId, recipeId]
        );
        return stmt.changes > 0;
    }

    // Elimina una raccolta (solo se appartiene all'utente)
    static async eliminaRaccolta(collectionId, userId) {
        const stmt = await db.execute(
            'DELETE FROM collections WHERE id = ? AND user_id = ?',
            [collectionId, userId]
        );
        return stmt.changes > 0;
    }

    // Restituisce le raccolte dell'utente con flag "contiene questa ricetta" (per il modale)
    static getRaccoltePerRicetta(userId, recipeId) {
        const query = `
            SELECT c.id, c.name,
                   EXISTS(
                       SELECT 1 FROM collection_recipes cr
                       WHERE cr.collection_id = c.id AND cr.recipe_id = ?
                   ) as ha_ricetta
            FROM collections c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        return db.query(query, [recipeId, userId]);
    }
}

module.exports = UserDAO;
