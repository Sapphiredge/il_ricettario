const db = require('./models/db');
const Recipe = require('./models/recipeDAO');

async function eseguiSeedingRecensioni() {
    try {
        console.log('Recupero utenti e ricette dal database...');
        // Recuperiamo tutti gli utenti e tutte le ricette
        const [users, recipes] = await Promise.all([
            db.query('SELECT id FROM users'),
            db.query('SELECT id, author_id FROM recipes')
        ]);

        if (users.length === 0 || recipes.length === 0) {
            console.error('ERRORE: Assicurati di aver generato prima gli utenti e le ricette col comando seed_users.js e seed_recipes.js!');
            process.exit(1);
        }

        console.log(`Trovati ${users.length} utenti e ${recipes.length} ricette. Inizio generazione recensioni...`);

        let recensioniInserite = 0;

        for (const recipe of recipes) {
            // Generiamo un numero casuale di recensioni per questa ricetta (da 1 a 6 recensioni)
            const numeroRecensioni = 1 + Math.floor(Math.random() * 6);
            
            // Mescoliamo gli utenti e ne peschiamo quanti ce ne servono, escludendo possibilmente l'autore della ricetta
            const utentiDisponibili = users.filter(u => u.id !== recipe.author_id).sort(() => 0.5 - Math.random());
            const utentiRecensori = utentiDisponibili.slice(0, numeroRecensioni);

            for (const user of utentiRecensori) {
                // Generazione di un rating pesato in modo da avere più recensioni positive che negative (realistico per un ricettario)
                const poolRatings = [3, 4, 4, 4, 5, 5, 5, 5, 2, 1];
                const rating = poolRatings[Math.floor(Math.random() * poolRatings.length)];

                // Salvataggio nel database tramite il Model esistente, che in automatico farà INSERT OR REPLACE
                await Recipe.aggiungiRecensione(user.id, recipe.id, rating);
                recensioniInserite++;
            }
        }

        console.log('\n🎉 Seeding delle recensioni completato con successo!');
        console.log(`Sono state inserite **${recensioniInserite}** recensioni casuali sulle ricette del sito.`);
        
        process.exit(0);

    } catch (err) {
        console.error('Errore durante il seeding delle recensioni:', err);
        process.exit(1);
    }
}

eseguiSeedingRecensioni();
