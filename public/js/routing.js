// Sincronizza i nuovi fogli di stile per pagina
function sincronizzaCSS(doc) {
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (!document.querySelector(`link[href="${href}"]`)) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = href;
            document.head.append(newLink);
        }
    });
}

// Mostra o nasconde la barra di ricerca nella Navbar in base alla pagina
function sincronizzaNavbarSearch(doc) {
    const src = doc.querySelector('.navbar-search-group');
    const tgt = document.querySelector('.navbar-search-group');
    const cont = document.querySelector('#navbarContent');

    if (src && !tgt) {
        const formHTML = doc.querySelector('form[action="/cerca"]')?.outerHTML;
        if (formHTML && cont) {
            const temp = document.createElement('div');
            temp.innerHTML = formHTML;
            cont.prepend(temp.firstChild);
        }
    } else if (!src && tgt) {
        document.querySelector('form[action="/cerca"]')?.remove();
    }
}

// Chiude la navbar mobile se è aperta
function chiudiNavbarMobile() {
    const navbar = document.getElementById('navbarContent');
    if (navbar?.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar);
        bsCollapse.hide();
    }
}

// Funzione che forza la chiusura dei modali
function pulisciModaliSPA() {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Ricarica ed esegue gli script specifici della pagina
function gestisciScriptDinamici(doc) {
    document.querySelectorAll('script.dynamic-script').forEach(s => s.remove());

    Array.from(doc.querySelectorAll('script'))
        .filter(s => {
            const src = s.getAttribute('src'); // estrazione src
            return src && !src.startsWith('http') && src.includes('/js/') && !src.includes('routing.js');
        })
        .forEach(script => {
            const newScript = document.createElement('script'); //ricreazione script
            newScript.type = 'module'; // scope isolato: evita ridichiarazione di classi nel global scope
            const baseSrc = script.getAttribute('src');
            newScript.src = baseSrc + '?v=' + Date.now();
            newScript.className = 'dynamic-script';
            document.body.append(newScript);
        });
}


// Re-inizializza le animazioni AOS sul nuovo contenuto
function resetAnimazioniAOS(container) {
    if (!window.AOS) return;

    container.querySelectorAll('.aos-init').forEach(el => {
        el.classList.remove('aos-init', 'aos-animate');
    });

    setTimeout(() => {
        window.AOS.init({ duration: 700, once: true, offset: 80 });
        window.AOS.refresh();
    }, 100);
}


async function caricaContenuto(url) {
    try {
        const response = await fetch(url);
        if (response.redirected) return (window.location.href = response.url);

        const html = await response.text(); // estrazione html
        const doc = new DOMParser().parseFromString(html, 'text/html'); // parsing html
        const nuovoContenuto = doc.getElementById('main-content'); // estrazione contenuto
        const container = document.getElementById('main-content'); // estrazione contenitore del main

        if (nuovoContenuto && container) {
            // Sincronizzazione testata, corpo e navigazione
            sincronizzaCSS(doc);
            sincronizzaNavbarSearch(doc);
            chiudiNavbarMobile();
            pulisciModaliSPA();

            // Sincronizza le classi e gli attributi del body
            document.body.className = doc.body.className;
            document.body.style.cssText = doc.body.style.cssText;

            document.title = doc.title;

            // Transizione e sostituzione DOM
            container.classList.remove('fade-in');
            void container.offsetWidth;

            container.className = nuovoContenuto.className;
            container.innerHTML = nuovoContenuto.innerHTML;
            container.classList.add('fade-in');

            setTimeout(() => {
                container.classList.remove('fade-in');
            }, 450);

            // Post-caricamento
            gestisciScriptDinamici(doc);
            resetAnimazioniAOS(container);
            window.scrollTo(0, 0);
        }
    } catch (err) {
        console.error('SPA Error:', err);
        window.location.href = url;
    }
}

// Funzione di gestione del submit dei form di ricerca
document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.getAttribute('action') === '/cerca' && form.id !== 'form-ricerca-filtri') {
        e.preventDefault();
        const formData = new FormData(form);
        const term = (formData.get('q') || '').trim();
        if (typeof page !== 'undefined') {
            page(`/cerca?q=${encodeURIComponent(term)}`);
        } else {
            window.location.href = `/cerca?q=${encodeURIComponent(term)}`;
        }
    }
});

// Init routing
page('*', (ctx) => {
    if (ctx.path.startsWith('/logout')) return (window.location.href = ctx.path);
    if (ctx.init) return; // Salta il fetch sulla prima visualizzazione sincronizzata
    caricaContenuto(ctx.path);
});

page.start();
