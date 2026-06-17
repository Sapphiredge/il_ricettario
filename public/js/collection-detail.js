'use strict';

/**
 * Gestione della pagina di una raccoolta dell'utente 
 */
class GestioneDettagliRaccolta {
    constructor() {
        this.btnElimina = document.getElementById('btn-elimina-raccolta');
        this.btnRimuoviList = document.querySelectorAll('.btn-rimuovi-ricetta');

        this.init();
    }

    // Inizializzazione dei listener degli eventi.
    init() {
        if (this.btnElimina) {
            this.btnElimina.addEventListener('click', () => this.eliminaRaccolta());
        }

        this.btnRimuoviList.forEach(btn => {
            btn.addEventListener('click', () => this.rimuoviRicetta(btn));
        });
    }

    // Funzione per eliminare una raccolta
    async eliminaRaccolta() {
        const id = this.btnElimina.dataset.id;
        const name = this.btnElimina.dataset.name;
        if (!confirm(`Eliminare la raccolta "${name}"? L'operazione è irreversibile.`)) return;

        try {
            const res = await fetch(`/raccolte/${id}/elimina`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                if (typeof page !== 'undefined') page('/raccolte');
                else window.location.href = '/raccolte';
            }
        } catch (err) {
            console.error('Errore eliminazione raccolta:', err);
        }
    }

    // Funzione per rimuovere una ricetta da una raccolta
    async rimuoviRicetta(btn) {
        const collectionId = btn.dataset.collectionId;
        const recipeId = btn.dataset.recipeId;

        try {
            const res = await fetch(`/raccolte/${collectionId}/rimuovi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ recipeId })
            });
            const data = await res.json();
            if (data.success) {
                const col = btn.closest('.col');
                if (col) {
                    col.style.transition = 'opacity 0.3s, transform 0.3s';
                    col.style.opacity = '0';
                    col.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        col.remove();
                        if (!document.querySelector('.col[data-recipe-id]')) {
                            if (typeof page !== 'undefined') page(window.location.pathname);
                            else window.location.reload();
                        }
                    }, 300);
                }
            }
        } catch (err) {
            console.error('Errore rimozione ricetta dalla raccolta:', err);
        }
    }
}

function initCollectionDetailPage() {
    new GestioneDettagliRaccolta();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollectionDetailPage);
} else {
    initCollectionDetailPage();
}
