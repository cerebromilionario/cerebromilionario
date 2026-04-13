(function() {
  // ========== HELPERS ==========
  function parseBRL(str) {
    if (typeof str !== "string") str = String(str ?? "");
    str = str.trim().replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
    const n = Number(str);
    return Number.isFinite(n) ? n : 0;
  }

  function formatBRL(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function el(id) {
    return document.getElementById(id);
  }

  // ========== SIMULATION ==========
  function simularDividendos(config) {
    const {
      investimentoInicial,
      aporteMensal,
      dividendYield,
      crescimentoDividendo,
      periodoSimulacao,
      inflacao
    } = config;

    const meses = periodoSimulacao * 12;
    const yieldMensal = dividendYield / 100 / 12;
    const crescimentoMensal = Math.pow(1 + crescimentoDividendo / 100, 1/12) - 1;
    const inflacaoMensal = Math.pow(1 + inflacao / 100, 1/12) - 1;

    let patrimonio = investimentoInicial;
    let dividendoMensal = investimentoInicial * yieldMensal;
    let totalDividendos = 0;
    const dados = [];

    for (let mes = 1; mes <= meses; mes++) {
      // Adiciona aporte
      patrimonio += aporteMensal;
      
      // Calcula dividendos do mês
      const dividendoAtual = patrimonio * yieldMensal;
      totalDividendos += dividendoAtual;
      
      // Reinveste dividendos
      patrimonio += dividendoAtual;
      
      // Aumenta dividend yield
      dividendoMensal *= (1 + crescimentoMensal);

      // Armazena dados para gráfico (a cada 3 meses)
      if (mes % 3 === 0 || mes === meses) {
        const patrimonioReal = patrimonio / Math.pow(1 + inflacao / 100, mes / 12);
        dados.push({
          mes: mes,
          patrimonio: patrimonioReal,
          dividendoMensal: dividendoMensal / Math.pow(1 + inflacao / 100, mes / 12)
        });
      }
    }

    const patrimonioReal = patrimonio / Math.pow(1 + inflacao / 100, periodoSimulacao);
    const rendaMensalFinal = (patrimonio * yieldMensal) / Math.pow(1 + inflacao / 100, periodoSimulacao);
    const rendaAnualFinal = rendaMensalFinal * 12;
    const totalDividendosReal = totalDividendos / Math.pow(1 + inflacao / 100, periodoSimulacao);

    return {
      patrimonioTotal: patrimonioReal,
      rendaMensal: rendaMensalFinal,
      rendaAnual: rendaAnualFinal,
      totalDividendos: totalDividendosReal,
      dados: dados
    };
  }

  // ========== RENDERING ==========
  function renderChart(dados) {
    const ctx = el("chartDividendos");
    if (!ctx) return;

    if (window.chartInstance) {
      window.chartInstance.destroy();
    }

    const labels = dados.map(d => `Mês ${d.mes}`);
    const patrimonios = dados.map(d => d.patrimonio);
    const dividendos = dados.map(d => d.dividendoMensal * 12);

    window.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Patrimônio Total (R$)',
            data: patrimonios,
            borderColor: '#c9a84c',
            backgroundColor: 'rgba(201, 168, 76, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Renda Anual de Dividendos (R$)',
            data: dividendos,
            borderColor: '#3ecf8e',
            backgroundColor: 'rgba(62, 207, 142, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#f0ede8',
              font: { family: "'DM Sans', sans-serif" }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#9996a0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#9996a0' },
            grid: { drawOnChartArea: false }
          },
          x: {
            ticks: { color: '#9996a0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }

  function atualizar(resultado) {
    el("patrimonioTotal").textContent = formatBRL(resultado.patrimonioTotal);
    el("rendaMensal").textContent = formatBRL(resultado.rendaMensal);
    el("rendaAnual").textContent = formatBRL(resultado.rendaAnual);
    el("totalDividendos").textContent = formatBRL(resultado.totalDividendos);

    el("metaInfo").innerHTML = `
      <span class="tag">Patrimônio Final: <b>${formatBRL(resultado.patrimonioTotal)}</b></span>
      <span class="tag">Renda Mensal: <b>${formatBRL(resultado.rendaMensal)}</b></span>
      <span class="tag">Renda Anual: <b>${formatBRL(resultado.rendaAnual)}</b></span>
    `;

    renderChart(resultado.dados);
  }

  // ========== EVENT LISTENERS ==========
  el("btnSimular").addEventListener("click", function() {
    const config = {
      investimentoInicial: Math.max(0, parseBRL(el("investimentoInicial").value)),
      aporteMensal: Math.max(0, parseBRL(el("aporteMensal").value)),
      dividendYield: Math.max(0, Number(el("dividendYield").value) || 0),
      crescimentoDividendo: Math.max(0, Number(el("crescimentoDividendo").value) || 0),
      periodoSimulacao: Math.max(1, Number(el("periodoSimulacao").value) || 1),
      inflacao: Math.max(0, Number(el("inflacao").value) || 0)
    };

    const resultado = simularDividendos(config);
    atualizar(resultado);
  });

  // Format currency inputs on blur
  ["investimentoInicial", "aporteMensal"].forEach(id => {
    el(id).addEventListener("blur", function() {
      const n = parseBRL(this.value);
      this.value = (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
  });
})();
