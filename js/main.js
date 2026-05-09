/**
 * Cérebro Milionário — Main JavaScript
 * Optimized for performance and mobile UX
 */

document.addEventListener('DOMContentLoaded', function() {
    // ── CONFIG & SELECTORS ────────────────────────────────
    const header = document.querySelector('.header');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navigation = document.querySelector('.navigation');
    const currentYearElement = document.getElementById('current-year');

    // ── FOOTER YEAR ───────────────────────────────────────
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // ── HEADER SCROLL EFFECT ──────────────────────────────
    if (header) {
        const handleScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
    }

    // ── MOBILE MENU LOGIC (ROBUST) ────────────────────────
    if (mobileBtn && navigation) {
        const toggleMenu = (e) => {
            if (e) e.preventDefault();
            const isOpen = navigation.classList.toggle('open');
            // Support both 'open' and 'active' classes if CSS uses both
            navigation.classList.toggle('active', isOpen); 
            
            mobileBtn.setAttribute('aria-expanded', isOpen);
            
            // Update Icon
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        // Use click for broad compatibility, but ensure it's responsive
        mobileBtn.addEventListener('click', toggleMenu);

        // Close on link click
        navigation.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navigation.classList.remove('open', 'active');
                mobileBtn.setAttribute('aria-expanded', 'false');
                const icon = mobileBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navigation.classList.contains('open') && 
                !header.contains(e.target) && 
                !navigation.contains(e.target)) {
                navigation.classList.remove('open', 'active');
                mobileBtn.setAttribute('aria-expanded', 'false');
                const icon = mobileBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });
    }

    // ── ACTIVE NAV LINK ───────────────────────────────────
    (function() {
        const path = window.location.pathname.replace(/\/index\.html$/, '/');
        document.querySelectorAll('.nav-menu a').forEach(a => {
            const href = a.getAttribute('href').replace(/\/index\.html$/, '/');
            if (path === href || (href !== '/' && path.startsWith(href.replace('.html','')))) {
                a.classList.add('active');
            }
        });
    })();

    // ── FAQ TOGGLE ────────────────────────────────────────
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            if (item) item.classList.toggle('open');
        });
    });

    // ── INITIALIZE COMPONENTS ─────────────────────────────
    initTabs();
    loadLatestPosts();
    initAnimations();
    optimizeArticleAds();
    
    // Newsletter
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            if (input && input.value) {
                alert('Obrigado por se inscrever! Você receberá nossas próximas novidades por e-mail.');
                input.value = '';
            }
        });
    });
});

// ── HELPER FUNCTIONS ──────────────────────────────────────

function initTabs() {
    const tabConfigs = [
        { tabs: '.market-data-tab', panels: '.market-data-panel' },
        { tabs: '.calculator-tab', panels: '.calculator-panel' }
    ];
    tabConfigs.forEach(config => {
        const tabs = document.querySelectorAll(config.tabs);
        const panels = document.querySelectorAll(config.panels);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const targetPanel = document.getElementById(target);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    });
}

function normalizePostsIndex(data) {
    // posts/posts.json is an index object with metadata at the root.
    // Always read the canonical posts array instead of counting root keys.
    if (data && Array.isArray(data.posts)) {
        if (Number.isInteger(data.totalPosts) && data.totalPosts !== data.posts.length) {
            console.warn('posts/posts.json totalPosts does not match posts.length:', data.totalPosts, data.posts.length);
        }
        return data.posts;
    }

    // Backward compatibility for any legacy build that exposed the index as a bare array.
    return Array.isArray(data) ? data : [];
}

async function fetchPostsIndex() {
    try {
        const res = await fetch('/posts/posts.json');
        const data = await res.json();
        return normalizePostsIndex(data);
    } catch (e) {
        console.error('Error fetching posts:', e);
        return [];
    }
}

async function loadLatestPosts() {
    const grid = document.getElementById('latest-posts-grid');
    if (!grid) return;
    const posts = await fetchPostsIndex();
    if (!posts.length) return;
    const latest = posts.slice(0, 4);
    // Only overwrite if the first rendered card doesn't match the latest post URL
    // (static HTML and JS data are in sync — skip re-render to avoid flash)
    const firstCard = grid.querySelector('.news-card');
    if (firstCard && firstCard.getAttribute('href') === latest[0].url) return;
    grid.innerHTML = latest.map(post => `
        <a href="${post.url}" class="news-card">
            <div class="news-card-img">
                <img src="${post.image || '/images/blog-default.svg'}" alt="${post.title}" loading="lazy">
            </div>
            <div class="news-card-content">
                <span class="news-tag">${(post.tags && post.tags[0]) || post.category || 'Educação'}</span>
                <h3>${post.title}</h3>
                <p class="news-excerpt">${post.excerpt || ''}</p>
                <div class="news-meta">
                    <span><i class="far fa-calendar"></i> ${post.date || ''}</span>
                    <span><i class="far fa-clock"></i> ${post.readTime || ''}</span>
                </div>
            </div>
        </a>
    `).join('');
}

function initAnimations() {
    const elements = document.querySelectorAll('.animate-fade-in');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

function sharePost(platform, url, title) {
    let shareUrl;
    const u = encodeURIComponent(url);
    const t = encodeURIComponent(title);
    switch(platform) {
        case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${u}`; break;
        case 'twitter':  shareUrl = `https://twitter.com/intent/tweet?url=${u}&text=${t}`; break;
        case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`; break;
        case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${t}%20${u}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
    return false;
}

async function loadBlogPosts() {
    const container = document.getElementById('posts-container');
    const pag = document.querySelector('.pagination');
    if (!container) return;
    const posts = await fetchPostsIndex();
    const perPage = 9;
    if (!posts.length) {
        container.innerHTML = '<p>Ainda não há posts disponíveis.</p>';
        if (pag) pag.style.display = 'none';
        return;
    }
    const totalPages = Math.ceil(posts.length / perPage);
    const renderPage = (page) => {
        const start = (page - 1) * perPage;
        const slice = posts.slice(start, start + perPage);
        container.innerHTML = slice.map(post => `
            <div class="post-card">
                <div class="blog-card-img">
                    <img src="${post.image || '/images/blog-cover.svg'}" alt="${post.title}" loading="lazy">
                </div>
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span><i class="far fa-calendar"></i> ${post.date ? post.date.split('-').reverse().join('/') : ''}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime || ''}</span>
                    </div>
                    <h3><a href="${post.url}">${post.title}</a></h3>
                    <p>${post.excerpt}</p>
                    <a href="${post.url}" class="btn btn-tertiary">Ler Mais</a>
                </div>
            </div>
        `).join('');
        if (pag) {
            pag.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.className = 'pagination-btn' + (i === page ? ' active' : '');
                btn.textContent = i;
                btn.onclick = () => { renderPage(i); window.scrollTo({top: container.offsetTop - 100, behavior: 'smooth'}); };
                pag.appendChild(btn);
            }
        }
    };
    renderPage(1);
}


// ── SAFE EDITORIAL AD PLACEMENTS ─────────────────────────
// Adsterra is loaded only in long editorial posts, after the user grants
// advertising consent. Institutional pages and short pages are intentionally
// excluded to preserve UX and future AdSense review quality.

const ADSTERRA_BANNER_KEY = '699af996b3136c4dfc586934025a7d1b';
const ADSTERRA_NATIVE_KEY = '75df86cf15f03453238aa97e4ff925c8';
const ADSTERRA_NATIVE_CONTAINER_ID = `container-${ADSTERRA_NATIVE_KEY}`;
const AD_ELIGIBLE_PATH_PREFIX = '/posts/';
const AD_EXCLUDED_SLUGS = new Set([
    'politica-de-privacidade',
    'politica-privacidade',
    'privacy-policy',
    'termos-uso',
    'contato',
    'sobre',
    'perguntas-frequentes',
    'politica-editorial',
    '404'
]);

function normalizePathname(pathname) {
    return pathname.replace(/\/+$/, '').replace(/\.html$/, '') || '/';
}

function isEligibleForEditorialAds() {
    const path = normalizePathname(window.location.pathname);
    if (!path.startsWith(AD_ELIGIBLE_PATH_PREFIX)) return false;

    const slug = path.split('/').filter(Boolean).pop();
    if (!slug || AD_EXCLUDED_SLUGS.has(slug)) return false;

    const article = document.querySelector('.post-content');
    if (!article) return false;

    const paragraphs = article.querySelectorAll('p').length;
    const headings = article.querySelectorAll('h2, h3').length;
    const textLength = (article.textContent || '').trim().length;
    return paragraphs >= 8 && headings >= 2 && textLength >= 3000;
}

function createAdSlot(type) {
    const slot = document.createElement('aside');
    slot.className = `ad-slot ad-slot--${type}`;
    slot.dataset.adsterraSlot = type;
    slot.setAttribute('aria-label', 'Publicidade');
    slot.innerHTML = '<div class="ad-label">Publicidade</div><div class="ad-box"></div>';
    return slot;
}

function insertAfterElement(reference, node) {
    if (!reference || !reference.parentNode) return false;
    reference.parentNode.insertBefore(node, reference.nextSibling);
    return true;
}

function placeEditorialAdSlots() {
    if (!isEligibleForEditorialAds()) return;
    if (document.querySelector('[data-adsterra-slot]')) return;

    const article = document.querySelector('.post-content');
    const paragraphs = Array.from(article.querySelectorAll(':scope > p'));
    const headings = Array.from(article.querySelectorAll(':scope > h2'));

    const bannerReference = paragraphs[Math.min(5, paragraphs.length - 3)];
    const nativeReference = headings.length >= 3 ? headings[Math.floor(headings.length * 0.65)] : paragraphs[Math.max(7, paragraphs.length - 2)];

    if (bannerReference) {
        insertAfterElement(bannerReference, createAdSlot('banner'));
    }

    if (nativeReference && nativeReference !== bannerReference) {
        const nativeSlot = createAdSlot('native');
        if (!insertAfterElement(nativeReference, nativeSlot) && paragraphs.length) {
            insertAfterElement(paragraphs[paragraphs.length - 2], nativeSlot);
        }
    }
}

function loadAdsterraBanner(slot) {
    const box = slot.querySelector('.ad-box');
    if (!box || box.dataset.loaded === 'true') return;
    box.dataset.loaded = 'true';

    const config = document.createElement('script');
    config.text = `atOptions = {\n  'key' : '${ADSTERRA_BANNER_KEY}',\n  'format' : 'iframe',\n  'height' : 250,\n  'width' : 300,\n  'params' : {}\n};`;

    const invoke = document.createElement('script');
    invoke.src = `https://www.highperformanceformat.com/${ADSTERRA_BANNER_KEY}/invoke.js`;
    invoke.async = true;

    box.appendChild(config);
    box.appendChild(invoke);
}

function loadAdsterraNative(slot) {
    const box = slot.querySelector('.ad-box');
    if (!box || box.dataset.loaded === 'true') return;
    box.dataset.loaded = 'true';

    const invoke = document.createElement('script');
    invoke.async = true;
    invoke.dataset.cfasync = 'false';
    invoke.src = `https://pl29394756.profitablecpmratenetwork.com/${ADSTERRA_NATIVE_KEY}/invoke.js`;

    const container = document.createElement('div');
    container.id = ADSTERRA_NATIVE_CONTAINER_ID;

    box.appendChild(invoke);
    box.appendChild(container);
}

function loadAdsterraPlacements() {
    document.querySelectorAll('[data-adsterra-slot="banner"]').forEach(loadAdsterraBanner);
    document.querySelectorAll('[data-adsterra-slot="native"]').forEach(loadAdsterraNative);
}

function optimizeArticleAds() {
    const enableAds = () => {
        placeEditorialAdSlots();
        loadAdsterraPlacements();
    };

    const consent = getConsent();
    if (consent && consent.ads) {
        enableAds();
    }

    document.addEventListener('consentUpdate', (event) => {
        if (event.detail && event.detail.ads) {
            enableAds();
        }
    });
}

// ── COOKIE CONSENT v2 ─────────────────────────────────────
//
// Consent schema (localStorage key: 'cookie-consent-v2'):
//   { necessary: true, analytics: bool, ads: bool, date: 'YYYY-MM-DD' }
//
// Script loaders (loadAnalytics / loadAds) are gated by consent and are
// called automatically only after the user grants the corresponding category.

const CONSENT_KEY = 'cookie-consent-v2';
const ADSENSE_CLIENT_ID = 'ca-pub-4613426749830025';

function getConsent() {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored) return JSON.parse(stored);
    } catch (_) {}

    // Migrate legacy keys
    const legacyStatus = localStorage.getItem('cookie-consent-status');
    const legacyAceito = localStorage.getItem('cookies-aceitos');
    if (legacyStatus === 'aceito' || legacyAceito === 'true') {
        return { necessary: true, analytics: true, ads: true, date: "" };
    }
    if (legacyStatus === 'rejected') {
        return { necessary: true, analytics: false, ads: false, date: "" };
    }
    return false; // no decision yet
}

function saveConsent(prefs) {
    const consent = { necessary: true, analytics: !!prefs.analytics, ads: !!prefs.ads, date: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    // Keep legacy keys in sync for backward compatibility
    const allGranted = consent.analytics && consent.ads;
    localStorage.setItem('cookie-consent-status', allGranted ? 'aceito' : 'partial');
    localStorage.setItem('cookies-aceitos', allGranted ? 'true' : 'false');
    applyConsent(consent);
    document.dispatchEvent(new CustomEvent('consentUpdate', { detail: consent }));
    return consent;
}

// ── SCRIPT LOADERS (gated on consent) ────────────────────

function loadAnalytics() {
    // Analytics consent is stored without loading a provider script by default.
}

function loadAds() {
    if (document.querySelector('script[src*="adsbygoogle"]')) return;

    const s = document.createElement('script');
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    s.async = true;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
}

function applyConsent(consent) {
    if (consent.analytics) loadAnalytics();
    if (consent.ads) loadAds();
}

// ── PREFERENCES MODAL ────────────────────────────────────

function buildPreferencesModal(currentConsent) {
    const existing = document.getElementById('cookie-prefs-modal');
    if (existing) existing.remove();

    const analyticsChecked = currentConsent ? currentConsent.analytics : false;
    const adsChecked = currentConsent ? currentConsent.ads : false;

    const modal = document.createElement('div');
    modal.id = 'cookie-prefs-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cookie-prefs-title');
    modal.innerHTML = `
      <div class="cookie-prefs-overlay" id="cookie-prefs-overlay"></div>
      <div class="cookie-prefs-box" role="document">
        <div class="cookie-prefs-header">
          <h2 id="cookie-prefs-title" class="cookie-prefs-title">Preferências de cookies</h2>
          <button class="cookie-prefs-close" id="cookie-prefs-close" aria-label="Fechar">&times;</button>
        </div>
        <div class="cookie-prefs-body">
          <p class="cookie-prefs-intro">Escolha quais categorias de cookies você aceita. Os cookies necessários não podem ser desativados — são essenciais para o funcionamento do site.</p>
          <div class="cookie-category">
            <div class="cookie-category-info">
              <strong>Necessários</strong>
              <span>Preferência de consentimento e funcionalidades básicas do site. Sempre ativos.</span>
            </div>
            <label class="cookie-toggle cookie-toggle--disabled" aria-label="Cookies necessários — sempre ativos">
              <input type="checkbox" checked disabled>
              <span class="cookie-toggle-track"></span>
            </label>
          </div>
          <div class="cookie-category">
            <div class="cookie-category-info">
              <strong>Analytics</strong>
              <span>Dados de audiência agregados (páginas visitadas, tempo de sessão) para melhorar o conteúdo. Nenhum dado pessoal identificável.</span>
            </div>
            <label class="cookie-toggle" aria-label="Cookies de analytics">
              <input type="checkbox" id="consent-analytics" ${analyticsChecked ? 'checked' : ''}>
              <span class="cookie-toggle-track"></span>
            </label>
          </div>
          <div class="cookie-category">
            <div class="cookie-category-info">
              <strong>Publicidade</strong>
              <span>Anúncios personalizados por redes de publicidade aprovadas. Se recusar, anúncios não personalizados (ou nenhum anúncio) serão exibidos.</span>
            </div>
            <label class="cookie-toggle" aria-label="Cookies de publicidade">
              <input type="checkbox" id="consent-ads" ${adsChecked ? 'checked' : ''}>
              <span class="cookie-toggle-track"></span>
            </label>
          </div>
        </div>
        <div class="cookie-prefs-footer">
          <button class="btn-prefs-reject" id="prefs-reject-all" type="button">Recusar todos</button>
          <button class="btn-prefs-aceitar" id="prefs-aceitar-todos" type="button">Aceitar todos</button>
          <button class="btn-prefs-save" id="prefs-save" type="button">Salvar preferências</button>
        </div>
        <p class="cookie-prefs-privacy">Saiba mais em nossa <a href="/politica-privacidade">Política de Privacidade</a>.</p>
      </div>`;

    document.body.appendChild(modal);

    const close = () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => modal.remove(), 300);
    };

    const applyAndClose = (prefs) => {
        saveConsent(prefs);
        close();
        const banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.remove('show');
    };

    document.getElementById('cookie-prefs-close').addEventListener('click', close);
    document.getElementById('cookie-prefs-overlay').addEventListener('click', close);
    document.getElementById('prefs-reject-all').addEventListener('click', () => applyAndClose({ analytics: false, ads: false }));
    document.getElementById('prefs-aceitar-todos').addEventListener('click', () => applyAndClose({ analytics: true, ads: true }));
    document.getElementById('prefs-save').addEventListener('click', () => {
        applyAndClose({
            analytics: document.getElementById('consent-analytics').checked,
            ads: document.getElementById('consent-ads').checked
        });
    });

    const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);

    const focusable = modal.querySelectorAll('button, input, a[href]');
    const first = focusable[0], last = focusable[focusable.length - 1];
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });

    requestAnimationFrame(() => {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.getElementById('cookie-prefs-close').focus();
    });
}

function openCookiePreferences() {
    buildPreferencesModal(getConsent());
}

window.openCookiePreferences = openCookiePreferences;

// ── BANNER INIT ──────────────────────────────────────────

function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const aceitarBtn = document.getElementById('cookie-aceitar');
    if (!cookieBanner || !aceitarBtn) return;

    const rejectBtn = document.getElementById('cookie-recusar');
    const prefsBtn = document.getElementById('cookie-preferencias');

    const consent = getConsent();
    if (consent) applyConsent(consent);

    if (!consent) {
        setTimeout(() => cookieBanner.classList.add('show'), 2000);
    }

    const closeBanner = () => cookieBanner.classList.remove('show');

    aceitarBtn.addEventListener('click', () => {
        saveConsent({ analytics: true, ads: true });
        closeBanner();
    });

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            saveConsent({ analytics: false, ads: false });
            closeBanner();
        });
    }

    if (prefsBtn) {
        prefsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCookiePreferences();
        });
    }
}

document.addEventListener('DOMContentLoaded', initCookieBanner);
