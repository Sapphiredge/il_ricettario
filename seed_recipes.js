const Recipe = require('./models/recipeDAO');
const db = require('./models/db');

const basiRicette = [
    {
        title: 'Spaghetti alla Carbonara', cat: 'Primi', cooking_method: 'Padella',
        tags: ['romana', 'tradizionale', 'veloce', 'maiale'], drink: 'Frascati Superiore',
        ingredients: [
            { name: 'Spaghetti', amount: '320g' }, { name: 'Guanciale', amount: '150g' },
            { name: 'Pecorino Romano', amount: '60g' }, { name: 'Tuorli', amount: '4' },
            { name: 'Pepe Nero', amount: 'q.b.' }
        ]
    },
    {
        title: 'Tiramisù Classico', cat: 'Dolci', cooking_method: 'Nessuna cottura',
        tags: ['dolce', 'classico', 'freddo', 'caffè'], drink: 'Moscato d\'Asti',
        ingredients: [
            { name: 'Savoiardi', amount: '300g' }, { name: 'Mascarpone', amount: '500g' },
            { name: 'Uova', amount: '4' }, { name: 'Zucchero', amount: '100g' },
            { name: 'Caffè espresso', amount: '300ml' }, { name: 'Cacao amaro', amount: 'q.b.' }
        ]
    },
    {
        title: 'Lasagne al Forno', cat: 'Primi', cooking_method: 'Forno',
        tags: ['domenica', 'famiglia', 'tradizionale', 'carne'], drink: 'Lambrusco',
        ingredients: [
            { name: 'Sfoglia per lasagne', amount: '500g' }, { name: 'Ragù di carne', amount: '1L' },
            { name: 'Besciamella', amount: '500ml' }, { name: 'Parmigiano Reggiano', amount: '150g' }
        ]
    },
    {
        title: 'Risotto ai Funghi Porcini', cat: 'Primi', cooking_method: 'Padella',
        tags: ['autunno', 'vegetariano', 'raffinato'], drink: 'Pinot Nero',
        ingredients: [
            { name: 'Riso Carnaroli', amount: '320g' }, { name: 'Funghi Porcini', amount: '400g' },
            { name: 'Brodo Vegetale', amount: '1L' }, { name: 'Vino bianco', amount: '1 bicchiere' },
            { name: 'Burro', amount: '50g' }, { name: 'Parmigiano Reggiano', amount: '40g' }
        ]
    },
    {
        title: 'Pollo alla Cacciatora', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['carne', 'rustico', 'famiglia', 'pomodoro'], drink: 'Chianti Classico',
        ingredients: [
            { name: 'Pollo a pezzi', amount: '1kg' }, { name: 'Pomodori pelati', amount: '400g' },
            { name: 'Olive nere', amount: '100g' }, { name: 'Vino rosso', amount: '1 bicchiere' },
            { name: 'Cipolla', amount: '1' }, { name: 'Rosmarino', amount: '2 rametti' }
        ]
    },
    {
        title: 'Melanzane alla Parmigiana', cat: 'Secondi', cooking_method: 'Forno',
        tags: ['vegetariano', 'campana', 'estivo'], drink: 'Fiano di Avellino',
        ingredients: [
            { name: 'Melanzane ovali', amount: '1kg' }, { name: 'Passata di pomodoro', amount: '700ml' },
            { name: 'Mozzarella', amount: '350g' }, { name: 'Parmigiano Reggiano', amount: '100g' },
            { name: 'Basilico fresco', amount: '1 mazzetto' }, { name: 'Olio per friggere', amount: 'q.b.' }
        ]
    },
    {
        title: 'Pesto alla Genovese', cat: 'Antipasti', cooking_method: 'Nessuna cottura',
        tags: ['ligure', 'estivo', 'vegetariano', 'veloce'], drink: 'Vermentino',
        ingredients: [
            { name: 'Basilico genovese DOP', amount: '50g' }, { name: 'Pinoli', amount: '15g' },
            { name: 'Aglio', amount: '1 spicchio' }, { name: 'Olio EVO', amount: '100ml' },
            { name: 'Parmigiano Reggiano', amount: '70g' }, { name: 'Pecorino Fiore Sardo', amount: '30g' }
        ]
    },
    {
        title: 'Gnocchi di Patate al Pomodoro', cat: 'Primi', cooking_method: 'Pentola',
        tags: ['domenica', 'fatto in casa', 'vegetariano'], drink: 'Trebbiano',
        ingredients: [
            { name: 'Patate vecchie', amount: '1kg' }, { name: 'Farina 00', amount: '300g' },
            { name: 'Uovo', amount: '1' }, { name: 'Passata di pomodoro', amount: '500ml' },
            { name: 'Parmigiano', amount: '50g' }, { name: 'Basilico', amount: 'q.b.' }
        ]
    },
    {
        title: 'Ossobuco alla Milanese', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['lombarda', 'invernale', 'carne'], drink: 'Barbera d\'Alba',
        ingredients: [
            { name: 'Ossibuchi di vitello', amount: '4' }, { name: 'Farina 00', amount: 'q.b.' },
            { name: 'Brodo di carne', amount: '500ml' }, { name: 'Vino bianco', amount: '1 bicchiere' },
            { name: 'Burro', amount: '40g' }, { name: 'Gremolada (aglio, prezzemolo, limone)', amount: 'q.b.' }
        ]
    },
    {
        title: 'Insalata Caprese', cat: 'Antipasti', cooking_method: 'Nessuna cottura',
        tags: ['fresco', 'estivo', 'veloce', 'vegetariano'], drink: 'Greco di Tufo',
        ingredients: [
            { name: 'Pomodori cuore di bue', amount: '400g' }, { name: 'Mozzarella di Bufala', amount: '250g' },
            { name: 'Olio EVO', amount: '3 cucchiai' }, { name: 'Basilico fresco', amount: '10 foglie' },
            { name: 'Sale e origano', amount: 'q.b.' }
        ]
    },
    {
        title: 'Bistecca alla Fiorentina', cat: 'Secondi', cooking_method: 'Griglia',
        tags: ['toscana', 'carne', 'griglia', 'raffinato'], drink: 'Brunello di Montalcino',
        ingredients: [
            { name: 'Bistecca T-bone (Chianina)', amount: '1.2kg' }, { name: 'Sale grosso', amount: 'q.b.' },
            { name: 'Pepe nero', amount: 'q.b.' }, { name: 'Olio EVO', amount: 'a crudo' }
        ]
    },
    {
        title: 'Focaccia Barese', cat: 'Antipasti', cooking_method: 'Forno',
        tags: ['pugliese', 'lievitato', 'pomodoro', 'rustico'], drink: 'Primitivo Rosato',
        ingredients: [
            { name: 'Semola rimacinata', amount: '250g' }, { name: 'Farina 0', amount: '250g' },
            { name: 'Lievito di birra fresco', amount: '10g' }, { name: 'Pomodorini', amount: '300g' },
            { name: 'Olive baresane', amount: '50g' }, { name: 'Olio EVO e origano', amount: 'q.b.' }
        ]
    },
    {
        title: 'Saltimbocca alla Romana', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['romana', 'carne', 'veloce'], drink: 'Frascati',
        ingredients: [
            { name: 'Fettine di vitello', amount: '400g' }, { name: 'Prosciutto crudo', amount: '4 fette' },
            { name: 'Salvia fresca', amount: '4 foglie' }, { name: 'Vino bianco', amount: 'mezzo bicchiere' },
            { name: 'Burro', amount: '30g' }, { name: 'Farina', amount: 'q.b.' }
        ]
    },
    {
        title: 'Ribollita Toscana', cat: 'Primi', cooking_method: 'Pentola',
        tags: ['toscana', 'invernale', 'vegetariano', 'povera'], drink: 'Chianti',
        ingredients: [
            { name: 'Cavolo nero', amount: '400g' }, { name: 'Fagioli cannellini', amount: '300g' },
            { name: 'Pane toscano raffermo', amount: '250g' }, { name: 'Verza', amount: '200g' },
            { name: 'Pomodori pelati', amount: '200g' }, { name: 'Olio EVO', amount: 'q.b.' }
        ]
    },
    {
        title: 'Polenta Concia', cat: 'Primi', cooking_method: 'Pentola',
        tags: ['montagna', 'invernale', 'formaggio'], drink: 'Nebbiolo',
        ingredients: [
            { name: 'Farina di mais bramata', amount: '500g' }, { name: 'Acqua', amount: '2L' },
            { name: 'Fontina', amount: '250g' }, { name: 'Toma', amount: '150g' },
            { name: 'Burro', amount: '150g' }, { name: 'Aglio e salvia', amount: 'q.b.' }
        ]
    },
    {
        title: 'Cotoletta alla Milanese', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['lombarda', 'fritto', 'carne', 'bambini'], drink: 'Franciacorta',
        ingredients: [
            { name: 'Costolette di vitello con osso', amount: '2' }, { name: 'Uova', amount: '2' },
            { name: 'Pangrattato', amount: '200g' }, { name: 'Burro chiarificato', amount: '150g' },
            { name: 'Sale grosso', amount: 'q.b.' }
        ]
    },
    {
        title: 'Arancini di Riso', cat: 'Antipasti', cooking_method: 'Friggitrice',
        tags: ['siciliana', 'fritto', 'street food'], drink: 'Nero d\'Avola',
        ingredients: [
            { name: 'Riso Originario', amount: '500g' }, { name: 'Ragù di carne e piselli', amount: '250g' },
            { name: 'Zafferano', amount: '1 bustina' }, { name: 'Caciocavallo', amount: '100g' },
            { name: 'Pangrattato e farina', amount: 'per la panatura' }, { name: 'Olio di semi', amount: 'per friggere' }
        ]
    },
    {
        title: 'Caponata Siciliana', cat: 'Contorni', cooking_method: 'Padella',
        tags: ['siciliana', 'vegetariano', 'agrodolce', 'estivo'], drink: 'Grillo',
        ingredients: [
            { name: 'Melanzane', amount: '800g' }, { name: 'Sedano', amount: '2 coste' },
            { name: 'Olive verdi e capperi', amount: 'q.b.' }, { name: 'Salsa di pomodoro', amount: '200ml' },
            { name: 'Zucchero e aceto', amount: 'per agrodolce' }, { name: 'Cipolla', amount: '1' }
        ]
    },
    {
        title: 'Bucatini all\'Amatriciana', cat: 'Primi', cooking_method: 'Padella',
        tags: ['romana', 'carne', 'piccante'], drink: 'Montepulciano d\'Abruzzo',
        ingredients: [
            { name: 'Bucatini', amount: '320g' }, { name: 'Guanciale', amount: '150g' },
            { name: 'Pomodori pelati', amount: '400g' }, { name: 'Pecorino Romano', amount: '70g' },
            { name: 'Peperoncino', amount: '1' }
        ]
    },
    {
        title: 'Spaghetti Cacio e Pepe', cat: 'Primi', cooking_method: 'Padella',
        tags: ['romana', 'vegetariano', 'veloce'], drink: 'Verdicchio',
        ingredients: [
            { name: 'Spaghetti', amount: '320g' }, { name: 'Pecorino Romano DOP', amount: '200g' },
            { name: 'Pepe nero in grani', amount: 'abbondante' }, { name: 'Sale', amount: 'q.b.' }
        ]
    },
    {
        title: 'Fritto Misto di Pesce', cat: 'Secondi', cooking_method: 'Friggitrice',
        tags: ['pesce', 'fritto', 'estivo'], drink: 'Prosecco DOCG',
        ingredients: [
            { name: 'Calamari', amount: '300g' }, { name: 'Gamberi', amount: '300g' },
            { name: 'Alici e paranza', amount: '200g' }, { name: 'Farina di semola', amount: '200g' },
            { name: 'Olio di semi d\'arachide', amount: '1L' }, { name: 'Limone', amount: '1' }
        ]
    },
    {
        title: 'Trofie al Pesto', cat: 'Primi', cooking_method: 'Pentola',
        tags: ['ligure', 'vegetariano', 'veloce'], drink: 'Pigato',
        ingredients: [
            { name: 'Trofie fresche', amount: '400g' }, { name: 'Pesto genovese', amount: '150g' },
            { name: 'Patate (opzionale)', amount: '1' }, { name: 'Fagiolini (opzionale)', amount: '50g' },
            { name: 'Parmigiano grattugiato', amount: 'q.b.' }
        ]
    },
    {
        title: 'Tortelli di Zucca', cat: 'Primi', cooking_method: 'Pentola',
        tags: ['lombarda', 'autunno', 'pasta fresca', 'vegetariano'], drink: 'Lambrusco Mantovano',
        ingredients: [
            { name: 'Pasta all\'uovo', amount: '400g' }, { name: 'Zucca mantovana', amount: '600g' },
            { name: 'Amaretti', amount: '50g' }, { name: 'Mostarda mantovana', amount: '50g' },
            { name: 'Parmigiano Reggiano', amount: '100g' }, { name: 'Noce moscata', amount: 'q.b.' }
        ]
    },
    {
        title: 'Brasato al Barolo', cat: 'Secondi', cooking_method: 'Pentola',
        tags: ['piemontese', 'invernale', 'carne', 'lenta cottura'], drink: 'Barolo',
        ingredients: [
            { name: 'Cappello di prete di manzo', amount: '1kg' }, { name: 'Vino Barolo', amount: '1 bottiglia' },
            { name: 'Carote, Sedano, Cipolla', amount: '1 ciascuno' }, { name: 'Alloro, Chiodi di garofano', amount: 'q.b.' },
            { name: 'Burro', amount: '40g' }, { name: 'Brodo di carne', amount: 'q.b.' }
        ]
    },
    {
        title: 'Cannoli Siciliani', cat: 'Dolci', cooking_method: 'Friggitrice',
        tags: ['siciliana', 'dolce', 'fritto', 'ricotta'], drink: 'Passito di Pantelleria',
        ingredients: [
            { name: 'Scorze per cannoli', amount: '10' }, { name: 'Ricotta di pecora', amount: '700g' },
            { name: 'Zucchero a velo', amount: '200g' }, { name: 'Gocce di cioccolato', amount: '50g' },
            { name: 'Scorza d\'arancia candita', amount: 'q.b.' }, { name: 'Granella di pistacchio', amount: 'q.b.' }
        ]
    },
    {
        title: 'Panna Cotta ai Frutti di Bosco', cat: 'Dolci', cooking_method: 'Pentola',
        tags: ['dolce', 'al cucchiaio', 'veloce'], drink: 'Brachetto d\'Acqui',
        ingredients: [
            { name: 'Panna fresca liquida', amount: '500ml' }, { name: 'Zucchero', amount: '100g' },
            { name: 'Colla di pesce', amount: '8g' }, { name: 'Baccello di vaniglia', amount: '1' },
            { name: 'Frutti di bosco freschi', amount: '200g' }, { name: 'Succo di limone', amount: 'q.b.' }
        ]
    },
    {
        title: 'Crostata di Marmellata', cat: 'Dolci', cooking_method: 'Forno',
        tags: ['dolce', 'classico', 'colazione'], drink: 'Moscato',
        ingredients: [
            { name: 'Farina 00', amount: '300g' }, { name: 'Burro', amount: '150g' },
            { name: 'Zucchero', amount: '100g' }, { name: 'Uova', amount: '1 intero + 1 tuorlo' },
            { name: 'Marmellata a scelta', amount: '300g' }, { name: 'Scorza di limone', amount: 'q.b.' }
        ]
    },
    {
        title: 'Branzino al Forno', cat: 'Secondi', cooking_method: 'Forno',
        tags: ['pesce', 'leggero', 'salutare'], drink: 'Vermentino',
        ingredients: [
            { name: 'Branzino (spigola)', amount: '1 da 800g' }, { name: 'Patate', amount: '500g' },
            { name: 'Pomodorini', amount: '100g' }, { name: 'Prezzemolo e aglio', amount: 'q.b.' },
            { name: 'Vino bianco', amount: 'mezzo bicchiere' }, { name: 'Olio EVO', amount: 'q.b.' }
        ]
    },
    {
        title: 'Frittata di Zucchine', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['veloce', 'vegetariano', 'economico'], drink: 'Trebbiano',
        ingredients: [
            { name: 'Uova', amount: '5' }, { name: 'Zucchine', amount: '300g' },
            { name: 'Parmigiano', amount: '40g' }, { name: 'Menta fresca', amount: 'q.b.' },
            { name: 'Sale e pepe', amount: 'q.b.' }, { name: 'Olio EVO', amount: '2 cucchiai' }
        ]
    },
    {
        title: 'Spaghetti alle Vongole', cat: 'Primi', cooking_method: 'Padella',
        tags: ['campana', 'pesce', 'raffinato'], drink: 'Falanghina',
        ingredients: [
            { name: 'Spaghetti', amount: '320g' }, { name: 'Vongole veraci', amount: '1kg' },
            { name: 'Aglio', amount: '2 spicchi' }, { name: 'Prezzemolo tritato', amount: '1 mazzetto' },
            { name: 'Vino bianco', amount: '1 bicchiere' }, { name: 'Peperoncino (opzionale)', amount: 'q.b.' }
        ]
    },
    {
        title: 'Penne all\'Arrabbiata', cat: 'Primi', cooking_method: 'Padella',
        tags: ['romana', 'piccante', 'veloce', 'vegano'], drink: 'Cerasuolo d\'Abruzzo',
        ingredients: [
            { name: 'Penne rigate', amount: '320g' }, { name: 'Pomodori pelati', amount: '400g' },
            { name: 'Aglio', amount: '2 spicchi' }, { name: 'Peperoncino rosso fresco', amount: '2' },
            { name: 'Prezzemolo', amount: 'q.b.' }, { name: 'Pecorino Romano (opzionale)', amount: 'q.b.' }
        ]
    },
    {
        title: 'Minestrone di Verdure', cat: 'Primi', cooking_method: 'Pentola',
        tags: ['salutare', 'vegano', 'invernale'], drink: 'Acqua Frizzante',
        ingredients: [
            { name: 'Verdure miste di stagione', amount: '1kg' }, { name: 'Patate', amount: '200g' },
            { name: 'Fagioli borlotti o piselli', amount: '150g' }, { name: 'Cipolla, carota, sedano', amount: '1 di ciascuno' },
            { name: 'Brodo vegetale o acqua', amount: '1.5L' }, { name: 'Olio EVO e Parmigiano', amount: 'per servire' }
        ]
    },
    {
        title: 'Scaloppine al Limone', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['carne', 'veloce', 'classico'], drink: 'Chardonnay',
        ingredients: [
            { name: 'Fettine di vitello', amount: '400g' }, { name: 'Succo di limone', amount: '2 limoni' },
            { name: 'Farina 00', amount: 'q.b.' }, { name: 'Burro', amount: '40g' },
            { name: 'Prezzemolo tritato', amount: 'q.b.' }, { name: 'Sale e pepe nero', amount: 'q.b.' }
        ]
    },
    {
        title: 'Vitello Tonnato', cat: 'Antipasti', cooking_method: 'Pentola',
        tags: ['piemontese', 'freddo', 'carne'], drink: 'Gavi',
        ingredients: [
            { name: 'Girello di vitello', amount: '600g' }, { name: 'Tonno sott\'olio', amount: '150g' },
            { name: 'Uova', amount: '2 sode' }, { name: 'Acciughe', amount: '4 filetti' },
            { name: 'Capperi', amount: '1 cucchiaio' }, { name: 'Brodo vegetale', amount: 'per cuocere la carne' }
        ]
    },
    {
        title: 'Insalata di Polpo', cat: 'Antipasti', cooking_method: 'Pentola',
        tags: ['pesce', 'fresco', 'estivo'], drink: 'Ribolla Gialla',
        ingredients: [
            { name: 'Polpo verace', amount: '800g' }, { name: 'Patate', amount: '400g' },
            { name: 'Prezzemolo', amount: '1 mazzetto' }, { name: 'Aglio', amount: '1 spicchio' },
            { name: 'Succo di limone', amount: '1' }, { name: 'Olio EVO', amount: '4 cucchiai' }
        ]
    },
    {
        title: 'Zucchine Ripiene', cat: 'Secondi', cooking_method: 'Forno',
        tags: ['verdure', 'famiglia', 'forno'], drink: 'Pinot Grigio',
        ingredients: [
            { name: 'Zucchine tonde o lunghe', amount: '4' }, { name: 'Carne macinata', amount: '250g' },
            { name: 'Pangrattato', amount: '30g' }, { name: 'Uovo', amount: '1' },
            { name: 'Parmigiano grattugiato', amount: '40g' }, { name: 'Prezzemolo tritato', amount: 'q.b.' }
        ]
    },
    {
        title: 'Spezzatino di Manzo', cat: 'Secondi', cooking_method: 'Pentola',
        tags: ['carne', 'invernale', 'famiglia', 'lenta cottura'], drink: 'Rosso di Montalcino',
        ingredients: [
            { name: 'Manzo per spezzatino', amount: '800g' }, { name: 'Patate', amount: '400g' },
            { name: 'Passata di pomodoro', amount: '300ml' }, { name: 'Vino rosso', amount: '1 bicchiere' },
            { name: 'Cipolla, carota, sedano', amount: 'q.b. per soffritto' }, { name: 'Brodo', amount: '500ml' }
        ]
    },
    {
        title: 'Seppie con Piselli', cat: 'Secondi', cooking_method: 'Padella',
        tags: ['pesce', 'tradizionale', 'veloce'], drink: 'Verdicchio dei Castelli di Jesi',
        ingredients: [
            { name: 'Seppie pulite', amount: '600g' }, { name: 'Piselli surgelati o freschi', amount: '300g' },
            { name: 'Passata di pomodoro', amount: '150ml' }, { name: 'Cipolla', amount: 'mezza' },
            { name: 'Vino bianco', amount: 'mezzo bicchiere' }, { name: 'Olio EVO', amount: '3 cucchiai' }
        ]
    },
    {
        title: 'Fagioli all\'Uccelletto', cat: 'Contorni', cooking_method: 'Pentola',
        tags: ['toscana', 'vegetariano', 'rustico'], drink: 'Chianti',
        ingredients: [
            { name: 'Fagioli cannellini secchi', amount: '300g' }, { name: 'Salsa di pomodoro', amount: '300g' },
            { name: 'Salvia', amount: '5 foglie' }, { name: 'Aglio', amount: '2 spicchi' },
            { name: 'Salsicce (opzionale)', amount: '2' }, { name: 'Olio EVO', amount: 'q.b.' }
        ]
    },
    {
        title: 'Carciofi alla Giudia', cat: 'Contorni', cooking_method: 'Friggitrice',
        tags: ['romana', 'fritto', 'vegetariano'], drink: 'Frascati',
        ingredients: [
            { name: 'Carciofi romaneschi (mammole)', amount: '4' }, { name: 'Olio di semi o oliva', amount: '1L' },
            { name: 'Sale', amount: 'q.b.' }, { name: 'Limone (per pulirli)', amount: '1' }
        ]
    },
    {
        title: 'Panzerotti Fritti', cat: 'Antipasti', cooking_method: 'Friggitrice',
        tags: ['pugliese', 'street food', 'lievitato', 'fritto'], drink: 'Birra Artigianale',
        ingredients: [
            { name: 'Farina 0', amount: '500g' }, { name: 'Lievito di birra fresco', amount: '12g' },
            { name: 'Mozzarella (ben asciutta)', amount: '300g' }, { name: 'Passata di pomodoro', amount: '200g' },
            { name: 'Origano e sale', amount: 'q.b.' }, { name: 'Olio di semi per friggere', amount: '1L' }
        ]
    },
    {
        title: 'Zuppa di Pesce', cat: 'Secondi', cooking_method: 'Pentola',
        tags: ['pesce', 'ricco', 'gourmet'], drink: 'Falanghina',
        ingredients: [
            { name: 'Pesce misto (scorfano, gallinella, ecc.)', amount: '1kg' }, { name: 'Cozze e vongole', amount: '500g' },
            { name: 'Gamberoni', amount: '4' }, { name: 'Pomodori pelati', amount: '400g' },
            { name: 'Aglio e prezzemolo', amount: 'q.b.' }, { name: 'Crostini di pane', amount: 'per servire' }
        ]
    },
    {
        title: 'Baccalà alla Vicentina', cat: 'Secondi', cooking_method: 'Forno',
        tags: ['veneta', 'pesce', 'lenta cottura'], drink: 'Soave',
        ingredients: [
            { name: 'Stoccafisso secco', amount: '800g' }, { name: 'Cipolle', amount: '500g' },
            { name: 'Olio EVO', amount: '300ml' }, { name: 'Acciughe', amount: '4 filetti' },
            { name: 'Latte', amount: '500ml' }, { name: 'Parmigiano grattugiato', amount: '50g' }
        ]
    },
    {
        title: 'Torta di Mele', cat: 'Dolci', cooking_method: 'Forno',
        tags: ['dolce', 'classico', 'colazione', 'famiglia'], drink: 'Tè o Latte',
        ingredients: [
            { name: 'Mele Golden', amount: '3' }, { name: 'Farina 00', amount: '250g' },
            { name: 'Zucchero', amount: '150g' }, { name: 'Uova', amount: '3' },
            { name: 'Burro o Olio di semi', amount: '100g' }, { name: 'Lievito per dolci', amount: '1 bustina' },
            { name: 'Latte', amount: 'mezzo bicchiere' }
        ]
    },
    {
        title: 'Sbriciolata alla Nutella', cat: 'Dolci', cooking_method: 'Forno',
        tags: ['dolce', 'cioccolato', 'veloce'], drink: 'Latte freddo',
        ingredients: [
            { name: 'Farina 00', amount: '400g' }, { name: 'Burro freddo', amount: '150g' },
            { name: 'Zucchero', amount: '130g' }, { name: 'Uova', amount: '2' },
            { name: 'Lievito per dolci', amount: 'mezza bustina' }, { name: 'Nutella (o crema nocciole)', amount: '400g' }
        ]
    },
    {
        title: 'Ciambellone Soffice', cat: 'Dolci', cooking_method: 'Forno',
        tags: ['dolce', 'colazione', 'classico'], drink: 'Cappuccino',
        ingredients: [
            { name: 'Farina 00', amount: '300g' }, { name: 'Zucchero', amount: '200g' },
            { name: 'Uova', amount: '4' }, { name: 'Olio di semi', amount: '130ml' },
            { name: 'Latte o Acqua', amount: '130ml' }, { name: 'Lievito per dolci', amount: '1 bustina' }
        ]
    },
    {
        title: 'Zuccotto Fiorentino', cat: 'Dolci', cooking_method: 'Nessuna cottura',
        tags: ['toscana', 'dolce', 'al cucchiaio', 'freddo'], drink: 'Vin Santo',
        ingredients: [
            { name: 'Pan di Spagna o Savoiardi', amount: '1 confezione' }, { name: 'Ricotta fresca', amount: '500g' },
            { name: 'Zucchero a velo', amount: '150g' }, { name: 'Panna montata', amount: '200ml' },
            { name: 'Cacao amaro', amount: '2 cucchiai' }, { name: 'Gocce di cioccolato', amount: '50g' },
            { name: 'Alchermes (per bagnare)', amount: 'q.b.' }
        ]
    },
    {
        title: 'Salame di Cioccolato', cat: 'Dolci', cooking_method: 'Nessuna cottura',
        tags: ['dolce', 'cioccolato', 'freddo', 'bambini'], drink: 'Vino Liquoroso',
        ingredients: [
            { name: 'Biscotti secchi', amount: '200g' }, { name: 'Burro fuso', amount: '100g' },
            { name: 'Zucchero', amount: '100g' }, { name: 'Cacao amaro', amount: '50g' },
            { name: 'Cioccolato fondente', amount: '100g' }, { name: 'Latte', amount: '2 cucchiai' }
        ]
    },
    {
        title: 'Profiteroles al Cioccolato', cat: 'Dolci', cooking_method: 'Forno',
        tags: ['dolce', 'pasticceria', 'gourmet'], drink: 'Spumante Dolce',
        ingredients: [
            { name: 'Bignè pronti o da fare', amount: '25-30' }, { name: 'Panna fresca da montare', amount: '500ml' },
            { name: 'Cioccolato fondente', amount: '300g' }, { name: 'Latte', amount: '150ml' },
            { name: 'Zucchero a velo', amount: 'q.b. per la panna' }
        ]
    },
    {
        title: 'Babà al Rum', cat: 'Dolci', cooking_method: 'Forno',
        tags: ['campana', 'dolce', 'lievitato', 'tradizionale'], drink: 'Limoncello',
        ingredients: [
            { name: 'Farina Manitoba', amount: '300g' }, { name: 'Burro morbido', amount: '100g' },
            { name: 'Uova', amount: '4' }, { name: 'Lievito di birra', amount: '15g' },
            { name: 'Acqua, Zucchero, Rum (per la bagna)', amount: '500ml/200g/150ml' }
        ]
    }
];

async function eseguiSeeding() {
    try {
        console.log('Recupero gli utenti "chef" dal database...');
        const utentiAssoluti = await db.query('SELECT id FROM users WHERE role = ?', ['chef']);
        
        if (utentiAssoluti.length === 0) {
            console.error('ERRORE: Nessun utente "chef" trovato. Esegui prima `node seed_users.js`.');
            process.exit(1);
        }

        console.log(`Trovati ${utentiAssoluti.length} utenti. Inizio la generazione e l'inserimento di ${basiRicette.length} ricette...`);

        let inserite = 0;

        for (const base of basiRicette) {
            const randomAuthor = utentiAssoluti[Math.floor(Math.random() * utentiAssoluti.length)].id;
            
            const difficulty = ['Facile', 'Media', 'Difficile'][Math.floor(Math.random() * 3)];
            const prep_time = 15 + Math.floor(Math.random() * 30);
            const cook_time = 10 + Math.floor(Math.random() * 60);
            const servings = 2 + Math.floor(Math.random() * 4);
            const calories = 200 + Math.floor(Math.random() * 600);

            // Costruzione dell'oggetto dati per la ricetta
            const dataRicetta = {
                author_id: randomAuthor,
                title: base.title,
                description: `Deliziosa ricetta di ${base.title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
                category: base.cat,
                difficulty: difficulty,
                prep_time: prep_time,
                cook_time: cook_time,
                servings: servings,
                calories: calories,
                cooking_method: base.cooking_method,
                suggested_drink: base.drink,
                tags: base.tags.join(', '),
                ingredients: base.ingredients,
                instructions: [
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor.',
                    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
                    'Sunt in culpa qui officia deserunt mollit anim id est laborum. Praesent id enim sit amet. Suspendisse eu nisl. Nullam magna enim, imperdiet vitae, feugiat in, fringilla id, nisl.'
                ]
            };

            await Recipe.creaRicetta(dataRicetta);
            inserite++;
        }

        console.log(`\n🎉 Seeding completato con successo! Sono state inserite ${inserite} ricette altamente dettagliate.`);
        process.exit(0);

    } catch (err) {
        console.error('Errore durante il seeding delle ricette:', err);
        process.exit(1);
    }
}

eseguiSeeding();
