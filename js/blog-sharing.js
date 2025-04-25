// Atualização dos botões de compartilhamento para todos os posts do blog
document.addEventListener('DOMContentLoaded', function() {
    // Atualiza os botões de compartilhamento em cada post do blog
    function updateShareButtons() {
        const articles = document.querySelectorAll('.post-content, .blog-post');
        
        articles.forEach(article => {
            // Obtém informações do artigo
            const title = article.querySelector('h1, h2, h3')?.textContent || document.title;
            const url = window.location.href;
            const description = article.querySelector('p')?.textContent || '';
            
            // Atualiza os botões de compartilhamento
            const shareButtons = article.querySelectorAll('.share-button');
            
            shareButtons.forEach(button => {
                const platform = button.getAttribute('data-platform');
                
                // Define os atributos de dados
                button.setAttribute('data-url', url);
                button.setAttribute('data-title', title);
                button.setAttribute('data-description', description);
                
                // Remove qualquer event listener existente
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Adiciona novo event listener
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const platform = this.getAttribute('data-platform');
                    const url = this.getAttribute('data-url');
                    const title = this.getAttribute('data-title');
                    const description = this.getAttribute('data-description');
                    
                    shareOnSocialMedia(platform, url, title, description);
                });
            });
        });
    }
    
    // Chama a função para atualizar os botões
    updateShareButtons();
});
