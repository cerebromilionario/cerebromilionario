// Arquivo JavaScript para dados de mercado (moedas ao vivo via ExchangeRate.host)

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados de mercado
    loadMarketData();

    // Atualizar a data/hora da última atualização
    updateLastUpdated();

    // Atualizar automaticamente as cotações de moedas (a cada 5 minutos)
    setInterval(async () => {
        await loadCurrencyLive();
        updateLastUpdated();
    }, 5 * 60 * 1000);
});

// Função para carregar dados de mercado
async function loadMarketData() {
    // 1) Moedas ao vivo
    await loadCurrencyLive();

    // 2) Índices e Ações (mantidos como exemplo estático por enquanto)
    //    Se você quiser, dá para conectar em APIs específicas depois.
    const marketData = {
        indices: [
            { symbol: "^BVSP", name: "IBOVESPA", value: 127845.32, change: 1243.67, changePercent: 0.98 },
            { symbol: "^GSPC", name: "S&P 500", value: 5218.76, change: 32.45, changePercent: 0.63 },
            { symbol: "^IXIC", name: "NASDAQ", value: 16429.37, change: 187.21, changePercent: 1.15 },
            { symbol: "^DJI", name: "DOW JONES", value: 39127.14, change: -42.83, changePercent: -0.11 }
        ],
        stocks: [
            { symbol: "PETR4.SA", name: "PETROBRAS", value: 38.42, change: 0.87, changePercent: 2.32 },
            { symbol: "VALE3.SA", name: "VALE", value: 67.15, change: -0.43, changePercent: -0.64 },
            { symbol: "ITUB4.SA", name: "ITAÚ", value: 33.76, change: 0.28, changePercent: 0.84 },
            { symbol: "BBDC4.SA", name: "BRADESCO", value: 15.23, change: 0.12, changePercent: 0.79 },
            { symbol: "MGLU3.SA", name: "MAGALU", value: 8.47, change: 0.32, changePercent: 3.93 }
        ]
    };

    // Renderizar dados de índices
    renderMarketItems('index-data', marketData.indices);

    // Renderizar dados de ações
    renderMarketItems('stock-data', marketData.stocks);
}

// Carrega moedas ao vivo via ExchangeRate.host (sem chave)
// Carrega moedas ao vivo (sem chave). Tenta ExchangeRate.host e faz fallback para Frankfurter (ECB).
async function loadCurrencyLive() {
    const container = document.getElementById('currency-data');
    if (!container) return;

    async function tryExchangeRateHost() {
        const url = "https://api.exchangerate.host/latest?base=BRL&symbols=USD,EUR,GBP";
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();

        // Alguns ambientes retornam {success:false, error:{code:101,...}} pedindo access_key
        if (data && data.success === false) {
            throw new Error(data?.error?.type || data?.error?.code || "exchangerate_host_error");
        }
        if (!data || !data.rates || !data.rates.USD || !data.rates.EUR || !data.rates.GBP) {
            throw new Error("Resposta inválida do ExchangeRate.host");
        }
        return data.rates; // BRL -> USD/EUR/GBP
    }

    async function tryFrankfurter() {
        // API sem chave (ECB). Endpoint: api.frankfurter.dev
        const url = "https://api.frankfurter.dev/latest?from=BRL&to=USD,EUR,GBP";
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (!data || !data.rates || !data.rates.USD || !data.rates.EUR || !data.rates.GBP) {
            throw new Error("Resposta inválida do Frankfurter");
        }
        return data.rates; // BRL -> USD/EUR/GBP
    }

    try {
        let rates;
        try {
            rates = await tryExchangeRateHost();
        } catch (err) {
            console.warn("ExchangeRate.host falhou, usando fallback Frankfurter:", err);
            rates = await tryFrankfurter();
        }

        // base=BRL retorna: 1 BRL = X USD/EUR/GBP.
        // Para mostrar USD/BRL (quanto custa 1 USD em BRL), fazemos 1 / rate.
        const usdbrl = 1 / rates.USD;
        const eurbrl = 1 / rates.EUR;
        const gbpbrl = 1 / rates.GBP;

        const currencies = [
            { symbol: "USD/BRL", name: "Dólar Americano", value: usdbrl, change: 0, changePercent: 0 },
            { symbol: "EUR/BRL", name: "Euro",            value: eurbrl, change: 0, changePercent: 0 },
            { symbol: "GBP/BRL", name: "Libra Esterlina", value: gbpbrl, change: 0, changePercent: 0 }
        ];

        renderMarketItems('currency-data', currencies);

        // Atualiza "última atualização"
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            lastUpdatedElement.textContent = `Atualizado em ${formattedDate} às ${formattedTime}`;
        }
    } catch (e) {
        console.error("Erro ao carregar cotações ao vivo:", e);
        container.innerHTML = "<p>Não foi possível carregar as cotações agora. Tente novamente em instantes.</p>";
    }
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
                    ${formatChange(item.change, item.symbol.includes('/'))} (${Number(item.changePercent).toFixed(2)}%)
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
        return Number(value).toFixed(4);
    } else {
        // Formato para índices e ações
        return Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

// Função para formatar variação
function formatChange(change, isCurrency) {
    if (isCurrency) {
        // Moedas
        return Number(change).toFixed(4);
    } else {
        // Índices e ações
        return Number(change).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

// Função para atualizar a data/hora da última atualização
function updateLastUpdated() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement && lastUpdatedElement.textContent.trim() === "") {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        lastUpdatedElement.textContent = `Atualizado em ${formattedDate} às ${formattedTime}`;
    }
}
