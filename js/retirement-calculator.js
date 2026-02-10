(function () {
  const el = (id) => document.getElementById(id);

  // -------- Helpers: parsing/formatting BRL --------
  function parseBRL(str) {
    if (typeof str !== "string") str = String(str ?? "");
    str = str.trim();
    if (!str) return 0;
    // remove currency symbol and spaces
    str = str.replace(/[R$\s]/g, "");
    // handle thousands '.' and decimal ','
    str = str.replace(/\./g, "").replace(",", ".");
    const n = Number(str);
    return Number.isFinite(n) ? n : 0;
  }

  function formatBRL(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // Convert annual rate to monthly effective rate
  function annualToMonthly(r) {
    return Math.pow(1 + r, 1 / 12) - 1;
  }

  // Real rate from nominal and inflation (Fisher exact)
  function realRate(nominal, inflation) {
    return (1 + nominal) / (1 + inflation) - 1;
  }

  function nowBR() {
    return new Date().toLocaleString("pt-BR");
  }

  // -------- Core simulation (monthly) in REAL terms (today's money) --------
  function simulate({
    ageNow,
    ageRetire,
    pv,
    pmt,
    pmtGrowAnnual,
    nominalReturnAnnual,
    inflationAnnual,
    feeDragAnnual,
    startDelayMonths,
    swrAnnual,
    desiredMonthlyIncome
  }) {
    // time
    const years = ageRetire - ageNow;
    const monthsTotal = Math.round(years * 12);
    const months = Math.max(0, monthsTotal);

    // rates (real)
    const nominalNet = nominalReturnAnnual - feeDragAnnual;
    const rRealAnnual = realRate(nominalNet, inflationAnnual);
    const rM = annualToMonthly(rRealAnnual);

    // target wealth (real)
    const desiredAnnualIncome = desiredMonthlyIncome * 12;
    const targetWealth = desiredAnnualIncome / Math.max(0.0001, swrAnnual);

    // simulate
    let balance = pv;
    let month = 0;
    let currentPmt = pmt;
    let contributionThisYear = 0;

    const yearlyRows = [];
    let yearIndex = 0;

    for (month = 1; month <= months; month++) {
      // contributions start after delay
      let contrib = 0;
      if (month > startDelayMonths) {
        contrib = currentPmt;
      }

      // apply monthly growth
      balance = balance * (1 + rM) + contrib;

      // record contribution totals for annual summary
      contributionThisYear += contrib;

      // annual step
      if (month % 12 === 0 || month === months) {
        const age = ageNow + month / 12;
        yearlyRows.push({
          year: ++yearIndex,
          age: Math.round(age * 10) / 10,
          balance: balance,
          contribYear: contributionThisYear
        });
        contributionThisYear = 0;

        // grow monthly contribution once a year (after completing a year)
        currentPmt = currentPmt * (1 + pmtGrowAnnual);
      }
    }

    return {
      months,
      rRealAnnual,
      targetWealth,
      wealthAtRetire: balance,
      yearlyRows
    };
  }

  // Binary search required monthly contribution to hit target by retirement
  function requiredMonthlyContribution(params) {
    const maxIter = 60;
    let lo = 0;
    let hi = 1;

    // Expand hi until it reaches target
    for (let i = 0; i < 30; i++) {
      const sim = simulate({ ...params, pmt: hi });
      if (sim.wealthAtRetire >= sim.targetWealth) break;
      hi *= 2;
      if (hi > 1e9) break;
    }

    // If even huge hi doesn't reach target, return null
    const simHi = simulate({ ...params, pmt: hi });
    if (simHi.wealthAtRetire < simHi.targetWealth) return null;

    for (let i = 0; i < maxIter; i++) {
      const mid = (lo + hi) / 2;
      const sim = simulate({ ...params, pmt: mid });
      if (sim.wealthAtRetire >= sim.targetWealth) hi = mid;
      else lo = mid;
    }
    return hi;
  }

  // If user keeps current contribution, estimate month when target is reached (if ever)
  function timeToTarget(params, maxYears = 70) {
    const monthsMax = maxYears * 12;
    const nominalNet = params.nominalReturnAnnual - params.feeDragAnnual;
    const rRealAnnual = realRate(nominalNet, params.inflationAnnual);
    const rM = annualToMonthly(rRealAnnual);
    const target = (params.desiredMonthlyIncome * 12) / Math.max(0.0001, params.swrAnnual);

    let balance = params.pv;
    let pmt = params.pmt;
    let month = 0;

    for (month = 1; month <= monthsMax; month++) {
      const contrib = month > params.startDelayMonths ? pmt : 0;
      balance = balance * (1 + rM) + contrib;
      if (balance >= target) return month;

      // annually grow pmt
      if (month % 12 === 0) {
        pmt *= (1 + params.pmtGrowAnnual);
      }
    }
    return null;
  }

  // -------- UI wiring --------
  function readParams() {
    const ageNow = clamp(Number(el("ageNow").value || 0), 0, 120);
    const ageRetire = clamp(Number(el("ageRetire").value || 0), 0, 120);

    const pv = Math.max(0, parseBRL(el("pv").value));
    const pmt = Math.max(0, parseBRL(el("pmt").value));
    const income = Math.max(0, parseBRL(el("income").value));

    const pmtGrowAnnual = Number(el("pmtGrow").value || 0) / 100;
    const nominalReturnAnnual = Number(el("nominalReturn").value || 0) / 100;
    const inflationAnnual = Number(el("inflation").value || 0) / 100;
    const swrAnnual = Number(el("swr").value || 0) / 100;
    const feeDragAnnual = Number(el("feeDrag").value || 0) / 100;

    const startDelayMonths = Number(el("startMonth").value || 0);

    return {
      ageNow,
      ageRetire,
      pv,
      pmt,
      pmtGrowAnnual,
      nominalReturnAnnual,
      inflationAnnual,
      swrAnnual,
      feeDragAnnual,
      startDelayMonths,
      desiredMonthlyIncome: income
    };
  }

  function renderTable(rows) {
    const tbody = el("projTable").querySelector("tbody");
    if (!rows?.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="color:rgba(233,236,241,.7)">Sem dados.</td></tr>`;
      return;
    }

    // show up to 40 years to keep readable, but include last
    const max = 40;
    let view = rows;
    if (rows.length > max) {
      view = [...rows.slice(0, 20), { divider: true }, ...rows.slice(-19)];
    }

    const html = view.map((r) => {
      if (r.divider) {
        return `<tr><td colspan="4" style="color:rgba(233,236,241,.55)">…</td></tr>`;
      }
      return `
        <tr>
          <td>${r.year}</td>
          <td>${r.age}</td>
          <td>${formatBRL(r.balance)}</td>
          <td>${formatBRL(r.contribYear)}</td>
        </tr>
      `;
    }).join("");

    tbody.innerHTML = html;
  }

  function run() {
    const params = readParams();

    // sanity checks
    if (params.ageRetire <= params.ageNow) {
      el("statusBadge").textContent = "Ajuste as idades";
      el("statusBadge").style.borderColor = "rgba(255,125,125,.55)";
      el("statusBadge").style.color = "#ffb0b0";
      el("status").textContent = "Idade inválida";
      el("status").className = "v bad";
      el("statusNote").textContent = "A idade de aposentadoria precisa ser maior que a idade atual.";
      return;
    }

    const sim = simulate(params);

    el("lastRun").textContent = `Simulado em ${nowBR()}`;

    // headline numbers
    el("targetWealth").textContent = formatBRL(sim.targetWealth);
    el("wealthAtRetire").textContent = formatBRL(sim.wealthAtRetire);

    const ok = sim.wealthAtRetire >= sim.targetWealth;
    el("status").textContent = ok ? "Meta atingida" : "Meta não atingida";
    el("status").className = "v " + (ok ? "good" : "bad");

    const yearsToRetire = sim.months / 12;
    const rRealPct = sim.rRealAnnual * 100;

    el("metaInfo").innerHTML = `
      <div class="pill">⏳ Prazo: <b>${yearsToRetire.toFixed(1)} anos</b></div>
      <div class="pill">📉 Rentabilidade real: <b>${rRealPct.toFixed(2)}% a.a.</b> (já descontando inflação e taxas)</div>
      <div class="pill">🎯 SWR: <b>${(params.swrAnnual*100).toFixed(1)}% a.a.</b></div>
    `;

    el("wealthAtRetireNote").textContent = ok
      ? "Você alcança o patrimônio alvo no prazo definido."
      : "No prazo definido, você ficaria abaixo do patrimônio alvo.";

    // required monthly contribution
    const req = requiredMonthlyContribution(params);
    el("neededPmt").textContent = req === null ? "Impossível com estes parâmetros" : formatBRL(req);

    if (!ok) {
      const t = timeToTarget(params);
      if (t === null) {
        el("statusNote").textContent =
          "Mantendo o aporte atual, você não atinge o alvo dentro de um horizonte muito longo. Ajuste aporte, prazo ou rentabilidade.";
      } else {
        const years = t / 12;
        const ageAt = params.ageNow + years;
        el("statusNote").textContent =
          `Mantendo o aporte atual, você atingiria o alvo em ~${years.toFixed(1)} anos (idade ~${ageAt.toFixed(1)}).`;
      }
    } else {
      const margin = sim.wealthAtRetire - sim.targetWealth;
      el("statusNote").textContent =
        `Folga estimada: ${formatBRL(margin)} acima do alvo (em valores de hoje).`;
    }

    // table
    renderTable(sim.yearlyRows);

    // badge
    el("statusBadge").textContent = ok ? "✅ Resultado positivo" : "⚠️ Ajustes recomendados";
    el("statusBadge").style.borderColor = ok ? "rgba(112,240,167,.35)" : "rgba(244,196,48,.35)";
    el("statusBadge").style.color = ok ? "rgba(190,255,220,.95)" : "rgba(255,240,200,.95)";
  }

  function reset() {
    el("ageNow").value = 33;
    el("ageRetire").value = 60;
    el("pv").value = "0";
    el("pmt").value = "1000";
    el("pmtGrow").value = "0";
    el("nominalReturn").value = "10";
    el("inflation").value = "4";
    el("swr").value = "4";
    el("income").value = "5000";
    el("startMonth").value = "0";
    el("feeDrag").value = "0.5";

    el("statusBadge").textContent = "Pronto para simular";
    el("statusBadge").style.borderColor = "rgba(255,255,255,.08)";
    el("statusBadge").style.color = "rgba(168,176,191,1)";

    el("lastRun").textContent = "Ainda não simulado";
    el("targetWealth").textContent = "—";
    el("wealthAtRetire").textContent = "—";
    el("status").textContent = "—";
    el("neededPmt").textContent = "—";
    el("wealthAtRetireNote").textContent = "—";
    el("statusNote").textContent = "—";
    el("metaInfo").textContent = "";
    renderTable(null);
  }

  // format money inputs on blur
  function attachMoneyMask(id) {
    const input = el(id);
    input.addEventListener("blur", () => {
      const n = parseBRL(input.value);
      input.value = n ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0";
    });
  }

  function init() {
    ["pv", "pmt", "income"].forEach(attachMoneyMask);

    el("btnCalc").addEventListener("click", run);
    el("btnReset").addEventListener("click", reset);

    // initial clean
    reset();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
