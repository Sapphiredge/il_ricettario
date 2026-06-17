'use strict';


// Gestione eliminazione ricette
class GestioneDashboard {
    constructor() {
        this.listaRicette = document.getElementById('recipes-grid');
        this.statTotale = document.getElementById('stat-total-recipes');

        this.init();
    }

    init() {
        if (this.listaRicette) {
            this.listaRicette.addEventListener('click', (e) => this.handleAction(e));
        }
    }

    handleAction(e) {
        const btnElimina = e.target.closest('.delete-recipe-btn');
        if (btnElimina) {
            this.confermaEliminazione(btnElimina);
            return;
        }

        const btnModifica = e.target.closest('.edit-recipe-btn');
        if (btnModifica) {
            const idRicetta = btnModifica.dataset.id;
            window.location.href = `/ricette/${idRicetta}/modifica`;
        }
    }

    // Messaggio di conferma
    async confermaEliminazione(btn) {
        const idRicetta = btn.dataset.id;
        const titoloElement = btn.closest('.card-body').querySelector('.card-title');
        const titolo = titoloElement ? titoloElement.textContent : 'questa ricetta';

        if (confirm(`Sei sicuro di voler eliminare definitivamente "${titolo}"?`)) {
            await this.eliminaRicetta(idRicetta, btn);
        }
    }

    // Elimina ricetta
    async eliminaRicetta(id, btn) {
        try {
            const response = await fetch(`/ricette/${id}/cancella`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                this.rimuoviCardDallaUI(btn);
                this.aggiornaContatore();
            } else {
                throw new Error('Errore nella risposta del server');
            }
        } catch (err) {
            console.error('Errore durante l\'eliminazione:', err);
            alert('Impossibile eliminare la ricetta. Riprova più tardi.');
        }
    }

    // Rimuovi card dalla UI (con animazione)
    rimuoviCardDallaUI(btn) {
        const colonna = btn.closest('.col');
        if (colonna) {
            colonna.style.transition = 'all 0.3s ease';
            colonna.style.opacity = '0';
            colonna.style.transform = 'scale(0.95)';

            setTimeout(() => {
                colonna.remove();
                // Se non ci sono più ricette, ricarica per mostrare il messaggio empty
                if (this.listaRicette && this.listaRicette.children.length === 0) {
                    window.location.reload();
                }
            }, 300);
        }
    }

    // Aggiorna contatore
    aggiornaContatore() {
        if (this.statTotale) {
            const attuale = parseInt(this.statTotale.textContent, 10);
            this.statTotale.textContent = attuale > 0 ? attuale - 1 : 0;
        }
    }
}

// Funzione di inizializzazione per il Dashboard Chef.
function initChefDashboard() {
    if (document.getElementById('recipes-grid')) {
        new GestioneDashboard();
    }
}

// Supporto per SPA: se il DOM è già pronto, inizializza subito.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChefDashboard);
} else {
    initChefDashboard();
}
