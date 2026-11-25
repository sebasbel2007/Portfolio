/* ==========================================================================
   SEBASTIÁN BELTRÁN — PORTFOLIO 2026
   ========================================================================== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------
       1. REVEAL AL HACER SCROLL (con stagger por grilla)
    ------------------------------------------------------------------ */
    var revealEls = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
        document.querySelectorAll('.grid, .about-intro, .about-cols').forEach(function (grid) {
            Array.prototype.forEach.call(grid.children, function (child, i) {
                if (child.classList.contains('reveal')) {
                    child.style.transitionDelay = Math.min(i * 70, 210) + 'ms';
                }
            });
        });

        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    // Respaldo: si el scroll salta rápido, el observer puede no muestrear un
    // elemento. Acá nos aseguramos de que nada quede invisible.
    var pendingReveals = Array.prototype.slice.call(revealEls);

    function revealPassedElements() {
        if (!pendingReveals.length) return;
        pendingReveals = pendingReveals.filter(function (el) {
            if (el.classList.contains('is-visible')) return false;
            if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
                el.classList.add('is-visible');
                return false;
            }
            return true;
        });
    }

    /* ------------------------------------------------------------------
       2. BARRA DE PROGRESO DE SCROLL
    ------------------------------------------------------------------ */
    var progressBar = document.getElementById('progressBar');
    var ticking = false;

    function updateProgress() {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max * 100 : 0;
        progressBar.style.width = pct.toFixed(2) + '%';
        ticking = false;
    }

    /* ------------------------------------------------------------------
       3. SCROLLSPY — item activo en el sidebar
    ------------------------------------------------------------------ */
    var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
    var spySections = navItems
        .map(function (item) { return document.getElementById(item.dataset.nav); })
        .filter(Boolean);

    function updateSpy() {
        var offset = 140;
        var current = spySections[0];

        spySections.forEach(function (section) {
            if (section.offsetParent === null) return; // bloque oculto por filtro
            if (section.getBoundingClientRect().top - offset <= 0) current = section;
        });

        if (!current) return;
        navItems.forEach(function (item) {
            item.classList.toggle('is-active', item.dataset.nav === current.id);
        });
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateProgress();
                updateSpy();
                revealPassedElements();
                settlePassedCounts();
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    /* ------------------------------------------------------------------
       4. MENÚ LATERAL MÓVIL
    ------------------------------------------------------------------ */
    var sidebar = document.getElementById('sidebar');
    var menuToggle = document.getElementById('menuToggle');
    var drawerClose = document.getElementById('drawerClose');
    var drawerOverlay = document.getElementById('drawerOverlay');

    function openDrawer() {
        sidebar.classList.add('is-open');
        drawerOverlay.hidden = false;
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        sidebar.classList.remove('is-open');
        drawerOverlay.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    function isDrawerOpen() { return sidebar.classList.contains('is-open'); }

    menuToggle.addEventListener('click', function () {
        isDrawerOpen() ? closeDrawer() : openDrawer();
    });
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    navItems.forEach(function (item) {
        item.addEventListener('click', function () {
            if (window.innerWidth <= 1024) closeDrawer();
        });
    });

    /* ------------------------------------------------------------------
       5. CONTADORES ANIMADOS (hero)
    ------------------------------------------------------------------ */
    function countUp(el) {
        var target = parseInt(el.dataset.count, 10) || 0;
        if (reduceMotion) { el.textContent = target; return; }

        var duration = 1100;
        var start = null;
        function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    var nums = document.querySelectorAll('.num[data-count]');

    function startCount(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        countUp(el);
    }

    if ('IntersectionObserver' in window) {
        var numObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    startCount(entry.target);
                    numObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        nums.forEach(function (n) { numObserver.observe(n); });
    } else {
        nums.forEach(function (n) { n.textContent = n.dataset.count; });
    }

    // Respaldo ante scrolls bruscos: si el observer no muestreó el elemento,
    // lo dejamos animar igual para que nunca quede un "0" en pantalla.
    var pendingCounts = Array.prototype.slice.call(nums);
    function settlePassedCounts() {
        pendingCounts = pendingCounts.filter(function (el) {
            if (el.dataset.done) return false;
            if (el.getBoundingClientRect().top < window.innerHeight) {
                startCount(el);
                return false;
            }
            return true;
        });
    }

    /* ------------------------------------------------------------------
       6. ROTADOR DE ROL (hero)
    ------------------------------------------------------------------ */
    var rotator = document.getElementById('roleRotator');
    if (rotator && !reduceMotion) {
        var roles = ['Full Stack', 'de Software', 'Web', 'de Datos'];
        var roleIndex = 0;
        setInterval(function () {
            rotator.classList.add('is-out');
            setTimeout(function () {
                roleIndex = (roleIndex + 1) % roles.length;
                rotator.textContent = roles[roleIndex];
                rotator.classList.remove('is-out');
            }, 320);
        }, 2800);
    }

    /* ------------------------------------------------------------------
       7. CONTADORES DE SECCIONES (sidebar, chips y bloques)
    ------------------------------------------------------------------ */
    var allCards = Array.prototype.slice.call(document.querySelectorAll('.card[data-cat]'));
    var TOTAL = allCards.length;

    // Cada tarjeta sabe en qué sección vive (bloque) y si es "vieja"
    allCards.forEach(function (card) {
        var block = card.closest('[data-block]');
        card._block = block ? block.id : '';
    });

    // Conteo por sección (coincide con los encabezados de bloque y el sidebar)
    function countInSection(section) {
        return allCards.filter(function (c) { return c._block === section; }).length;
    }
    function countByCat(cat) {
        return allCards.filter(function (c) { return c.dataset.cat === cat; }).length;
    }

    document.querySelectorAll('[data-count-for]').forEach(function (el) {
        var key = el.dataset.countFor;
        el.textContent = (key === 'viejos') ? countByCat('viejos') : countInSection(key);
    });
    document.querySelectorAll('[data-chip-count]').forEach(function (el) {
        var key = el.dataset.chipCount;
        if (key === 'todos') el.textContent = TOTAL;
        else if (key === 'viejos') el.textContent = countByCat('viejos');
        else el.textContent = countInSection(key);
    });
    var navTotal = document.getElementById('navTotal');
    if (navTotal) navTotal.textContent = TOTAL;

    document.querySelectorAll('[data-block]').forEach(function (block) {
        var total = block.querySelectorAll('.card[data-cat]').length;
        var label = block.querySelector('[data-block-count]');
        if (label) label.dataset.total = total;
        if (label) label.textContent = total + (total === 1 ? ' proyecto' : ' proyectos');
    });

    /* ------------------------------------------------------------------
       8. FILTRO + BÚSQUEDA DE PROYECTOS
    ------------------------------------------------------------------ */
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var searchInput = document.getElementById('searchInput');
    var searchClear = document.getElementById('searchClear');
    var resultCount = document.getElementById('resultCount');
    var emptyState = document.getElementById('emptyState');
    var resetFilters = document.getElementById('resetFilters');
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-block]'));
    var families = Array.prototype.slice.call(document.querySelectorAll('[data-family]'));

    var activeFilter = 'todos';
    var query = '';

    // Texto de búsqueda normalizado (sin acentos) por tarjeta
    allCards.forEach(function (card) {
        var hay = (card.dataset.search + ' ' + card.textContent).toLowerCase();
        card._hay = hay.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    });

    function normalize(str) {
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function cardMatches(card) {
        if (activeFilter !== 'todos') {
            if (activeFilter === 'viejos') {
                if (card.dataset.cat !== 'viejos') return false;
            } else if (card._block !== activeFilter) {
                return false;
            }
        }
        if (!query) return true;
        return query.split(/\s+/).every(function (term) {
            return card._hay.indexOf(term) !== -1;
        });
    }

    function applyFilters() {
        var visible = 0;

        allCards.forEach(function (card) {
            var show = cardMatches(card);
            card.hidden = !show;
            if (show) visible++;
        });

        // Familias: se muestran si al menos una de sus tarjetas está visible
        families.forEach(function (family) {
            var any = Array.prototype.some.call(
                family.querySelectorAll('.card[data-cat]'),
                function (c) { return !c.hidden; }
            );
            family.hidden = !any;
        });

        // Bloques: se ocultan si no queda ninguna tarjeta visible
        blocks.forEach(function (block) {
            var cards = block.querySelectorAll('.card[data-cat]');
            var shown = block.querySelectorAll('.card[data-cat]:not([hidden])').length;
            var total = parseInt(block.querySelector('[data-block-count]').dataset.total, 10);
            block.hidden = shown === 0;

            var label = block.querySelector('[data-block-count]');
            label.textContent = (shown === total)
                ? total + (total === 1 ? ' proyecto' : ' proyectos')
                : shown + ' de ' + total + ' proyectos';
        });

        // Subtítulo "Proyectos viejos": se oculta si sus 3 tarjetas no están visibles
        var oldTitle = document.getElementById('viejos');
        if (oldTitle) {
            var oldShown = document.querySelectorAll('.card[data-cat="viejos"]:not([hidden])').length;
            oldTitle.hidden = oldShown === 0;
        }

        emptyState.hidden = visible !== 0;
        resultCount.textContent = visible + ' de ' + TOTAL + (visible === 1 ? ' proyecto' : ' proyectos');
        searchClear.hidden = query.length === 0;

        updateSpy();
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.dataset.filter;
            chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
            applyFilters();
        });
    });

    searchInput.addEventListener('input', function () {
        query = normalize(searchInput.value.trim());
        applyFilters();
    });

    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        query = '';
        applyFilters();
        searchInput.focus();
    });

    resetFilters.addEventListener('click', function () {
        activeFilter = 'todos';
        query = '';
        searchInput.value = '';
        chips.forEach(function (c) { c.classList.toggle('is-active', c.dataset.filter === 'todos'); });
        applyFilters();
        document.getElementById('proyectos').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ------------------------------------------------------------------
       9. CREDENCIALES — expandir / colapsar
    ------------------------------------------------------------------ */
    document.querySelectorAll('.creds-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var panel = document.getElementById(btn.getAttribute('aria-controls'));
            var open = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!open));
            if (panel) panel.hidden = open;
        });
    });

    /* ------------------------------------------------------------------
       10. COPIAR AL PORTAPAPELES
    ------------------------------------------------------------------ */
    function legacyCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () {
                return legacyCopy(text) ? Promise.resolve() : Promise.reject();
            });
        }
        return legacyCopy(text) ? Promise.resolve() : Promise.reject();
    }

    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        var original = btn.textContent;
        btn.addEventListener('click', function () {
            copyText(btn.dataset.copy || '').then(function () {
                btn.textContent = 'Copiado ✓';
                btn.classList.add('is-copied');
                setTimeout(function () {
                    btn.textContent = original;
                    btn.classList.remove('is-copied');
                }, 1600);
            }).catch(function () {
                btn.textContent = 'Error';
                setTimeout(function () { btn.textContent = original; }, 1600);
            });
        });
    });

    /* ------------------------------------------------------------------
       11. LIGHTBOX DE IMÁGENES (con navegación por teclado)
    ------------------------------------------------------------------ */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCap = document.getElementById('lightboxCap');
    var lastFocused = null;

    function visibleCards() {
        return allCards.filter(function (c) { return !c.hidden && c.offsetParent !== null; });
    }

    function openLightbox(card) {
        var img = card.querySelector('.card-media img');
        var title = card.querySelector('.card-title-row h4');
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightboxCap.textContent = title ? title.textContent : img.alt;
        lightbox.hidden = false;
        document.body.style.overflow = 'hidden';
        lastFocused = document.activeElement;
        lightbox.querySelector('.lightbox-close').focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        document.body.style.overflow = '';
        lightboxImg.removeAttribute('src');
        if (lastFocused) lastFocused.focus();
    }

    function stepLightbox(dir) {
        var cards = visibleCards();
        if (!cards.length || lightbox.hidden) return;
        var current = cards.findIndex(function (c) {
            return c.querySelector('.card-media img') && c.querySelector('.card-media img').src === lightboxImg.src;
        });
        var next = cards[(current + dir + cards.length) % cards.length];
        if (next) openLightbox(next);
    }

    document.querySelectorAll('.zoom-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var card = btn.closest('.card');
            if (card) openLightbox(card);
        });
    });

    lightbox.querySelectorAll('[data-close]').forEach(function (el) {
        el.addEventListener('click', closeLightbox);
    });

    /* ------------------------------------------------------------------
       12. TECLADO GLOBAL
    ------------------------------------------------------------------ */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (!lightbox.hidden) closeLightbox();
            else if (isDrawerOpen()) closeDrawer();
        }
        if (lightbox.hidden) return;
        if (e.key === 'ArrowRight') stepLightbox(1);
        if (e.key === 'ArrowLeft') stepLightbox(-1);
    });

    /* ------------------------------------------------------------------
       13. ARRANQUE
    ------------------------------------------------------------------ */
    applyFilters();
    revealPassedElements();
    settlePassedCounts();
    updateProgress();
    updateSpy();
})();
