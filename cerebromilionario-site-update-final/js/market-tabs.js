// Arquivo para controlar as abas de dados de mercado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa as abas de dados de mercado
    initializeMarketTabs();
});

// Função para inicializar as abas de dados de mercado
function initializeMarketTabs() {
    const tabs = document.querySelectorAll('.market-data-tab');
    const panels = document.querySelectorAll('.market-data-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove a classe active de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            
            // Adiciona a classe active à aba clicada
            this.classList.add('active');
            
            // Obtém o ID do painel correspondente
            const panelId = this.getAttribute('data-panel');
            
            // Remove a classe active de todos os painéis
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Adiciona a classe active ao painel correspondente
            document.getElementById(panelId).classList.add('active');
        });
    });
}
