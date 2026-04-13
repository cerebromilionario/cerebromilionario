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

  function calcularIRBolsa() {
    const tipoOperacao = el("tipoOperacao").value;
    const lucroOperacao = Math.max(0, parseBRL(el("lucroOperacao").value));
    const prejuzoAcumulado = Math.max(0, parseBRL(el("prejuzoAcumulado").value));
    const mes = Number(el("mesOperacao").value);

    let aliquota = 0;
    let codigoDARF = "";
    let lucroTributavel = lucroOperacao - prejuzoAcumulado;

    if (tipoOperacao === "dayTrade") {
      aliquota = 0.20; // 20% para day trade
      codigoDARF = "6015";
    } else {
      // Operação normal
      if (lucroTributavel <= 0) {
        aliquota = 0;
        codigoDARF = "Sem IR";
      } else if (lucroTributavel < 20000) {
        aliquota = 0; // Isento se menor que R$ 20 mil
        codigoDARF = "Isento (< R$ 20 mil)";
      } else {
        aliquota = 0.15; // 15% para operações normais
        codigoDARF = "6015";
      }
    }

    lucroTributavel = Math.max(0, lucroTributavel);
    const irDevido = lucroTributavel * aliquota;

    return {
      lucroTributavel,
      aliquota: aliquota * 100,
      irDevido,
      codigoDARF,
      tipoOperacao,
      mes
    };
  }

  function atualizar(resultado) {
    el("lucroTributavel").textContent = formatBRL(resultado.lucroTributavel);
    el("aliquota").textContent = resultado.aliquota.toFixed(1) + "%";
    el("irDevido").textContent = formatBRL(resultado.irDevido);
    el("codigoDARF").textContent = resultado.codigoDARF;

    const mesNome = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ][resultado.mes - 1];

    const ultimoDiaUtil = new Date(2026, resultado.mes, 0);
    const dataVencimento = ultimoDiaUtil.toLocaleDateString("pt-BR");

    el("metaInfo").innerHTML = `
      <span class="tag">Tipo: <b>${resultado.tipoOperacao === "dayTrade" ? "Day Trade" : "Swing Trade"}</b></span>
      <span class="tag">Mês: <b>${mesNome}</b></span>
      <span class="tag">Vencimento: <b>${dataVencimento}</b></span>
    `;
  }

  el("btnCalcular").addEventListener("click", function() {
    const resultado = calcularIRBolsa();
    atualizar(resultado);
  });

  ["lucroOperacao", "prejuzoAcumulado"].forEach(id => {
    el(id).addEventListener("blur", function() {
      const n = parseBRL(this.value);
      this.value = (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
  });
})();
