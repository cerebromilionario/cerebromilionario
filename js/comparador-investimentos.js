(function() {
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

  function simularCenario(capital, aporte, retorno, periodo) {
    const meses = periodo * 12;
    const retornoMensal = Math.pow(1 + retorno / 100, 1/12) - 1;

    let saldo = capital;
    const dados = [];

    for (let mes = 1; mes <= meses; mes++) {
      saldo = saldo * (1 + retornoMensal) + aporte;
      if (mes % 12 === 0 || mes === meses) {
        dados.push({ mes, saldo });
      }
    }

    const totalInvestido = capital + (aporte * meses);
    const ganho = saldo - totalInvestido;
    const rentabilidade = (ganho / totalInvestido) * 100;

    return {
      valorFinal: saldo,
      totalInvestido,
      ganho,
      rentabilidade,
      dados
    };
  }

  function comparar() {
    const nome1 = el("nome1").value || "Cenário 1";
    const capital1 = Math.max(0, parseBRL(el("capital1").value));
    const aporte1 = Math.max(0, parseBRL(el("aporte1").value));
    const retorno1 = Math.max(0, Number(el("retorno1").value) || 0);
    const periodo1 = Math.max(1, Number(el("periodo1").value) || 1);

    const nome2 = el("nome2").value || "Cenário 2";
    const capital2 = Math.max(0, parseBRL(el("capital2").value));
    const aporte2 = Math.max(0, parseBRL(el("aporte2").value));
    const retorno2 = Math.max(0, Number(el("retorno2").value) || 0);
    const periodo2 = Math.max(1, Number(el("periodo2").value) || 1);

    const resultado1 = simularCenario(capital1, aporte1, retorno1, periodo1);
    const resultado2 = simularCenario(capital2, aporte2, retorno2, periodo2);

    // Atualizar títulos
    el("titulo1").textContent = nome1;
    el("titulo2").textContent = nome2;

    // Atualizar Cenário 1
    el("valor1").textContent = formatBRL(resultado1.valorFinal);
    el("investido1").textContent = formatBRL(resultado1.totalInvestido);
    el("ganho1").textContent = formatBRL(resultado1.ganho);
    el("rentabilidade1").textContent = resultado1.rentabilidade.toFixed(1) + "%";

    // Atualizar Cenário 2
    el("valor2").textContent = formatBRL(resultado2.valorFinal);
    el("investido2").textContent = formatBRL(resultado2.totalInvestido);
    el("ganho2").textContent = formatBRL(resultado2.ganho);
    el("rentabilidade2").textContent = resultado2.rentabilidade.toFixed(1) + "%";

    // Diferença
    const diferenca = resultado2.valorFinal - resultado1.valorFinal;
    const percentualDif = (diferenca / resultado1.valorFinal) * 100;
    const melhor = diferenca > 0 ? nome2 : nome1;

    el("diferenca").textContent = `${formatBRL(Math.abs(diferenca))} a favor de ${melhor}`;
    el("percentualDif").textContent = `${Math.abs(percentualDif).toFixed(1)}%`;

    // Gráfico
    renderChart(resultado1, resultado2, nome1, nome2);
  }

  function renderChart(res1, res2, nome1, nome2) {
    const ctx = el("chartComparacao");
    if (!ctx) return;

    if (window.chartComparacao) {
      window.chartComparacao.destroy();
    }

    const maxMeses = Math.max(res1.dados.length, res2.dados.length);
    const labels = [];
    const dados1 = [];
    const dados2 = [];

    for (let i = 0; i < maxMeses; i++) {
      if (res1.dados[i]) {
        labels.push(`Ano ${Math.ceil(res1.dados[i].mes / 12)}`);
        dados1.push(res1.dados[i].saldo);
      }
      if (res2.dados[i]) {
        dados2.push(res2.dados[i].saldo);
      }
    }

    window.chartComparacao = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: nome1,
            data: dados1,
            borderColor: '#7a6328',
            backgroundColor: 'rgba(122, 99, 40, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: nome2,
            data: dados2,
            borderColor: '#3ecf8e',
            backgroundColor: 'rgba(62, 207, 142, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: '#f0ede8' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#9996a0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#9996a0' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }

  el("btnComparar").addEventListener("click", comparar);

  ["capital1", "aporte1", "capital2", "aporte2"].forEach(id => {
    el(id).addEventListener("blur", function() {
      const n = parseBRL(this.value);
      this.value = (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
  });
})();
