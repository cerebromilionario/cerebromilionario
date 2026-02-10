// Arquivo JavaScript principal para o site Cérebro Milionário

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o ano atual no footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
            
            // Alternar ícone do menu
            const menuIcon = mobileMenuBtn.querySelector('i');
            if (menuIcon) {
                if (isExpanded) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-times');
                } else {
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    }

    // Header fixo com mudança de estilo ao rolar
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Inicializar tabs (para market data, calculadora, etc)
    initTabs();

    // Carregar posts recentes na página inicial
    loadLatestPosts();

    // Formulário de newsletter
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    if (newsletterForms.length > 0) {
        newsletterForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                if (emailInput && emailInput.value) {
                    // Aqui seria a lógica para enviar o email para um serviço
                    // Por enquanto, apenas simulamos o sucesso
                    alert('Obrigado por se inscrever! Em breve você receberá nossas novidades.');
                    emailInput.value = '';
                }
            });
        });
    }

    // Inicializar animações de entrada
    initAnimations();
});

// Função para inicializar tabs
function initTabs() {
    const tabContainers = [
        { tabs: '.market-data-tab', panels: '.market-data-panel' },
        { tabs: '.calculator-tab', panels: '.calculator-panel' }
    ];

    tabContainers.forEach(container => {
        const tabs = document.querySelectorAll(container.tabs);
        const panels = document.querySelectorAll(container.panels);
        
        if (tabs.length > 0 && panels.length > 0) {
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remover classe ativa de todas as tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    
                    // Adicionar classe ativa à tab clicada
                    this.classList.add('active');
                    
                    // Esconder todos os painéis
                    panels.forEach(panel => panel.classList.remove('active'));
                    
                    // Mostrar o painel correspondente
                    const panelId = this.getAttribute('data-panel');
                    const targetPanel = document.getElementById(panelId);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                    }
                });
            });
        }
    });
}

// Função para carregar posts recentes na página inicial
function loadLatestPosts() {
    const latestPostsGrid = document.getElementById('latest-posts-grid');
    if (!latestPostsGrid) return;

    // Dados de exemplo para os posts recentes
    // Em um site real, isso viria de uma API ou banco de dados
    const latestPosts = [
        {
            title: 'Psicologia Financeira: Como Evitar Armadilhas',
            excerpt: 'Os vieses que sabotam seu bolso e como criar um sistema para tomar melhores decisões.',
            image: 'images/blog-default.svg',
            url: 'posts/psicologia-financeira.html',
            date: '',
            readTime: '15 min'
        },
        {
            title: 'Planejamento de Aposentadoria: Estratégia de Longo Prazo',
            excerpt: 'Como calcular patrimônio alvo, aportes e taxa de retirada para viver de renda.',
            image: 'images/blog-default.svg',
            url: 'posts/planejamento-aposentadoria.html',
            date: '',
            readTime: '15 min'
        },
        {
            title: 'Orçamento Familiar: Método Prático para Sobrar Dinheiro',
            excerpt: 'Um método simples para controlar gastos, reduzir desperdícios e acelerar seus aportes.',
            image: 'images/blog-default.svg',
            url: 'posts/orcamento-familiar.html',
            date: '',
            readTime: '15 min'
        },
        {
            title: 'Minimalismo Financeiro: Gastar Melhor e Investir Mais',
            excerpt: 'Uma abordagem prática para reduzir consumo e acelerar a construção de patrimônio.',
            image: 'images/blog-default.svg',
            url: 'posts/minimalismo-financeiro.html',
            date: '',
            readTime: '15 min'
        },
        {
            title: 'Investimentos Sustentáveis: ESG na Prática',
            excerpt: 'Como avaliar ESG de verdade e evitar armadilhas na hora de investir com propósito.',
            image: 'images/blog-default.svg',
            url: 'posts/investimentos-sustentaveis.html',
            date: '',
            readTime: '15 min'
        },
        {
            title: 'Fundo de Emergência: O Guia Completo',
            excerpt: 'Como montar sua reserva com segurança, liquidez e estratégia — e quando usar.',
            image: 'images/blog-default.svg',
            url: 'posts/fundo-emergencia.html',
            date: '',
            readTime: '15 min'
        },
    ];

    let postsHTML = '';
    latestPosts.forEach(post => {
        postsHTML += `
            <div class="blog-card animate-fade-in">
                <div class="blog-card-img">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span><i class="far fa-calendar"></i> ${post.date}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime} de leitura</span>
                    </div>
                    <h3><a href="${post.url}">${post.title}</a></h3>
                    <p>${post.excerpt}</p>
                    <a href="${post.url}" class="btn btn-tertiary">Ler Mais</a>
                </div>
            </div>
        `;
    });

    latestPostsGrid.innerHTML = postsHTML;
}

// Função para inicializar animações
function initAnimations() {
    // Animação de fade-in para elementos com a classe animate-fade-in
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    
    if (animatedElements.length > 0) {
        // Função para verificar se um elemento está visível na viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        }
        
        // Função para animar elementos visíveis
        function animateVisibleElements() {
            animatedElements.forEach(element => {
                if (isElementInViewport(element) && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        }
        
        // Configurar estilo inicial para elementos animados
        animatedElements.forEach(element => {
            if (!element.style.opacity) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }
        });
        
        // Executar animação no carregamento e no scroll
        animateVisibleElements();
        window.addEventListener('scroll', animateVisibleElements);
    }
}

// Função para compartilhamento em redes sociais
function sharePost(platform, url, title) {
    let shareUrl;
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    return false;
}


// Blog: renderiza lista completa com paginação (9 por página) usando posts.json
async function loadBlogPosts() {
    const container = document.getElementById('posts-container');
    const pag = document.querySelector('.pagination');
    if (!container) return;

    const posts = await fetchPostsIndex();
    const perPage = 9;

    if (!posts.length) {
        container.innerHTML = '<p style="opacity:.75">Ainda não há posts disponíveis.</p>';
        if (pag) pag.style.display = 'none';
        return;
    }

    const totalPages = Math.max(1, Math.ceil(posts.length / perPage));

    function renderPage(page) {
        const p = Math.max(1, Math.min(totalPages, page));
        const start = (p - 1) * perPage;
        const slice = posts.slice(start, start + perPage);

        container.innerHTML = slice.map(post => `
            <div class="post-card">
                <div class="blog-card-img">
                    <img src="${escapeHtml(post.image || 'images/blog-default.svg')}" alt="${escapeHtml(post.title)}" loading="lazy">
                </div>
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span><i class="far fa-calendar"></i> ${post.date ? escapeHtml(post.date.split('-').reverse().join('/')) : '—'}</span>
                        <span><i class="far fa-clock"></i> ${escapeHtml(post.readTime || '—')}</span>
                    </div>
                    <h3><a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a></h3>
                    <p>${escapeHtml(post.excerpt)}</p>
                    <a href="${escapeHtml(post.url)}" class="btn btn-tertiary">Ler Mais</a>
                </div>
            </div>
        `).join('');

        // Pagination buttons
        if (pag) {
            pag.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.className = 'pagination-btn' + (i === p ? ' active' : '');
                btn.dataset.page = String(i);
                btn.textContent = String(i);
                btn.addEventListener('click', () => renderPage(i));
                pag.appendChild(btn);
            }
        }
        // Scroll to top of posts area for better UX
        const section = document.getElementById('blog-posts') || container;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // initial page
    renderPage(1);
}

