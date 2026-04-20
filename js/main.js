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
    
    // Newsletter
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            if (input && input.value) {
                alert('Obrigado por se inscrever! Em breve você receberá nossas novidades.');
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

async function fetchPostsIndex() {
    try {
        const res = await fetch('/posts/posts.json');
        return await res.json();
    } catch (e) {
        console.error('Error fetching posts:', e);
        return [];
    }
}

async function loadLatestPosts() {
    const grid = document.getElementById('latest-posts-grid');
    if (!grid) return;
    const posts = await fetchPostsIndex();
    const latest = posts.slice(0, 4);
    grid.innerHTML = latest.map(post => `
        <a href="${post.url}" class="news-card">
            <div class="news-card-img">
                <img src="${post.image || '/images/blog-cover.svg'}" alt="${post.title}" loading="lazy">
            </div>
            <div class="news-card-content">
                <span class="news-tag">${post.category || 'Educação'}</span>
                <h3>${post.title}</h3>
                <div class="news-meta">
                    <span><i class="far fa-calendar"></i> ${post.date ? post.date.split('-').reverse().join('/') : ''}</span>
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
