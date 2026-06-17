'use strict';

// classe per la gestione dello scorrimento (carousel) orizzontale.
class Carosello {
    constructor(config) {
        this.container = config.container;
        this.btnSinistro = config.btnSinistro;
        this.btnDestro = config.btnDestro;
        this.scrollAmount = config.scrollAmount || 320;

        this.init();
    }

    init() {
        // Scorrimento verso sinistra
        this.btnSinistro.addEventListener('click', () => {
            this.container.scrollBy({
                left: -this.scrollAmount,
                behavior: 'smooth'
            });
        });

        // Scorrimento verso destra
        this.btnDestro.addEventListener('click', () => {
            this.container.scrollBy({
                left: this.scrollAmount,
                behavior: 'smooth'
            });
        });
    }
}

// Funzione di inizializzazione per il Carosello in Homepage.
function initHomepage() {
    const container = document.getElementById('recent-recipes-container');
    const btnSinistro = document.getElementById('btn-scroll-left');
    const btnDestro = document.getElementById('btn-scroll-right');

    if (container && btnSinistro && btnDestro) {
        new Carosello({
            container: container,
            btnSinistro: btnSinistro,
            btnDestro: btnDestro,
            scrollAmount: 320
        });
    }
}

// Supporto per SPA: se il DOM è già pronto, inizializza subito.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepage);
} else {
    initHomepage();
}

