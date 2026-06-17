'use strict';


/**
 * Classe per la gestione delle raccolte dell'utente (creazione ed eliminazione).
 */
class GestioneRaccolte {
    constructor() {
        this.btnNuova = document.getElementById('btn-nuova-raccolta');
        this.btnNuovaEmpty = document.getElementById('btn-nuova-raccolta-empty');
        this.btnSalva = document.getElementById('btn-salva-raccolta');
        this.modalEl = document.getElementById('modalCreaRaccolta');
        this.inputNome = document.getElementById('nomeRaccolta');
        this.errorEl = document.getElementById('modal-crea-error');
        this.btnEliminaList = document.querySelectorAll('.btn-elimina-raccolta');

        if (this.modalEl) {
            this.modal = new bootstrap.Modal(this.modalEl);
            this.init();
        }
    }

    // Inizializzazione dei listener degli eventi.
    init() {
        if (this.btnNuova) {
            this.btnNuova.addEventListener('click', () => this.apriModale());
        }
        if (this.btnNuovaEmpty) {
            this.btnNuovaEmpty.addEventListener('click', () => this.apriModale());
        }
        if (this.btnSalva) {
            this.btnSalva.addEventListener('click', () => this.salvaRaccolta());
        }
        
        this.btnEliminaList.forEach(btn => {
            btn.addEventListener('click', () => this.confermaEliminazione(btn));
        });
    }

    // Apre il modale di creazione raccolta resettando il campo nome.
    apriModale() {
        if (this.inputNome) this.inputNome.value = '';
        if (this.errorEl) this.errorEl.classList.add('d-none');
        this.modal.show();
    }

    // Invia la richiesta di creazione raccolta e reindirizza in caso di successo.
    async salvaRaccolta() {
        const name = this.inputNome.value.trim();

        if (!name) {
            this.errorEl.textContent = 'Il nome della raccolta è obbligatorio.';
            this.errorEl.classList.remove('d-none');
            return;
        }

        try {
            this.btnSalva.disabled = true;
            const res = await fetch('/raccolte/crea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();

            if (data.success) {
                this.modalEl.addEventListener('hidden.bs.modal', function onHidden() {
                    this.removeEventListener('hidden.bs.modal', onHidden);
                    if (typeof page !== 'undefined') page('/raccolte');
                    else window.location.href = '/raccolte';
                });
                this.modal.hide();
            } else {
                this.errorEl.textContent = data.error || 'Errore durante la creazione.';
                this.errorEl.classList.remove('d-none');
            }
        } catch (err) {
            console.error('Errore creazione raccolta:', err);
        } finally {
            this.btnSalva.disabled = false;
        }
    }

    // Chiede conferma all'utente ed esegue la richiesta di eliminazione raccolta.
    async confermaEliminazione(btn) {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (!confirm(`Sei sicuro di voler eliminare definitivamente la raccolta "${name}"? Le ricette non verranno cancellate.`)) return;

        try {
            const res = await fetch(`/raccolte/${id}/elimina`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();

            if (data.success) {
                this.rimuoviCardDallaUI(btn);
            }
        } catch (err) {
            console.error('Errore eliminazione raccolta:', err);
            alert('Impossibile eliminare la raccolta. Riprova più tardi.');
        }
    }

    // Rimuove con animazione la card della raccolta eliminata dal DOM.
    rimuoviCardDallaUI(btn) {
        const colonna = btn.closest('.col');
        if (colonna) {
            colonna.style.transition = 'all 0.3s ease';
            colonna.style.opacity = '0';
            colonna.style.transform = 'scale(0.95)';

            setTimeout(() => {
                colonna.remove();
                if (!document.querySelector('.collection-card')) {
                    window.location.reload();
                }
            }, 300);
        }
    }
}

function initCollectionsPage() {
    new GestioneRaccolte();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollectionsPage);
} else {
    initCollectionsPage();
}
