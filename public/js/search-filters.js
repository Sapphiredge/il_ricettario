'use strict';

/**
 * Classe per la gestione dei filtri di ricerca avanzata e dell'integrazione SPA.
 */
class FiltriAvanzati {
    /**
     * Inizializza i selettori degli elementi DOM principali.
     */
    constructor() {
        this.formFiltri = document.getElementById('form-ricerca-filtri');
        this.pillsCategoria = document.querySelectorAll('.filter-pill');
        this.labelAllergeni = document.querySelectorAll('.filter-allergen-label');

        this.init();
    }

    /**
     * Registra i listener per gli eventi della pagina di ricerca.
     */
    init() {
        // Gestione delle pill interattive (pulsanti radio per categoria, metodo cottura e difficoltà)
        this.pillsCategoria.forEach(pill => {
            pill.addEventListener('click', (e) => this.handlePillClick(e, pill));
        });

        // Gestione visiva delle checkbox degli allergeni (effetto toggle attivo)
        this.labelAllergeni.forEach(label => {
            label.addEventListener('click', (e) => this.handleAllergenClick(e, label));
        });

        // Gestione dell'invio del form compatibile con SPA/Page.js
        if (this.formFiltri) {
            this.formFiltri.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    /**
     * Gestisce l'evento di click su una pill di filtro.
     * @param {Event} e - L'evento di click originale.
     * @param {HTMLElement} pill - L'elemento DOM della pill cliccata.
     */
    handlePillClick(e, pill) {
        e.preventDefault(); // Previene il doppio evento dovuto a label + input radio

        const input = pill.querySelector('input[type="radio"]');
        if (!input) return;

        // Se la pill è già attiva, la deseleziona (funzione toggle-off)
        if (input.checked && pill.classList.contains('active')) {
            input.checked = false;
            pill.classList.remove('active');
        } else {
            // Deseleziona le altre pill della stessa categoria di filtro
            const name = input.name;
            document.querySelectorAll(`input[name="${name}"]`).forEach(other => {
                other.checked = false;
                other.closest('.filter-pill')?.classList.remove('active');
            });

            // Seleziona la pill corrente
            input.checked = true;
            pill.classList.add('active');
        }
    }

    /**
     * Gestisce l'evento di click sulla label di esclusione di un allergene.
     * @param {Event} e - L'evento di click originale.
     * @param {HTMLElement} label - La label dell'allergene.
     */
    handleAllergenClick(e, label) {
        e.preventDefault(); // Previene il doppio evento

        const input = label.querySelector('input[type="checkbox"]');
        if (!input) return;

        // Inverte lo stato della checkbox e aggiorna la classe attiva
        input.checked = !input.checked;
        label.classList.toggle('active', input.checked);
    }

    /**
     * Gestisce l'invio del form di ricerca, serializzando i dati e aggiornando la rotta.
     * @param {Event} e - L'evento di submit del form.
     */
    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.formFiltri);
        const params = new URLSearchParams();

        // Query di testo libero
        const q = formData.get('q');
        if (q?.trim()) params.set('q', q.trim());

        // Filtri a selezione singola (radio button)
        ['category', 'cooking_method', 'difficulty'].forEach(key => {
            const val = formData.get(key);
            if (val) params.set(key, val);
        });

        // Filtri a selezione multipla (checkbox degli allergeni da escludere)
        formData.getAll('allergens').forEach(a => params.append('allergens', a));

        const url = `/cerca?${params.toString()}`;

        // Reindirizza usando il router SPA (Page.js) o ricaricando la pagina
        if (typeof page !== 'undefined') {
            page(url);
        } else {
            window.location.href = url;
        }
    }
}

/**
 * Funzione di inizializzazione per i filtri di ricerca.
 */
function initSearchFiltersPage() {
    if (document.getElementById('form-ricerca-filtri')) {
        new FiltriAvanzati();
    }
}

// Supporto per SPA (Single Page Application)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchFiltersPage);
} else {
    initSearchFiltersPage();
}
