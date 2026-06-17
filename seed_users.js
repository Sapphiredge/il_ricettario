const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Errore nell\'apertura del database:', err.message);
        return;
    }
    console.log('Connesso al database.db per il seeding.');

    try {
        // Generiamo l'hash di una password standard per tutti i finti utenti ("password123")
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = [
            { username: 'chef_mario', full_name: 'Mario Rossi', email: 'mario.rossi@mail.com' },
            { username: 'luca_cucina', full_name: 'Luca Bianchi', email: 'luca.bianchi@mail.com' },
            { username: 'giulia_chef', full_name: 'Giulia Verdi', email: 'giulia.verdi@mail.com' },
            { username: 'anna_food', full_name: 'Anna Esposito', email: 'anna.esposito@mail.com' },
            { username: 'marco_ricette', full_name: 'Marco Romano', email: 'marco.romano@mail.com' },
            { username: 'sofia_bake', full_name: 'Sofia Colombo', email: 'sofia.colombo@mail.com' },
            { username: 'lorenzo_cook', full_name: 'Lorenzo Ricci', email: 'lorenzo.ricci@mail.com' },
            { username: 'martina_dolci', full_name: 'Martina Marino', email: 'martina.marino@mail.com' },
            { username: 'ale_pasta', full_name: 'Alessandro Greco', email: 'alessandro.greco@mail.com' },
            { username: 'chiara_gourmet', full_name: 'Chiara Gallo', email: 'chiara.gallo@mail.com' },
            { username: 'matteo_grill', full_name: 'Matteo Conti', email: 'matteo.conti@mail.com' },
            { username: 'francesca_pan', full_name: 'Francesca Fiore', email: 'francesca.fiore@mail.com' },
            { username: 'andrea_sapore', full_name: 'Andrea De Luca', email: 'andrea.deluca@mail.com' },
            { username: 'valentina_cib', full_name: 'Valentina Costa', email: 'valentina.costa@mail.com' },
            { username: 'davide_pizza', full_name: 'Davide Giordano', email: 'davide.giordano@mail.com' },
            { username: 'elena_veg', full_name: 'Elena Rizzo', email: 'elena.rizzo@mail.com' },
            { username: 'simo_foodie', full_name: 'Simone Lombardi', email: 'simone.lombardi@mail.com' },
            { username: 'ila_bistrot', full_name: 'Ilaria Moretti', email: 'ilaria.moretti@mail.com' },
            { username: 'giorgio_carne', full_name: 'Giorgio Barbieri', email: 'giorgio.barbieri@mail.com' },
            { username: 'sara_healthy', full_name: 'Sara Fontana', email: 'sara.fontana@mail.com' }
        ];

        db.serialize(() => {
            // Utilizziamo INSERT OR IGNORE in modo che, se il file viene lanciato due volte
            // non mandi in crash l'app a causa del vincolo UNIQUE su email e username.
            const stmt = db.prepare('INSERT OR IGNORE INTO users (username, full_name, email, password, role) VALUES (?, ?, ?, ?, \'chef\')');

            for (const user of users) {
                stmt.run([user.username, user.full_name, user.email, hashedPassword]);
            }

            stmt.finalize(() => {
                console.log('Seeding completato. Sono stati aggiunti nuovi utenti (se non erano già presenti).');
                console.log('📌 La password per TUTTI questi nuovi utenti è: password123');
                db.close((err) => {
                    if (err) console.error(err.message);
                    else console.log('Chiusura connessione database.');
                });
            });
        });

    } catch (error) {
        console.error('Errore durante il seeding:', error);
        db.close();
    }
});
