// Função para compartilhamento nas redes sociais
function shareOnSocialMedia(platform, url, title, description) {
    // Codifica os parâmetros para URL
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    
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
}

// Adiciona event listeners aos botões de compartilhamento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Obtém todos os botões de compartilhamento
    const shareButtons = document.querySelectorAll('.share-button');
    
    // Adiciona event listener para cada botão
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Previne o comportamento padrão do link
            
            // Obtém os atributos de dados do botão
            const platform = this.getAttribute('data-platform');
            const url = this.getAttribute('data-url') || window.location.href;
            const title = this.getAttribute('data-title') || document.title;
            const description = this.getAttribute('data-description') || '';
            
            // Compartilha nas redes sociais
            shareOnSocialMedia(platform, url, title, description);
        });
    });
});

// Função para menu mobile
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
});
