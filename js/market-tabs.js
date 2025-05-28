// Arquivo JavaScript para as abas de dados de mercado

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tabs de dados de mercado
    initMarketTabs();
});

// Inicializar tabs de dados de mercado
function initMarketTabs() {
    const tabs = document.querySelectorAll('.market-data-tab');
    const panels = document.querySelectorAll('.market-data-panel');
    
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
}
