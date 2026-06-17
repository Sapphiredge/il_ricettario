'use strict';

/**
 * Classe per la gestione del carosello
 */
class Carosello {
    constructor(config) {
        this.container = config.container;
        this.btnSinistro = config.btnSinistro;
        this.btnDestro = config.btnDestro;
        this.scrollAmount = config.scrollAmount || 320;

        this.init();
    }

    // Inizializzazione listener eventi
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

// Inizializzazione del carosello in homepage
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepage);
} else {
    initHomepage();
}

