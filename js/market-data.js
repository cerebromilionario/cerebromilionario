/**
 * Script de Cotações em Tempo Real - Dólar e Ações
 * Substitua os IDs no HTML conforme necessário.
 * Atualiza a cada 30 segundos.
 */

// Configurações
const config = {
    moedas: ["USD-BRL"],  // Dólar
    acoes: ["PETR4", "VALE3", "ITUB4"],  // Códigos das ações (sufixo .SA será adicionado)
    interval: 30000  // 30 segundos
};

// Busca cotação de moedas (AwesomeAPI)
async function fetchMoeda(codigo) {
    try {
        const response = await fetch(`https://economia.awesomeapi.com.br/json/last/${codigo}`);
        const data = await response.json();
        const codigoFormatado = codigo.replace("-", "");
        return {
            valor: parseFloat(data[codigoFormatado].bid).toFixed(2),
            variacao: data[codigoFormatado].pctChange
        };
    } catch (error) {
        console.error(`Erro ao buscar ${codigo}:`, error);
        return { valor: "Erro", variacao: "0" };
    }
}

// Busca cotação de ações (Yahoo Finance)
async function fetchAcao(codigo) {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${codigo}.SA?interval=1m`);
        const data = await response.json();
        return {
            valor: data.chart.result[0].meta.regularMarketPrice.toFixed(2),
            variacao: data.chart.result[0].meta.chartPreviousClose
        };
    } catch (error) {
        console.error(`Erro ao buscar ação ${codigo}:`, error);
        return { valor: "Erro", variacao: "0" };
    }
}

// Atualiza os dados na tela
function atualizarDados() {
    // Atualiza moedas
    config.moedas.forEach(async (moeda) => {
        const data = await fetchMoeda(moeda);
        const elementoValor = document.getElementById(`${moeda.toLowerCase()}-valor`);
        const elementoVariacao = document.getElementById(`${moeda.toLowerCase()}-variacao`);
        
        if (elementoValor) elementoValor.textContent = `R$ ${data.valor}`;
        if (elementoVariacao) {
            elementoVariacao.textContent = `${data.variacao}%`;
            elementoVariacao.style.color = data.variacao >= 0 ? "#2ecc71" : "#e74c3c";
        }
    });

    // Atualiza ações
    config.acoes.forEach(async (acao) => {
        const data = await fetchAcao(acao);
        const elementoValor = document.getElementById(`${acao.toLowerCase()}-valor`);
        const elementoVariacao = document.getElementById(`${acao.toLowerCase()}-variacao`);
        
        if (elementoValor) elementoValor.textContent = `R$ ${data.valor}`;
        if (elementoVariacao) {
            const variacaoPercentual = ((data.valor - data.variacao) / data.variacao * 100).toFixed(2);
            elementoVariacao.textContent = `${variacaoPercentual}%`;
            elementoVariacao.style.color = variacaoPercentual >= 0 ? "#2ecc71" : "#e74c3c";
        }
    });
}

// Inicia a atualização automática
document.addEventListener("DOMContentLoaded", () => {
    atualizarDados();  // Executa imediatamente
    setInterval(atualizarDados, config.interval);  // Atualiza a cada 30 segundos
});
