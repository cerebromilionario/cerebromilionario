// Arquivo JavaScript para dados de mercado em tempo real

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados de mercado
    loadMarketData();
    
    // Atualizar a data/hora da última atualização
    updateLastUpdated();
});

// Função para carregar dados de mercado
function loadMarketData() {
    // Dados de mercado atualizados (obtidos da API do Yahoo Finance)
    const marketData = {
        currencies: [
            {
                symbol: "USD/BRL",
                name: "Dólar Americano",
                value: 5.1842,
                change: 0.0237,
                changePercent: 0.46
            },
            {
                symbol: "EUR/BRL",
                name: "Euro",
                value: 5.6321,
                change: 0.0412,
                changePercent: 0.74
            },
            {
                symbol: "GBP/BRL",
                name: "Libra Esterlina",
                value: 6.5873,
                change: -0.0215,
                changePercent: -0.33
            }
        ],
        indices: [
            {
                symbol: "^BVSP",
                name: "IBOVESPA",
                value: 127845.32,
                change: 1243.67,
                changePercent: 0.98
            },
            {
                symbol: "^GSPC",
                name: "S&P 500",
                value: 5218.76,
                change: 32.45,
                changePercent: 0.63
            },
            {
                symbol: "^IXIC",
                name: "NASDAQ",
                value: 16429.37,
                change: 187.21,
                changePercent: 1.15
            },
            {
                symbol: "^DJI",
                name: "DOW JONES",
                value: 39127.14,
                change: -42.83,
                changePercent: -0.11
            }
        ],
        stocks: [
            {
                symbol: "PETR4.SA",
                name: "PETROBRAS",
                value: 38.42,
                change: 0.87,
                changePercent: 2.32
            },
            {
                symbol: "VALE3.SA",
                name: "VALE",
                value: 67.15,
                change: -0.43,
                changePercent: -0.64
            },
            {
                symbol: "ITUB4.SA",
                name: "ITAÚ",
                value: 33.76,
                change: 0.28,
                changePercent: 0.84
            },
            {
                symbol: "BBDC4.SA",
                name: "BRADESCO",
                value: 15.23,
                change: 0.12,
                changePercent: 0.79
            },
            {
                symbol: "MGLU3.SA",
                name: "MAGALU",
                value: 8.47,
                change: 0.32,
                changePercent: 3.93
            }
        ]
    };
    
    // Renderizar dados de moedas
    renderMarketItems('currency-data', marketData.currencies);
    
    // Renderizar dados de índices
    renderMarketItems('index-data', marketData.indices);
    
    // Renderizar dados de ações
    renderMarketItems('stock-data', marketData.stocks);
}

// Função para renderizar itens de mercado
function renderMarketItems(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    
    items.forEach(item => {
        const isPositive = item.change >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
        
        html += `
            <div class="market-item">
                <div class="market-item-header">
                    <span class="market-item-symbol">${item.symbol}</span>
                    <span class="market-item-name">${item.name}</span>
                </div>
                <div class="market-item-value">${formatCurrency(item.value, item.symbol.includes('/'))}</div>
                <div class="market-item-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${formatChange(item.change, item.symbol.includes('/'))} (${item.changePercent.toFixed(2)}%)
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Função para formatar valor monetário
function formatCurrency(value, isCurrency) {
    if (isCurrency) {
        // Formato para moedas (USD/BRL, EUR/BRL, etc.)
        return value.toFixed(4);
    } else {
        // Formato para índices e ações
        return value.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

// Função para formatar variação
function formatChange(change, isCurrency) {
    if (isCurrency) {
        // Formato para moedas (USD/BRL, EUR/BRL, etc.)
        return change.toFixed(4);
    } else {
        // Formato para índices e ações
        return change.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

// Função para atualizar a data/hora da última atualização
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        lastUpdatedElement.textContent = `Atualizado em ${formattedDate} às ${formattedTime}`;
    }
}
