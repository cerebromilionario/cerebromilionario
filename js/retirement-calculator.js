(function () {
  const el = (id) => document.getElementById(id);

  // ---------- Helpers BRL ----------
  function parseBRL(str) {
    if (typeof str !== "string") str = String(str ?? "");
    str = str.trim();
    if (!str) return 0;
    str = str.replace(/[R$\s]/g, "");
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

  function annualToMonthly(r) {
    return Math.pow(1 + r, 1 / 12) - 1;
  }

  function realRate(nominal, inflation) {
    return (1 + nominal) / (1 + inflation) - 1;
  }

  function nowBR() {
    return new Date().toLocaleString("pt-BR");
  }

  // ---------- Core simulation (REAL terms) ----------
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
    const years = ageRetire - ageNow;
    const monthsTotal = Math.round(years * 12);
    const months = Math.max(0, monthsTotal);

    const nominalNet = nominalReturnAnnual - feeDragAnnual;
    const rRealAnnual = realRate(nominalNet, inflationAnnual);
    const rM = annualToMonthly(rRealAnnual);

    const desiredAnnualIncome = desiredMonthlyIncome * 12;
    const targetWealth = desiredAnnualIncome / Math.max(0.0001, swrAnnual);

    let balance = pv;
    let currentPmt = pmt;
    let contributionThisYear = 0;

    const yearlyRows = [];
    const monthlyBalances = []; // for chart: end-of-year points, plus last
    let yearIndex = 0;

    for (let month = 1; month <= months; month++) {
      const contrib = month > startDelayMonths ? currentPmt : 0;
      balance = balance * (1 + rM) + contrib;
      contributionThisYear += contrib;

      // record for chart each month? (heavy). We'll record each quarter + last.
      if (month % 3 === 0 || month === months) {
        monthlyBalances.push({ month, balance });
      }

      if (month % 12 === 0 || month === months) {
        const age = ageNow + month / 12;
        yearlyRows.push({
          year: ++yearIndex,
          age: Math.round(age * 10) / 10,
          balance,
          contribYear: contributionThisYear
        });
        contributionThisYear = 0;
        currentPmt = currentPmt * (1 + pmtGrowAnnual);
      }
    }

    return { months, rRealAnnual, targetWealth, wealthAtRetire: balance, yearlyRows, monthlyBalances };
  }

  function requiredMonthlyContribution(params) {
    const maxIter = 60;
    let lo = 0;
    let hi = 1;

    for (let i = 0; i < 30; i++) {
      const sim = simulate({ ...params, pmt: hi });
      if (sim.wealthAtRetire >= sim.targetWealth) break;
      hi *= 2;
      if (hi > 1e9) break;
    }

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

  function timeToTarget(params, maxYears = 70) {
    const monthsMax = maxYears * 12;
    const nominalNet = params.nominalReturnAnnual - params.feeDragAnnual;
    const rRealAnnual = realRate(nominalNet, params.inflationAnnual);
    const rM = annualToMonthly(rRealAnnual);
    const target = (params.desiredMonthlyIncome * 12) / Math.max(0.0001, params.swrAnnual);

    let balance = params.pv;
    let pmt = params.pmt;

    for (let month = 1; month <= monthsMax; month++) {
      const contrib = month > params.startDelayMonths ? pmt : 0;
      balance = balance * (1 + rM) + contrib;
      if (balance >= target) return month;
      if (month % 12 === 0) pmt *= (1 + params.pmtGrowAnnual);
    }
    return null;
  }

  // ---------- Premium scenarios ----------
  function scenarioPresets(user) {
    // You can tweak these presets later. They are NOMINAL rates.
    return {
      cons: { label: "Conservador", nominalReturnAnnual: 8 / 100, inflationAnnual: 4.5 / 100 },
      base: { label: "Moderado",   nominalReturnAnnual: 10 / 100, inflationAnnual: 4 / 100 },
      aggr: { label: "Agressivo",  nominalReturnAnnual: 12 / 100, inflationAnnual: 4 / 100 },
      custom: { label: "Personalizado", nominalReturnAnnual: user.nominalReturnAnnual, inflationAnnual: user.inflationAnnual }
    };
  }

  function paramsFromUI() {
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
      ageNow, ageRetire, pv, pmt, pmtGrowAnnual,
      nominalReturnAnnual, inflationAnnual, swrAnnual,
      feeDragAnnual, startDelayMonths, desiredMonthlyIncome: income
    };
  }

  function renderTable(rows) {
    const tbody = el("projTable").querySelector("tbody");
    if (!rows?.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="small-muted">Simule para ver a projeção…</td></tr>`;
      return;
    }
    const max = 40;
    let view = rows;
    if (rows.length > max) view = [...rows.slice(0, 20), { divider: true }, ...rows.slice(-19)];
    tbody.innerHTML = view.map((r) => {
      if (r.divider) return `<tr><td colspan="4" class="small-muted">…</td></tr>`;
      return `
        <tr>
          <td>${r.year}</td>
          <td>${r.age}</td>
          <td>${formatBRL(r.balance)}</td>
          <td>${formatBRL(r.contribYear)}</td>
        </tr>`;
    }).join("");
  }

  // ---------- SVG chart ----------
  function drawChart(seriesMap, months, targetWealth, activeKey) {
    const svg = el("retChart");
    if (!svg) return;

    const W = 900, H = 320;
    const padL = 48, padR = 12, padT = 12, padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Gather maxY from all series and target
    let maxY = targetWealth || 0;
    Object.values(seriesMap).forEach(s => {
      s.points.forEach(p => { if (p.y > maxY) maxY = p.y; });
    });
    if (maxY <= 0) maxY = 1;

    // Add headroom
    maxY *= 1.12;

    const xScale = (m) => padL + (m / Math.max(1, months)) * plotW;
    const yScale = (v) => padT + (1 - (v / maxY)) * plotH;

    // Clear svg
    svg.innerHTML = "";

    // Grid lines
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (i / gridLines) * plotH;
      svg.insertAdjacentHTML("beforeend", `<line class="ret-grid" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"></line>`);
    }

    // Axes
    svg.insertAdjacentHTML("beforeend", `<line class="ret-axis" x1="${padL}" x2="${W - padR}" y1="${H - padB}" y2="${H - padB}"></line>`);
    svg.insertAdjacentHTML("beforeend", `<line class="ret-axis" x1="${padL}" x2="${padL}" y1="${padT}" y2="${H - padB}"></line>`);

    // Target line
    if (targetWealth > 0) {
      const yT = yScale(targetWealth);
      svg.insertAdjacentHTML("beforeend", `<line class="ret-axis" x1="${padL}" x2="${W - padR}" y1="${yT}" y2="${yT}" style="stroke-dasharray:6 5; stroke: rgba(244,196,48,.55)"></line>`);
      svg.insertAdjacentHTML("beforeend", `<text class="ret-label" x="${padL + 6}" y="${Math.max(padT + 12, yT - 6)}">Alvo</text>`);
    }

    // Labels (Y max)
    const fmtShort = (n) => {
      if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",") + " mi";
      if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
      return String(Math.round(n));
    };
    svg.insertAdjacentHTML("beforeend", `<text class="ret-label" x="8" y="${padT + 12}">${fmtShort(maxY)}</text>`);
    svg.insertAdjacentHTML("beforeend", `<text class="ret-label" x="8" y="${H - padB}">0</text>`);

    // Draw series
    const order = ["cons", "base", "aggr"];
    order.forEach((key) => {
      const s = seriesMap[key];
      if (!s) return;

      // If activeKey is custom, show only custom + base faint? We'll show all three always, but highlight active among presets.
      const isActive = key === activeKey;
      const opacity = (activeKey === "custom") ? 0.55 : (isActive ? 1 : 0.35);

      const pts = s.points.map(p => `${xScale(p.x).toFixed(1)},${yScale(p.y).toFixed(1)}`).join(" ");
      svg.insertAdjacentHTML("beforeend", `<polyline class="ret-line ${key}" points="${pts}" style="opacity:${opacity}"></polyline>`);

      // endpoint dot
      const last = s.points[s.points.length - 1];
      if (last) {
        svg.insertAdjacentHTML("beforeend", `<circle class="ret-dot" cx="${xScale(last.x)}" cy="${yScale(last.y)}" r="3.8" fill="${key==='base'?'#f4c430':(key==='cons'?'#2c2c2e':'#0f9d58')}" style="opacity:${opacity}"></circle>`);
      }
    });

    // Custom series line (if exists)
    if (seriesMap.custom) {
      const s = seriesMap.custom;
      const pts = s.points.map(p => `${xScale(p.x).toFixed(1)},${yScale(p.y).toFixed(1)}`).join(" ");
      const opacity = activeKey === "custom" ? 1 : 0.25;
      svg.insertAdjacentHTML("beforeend", `<polyline class="ret-line base" points="${pts}" style="stroke:#111; opacity:${opacity}; stroke-width:2.2"></polyline>`);
    }

    // X labels: start and end
    svg.insertAdjacentHTML("beforeend", `<text class="ret-label" x="${padL}" y="${H - 12}">Hoje</text>`);
    svg.insertAdjacentHTML("beforeend", `<text class="ret-label" x="${W - padR - 44}" y="${H - 12}">Apos.</text>`);
  }

  function renderScenarioCards(results, activeKey) {
    const grid = el("scenarioGrid");
    if (!grid) return;

    const makeCard = (key, r) => {
      const ok = r.wealthAtRetire >= r.targetWealth;
      const realPct = (r.rRealAnnual * 100).toFixed(2);
      const cls = ok ? "good" : "bad";
      const tag = ok ? "Meta OK" : "Abaixo da meta";
      const active = key === activeKey ? 'style="outline:2px solid rgba(244,196,48,.55)"' : "";
      return `
        <div class="scn-card" ${active}>
          <div class="scn-title">
            <div class="scn-pill">${r.label}</div>
            <div class="small-muted">${tag}</div>
          </div>
          <div class="scn-kpi">${formatBRL(r.wealthAtRetire)}</div>
          <div class="scn-sub">Patrimônio na aposentadoria (R$ de hoje)</div>
          <div class="scn-sub">Rentabilidade real estimada: <b>${realPct}% a.a.</b></div>
          <div class="scn-sub">Alvo: <b>${formatBRL(r.targetWealth)}</b></div>
        </div>
      `;
    };

    const order = ["cons", "base", "aggr"];
    grid.innerHTML = order.map((k) => makeCard(k, results[k])).join("");
  }

  function updateLegend(activeKey) {
    const legend = el("chartLegend");
    if (!legend) return;
    if (activeKey === "custom") {
      legend.textContent = "Destaque: Personalizado (linha preta) • Cenários: Conservador/Grafite, Moderado/Dourado, Agressivo/Verde";
    } else {
      const map = { cons: "Conservador", base: "Moderado", aggr: "Agressivo" };
      legend.textContent = `Destaque: ${map[activeKey]} • Comparação com os outros cenários`;
    }
  }

  // ---------- Main run ----------
  let activeScenario = "base";

  function run() {
    const user = paramsFromUI();

    // sanity checks
    if (user.ageRetire <= user.ageNow) {
      el("statusBadge").textContent = "Ajuste as idades";
      el("status").textContent = "Idade inválida";
      el("statusNote").textContent = "A idade de aposentadoria precisa ser maior que a idade atual.";
      return;
    }

    const presets = scenarioPresets(user);

    // build scenario results
    const results = {};
    const seriesMap = {};

    ["cons", "base", "aggr"].forEach((k) => {
      const p = { ...user, nominalReturnAnnual: presets[k].nominalReturnAnnual, inflationAnnual: presets[k].inflationAnnual };
      const sim = simulate(p);
      results[k] = { ...sim, label: presets[k].label };
      // chart points from monthlyBalances
      seriesMap[k] = { points: sim.monthlyBalances.map(d => ({ x: d.month, y: d.balance })) };
    });

    // custom series (optional) for chart when selected
    if (activeScenario === "custom") {
      const simC = simulate({ ...user, nominalReturnAnnual: presets.custom.nominalReturnAnnual, inflationAnnual: presets.custom.inflationAnnual });
      seriesMap.custom = { points: simC.monthlyBalances.map(d => ({ x: d.month, y: d.balance })) };
    } else {
      seriesMap.custom = null;
    }

    // Primary output uses ACTIVE scenario
    const activeParams =
      activeScenario === "custom"
        ? user
        : { ...user, nominalReturnAnnual: presets[activeScenario].nominalReturnAnnual, inflationAnnual: presets[activeScenario].inflationAnnual };

    const sim = simulate(activeParams);

    el("lastRun").textContent = `Simulado em ${nowBR()}`;
    el("targetWealth").textContent = formatBRL(sim.targetWealth);
    el("wealthAtRetire").textContent = formatBRL(sim.wealthAtRetire);

    const ok = sim.wealthAtRetire >= sim.targetWealth;
    el("status").textContent = ok ? "Meta atingida" : "Meta não atingida";
    el("status").className = ok ? "metric good" : "metric bad";

    const yearsToRetire = sim.months / 12;
    const rRealPct = sim.rRealAnnual * 100;
    el("metaInfo").innerHTML = `
      <span class="tag">Prazo: <b>${yearsToRetire.toFixed(1)} anos</b></span>
      <span class="tag">Rentabilidade real: <b>${rRealPct.toFixed(2)}% a.a.</b></span>
      <span class="tag">SWR: <b>${(user.swrAnnual*100).toFixed(1)}% a.a.</b></span>
      <span class="tag">Cenário ativo: <b>${presets[activeScenario]?.label || "Personalizado"}</b></span>
    `;

    el("wealthAtRetireNote").textContent = ok
      ? "Você alcança o patrimônio alvo no prazo definido."
      : "No prazo definido, você ficaria abaixo do patrimônio alvo.";

    const req = requiredMonthlyContribution(activeParams);
    el("neededPmt").textContent = req === null ? "Impossível com estes parâmetros" : formatBRL(req);

    if (!ok) {
      const t = timeToTarget(activeParams);
      if (t === null) {
        el("statusNote").textContent = "Mantendo o aporte atual, você não atinge o alvo em um horizonte muito longo. Ajuste aporte, prazo ou rentabilidade.";
      } else {
        const years = t / 12;
        const ageAt = user.ageNow + years;
        el("statusNote").textContent = `Mantendo o aporte atual, você atingiria o alvo em ~${years.toFixed(1)} anos (idade ~${ageAt.toFixed(1)}).`;
      }
    } else {
      const margin = sim.wealthAtRetire - sim.targetWealth;
      el("statusNote").textContent = `Folga estimada: ${formatBRL(margin)} acima do alvo (em valores de hoje).`;
    }

    // Table uses ACTIVE scenario
    renderTable(sim.yearlyRows);

    // Premium: cards and chart
    renderScenarioCards(results, activeScenario);
    updateLegend(activeScenario);
    drawChart(seriesMap, sim.months, sim.targetWealth, activeScenario);

    // Badge
    el("statusBadge").textContent = ok ? "✅ Resultado positivo" : "⚠️ Ajustes recomendados";
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
    el("lastRun").textContent = "Ainda não simulado";
    el("targetWealth").textContent = "—";
    el("wealthAtRetire").textContent = "—";
    el("status").textContent = "—";
    el("status").className = "metric";
    el("neededPmt").textContent = "—";
    el("wealthAtRetireNote").textContent = "—";
    el("statusNote").textContent = "—";
    el("metaInfo").innerHTML = "";
    renderTable(null);

    // premium placeholders
    const grid = el("scenarioGrid");
    if (grid) grid.innerHTML = "";
    const svg = el("retChart");
    if (svg) svg.innerHTML = "";
    const legend = el("chartLegend");
    if (legend) legend.textContent = "—";
  }

  function attachMoneyMask(id) {
    const input = el(id);
    input.addEventListener("blur", () => {
      const n = parseBRL(input.value);
      input.value = (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
  }

  function bindScenarioTabs() {
    const tabs = document.querySelectorAll(".scenario-tabs .tab");
    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeScenario = btn.dataset.scn || "base";
        run();
      });
    });
  }

  function init() {
    ["pv", "pmt", "income"].forEach(attachMoneyMask);
    el("btnCalc").addEventListener("click", run);
    el("btnReset").addEventListener("click", reset);
    bindScenarioTabs();
    reset();
  }

  document.addEventListener("DOMContentLoaded", init);
})();