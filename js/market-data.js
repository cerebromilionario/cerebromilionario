<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotações em Tempo Real</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .market-section {
            margin-bottom: 30px;
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 5px;
        }
        
        .market-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f5f5f5;
        }
        
        .positive-change {
            color: #2ecc71;
        }
        
        .negative-change {
            color: #e74c3c;
        }
        
        #last-updated {
            font-size: 0.9em;
            color: #777;
            text-align: right;
            margin-top: 20px;
        }
        
        .loading {
            color: #3498db;
        }
    </style>
</head>
<body>
    <h1>Cotações do Mercado</h1>
    
    <div class="market-section">
        <h2>Moedas</h2>
        <div id="currency-data" class="loading">Carregando cotações...</div>
    </div>
    
    <div class="market-section">
        <h2>Ações Brasileiras</h2>
        <div id="stock-data" class="loading">Carregando cotações...</div>
    </div>
    
    <div id="last-updated"></div>

    <script>
        // =============================================
        // CONFIGURAÇÕES - PODE EDITAR ESTA PARTE
        // =============================================
        const config = {
            updateInterval: 300000, // 5 minutos (300000 ms)
            useLocalStorage: true, // Usar cache do navegador
            showDebug: false // Mostrar mensagens de debug no console
        };

        // Dados padrão (serão usados se a API falhar e não tiver cache)
        const defaultData = {
            currencies: {
                'USD-BRL': { value: '5.30', change: '0.27' },
                'EUR-BRL': { value: '5.75', change: '0.15' }
            },
            stocks: {
                'PETR4': { name: 'PETROBRAS', value: '32.50', change: '1.20' },
                'VALE3': { name: 'VALE', value: '68.90', change: '0.80' },
                'ITUB4': { name: 'ITAÚ', value: '30.25', change: '0.50' }
            }
        };
        // =============================================
        // FIM DAS CONFIGURAÇÕES
        // =============================================

        // Função principal que é executada quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            // Mostra a data/hora atual
            updateLastUpdated();
            
            // Carrega os dados pela primeira vez
            fetchDataWithFallback();
            
            // Configura a atualização automática
            setInterval(fetchDataWithFallback, config.updateInterval);
        });

        // Função que tenta buscar dados novos, se falhar usa cache ou dados padrão
        async function fetchDataWithFallback() {
            try {
                if (config.showDebug) console.log("Tentando buscar dados atualizados...");
                
                // Tenta buscar dados atualizados
                const [currencyData, stockData] = await Promise.all([
                    fetchCurrencyData(),
                    fetchStockData()
                ]);
                
                // Atualiza a tela com os novos dados
                updateCurrencyUI(currencyData);
                updateStockUI(stockData);
                
                // Salva no cache do navegador
                saveToLocalStorage({ 
                    currencyData, 
                    stockData,
                    lastUpdated: new Date().toISOString()
                });
                
                if (config.showDebug) console.log("Dados atualizados com sucesso!");
                
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                
                // Tenta carregar dados salvos
                const cachedData = loadFromLocalStorage();
                if (cachedData) {
                    if (config.showDebug) console.log("Usando dados do cache...");
                    updateCurrencyUI(cachedData.currencyData);
                    updateStockUI(cachedData.stockData);
                } else {
                    // Usa dados padrão se não tiver cache
                    if (config.showDebug) console.log("Usando dados padrão...");
                    updateCurrencyUI(defaultData.currencies);
                    updateStockUI(defaultData.stocks);
                }
            }
            
            // Atualiza a hora da última atualização
            updateLastUpdated();
        }

        // Busca cotações de moedas
        async function fetchCurrencyData() {
            try {
                const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
                const data = await response.json();
                
                return {
                    'USD-BRL': { 
                        value: parseFloat(data.USDBRL.bid).toFixed(2),
                        change: parseFloat(data.USDBRL.pctChange).toFixed(2)
                    },
                    'EUR-BRL': { 
                        value: parseFloat(data.EURBRL.bid).toFixed(2),
                        change: parseFloat(data.EURBRL.pctChange).toFixed(2)
                    }
                };
            } catch (error) {
                console.error("Erro ao buscar moedas:", error);
                throw error;
            }
        }

        // Busca cotações de ações (simplificado)
        async function fetchStockData() {
            try {
                // Simulando uma API (na prática, você precisaria de um backend)
                // Esta é uma versão simplificada que usa dados mockados
                // Para uma versão real, precisaria configurar um servidor proxy
                return defaultData.stocks;
            } catch (error) {
                console.error("Erro ao buscar ações:", error);
                throw error;
            }
        }

        // Atualiza a exibição das moedas
        function updateCurrencyUI(data) {
            const container = document.getElementById('currency-data');
            if (!container) return;
            
            let html = '';
            for (const [pair, info] of Object.entries(data)) {
                const isPositive = parseFloat(info.change) >= 0;
                const changeClass = isPositive ? 'positive-change' : 'negative-change';
                const changeIcon = isPositive ? '▲' : '▼';
                
                html += `
                    <div class="market-item">
                        <div>${pair.replace('-', '/')}</div>
                        <div>R$ ${info.value}</div>
                        <div class="${changeClass}">${changeIcon} ${Math.abs(info.change)}%</div>
                    </div>
                `;
            }
            
            container.innerHTML = html;
            container.classList.remove('loading');
        }

        // Atualiza a exibição das ações
        function updateStockUI(data) {
            const container = document.getElementById('stock-data');
            if (!container) return;
            
            let html = '';
            for (const [ticker, info] of Object.entries(data)) {
                const isPositive = parseFloat(info.change) >= 0;
                const changeClass = isPositive ? 'positive-change' : 'negative-change';
                const changeIcon = isPositive ? '▲' : '▼';
                
                html += `
                    <div class="market-item">
                        <div>${info.name} (${ticker})</div>
                        <div>R$ ${info.value}</div>
                        <div class="${changeClass}">${changeIcon} ${Math.abs(info.change)}%</div>
                    </div>
                `;
            }
            
            container.innerHTML = html;
            container.classList.remove('loading');
        }

        // Funções de cache (salva no armazenamento local do navegador)
        function saveToLocalStorage(data) {
            if (config.useLocalStorage) {
                localStorage.setItem('marketData', JSON.stringify(data));
            }
        }

        function loadFromLocalStorage() {
            if (config.useLocalStorage) {
                const saved = localStorage.getItem('marketData');
                return saved ? JSON.parse(saved) : null;
            }
            return null;
        }

        // Atualiza a data/hora da última atualização
        function updateLastUpdated() {
            const element = document.getElementById('last-updated');
            if (element) {
                const now = new Date();
                element.textContent = `Última atualização: ${now.toLocaleString('pt-BR')}`;
            }
        }
    </script>
</body>
</html>
