'use strict';


// Classe per la gestione delle interazioni nella pagina della singola ricetta.
class GestioneRicetta {
    constructor(config) {
        this.recipeId = config.recipeId;
        this.btnDelete = config.btnDelete;
        this.starInputs = config.starInputs;
        this.starIcons = config.starIcons;

        this.init();
    }

    init() {
        // Listener eliminazione
        if (this.btnDelete) {
            this.btnDelete.addEventListener('click', () => this.confermaEliminazione());
        }

        // Listener stelline (Voto e Hover)
        this.starInputs?.forEach((input, index) => {
            // Click sulla stella per votare
            input.addEventListener('change', () => this.aggiornaVisualizzazioneStelle(parseInt(input.value)));

            const label = input.parentElement;
            // Entrata mouse (effetto hover giallo)
            label.addEventListener('mouseenter', () => this.evidenziaStelleHover(index));
            // Uscita mouse (ripristina voto attuale)
            label.addEventListener('mouseleave', () => {
                const checked = document.querySelector('.star-input:checked');
                this.aggiornaVisualizzazioneStelle(checked ? parseInt(checked.value) : 0);
            });
        });
    }



    // Colora le stelle in base al voto selezionato.
    aggiornaVisualizzazioneStelle(rating) {
        this.starIcons.forEach((icon, i) => {
            if (i < rating) {
                icon.classList.add('star-attiva');
            } else {
                icon.classList.remove('star-attiva');
            }
        });
    }

    // Evidenzia le stelle al passaggio del mouse.
    evidenziaStelleHover(index) {
        this.starIcons.forEach((icon, i) => {
            if (i <= index) {
                icon.classList.add('star-attiva');
            } else {
                icon.classList.remove('star-attiva');
            }
        });
    }

    // Gestione eliminazione via AJAX
    async confermaEliminazione() {
        const titolo = this.btnDelete?.dataset.title || 'questa ricetta';
        if (confirm(`Sei sicuro di voler eliminare definitivamente "${titolo}"? L'operazione è irreversibile.`)) {
            await this.eliminaRicetta();
        }
    }

    // Invia la richiesta DELETE e reindirizza alla dashboard in caso di successo.
    async eliminaRicetta() {
        try {
            const response = await fetch(`/ricette/${this.recipeId}/cancella`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Utilizza il router page.js se disponibile, altrimenti redirect standard
                if (typeof page !== 'undefined') {
                    page('/chef/dashboard');
                } else {
                    window.location.href = '/chef/dashboard';
                }
            } else {
                throw new Error('Impossibile eliminare la ricetta.');
            }
        } catch (err) {
            console.error('Errore eliminazione:', err);
            alert('Si è verificato un errore durante l\'eliminazione. Riprova più tardi.');
        }
    }
}

// Gestione paginazione recensioni
class PaginatoreRecensioni {
    constructor(config) {
        this.righe = config.righe;
        this.btnPrecedente = config.btnPrecedente;
        this.btnSuccessivo = config.btnSuccessivo;
        this.spanPaginaCorrente = config.spanPaginaCorrente;
        this.spanTotalePagine = config.spanTotalePagine;
        this.containerPagination = config.containerPagination;

        this.oggettiPerPagina = 4;
        this.paginaIniziale = 1;

        this.init();
    }

    // Inizializzazione dei listener di navigazione della paginazione recensioni.
    init() {
        if (!this.righe || this.righe.length === 0) {
            if (this.containerPagination) {
                this.containerPagination.classList.add('d-none');
            }
            return;
        }

        this.btnPrecedente.addEventListener('click', () => {
            if (this.paginaIniziale > 1) {
                this.paginaIniziale--;
                this.aggiornaVisualizzazione();
                this.scrollToTop();
            }
        });

        this.btnSuccessivo.addEventListener('click', () => {
            const totalePagine = Math.ceil(this.righe.length / this.oggettiPerPagina) || 1;
            if (this.paginaIniziale < totalePagine) {
                this.paginaIniziale++;
                this.aggiornaVisualizzazione();
                this.scrollToTop();
            }
        });

        this.aggiornaVisualizzazione();
    }

    // metodo per aggiornare la visualizzazione delle recensioni
    aggiornaVisualizzazione() {
        const totalePagine = Math.ceil(this.righe.length / this.oggettiPerPagina) || 1;

        if (this.containerPagination) {
            if (totalePagine > 1) {
                this.containerPagination.classList.remove('d-none');
            } else {
                this.containerPagination.classList.add('d-none');
            }
        }

        if (this.paginaIniziale > totalePagine) this.paginaIniziale = totalePagine;
        if (this.paginaIniziale < 1) this.paginaIniziale = 1;

        this.righe.forEach(riga => {
            riga.classList.remove('d-block');
            riga.classList.add('d-none');
        });

        const inizio = (this.paginaIniziale - 1) * this.oggettiPerPagina;
        const fine = inizio + this.oggettiPerPagina;

        Array.from(this.righe).slice(inizio, fine).forEach(riga => {
            riga.classList.remove('d-none');
            riga.classList.add('d-block');
        });

        // Aggiorna interfaccia utente
        if (this.spanPaginaCorrente) this.spanPaginaCorrente.textContent = this.paginaIniziale;
        if (this.spanTotalePagine) this.spanTotalePagine.textContent = totalePagine;

        this.btnPrecedente.disabled = this.paginaIniziale === 1;
        this.btnSuccessivo.disabled = this.paginaIniziale === totalePagine;

        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 50);
        }
    }

    // Scorre la pagina fino alla sezione delle recensioni.
    scrollToTop() {
        const section = document.querySelector('.border-top.pt-5');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Validazione form recensione: alert se c'è commento senza stelline.
class ValidatoreRecensione {
    constructor(config) {
        this.form = config.form;
        this.alert = config.alert;
        this.commento = config.commento;

        this.init();
    }

    // Registra il listener per la validazione al submit del form.
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Valida la presenza del voto e invia la recensione via AJAX.
    async handleSubmit(e) {
        e.preventDefault();
        const hasRating = !!document.querySelector('.star-input:checked');

        if (!hasRating) {
            this.mostraAlert();
            return;
        }

        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch(this.form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Ricarica la pagina tramite router per mostrare la nuova recensione
                if (typeof page !== 'undefined') {
                    page(window.location.pathname);
                } else {
                    window.location.reload();
                }
            } else {
                throw new Error('Errore durante l\'invio della recensione');
            }
        } catch (err) {
            console.error('Errore recensione:', err);
            alert('Si è verificato un errore durante l\'invio della recensione.');
        }
    }

    // Mostra l'alert di errore per voto mancante e lo nasconde dopo 4 secondi.
    mostraAlert() {
        this.alert.classList.remove('d-none');
        setTimeout(() => this.alert.classList.add('d-none'), 4000);
    }
}

// Inizializzazione della pagina ricetta.
function initRecipePage() {
    const btnSalva = document.getElementById('btn-save-recipe');

    // 1. Inizializzazione GestioneRicetta (Salva / Rating)
    if (btnSalva) {
        new GestioneRicetta({
            btnSalva: btnSalva,
            iconSalva: document.getElementById('saved-icon'),
            starInputs: document.querySelectorAll('.star-input'),
            starIcons: document.querySelectorAll('.star-icon'),
            recipeId: btnSalva ? btnSalva.dataset.recipeId : document.getElementById('btn-delete-recipe')?.dataset.id,
            btnDelete: document.getElementById('btn-delete-recipe')
        });
    } else {
        // Se non c'è il tasto salva (magari autore o admin), cerchiamo comunque il tasto elimina
        const btnDelete = document.getElementById('btn-delete-recipe');
        if (btnDelete) {
            new GestioneRicetta({
                recipeId: btnDelete.dataset.id,
                btnDelete: btnDelete
            });
        }
    }

    // 2. Inizializzazione Paginatore Recensioni
    const reviewCards = document.querySelectorAll('.review-card');
    if (reviewCards.length > 0) {
        new PaginatoreRecensioni({
            righe: reviewCards,
            btnPrecedente: document.getElementById('prev-reviews'),
            btnSuccessivo: document.getElementById('next-reviews'),
            spanPaginaCorrente: document.getElementById('current-page-reviews'),
            spanTotalePagine: document.getElementById('total-pages-reviews'),
            containerPagination: document.getElementById('pagination-reviews')
        });
    }

    // 3. Inizializzazione Validatore Form Recensione
    const formRecensione = document.getElementById('review-form');
    if (formRecensione) {
        new ValidatoreRecensione({
            form: formRecensione,
            alert: document.getElementById('review-rating-alert'),
            commento: document.getElementById('reviewComment')
        });
    }
}

// Esegui inizializzazione: se il DOM è già pronto (SPA), esegui subito.
// Altrimenti aspetta l'evento DOMContentLoaded (Caricamento iniziale).
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecipePage);
} else {
    initRecipePage();
}