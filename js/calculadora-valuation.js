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

  function calcularValuation() {
    const lucroLiquido = Math.max(0, parseBRL(el("lucroLiquido").value));
    const numeroAcoes = Math.max(0.1, parseBRL(el("numeroAcoes").value));
    const crescimento = Math.max(0, Number(el("crescimentoEsperado").value) || 0) / 100;
    const taxaDesconto = Math.max(0.01, Number(el("taxaDesconto").value) || 10) / 100;
    const precoAtual = Math.max(0, parseBRL(el("precoAtual").value));

    // LPA
    const lpa = lucroLiquido / numeroAcoes;

    // Preço Justo (Gordon Growth Model)
    let precoJusto = 0;
    if (taxaDesconto > crescimento) {
      precoJusto = (lpa * (1 + crescimento)) / (taxaDesconto - crescimento);
    }

    // Margem de Segurança
    let margemSeguranca = 0;
    if (precoJusto > 0) {
      margemSeguranca = ((precoJusto - precoAtual) / precoJusto) * 100;
    }

    // P/L
    const pl = precoAtual > 0 ? precoAtual / lpa : 0;

    return {
      lpa,
      precoJusto,
      margemSeguranca,
      pl,
      precoAtual
    };
  }

  function atualizar(resultado) {
    el("lpa").textContent = formatBRL(resultado.lpa);
    el("precoJustoGordon").textContent = formatBRL(resultado.precoJusto);
    el("pl").textContent = resultado.pl.toFixed(2) + "x";
    
    const margemTexto = resultado.margemSeguranca > 0 
      ? `${resultado.margemSeguranca.toFixed(1)}% (Barata)`
      : `${Math.abs(resultado.margemSeguranca).toFixed(1)}% (Cara)`;
    el("margemSeguranca").textContent = margemTexto;

    const recomendacao = resultado.margemSeguranca > 25 ? "Compra recomendada" 
                        : resultado.margemSeguranca > 0 ? "Considerar compra"
                        : "Evitar compra";

    el("metaInfo").innerHTML = `
      <span class="tag">Preço Atual: <b>${formatBRL(resultado.precoAtual)}</b></span>
      <span class="tag">Preço Justo: <b>${formatBRL(resultado.precoJusto)}</b></span>
      <span class="tag">Recomendação: <b>${recomendacao}</b></span>
    `;
  }

  el("btnCalcular").addEventListener("click", function() {
    const resultado = calcularValuation();
    atualizar(resultado);
  });

  ["lucroLiquido", "numeroAcoes", "precoAtual"].forEach(id => {
    el(id).addEventListener("blur", function() {
      const n = parseBRL(this.value);
      this.value = (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
  });

  // Calcular ao carregar
  window.addEventListener("load", function() {
    const resultado = calcularValuation();
    atualizar(resultado);
  });
})();
