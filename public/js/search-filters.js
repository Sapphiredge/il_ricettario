'use strict';

/**
 * Classe per la gestione dei filtri di ricerca avanzata e dell'integrazione SPA.
 */
class FiltriAvanzati {
    constructor() {
        this.formFiltri = document.getElementById('form-ricerca-filtri');
        this.pillsCategoria = document.querySelectorAll('.filter-pill');
        this.labelAllergeni = document.querySelectorAll('.filter-allergen-label');

        this.init();
    }

    // Inizializza i listener degli eventi.
    init() {
        this.pillsCategoria.forEach(pill => {
            pill.addEventListener('click', (e) => this.handlePillClick(e, pill));
        });

        this.labelAllergeni.forEach(label => {
            label.addEventListener('click', (e) => this.handleAllergenClick(e, label));
        });

        if (this.formFiltri) {
            this.formFiltri.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // Gestisce l'evento di click su una pill di filtro.
    handlerClickPillola(e, pill) {
        e.preventDefault();

        const input = pill.querySelector('input[type="radio"]');
        if (!input) return;
        // In caso di filtro attivo lo rimuove
        if (input.checked && pill.classList.contains('active')) {
            input.checked = false;
            pill.classList.remove('active');
        } else {

            const name = input.name;
            document.querySelectorAll(`input[name="${name}"]`).forEach(other => {
                other.checked = false;
                other.closest('.filter-pill')?.classList.remove('active');
            });

            input.checked = true;
            pill.classList.add('active');
        }
    }

    // gestione attivazione filtro per allergeni
    handlerClickAllergene(e, label) {
        e.preventDefault();

        const input = label.querySelector('input[type="checkbox"]');
        if (!input) return;

        // Inverte lo stato della checkbox e aggiorna la classe attiva
        input.checked = !input.checked;
        label.classList.toggle('active', input.checked);
    }

    // Gestione invio form ricerca
    handlerInvioFormRicerca(e) {
        e.preventDefault();

        const formData = new FormData(this.formFiltri);
        const params = new URLSearchParams();

        const q = formData.get('q');
        if (q?.trim()) params.set('q', q.trim());

        // Filtri a selezione singola
        ['category', 'cooking_method', 'difficulty'].forEach(key => {
            const val = formData.get(key);
            if (val) params.set(key, val);
        });

        // Filtri a selezione multipla (checkbox degli allergeni da escludere)
        formData.getAll('allergens').forEach(a => params.append('allergens', a));

        const url = `/cerca?${params.toString()}`;

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
