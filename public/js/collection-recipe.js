'use strict';

//Classe helper per la gestione delle raccolte delle ricette
class GestioneRaccolteRicetta {

    constructor() {
        this.btnSave = document.getElementById('btn-save-recipe');
        this.savedIcon = document.getElementById('saved-icon');
        this.modalEl = document.getElementById('modalRaccolte');
        this.feedbackEl = document.getElementById('modal-raccolta-feedback');
        this.btnCreaModal = document.getElementById('btn-crea-raccolta-modal');
        this.inputNome = document.getElementById('nuova-raccolta-nome');
        this.lista = document.getElementById('lista-raccolte-modal');

        if (!this.btnSave || !this.modalEl) return;

        this.modal = new bootstrap.Modal(this.modalEl);
        this.contieneRaccoltaCount = document.querySelectorAll('.btn-raccolta-toggle[data-action="rimuovi"]').length;

        this.init();
    }

    init() {
        this.btnSave.addEventListener('click', () => this.modal.show());

        if (this.btnCreaModal) {
            this.btnCreaModal.addEventListener('click', () => this.creaESalva());
        }

        document.querySelectorAll('.btn-raccolta-toggle').forEach(btn => this.bindToggleBtn(btn));
    }

    //metodo per la gestione grafica del pulsante di salvataggio/rimozione ricette da una raccolta
    aggiornaBookmark() {
        if (this.contieneRaccoltaCount > 0) {
            this.btnSave.classList.add('active-saved');
            this.btnSave.classList.remove('text-secondary');
            this.savedIcon?.classList.add('fill-current');
        } else {
            this.btnSave.classList.remove('active-saved');
            this.btnSave.classList.add('text-secondary');
            this.savedIcon?.classList.remove('fill-current');
        }
    }

    //metodo per la gestione della visualizzazione del feedback all'utente al salvataggio/rimozione di una ricetta da una raccolta
    mostraFeedback(msg, tipo = 'success') {
        if (!this.feedbackEl) return;
        this.feedbackEl.textContent = msg;
        this.feedbackEl.className = `alert alert-${tipo} py-2 px-3 mb-3`;
        this.feedbackEl.classList.remove('d-none');
        setTimeout(() => this.feedbackEl.classList.add('d-none'), 3000);
    }

    //metodo per la gestione del click sui pulsanti di salvataggio/rimozione ricette da una raccolta
    bindToggleBtn(btn) {
        btn.addEventListener('click', async () => {
            const collectionId = btn.dataset.collectionId;
            const recipeId = btn.dataset.recipeId;
            const action = btn.dataset.action;

            try {
                const endpoint = action === 'aggiungi'
                    ? `/raccolte/${collectionId}/aggiungi`
                    : `/raccolte/${collectionId}/rimuovi`;

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ recipeId })
                });
                const data = await res.json();

                if (data.success) {
                    if (action === 'aggiungi') {
                        this.contieneRaccoltaCount++;
                        btn.dataset.action = 'rimuovi';
                        btn.className = 'btn btn-sm btn-success-soft btn-raccolta-toggle fw-semibold d-flex align-items-center gap-1';
                        btn.innerHTML = '<span class="material-symbols-outlined fs-6">check</span> Aggiunta';
                        this.mostraFeedback('Ricetta salvata nella raccolta!');
                    } else {
                        this.contieneRaccoltaCount = Math.max(0, this.contieneRaccoltaCount - 1);
                        btn.dataset.action = 'aggiungi';
                        btn.className = 'btn btn-sm btn-outline-primary fw-semibold d-flex align-items-center gap-1 btn-raccolta-toggle';
                        btn.innerHTML = '<span class="material-symbols-outlined fs-6">add</span> Salva';
                        this.mostraFeedback('Ricetta rimossa dalla raccolta.', 'secondary');
                    }
                    this.aggiornaBookmark();
                }
            } catch (err) {
                console.error('Errore toggle raccolta:', err);
                this.mostraFeedback('Errore durante l\'operazione.', 'danger');
            }
        });
    }

    //metodo per la gestione del click sul pulsante di creazione di una nuova raccolta all'interno del modale
    async creaESalva() {
        const nome = this.inputNome?.value.trim();
        const recipeId = this.btnCreaModal.dataset.recipeId;

        if (!nome) {
            this.mostraFeedback('Inserisci un nome per la raccolta.', 'warning');
            return;
        }

        try {
            this.btnCreaModal.disabled = true;
            this.btnCreaModal.textContent = 'Creazione...';

            const resCreate = await fetch('/raccolte/crea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ name: nome })
            });
            const created = await resCreate.json();

            if (!created.success) {
                this.mostraFeedback(created.error || 'Errore creazione raccolta.', 'danger');
                return;
            }

            await fetch(`/raccolte/${created.id}/aggiungi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ recipeId })
            });

            this.contieneRaccoltaCount++;
            this.aggiornaBookmark();

            if (this.lista) {
                this.lista.querySelector('.alert-warning')?.remove();
                this.lista.querySelector('p.text-secondary')?.remove();

                let container = this.lista.querySelector('.d-flex.flex-column.gap-2');
                if (!container) {
                    const hint = document.createElement('p');
                    hint.className = 'text-secondary small mb-3';
                    hint.textContent = 'Seleziona in quale raccolta salvare questa ricetta:';
                    this.lista.insertBefore(hint, this.lista.firstChild);
                    container = document.createElement('div');
                    container.className = 'd-flex flex-column gap-2 mb-4';
                    this.lista.appendChild(container);
                }

                const item = document.createElement('div');
                item.className = 'd-flex align-items-center justify-content-between p-3 bg-light rounded-3 border border-light collection-modal-item';
                item.innerHTML = `
                    <div class="d-flex align-items-center gap-2">
                        <span class="material-symbols-outlined fs-6 text-primary">collections_bookmark</span>
                        <span class="fw-semibold text-dark">${nome}</span>
                    </div>
                    <button class="btn btn-sm btn-success-soft btn-raccolta-toggle fw-semibold d-flex align-items-center gap-1"
                        data-collection-id="${created.id}" data-recipe-id="${recipeId}" data-action="rimuovi">
                        <span class="material-symbols-outlined fs-6">check</span> Aggiunta
                    </button>
                `;
                container.appendChild(item);
                this.bindToggleBtn(item.querySelector('.btn-raccolta-toggle'));
            }

            if (this.inputNome) this.inputNome.value = '';
            this.mostraFeedback(`Raccolta "${nome}" creata e ricetta salvata!`);
        } catch (err) {
            console.error('Errore creazione raccolta dal modale:', err);
            this.mostraFeedback('Errore durante l\'operazione.', 'danger');
        } finally {
            this.btnCreaModal.disabled = false;
            this.btnCreaModal.textContent = 'Crea e Salva';
        }
    }
}

function initCollectionRecipePage() {
    new GestioneRaccolteRicetta();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollectionRecipePage);
} else {
    initCollectionRecipePage();
}
