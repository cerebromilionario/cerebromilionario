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
            title: 'O Poder dos Juros Compostos',
            excerpt: 'Descubra como os juros compostos podem transformar pequenos investimentos em grandes fortunas ao longo do tempo.',
            image: 'images/post-juros-compostos.jpg',
            url: 'posts/o-poder-dos-juros-compostos.html',
            date: '28/05/2025',
            readTime: '10 min'
        },
        {
            title: 'Investimentos para Iniciantes',
            excerpt: 'Um guia completo para quem está começando a investir: entenda os conceitos básicos e as melhores opções.',
            image: 'images/post-investimentos-iniciantes.jpg',
            url: 'posts/investimentos-para-iniciantes.html',
            date: '25/05/2025',
            readTime: '12 min'
        },
        {
            title: 'Educação Financeira: A Base para o Sucesso',
            excerpt: 'Por que a educação financeira é fundamental para construir um futuro próspero e como começar a aprender.',
            image: 'images/post-educacao-financeira.jpg',
            url: 'posts/educacao-financeira-base-para-sucesso.html',
            date: '22/05/2025',
            readTime: '8 min'
        }
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
