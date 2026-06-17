'use strict';


// Limiti massimi
const MAX_INGREDIENTI = 15;
const MAX_PASSAGGI = 10;
const MAX_CHARS_QUANTITA = 6;
const MAX_CHARS_NOME_ING = 30;
const MAX_CHARS_PASSAGGIO = 500;

// Classe per la gestione della creazione e modifica delle ricette.
class RicettaCE {
    constructor() {
        this.listaIngredienti = document.getElementById('ingredients-list');
        this.listaIstruzioni = document.getElementById('instructions-list');

        this.btnAggiungiIngrediente = document.getElementById('aggiungi-ingrediente');
        this.btnAggiungiIstruzione = document.getElementById('aggiungi-istruzione');

        this.contaIngrediente = document.getElementById('contatore-ingredienti');
        this.contaIstruzione = document.getElementById('contatore-passaggi');

        this.init();
    }

    init() {
        if (this.btnAggiungiIngrediente) {
            this.btnAggiungiIngrediente.removeAttribute('onclick');
            this.btnAggiungiIngrediente.addEventListener('click', () => this.aggiungiIngrediente());
        }

        if (this.btnAggiungiIstruzione) {
            this.btnAggiungiIstruzione.removeAttribute('onclick');
            this.btnAggiungiIstruzione.addEventListener('click', () => this.aggiungiIstruzione());
        }

        this.setupRimozione();
        this.setupAlertNomeIngrediente();
        this.aggiornaContatori();
    }

    // Restituisce il numero corrente di righe ingrediente
    getNumIngredienti() {
        return this.listaIngredienti?.querySelectorAll('.ingredient-row').length ?? 0;
    }

    // Restituisce il numero corrente di passaggi
    getNumPassaggi() {
        return this.listaIstruzioni?.querySelectorAll('.instruction-row').length ?? 0;
    }

    // Aggiorna i contatori e lo stato abilitato/disabilitato dei pulsanti
    aggiornaContatori() {
        const numIng = this.getNumIngredienti();
        const numPass = this.getNumPassaggi();

        if (this.contaIngrediente) {
            this.contaIngrediente.textContent = `${numIng} / ${MAX_INGREDIENTI}`;
            this.contaIngrediente.classList.toggle('text-danger', numIng >= MAX_INGREDIENTI);
            this.contaIngrediente.classList.toggle('fw-bold', numIng >= MAX_INGREDIENTI);
        }

        if (this.contaIstruzione) {
            this.contaIstruzione.textContent = `${numPass} / ${MAX_PASSAGGI}`;
            this.contaIstruzione.classList.toggle('text-danger', numPass >= MAX_PASSAGGI);
            this.contaIstruzione.classList.toggle('fw-bold', numPass >= MAX_PASSAGGI);
        }

        if (this.btnAggiungiIngrediente) {
            const raggiunto = numIng >= MAX_INGREDIENTI;
            this.btnAggiungiIngrediente.disabled = raggiunto;
            this.btnAggiungiIngrediente.title = raggiunto
                ? `Limite massimo di ${MAX_INGREDIENTI} ingredienti raggiunto`
                : '';
        }

        if (this.btnAggiungiIstruzione) {
            const raggiunto = numPass >= MAX_PASSAGGI;
            this.btnAggiungiIstruzione.disabled = raggiunto;
            this.btnAggiungiIstruzione.title = raggiunto
                ? `Limite massimo di ${MAX_PASSAGGI} passaggi raggiunto`
                : '';
        }
    }

    // Gestisce la rimozione dinamica di elementi dalle liste.
    setupRimozione() {
        this.listaIngredienti?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn && btn.title === 'Rimuovi ingrediente') {
                btn.parentElement.remove();
                this.aggiornaContatori();
            }
        });

        this.listaIstruzioni?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn && btn.title === 'Rimuovi passaggio') {
                btn.closest('.instruction-row').remove();
                this.indicizzaIstruzioni();
                this.aggiornaContatori();
            }
        });
    }

    // Alert inline quando il nome di un ingrediente raggiunge il limite di caratteri.
    setupAlertNomeIngrediente() {
        // Crea l'elemento alert una volta sola e lo inserisce dopo la lista
        this._alertNome = document.createElement('div');
        this._alertNome.className = 'alert alert-warning d-none py-2 px-3 mt-2 small fw-semibold';
        this._alertNome.role = 'alert';
        this._alertNome.innerHTML = `
            <span class="material-symbols-outlined fs-6 align-middle me-1">warning</span>
            Limite di ${MAX_CHARS_NOME_ING} caratteri raggiunto per il nome dell'ingrediente.
        `;
        this.listaIngredienti?.parentElement?.insertBefore(this._alertNome, this.listaIngredienti.nextSibling);

        // Event delegation sull'input: si attiva su qualsiasi campo nome nella lista
        this.listaIngredienti?.addEventListener('input', (e) => {
            if (e.target.name === 'ingredient_names') {
                if (e.target.value.length >= MAX_CHARS_NOME_ING) {
                    this._mostraAlertNome();
                } else {
                    this._nascondiAlertNome();
                }
            }
        });
    }

    _mostraAlertNome() {
        if (this._alertNome) {
            clearTimeout(this._alertNomeTimer);
            this._alertNome.classList.remove('d-none');
            this._alertNomeTimer = setTimeout(() => this._nascondiAlertNome(), 3000);
        }
    }

    _nascondiAlertNome() {
        this._alertNome?.classList.add('d-none');
    }


    // Aggiunge una nuova riga per un ingrediente.
    aggiungiIngrediente() {
        if (this.getNumIngredienti() >= MAX_INGREDIENTI) return;

        const div = document.createElement('div');
        div.className = 'd-flex align-items-center gap-2 ingredient-row mb-3';
        div.innerHTML = `
            <input name="ingredient_amounts" required maxlength="${MAX_CHARS_QUANTITA}" class="form-control custom-input shadow-none w-25" placeholder="es. 200g" type="text" />
            <input name="ingredient_names" required maxlength="${MAX_CHARS_NOME_ING}" class="form-control custom-input shadow-none flex-grow-1" placeholder="es. Farina 00" type="text" />
            <button type="button" class="btn btn-light text-danger border p-2 d-inline-flex align-items-center justify-content-center btn-danger-hover rounded-3" title="Rimuovi ingrediente">
                <span class="material-symbols-outlined fs-5">delete</span>
            </button>
        `;
        this.listaIngredienti.appendChild(div);
        this.aggiornaContatori();
    }

    // Aggiunge un nuovo passaggio alla preparazione.
    aggiungiIstruzione() {
        if (this.getNumPassaggi() >= MAX_PASSAGGI) return;

        const div = document.createElement('div');
        div.className = 'd-flex gap-3 instruction-row mb-3';
        div.innerHTML = `
            <div class="step-counter text-white fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px; flex-shrink: 0; margin-top: 4px; background-color: #6b8f24;">#</div>
            <div class="d-flex gap-2 flex-grow-1">
                <textarea name="instruction_descriptions" required maxlength="${MAX_CHARS_PASSAGGIO}" class="form-control custom-input shadow-none" style="min-height: 80px; resize: vertical;" placeholder="Descrivi questo passaggio nel dettaglio..."></textarea>
                <button type="button" class="btn btn-light text-danger border p-2 d-inline-flex align-items-center justify-content-center btn-danger-hover rounded-3 align-self-start" title="Rimuovi passaggio">
                    <span class="material-symbols-outlined fs-5">delete</span>
                </button>
            </div>
        `;
        this.listaIstruzioni.appendChild(div);
        this.indicizzaIstruzioni();
        this.aggiornaContatori();
    }

    // Aggiorna i numeri dei passaggi in base alla loro posizione.
    indicizzaIstruzioni() {
        const contatori = this.listaIstruzioni.querySelectorAll('.step-counter');
        contatori.forEach((el, idx) => {
            el.innerText = idx + 1;
        });
    }
}

// Funzione di inizializzazione per il Form Ricetta (Crea/Modifica).
function initRecipeForm() {
    if (document.getElementById('ingredients-list')) {
        new RicettaCE();
    }
}

// Supporto per SPA: se il DOM è già pronto, inizializza subito.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecipeForm);
} else {
    initRecipeForm();
}
