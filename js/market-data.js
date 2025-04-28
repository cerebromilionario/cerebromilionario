// Arquivo para obter e exibir cotações em tempo real com APIs reais
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os elementos de cotação
    initializeMarketData();
    
    // Atualiza o timestamp inicial
    updateLastUpdated();
});

// Configurações
const config = {
    updateInterval: 60000, // 1 minuto (reduzido de 5 minutos para dados mais atualizados)
    currencyPairs: ['USD-BRL', 'EUR-BRL', 'GBP-BRL'],
    stockTickers: ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'MGLU3'],
    indices: [
        { code: '^BVSP', name: 'IBOVESPA' },
        { code: '^GSPC', name: 'S&P 500' },
        { code: '^IXIC', name: 'NASDAQ' },
        { code: '^DJI', name: 'DOW JONES' }
    ]
};

// Função para inicializar os dados de mercado
function initializeMarketData() {
    // Obtém todas as cotações
    fetchAllMarketData();
    
    // Configura atualização periódica
    setInterval(fetchAllMarketData, config.updateInterval);
}

// Função para obter todos os dados do mercado
async function fetchAllMarketData() {
    try {
        await Promise.all([
            fetchCurrencyData(),
            fetchIndexData(),
            fetchStockData()
        ]);
        updateLastUpdated();
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        showErrorMessage();
    }
}

// Função para obter cotações de moedas (usando AwesomeAPI)
async function fetchCurrencyData() {
    try {
        const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${config.currencyPairs.join()}`);
        const data = await response.json();
        
        const formattedData = {};
        config.currencyPairs.forEach(pair => {
            const key = pair.replace('-', '');
            if (data[key]) {
                formattedData[pair] = {
                    value: parseFloat(data[key].bid).toFixed(2),
                    change: parseFloat(data[key].pctChange).toFixed(2)
                };
            }
        });
        
        updateCurrencyUI(formattedData);
    } catch (error) {
        console.error('Erro ao obter dados de moedas:', error);
        throw error;
    }
}

// Função para obter cotações de índices (usando Yahoo Finance)
async function fetchIndexData() {
    try {
        const requests = config.indices.map(index => 
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${index.code}`)
                .then(response => response.json())
                .then(data => ({
                    name: index.name,
                    data: data.chart.result[0].meta
                }))
        );
        
        const results = await Promise.all(requests);
        
        const indexData = {};
        results.forEach(result => {
            const meta = result.data;
            const changePercent = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2);
            
            indexData[result.name] = {
                value: meta.regularMarketPrice.toLocaleString('pt-BR'),
                change: changePercent
            };
        });
        
        updateIndexUI(indexData);
    } catch (error) {
        console.error('Erro ao obter dados de índices:', error);
        throw error;
    }
}

// Função para obter cotações de ações (usando Yahoo Finance)
async function fetchStockData() {
    try {
        const requests = config.stockTickers.map(ticker => 
            fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.SA`)
                .then(response => response.json())
                .then(data => ({
                    ticker,
                    data: data.chart.result[0].meta
                }))
        );
        
        const results = await Promise.all(requests);
        
        const stockData = {};
        results.forEach(result => {
            const meta = result.data;
            const changePercent = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2);
            
            stockData[result.ticker] = {
                name: getStockName(result.ticker),
                value: meta.regularMarketPrice.toFixed(2),
                change: changePercent
            };
        });
        
        updateStockUI(stockData);
    } catch (error) {
        console.error('Erro ao obter dados de ações:', error);
        throw error;
    }
}

// Mapeamento de nomes de ações
function getStockName(ticker) {
    const names = {
        'PETR4': 'PETROBRAS',
        'VALE3': 'VALE',
        'ITUB4': 'ITAÚ',
        'BBDC4': 'BRADESCO',
        'MGLU3': 'MAGALU'
    };
    return names[ticker] || ticker;
}

// Funções de atualização de UI (mantidas como no seu código original)
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
                <div class="market-symbol">${pair.replace('-', '/')}</div>
                <div class="market-value">R$ ${info.value}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change)}%
                </div>
            </div>
        `;
    }
    
    currencyContainer.innerHTML = html;
}

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
                <div class="market-value">${info.value}</div>
                <div class="market-change ${changeClass}">
                    ${changeIcon} ${Math.abs(info.change)}%
                </div>
            </div>
        `;
    }
    
    indexContainer.innerHTML = html;
}

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

// Função para mostrar mensagem de erro
function showErrorMessage() {
    const containers = ['currency-data', 'index-data', 'stock-data'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = `<div class="error-message">Dados temporariamente indisponíveis. Atualizando automaticamente...</div>`;
        }
    });
}

// Funções de timestamp (mantidas como no seu código original)
function getCurrentDateTime() {
    const now = new Date();
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    return now.toLocaleDateString('pt-BR', options);
}

function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Última atualização: ${getCurrentDateTime()}`;
    }
}
