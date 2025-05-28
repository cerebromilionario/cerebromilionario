// Arquivo para obter e exibir cotações em tempo real
// Última atualização: 28/04/2025 12:57

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os elementos de cotação
    initializeMarketData();
});

// Função para inicializar os dados de mercado
function initializeMarketData() {
    // Atualiza os dados de moedas
    updateCurrencyUI({"USD/BRL": {"value": 5.66, "change": -0.4}, "EUR/BRL": {"value": 6.43, "change": -0.5}, "GBP/BRL": {"value": 7.56, "change": -0.17}});
    
    // Atualiza os dados de índices
    updateIndexUI({"IBOVESPA": {"value": 134739, "change": 0.12}, "S&P 500": {"value": 5525, "change": 0.74}, "NASDAQ": {"value": 17382, "change": 1.26}, "DOW JONES": {"value": 40113, "change": 0.05}});
    
    // Atualiza os dados de ações
    updateStockUI({"PETR4.SA": {"name": "PETROBRAS", "value": 30.52, "change": 0.3}, "VALE3.SA": {"name": "VALE", "value": 53.85, "change": -2.64}, "ITUB4.SA": {"name": "ITA\u00da", "value": 34.62, "change": -0.37}, "BBDC4.SA": {"name": "BRADESCO", "value": 13.38, "change": 0.15}, "MGLU3.SA": {"name": "MAGALU", "value": 10.45, "change": -1.14}});
    
    // Atualiza o timestamp da última atualização
    updateLastUpdated();
}

// Função para atualizar a interface com dados de moedas
function updateCurrencyUI(data) {
    const currencyContainer = document.getElementById('currency-data');
    if (!currencyContainer) return;
    
    let html = '';
    
    for (const [pair, info] of Object.entries(data)) {
        const isPositive = parseFloat(info.change) >= 0;
        const changeClass = isPositive ? 'positive-change' : 'negative-change';
        const changeIcon = isPositive ? '▲' : '▼';
        
        html += `
            <div class="market-item">
                <div class="market-symbol">${pair}</div>
                <div class="market-value">R$ ${info.value.toFixed(2)}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change).toFixed(2)}%
                </div>
            </div>
        `;
    }
    
    currencyContainer.innerHTML = html;
}

// Função para atualizar a interface com dados de índices
function updateIndexUI(data) {
    const indexContainer = document.getElementById('index-data');
    if (!indexContainer) return;
    
    let html = '';
    
    for (const [index, info] of Object.entries(data)) {
        const isPositive = parseFloat(info.change) >= 0;
        const changeClass = isPositive ? 'positive-change' : 'negative-change';
        const changeIcon = isPositive ? '▲' : '▼';
        
        html += `
            <div class="market-item">
                <div class="market-symbol">${index}</div>
                <div class="market-value">${info.value.toLocaleString('pt-BR')}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change).toFixed(2)}%
                </div>
            </div>
        `;
    }
    
    indexContainer.innerHTML = html;
}

// Função para atualizar a interface com dados de ações
function updateStockUI(data) {
    const stockContainer = document.getElementById('stock-data');
    if (!stockContainer) return;
    
    let html = '';
    
    for (const [ticker, info] of Object.entries(data)) {
        const isPositive = parseFloat(info.change) >= 0;
        const changeClass = isPositive ? 'positive-change' : 'negative-change';
        const changeIcon = isPositive ? '▲' : '▼';
        
        html += `
            <div class="market-item">
                <div class="market-name">${info.name}</div>
                <div class="market-value">R$ ${info.value.toFixed(2)}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change).toFixed(2)}%
                </div>
            </div>
        `;
    }
    
    stockContainer.innerHTML = html;
}

// Função para formatar data e hora atual
function getCurrentDateTime() {
    return "28/04/2025 12:57";
}

// Atualiza o timestamp da última atualização
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Última atualização: ${getCurrentDateTime()}`;
    }
}
