// Arquivo para obter e exibir cotações em tempo real
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os elementos de cotação
    initializeMarketData();
});

// Função para inicializar os dados de mercado
function initializeMarketData() {
    // Obtém cotações de moedas
    fetchCurrencyData();
    
    // Obtém cotações de índices
    fetchIndexData();
    
    // Obtém cotações de ações
    fetchStockData();
    
    // Atualiza os dados a cada 5 minutos
    setInterval(function() {
        fetchCurrencyData();
        fetchIndexData();
        fetchStockData();
    }, 300000); // 5 minutos em milissegundos
}

// Função para obter cotações de moedas
async function fetchCurrencyData() {
    try {
        // Simula a obtenção de dados de API
        const currencyData = {
            'USD/BRL': {
                value: (Math.random() * 0.2 + 5.0).toFixed(2),
                change: (Math.random() * 0.2 - 0.1).toFixed(2)
            },
            'EUR/BRL': {
                value: (Math.random() * 0.2 + 5.5).toFixed(2),
                change: (Math.random() * 0.2 - 0.1).toFixed(2)
            },
            'GBP/BRL': {
                value: (Math.random() * 0.2 + 6.5).toFixed(2),
                change: (Math.random() * 0.2 - 0.1).toFixed(2)
            }
        };
        
        // Atualiza a interface com os dados obtidos
        updateCurrencyUI(currencyData);
    } catch (error) {
        console.error('Erro ao obter dados de moedas:', error);
    }
}

// Função para obter cotações de índices
async function fetchIndexData() {
    try {
        // Simula a obtenção de dados de API
        const indexData = {
            'IBOVESPA': {
                value: Math.floor(Math.random() * 2000 + 125000),
                change: (Math.random() * 2 - 1).toFixed(2)
            },
            'S&P 500': {
                value: Math.floor(Math.random() * 100 + 5000),
                change: (Math.random() * 2 - 1).toFixed(2)
            },
            'NASDAQ': {
                value: Math.floor(Math.random() * 200 + 16000),
                change: (Math.random() * 2 - 1).toFixed(2)
            },
            'DOW JONES': {
                value: Math.floor(Math.random() * 500 + 38000),
                change: (Math.random() * 2 - 1).toFixed(2)
            }
        };
        
        // Atualiza a interface com os dados obtidos
        updateIndexUI(indexData);
    } catch (error) {
        console.error('Erro ao obter dados de índices:', error);
    }
}

// Função para obter cotações de ações
async function fetchStockData() {
    try {
        // Simula a obtenção de dados de API
        const stockData = {
            'PETR4.SA': {
                name: 'PETROBRAS',
                value: (Math.random() * 5 + 35).toFixed(2),
                change: (Math.random() * 4 - 2).toFixed(2)
            },
            'VALE3.SA': {
                name: 'VALE',
                value: (Math.random() * 10 + 65).toFixed(2),
                change: (Math.random() * 4 - 2).toFixed(2)
            },
            'ITUB4.SA': {
                name: 'ITAÚ',
                value: (Math.random() * 5 + 30).toFixed(2),
                change: (Math.random() * 4 - 2).toFixed(2)
            },
            'BBDC4.SA': {
                name: 'BRADESCO',
                value: (Math.random() * 3 + 15).toFixed(2),
                change: (Math.random() * 4 - 2).toFixed(2)
            },
            'MGLU3.SA': {
                name: 'MAGALU',
                value: (Math.random() * 2 + 8).toFixed(2),
                change: (Math.random() * 4 - 2).toFixed(2)
            }
        };
        
        // Atualiza a interface com os dados obtidos
        updateStockUI(stockData);
    } catch (error) {
        console.error('Erro ao obter dados de ações:', error);
    }
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
                <div class="market-value">R$ ${info.value}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change)}%
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
                    ${changeIcon} ${Math.abs(info.change)}%
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
                <div class="market-value">R$ ${info.value}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change)}%
                </div>
            </div>
        `;
    }
    
    stockContainer.innerHTML = html;
}

// Função para formatar data e hora atual
function getCurrentDateTime() {
    const now = new Date();
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return now.toLocaleDateString('pt-BR', options);
}

// Atualiza o timestamp da última atualização
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Última atualização: ${getCurrentDateTime()}`;
    }
}

// Inicializa o timestamp de última atualização
document.addEventListener('DOMContentLoaded', function() {
    updateLastUpdated();
    
    // Atualiza o timestamp a cada 5 minutos
    setInterval(updateLastUpdated, 300000);
});
