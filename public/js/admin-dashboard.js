'use strict';

/**
 * Classe per la gestione della paginazione lato client nelle tabelle.
 */
class Paginatore {
    constructor(config) {
        this.inputRicerca = config.inputRicerca;
        this.righe = config.righe;
        this.btnPrecedente = config.btnPrecedente;
        this.btnSuccessivo = config.btnSuccessivo;
        this.spanPaginaCorrente = config.spanPaginaCorrente;
        this.spanTotalePagine = config.spanTotalePagine;

        this.oggettiPerPagina = 5;
        this.paginaIniziale = 1;

        this.init();
    }

    /**
     * Inizializza i listener degli eventi.
     */
    init() {
        this.inputRicerca.addEventListener('input', () => {
            this.paginaIniziale = 1;
            this.aggiornaTabella();
        });

        this.btnPrecedente.addEventListener('click', () => {
            if (this.paginaIniziale > 1) {
                this.paginaIniziale--;
                this.aggiornaTabella();
            }
        });

        this.btnSuccessivo.addEventListener('click', () => {
            const stringRicerca = this.inputRicerca.value.toLowerCase();
            const righeFiltrateCount = Array.from(this.righe).filter(riga =>
                riga.textContent.toLowerCase().includes(stringRicerca)
            ).length;
            const totalePagine = Math.ceil(righeFiltrateCount / this.oggettiPerPagina) || 1;

            if (this.paginaIniziale < totalePagine) {
                this.paginaIniziale++;
                this.aggiornaTabella();
            }
        });

        this.aggiornaTabella();
    }

    /**
     * Aggiorna la visibilità delle righe e l'interfaccia utente.
     */
    aggiornaTabella() {
        const stringRicerca = this.inputRicerca.value.toLowerCase();

        // 1. Filtro
        const righeFiltrate = Array.from(this.righe).filter(riga => {
            return riga.textContent.toLowerCase().includes(stringRicerca);
        });

        const totalePagine = Math.ceil(righeFiltrate.length / this.oggettiPerPagina) || 1;

        // 2. Sicurezza: mantieni la pagina entro i limiti
        if (this.paginaIniziale > totalePagine) this.paginaIniziale = totalePagine;
        if (this.paginaIniziale < 1) this.paginaIniziale = 1;

        // 3. Nascondi tutte le righe
        this.righe.forEach(riga => riga.style.display = 'none');

        // 4. Mostra pezzetto (slice) per la pagina attuale
        const inizio = (this.paginaIniziale - 1) * this.oggettiPerPagina;
        const fine = inizio + this.oggettiPerPagina;

        righeFiltrate.slice(inizio, fine).forEach(riga => {
            riga.style.display = '';
        });

        // 5. Aggiorna interfaccia utente
        if (this.spanPaginaCorrente) this.spanPaginaCorrente.textContent = this.paginaIniziale;
        if (this.spanTotalePagine) this.spanTotalePagine.textContent = totalePagine;

        this.btnPrecedente.disabled = this.paginaIniziale === 1;
        this.btnSuccessivo.disabled = this.paginaIniziale === totalePagine;

        const container = this.btnPrecedente.closest('.pagination-container');
        if (container) {
            container.style.display = righeFiltrate.length === 0 ? 'none' : 'flex';
        }

        // Ricalcola le posizioni degli elementi per AOS (Animazioni di scroll)
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 50);
        }
    }
}

/**
 * Classe per la gestione dei ban via AJAX.
 */
class GestioneBan {
    constructor() {
        this.init();
    }

    init() {
        // Gestione ban ricette
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            if (form.classList.contains('admin-recipe-ban-form') || form.classList.contains('admin-user-ban-form')) {
                e.preventDefault();
                await this.eseguiToggleBan(form);
            }
        });
    }

    async eseguiToggleBan(form) {
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                this.aggiornaUI(form, data.is_banned);
            } else {
                throw new Error('Errore nella risposta del server');
            }
        } catch (err) {
            console.error('Errore ban:', err);
            alert('Impossibile completare l\'operazione. Riprova più tardi.');
        }
    }

    aggiornaUI(form, isBanned) {
        const btn = form.querySelector('button');
        const icon = btn.querySelector('.material-symbols-outlined');
        const riga = form.closest('tr');
        const statusBadge = riga.querySelector('.recipe-status-badge, .user-status-badge');

        // Aggiorna bottone
        if (isBanned) {
            btn.classList.add('bg-danger', 'bg-opacity-10', 'text-danger', 'border-danger');
            btn.classList.remove('text-secondary');
            btn.title = btn.title.replace('Blocca', 'Sblocca');
            icon.textContent = 'lock_open';
        } else {
            btn.classList.remove('bg-danger', 'bg-opacity-10', 'text-danger', 'border-danger');
            btn.classList.add('text-secondary');
            btn.title = btn.title.replace('Sblocca', 'Blocca');
            icon.textContent = 'block';
        }

        // Aggiorna badge stato
        if (statusBadge) {
            if (isBanned) {
                statusBadge.classList.replace('bg-success', 'bg-danger');
                statusBadge.classList.replace('text-success', 'text-danger');
                statusBadge.textContent = statusBadge.textContent.includes('Ricetta') || statusBadge.classList.contains('recipe-status-badge') ? 'Bannata' : 'Bannato';
            } else {
                statusBadge.classList.replace('bg-danger', 'bg-success');
                statusBadge.classList.replace('text-danger', 'text-success');
                statusBadge.textContent = statusBadge.textContent.includes('Ricetta') || statusBadge.classList.contains('recipe-status-badge') ? 'Attiva' : 'Attivo';
            }
        }
    }
}

// Funzione di inizializzazione per il Dashboard Admin.
function initAdminDashboard() {
    new GestioneBan();
    // Configurazione Ricette
    const ricetteConfig = {
        inputRicerca: document.getElementById('search-recipes'),
        righe: document.querySelectorAll('.recipe-row'),
        btnPrecedente: document.getElementById('prev-recipes'),
        btnSuccessivo: document.getElementById('next-recipes'),
        spanPaginaCorrente: document.getElementById('current-page-recipes'),
        spanTotalePagine: document.getElementById('total-pages-recipes')
    };

    if (ricetteConfig.inputRicerca) new Paginatore(ricetteConfig);

    // Configurazione Utenti
    const utentiConfig = {
        inputRicerca: document.getElementById('search-users'),
        righe: document.querySelectorAll('.user-row'),
        btnPrecedente: document.getElementById('prev-users'),
        btnSuccessivo: document.getElementById('next-users'),
        spanPaginaCorrente: document.getElementById('current-page-users'),
        spanTotalePagine: document.getElementById('total-pages-users')
    };

    if (utentiConfig.inputRicerca) new Paginatore(utentiConfig);
}

// Supporto per SPA: se il DOM è già pronto, inizializza subito.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
    initAdminDashboard();
}

