(function() {
  function el(id) {
    return document.getElementById(id);
  }

  // Retornos esperados e volatilidades
  const ATIVOS = {
    rendaFixa: { retorno: 0.08, volatilidade: 0.02 },
    acoes: { retorno: 0.12, volatilidade: 0.18 },
    etfs: { retorno: 0.11, volatilidade: 0.15 }
  };

  function atualizarTotal() {
    const rf = Number(el("rendaFixa").value) || 0;
    const ac = Number(el("acoes").value) || 0;
    const et = Number(el("etfs").value) || 0;
    const total = rf + ac + et;
    el("totalAlocacao").textContent = total;
  }

  function simularCarteira() {
    const rf = (Number(el("rendaFixa").value) || 0) / 100;
    const ac = (Number(el("acoes").value) || 0) / 100;
    const et = (Number(el("etfs").value) || 0) / 100;

    // Retorno esperado ponderado
    const retornoEsperado = 
      rf * ATIVOS.rendaFixa.retorno +
      ac * ATIVOS.acoes.retorno +
      et * ATIVOS.etfs.retorno;

    // Volatilidade ponderada (simplificada)
    const volatilidade = 
      rf * ATIVOS.rendaFixa.volatilidade +
      ac * ATIVOS.acoes.volatilidade +
      et * ATIVOS.etfs.volatilidade;

    // Índice Sharpe (assumindo taxa livre de risco de 4%)
    const taxaLivre = 0.04;
    const sharpeIndex = (retornoEsperado - taxaLivre) / Math.max(volatilidade, 0.01);

    // Classificação
    let classificacao = "Moderado";
    if (rf > 0.60) classificacao = "Conservador";
    else if (ac > 0.60) classificacao = "Agressivo";

    return {
      retornoEsperado,
      volatilidade,
      sharpeIndex,
      classificacao,
      rf, ac, et
    };
  }

  function renderChart(resultado) {
    const ctx = el("chartCarteira");
    if (!ctx) return;

    if (window.chartCarteira) {
      window.chartCarteira.destroy();
    }

    window.chartCarteira = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Renda Fixa', 'Ações', 'ETFs'],
        datasets: [{
          data: [
            resultado.rf * 100,
            resultado.ac * 100,
            resultado.et * 100
          ],
          backgroundColor: [
            '#7a6328',
            '#3ecf8e',
            '#c9a84c'
          ],
          borderColor: '#17171f',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#f0ede8' }
          }
        }
      }
    });
  }

  function atualizar(resultado) {
    el("retornoEsperado").textContent = (resultado.retornoEsperado * 100).toFixed(2) + "%";
    el("volatilidade").textContent = (resultado.volatilidade * 100).toFixed(2) + "%";
    el("sharpeIndex").textContent = resultado.sharpeIndex.toFixed(2);
    el("classificacao").textContent = resultado.classificacao;

    renderChart(resultado);
  }

  el("rendaFixa").addEventListener("input", atualizarTotal);
  el("acoes").addEventListener("input", atualizarTotal);
  el("etfs").addEventListener("input", atualizarTotal);

  el("btnSimular").addEventListener("click", function() {
    const resultado = simularCarteira();
    atualizar(resultado);
  });

  // Simular ao carregar
  window.addEventListener("load", function() {
    const resultado = simularCarteira();
    atualizar(resultado);
  });
})();
