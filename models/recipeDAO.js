const db = require('./db');

class RecipeDAO {

    // Trova una ricetta per id (solo non bannate), con ingredienti, istruzioni e tag
    static async trovaRicettaPerId(id) {
        const query = `
            SELECT r.*, u.username as author_name, u.role as author_role,
                   (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as review_count
            FROM recipes r
            JOIN users u ON r.author_id = u.id
            WHERE r.id = ? AND r.is_banned = 0
        `;
        const ricetta = await db.queryOne(query, [id]);
        if (!ricetta) return null;

        [ricetta.ingredients, ricetta.instructions, ricetta.tags] = await Promise.all([
            db.query('SELECT * FROM ingredients WHERE recipe_id = ?', [id]),
            db.query('SELECT * FROM instructions WHERE recipe_id = ? ORDER BY step_number ASC', [id]),
            db.query('SELECT tag_name FROM recipe_tags WHERE recipe_id = ?', [id]).then(rows => rows.map(r => r.tag_name))
        ]);

        return ricetta;
    }

    // Trova una ricetta per id senza filtri (usato per bannare/sbannare)
    static async trovaTuttiDatiRicettaPerId(id) {
        return db.queryOne('SELECT * FROM recipes WHERE id = ?', [id]);
    }

    // Trova tutte le ricette per una specifica categoria
    static async getRicettePerCategoria(category) {
        const query = `
            SELECT r.*, u.username as author_name, u.role as author_role,
                   (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as review_count
            FROM recipes r
            JOIN users u ON r.author_id = u.id
            WHERE r.category = ? AND r.is_banned = 0
        `;

        return db.query(query, [category]);
    }

    // Trova le ultime 10 ricette pubblicate nelle ultime 24 ore
    static async getRicetteRecenti24H() {
        const query = `
            SELECT r.*, u.username as author_name, u.role as author_role,
                   (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as review_count
            FROM recipes r
            JOIN users u ON r.author_id = u.id
            WHERE r.is_banned = 0 AND r.created_at >= datetime('now', '-1 day')
            ORDER BY r.created_at DESC
            LIMIT 10
        `;
        return db.query(query);
    }

    // Trova le ricette pubblicate ordinate per rating decrescente
    static async getRicetteTopRating() {
        const query = `
            SELECT r.*, u.username as author_name, u.role as author_role,
                   (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as review_count
            FROM recipes r
            JOIN users u ON r.author_id = u.id
            WHERE r.is_banned = 0
            ORDER BY COALESCE(average_rating, 0) DESC, r.created_at DESC
            LIMIT 20
        `;
        return db.query(query);
    }

    // Trova tutte le ricette per la dashboard admin
    static getTutteLeRicetteAdmin() {
        const query = `
            SELECT r.*, u.username as author_name, u.role as author_role 
            FROM recipes as r
            JOIN users as u ON r.author_id = u.id
            ORDER BY r.created_at DESC
        `;
        return db.query(query);
    }

    // Trova tutte le ricette di un autore
    static async getRicettePerAutore(authorId) {
        return db.query('SELECT * FROM recipes WHERE author_id = ? ORDER BY created_at DESC', [authorId]);
    }

    // Crea una nuova ricetta con ingredienti, istruzioni e tag in una singola transazione
    static async creaRicetta(data) {
        const {
            author_id, title, description, category,
            difficulty, prep_time, cook_time, servings, calories, cooking_method, suggested_drink,
            ingredients, instructions, tags
        } = data;

        try {
            await db.execute('BEGIN TRANSACTION');

            const res = await db.execute(`
                INSERT INTO recipes (
                    author_id, title, description, category,
                    difficulty, prep_time, cook_time, servings, calories, cooking_method, suggested_drink
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [author_id, title, description, category, difficulty, prep_time, cook_time, servings, calories, cooking_method, suggested_drink]);

            const recipeId = res.lastID;

            if (ingredients?.length) {
                for (const i of ingredients) {
                    await db.execute('INSERT INTO ingredients (recipe_id, amount, name) VALUES (?, ?, ?)', [recipeId, i.amount, i.name]);
                }
            }

            if (instructions?.length) {
                for (const [step_number, description] of instructions.entries()) {
                    await db.execute('INSERT INTO instructions (recipe_id, step_number, description) VALUES (?, ?, ?)', [recipeId, step_number + 1, description]);
                }
            }

            if (tags) {
                const tagList = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
                for (const t of tagList) {
                    await db.execute('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_name) VALUES (?, ?)', [recipeId, t]);
                }
            }

            await db.execute('COMMIT');
            return recipeId;

        } catch (err) {
            await db.execute('ROLLBACK');
            throw err;
        }
    }

    // Elimina una ricetta per id (gli ingredienti e le istruzioni vengono rimossi a cascata)
    static async eliminaRicetta(id) {
        const stmt = await db.execute('DELETE FROM recipes WHERE id = ?', [id]);
        return stmt.changes > 0;
    }

    // Aggiorna una ricetta esistente sostituendo ingredienti, istruzioni e tag in una transazione
    static async aggiornaRicetta(id, data) {
        const {
            title, description, category,
            difficulty, prep_time, cook_time, servings, calories, cooking_method, suggested_drink,
            ingredients, instructions, tags
        } = data;

        try {
            await db.execute('BEGIN TRANSACTION');

            await db.execute(`
                UPDATE recipes SET
                    title = ?, description = ?, category = ?,
                    difficulty = ?, prep_time = ?, cook_time = ?, servings = ?, calories = ?, cooking_method = ?, suggested_drink = ?
                WHERE id = ?
            `, [title, description, category, difficulty, prep_time, cook_time, servings, calories, cooking_method, suggested_drink, id]);

            // Sostituzione ingredienti
            await db.execute('DELETE FROM ingredients WHERE recipe_id = ?', [id]);
            if (ingredients?.length) {
                for (const i of ingredients) {
                    await db.execute('INSERT INTO ingredients (recipe_id, amount, name) VALUES (?, ?, ?)', [id, i.amount, i.name]);
                }
            }

            // Sostituzione istruzioni
            await db.execute('DELETE FROM instructions WHERE recipe_id = ?', [id]);
            if (instructions?.length) {
                for (const [idx, passo] of instructions.entries()) {
                    await db.execute('INSERT INTO instructions (recipe_id, step_number, description) VALUES (?, ?, ?)', [id, idx + 1, passo]);
                }
            }

            // Sostituzione tag
            await db.execute('DELETE FROM recipe_tags WHERE recipe_id = ?', [id]);
            if (tags) {
                const tagList = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
                for (const t of tagList) {
                    await db.execute('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_name) VALUES (?, ?)', [id, t]);
                }
            }

            await db.execute('COMMIT');
            return true;
        } catch (err) {
            await db.execute('ROLLBACK');
            throw err;
        }
    }

    // Aggiunge o sostituisce la recensione di un utente per una ricetta
    static async aggiungiRecensione(userId, recipeId, rating, comment) {
        const stmt = await db.execute(
            'INSERT OR REPLACE INTO reviews (user_id, recipe_id, rating, comment, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [userId, recipeId, rating, comment]
        );
        return stmt.changes > 0;
    }

    // Trova tutte le recensioni di una ricetta
    static getRecensioni(recipeId) {
        const query = `
            SELECT r.*, u.username as author_name, u.role as author_role
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.recipe_id = ?
            ORDER BY r.created_at DESC
        `;
        return db.query(query, [recipeId]);
    }

    // Calcola le statistiche di riepilogo per la dashboard di un utente/autore
    static async getStatisticheDashboard(userId) {
        const [savedRow, rateRow] = await Promise.all([
            db.queryOne('SELECT COUNT(cr.recipe_id) as count FROM collection_recipes cr JOIN collections c ON cr.collection_id = c.id WHERE c.user_id = ?', [userId]),
            db.queryOne('SELECT AVG(rv.rating) as avg FROM reviews rv JOIN recipes r ON rv.recipe_id = r.id WHERE r.author_id = ?', [userId])
        ]);

        return {
            saved_count: savedRow?.count || 0,
            avg_rating: (rateRow && rateRow.avg) ? Number(rateRow.avg).toFixed(1) : null
        };
    }

    // Attiva o disattiva il ban di una ricetta
    static async toggleBanRicetta(id, is_banned) {
        const stmt = await db.execute('UPDATE recipes SET is_banned = ? WHERE id = ?', [is_banned ? 1 : 0, id]);
        return stmt.changes > 0;
    }

    // Dizionario euristico: allergene → keyword negli ingredienti, titolo e descrizione
    static KEYWORDS_ALLERGENI = {
        glutine: ['glutine', 'farina', 'grano', 'semola', 'orzo', 'segale', 'avena', 'farro', 'spelta', 'pane', 'pasta', 'cous cous', 'bulgur'],
        lattosio: ['latte', 'burro', 'panna', 'formaggio', 'yogurt', 'mozzarella', 'ricotta', 'parmigiano', 'pecorino', 'grana', 'lattosio', 'mascarpone', 'fontina'],
        uova: ['uovo', 'uova', 'albume', 'tuorlo'],
        pesce: ['pesce', 'tonno', 'salmone', 'merluzzo', 'orata', 'branzino', 'acciughe', 'baccalà', 'alici', 'trota', 'halibut', 'rombo'],
        crostacei: ['gambero', 'gamberetti', 'aragosta', 'granchio', 'scampi', 'crostacei', 'astice'],
        arachidi: ['arachidi', 'arachide', 'burro di arachidi'],
        soia: ['soia', 'tofu', 'miso', 'edamame', 'tempeh'],
        frutta_guscio: ['noci', 'mandorle', 'nocciole', 'anacardi', 'pistacchi', 'pinoli', 'noci pecan', 'castagne'],
        sedano: ['sedano'],
        senape: ['senape'],
        sesamo: ['sesamo', 'tahini'],
        solfiti: ['solfiti', 'anidride solforosa'],
        lupini: ['lupini', 'lupino'],
        molluschi: ['cozze', 'vongole', 'polpo', 'calamari', 'seppie', 'molluschi', 'lumache']
    };

    // Ricerca avanzata con filtri per testo, categoria, cottura, difficoltà e allergeni da escludere
    static async cercaConFiltri({ term = '', category = '', cooking_method = '', difficulty = '', allergens_exclude = [] } = {}) {
        const conditions = ['r.is_banned = 0'];
        const params = [];

        // Filtro testo libero (titolo, descrizione, categoria, tag, metodo, ingrediente)
        if (term) {
            const p = `%${term}%`;
            conditions.push(`(
                r.title LIKE ? OR r.description LIKE ? OR r.category LIKE ?
                OR rt.tag_name LIKE ? OR r.cooking_method LIKE ? OR ing.name LIKE ?
            )`);
            params.push(p, p, p, p, p, p);
        }

        // Filtro categoria
        if (category) {
            conditions.push('LOWER(r.category) = LOWER(?)');
            params.push(category);
        }

        // Filtro metodo di cottura
        if (cooking_method) {
            conditions.push('LOWER(r.cooking_method) = LOWER(?)');
            params.push(cooking_method);
        }

        // Filtro difficoltà
        if (difficulty) {
            conditions.push('LOWER(r.difficulty) = LOWER(?)');
            params.push(difficulty);
        }

        // Esclusione allergeni: per ogni allergene esclude ricette che contengono le keyword
        // negli ingredienti, nel titolo o nella descrizione
        for (const allergene of allergens_exclude) {
            const keywords = RecipeDAO.KEYWORDS_ALLERGENI[allergene];
            if (!keywords || keywords.length === 0) continue;

            const ingConditions = keywords.map(() => 'LOWER(ingA.name) LIKE ?').join(' OR ');
            const ingParams = keywords.map(k => `%${k}%`);

            const txtConditions = keywords.map(() => '(LOWER(r.title) LIKE ? OR LOWER(r.description) LIKE ?)').join(' OR ');
            const txtParams = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);

            conditions.push(`(
                NOT EXISTS (SELECT 1 FROM ingredients ingA WHERE ingA.recipe_id = r.id AND (${ingConditions}))
                AND NOT (${txtConditions})
            )`);
            params.push(...ingParams, ...txtParams);
        }

        const where = conditions.join('\n            AND ');

        const query = `
            SELECT DISTINCT r.*, u.username as author_name, u.role as author_role,
                   (SELECT AVG(rating) FROM reviews WHERE recipe_id = r.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE recipe_id = r.id) as review_count
            FROM recipes r
            JOIN users u ON r.author_id = u.id
            LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
            LEFT JOIN ingredients ing ON r.id = ing.recipe_id
            WHERE ${where}
            ORDER BY r.created_at DESC
        `;

        return db.query(query, params);
    }
}

module.exports = RecipeDAO;
