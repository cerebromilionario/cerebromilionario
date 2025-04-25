// Função para compartilhamento nas redes sociais - Versão corrigida
function shareOnSocialMedia(platform, url, title, description) {
    // Codifica os parâmetros para URL
    const encodedUrl = encodeURIComponent(url || window.location.href);
    const encodedTitle = encodeURIComponent(title || document.title);
    const encodedDescription = encodeURIComponent(description || '');
    
    // URLs para compartilhamento em diferentes plataformas
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'whatsapp':
            shareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
            break;
        case 'email':
            shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`;
            break;
        default:
            console.error('Plataforma de compartilhamento não suportada');
            return;
    }
    
    // Abre uma nova janela para compartilhamento
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Registra o evento de compartilhamento para análise
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            'method': platform,
            'content_type': 'article',
            'content_id': window.location.pathname
        });
    }
}

// Inicializa os botões de compartilhamento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando botões de compartilhamento...');
    
    // Seleciona todos os botões de compartilhamento
    const shareButtons = document.querySelectorAll('.share-button, .social-share-btn, [data-share]');
    
    console.log('Botões encontrados:', shareButtons.length);
    
    // Adiciona event listener para cada botão
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Previne o comportamento padrão do link
            
            // Obtém os atributos de dados do botão
            const platform = this.getAttribute('data-platform') || this.getAttribute('data-share');
            const url = this.getAttribute('data-url') || window.location.href;
            const title = this.getAttribute('data-title') || document.title;
            const description = this.getAttribute('data-description') || '';
            
            console.log('Compartilhando:', platform, url);
            
            // Compartilha nas redes sociais
            shareOnSocialMedia(platform, url, title, description);
        });
    });
    
    // Adiciona event listeners para botões adicionados dinamicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        const newButtons = node.querySelectorAll('.share-button, .social-share-btn, [data-share]');
                        newButtons.forEach(button => {
                            button.addEventListener('click', function(e) {
                                e.preventDefault();
                                const platform = this.getAttribute('data-platform') || this.getAttribute('data-share');
                                const url = this.getAttribute('data-url') || window.location.href;
                                const title = this.getAttribute('data-title') || document.title;
                                const description = this.getAttribute('data-description') || '';
                                shareOnSocialMedia(platform, url, title, description);
                            });
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Função para adicionar botões de compartilhamento a todos os posts
function addShareButtonsToAllPosts() {
    const articles = document.querySelectorAll('.blog-post, .post-content, article');
    
    articles.forEach(article => {
        // Verifica se o artigo já tem botões de compartilhamento
        const existingButtons = article.querySelector('.social-share-container');
        if (existingButtons) return;
        
        // Obtém informações do artigo
        const title = article.querySelector('h1, h2, h3')?.textContent || document.title;
        const url = window.location.href;
        
        // Cria container para botões de compartilhamento
        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-container';
        shareContainer.innerHTML = `
            <p class="share-title">Compartilhe este artigo:</p>
            <div class="social-share-buttons">
                <button class="social-share-btn" data-share="facebook" data-url="${url}" data-title="${title}">
                    <i class="fab fa-facebook-f"></i> Facebook
                </button>
                <button class="social-share-btn" data-share="twitter" data-url="${url}" data-title="${title}">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button class="social-share-btn" data-share="whatsapp" data-url="${url}" data-title="${title}">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button class="social-share-btn" data-share="telegram" data-url="${url}" data-title="${title}">
                    <i class="fab fa-telegram"></i> Telegram
                </button>
                <button class="social-share-btn" data-share="linkedin" data-url="${url}" data-title="${title}">
                    <i class="fab fa-linkedin-in"></i> LinkedIn
                </button>
                <button class="social-share-btn" data-share="email" data-url="${url}" data-title="${title}">
                    <i class="fas fa-envelope"></i> Email
                </button>
            </div>
        `;
        
        // Adiciona os botões ao final do artigo
        article.appendChild(shareContainer);
    });
}

// Adiciona botões de compartilhamento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    addShareButtonsToAllPosts();
});

// Adiciona botões de compartilhamento quando a página for carregada completamente
window.addEventListener('load', function() {
    addShareButtonsToAllPosts();
});
