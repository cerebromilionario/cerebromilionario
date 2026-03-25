(function () {
  const grid = document.getElementById("news-grid");
  const updated = document.getElementById("news-updated");

  if (!grid) return;

  const feeds = [
    { name: "InfoMoney", url: "https://www.infomoney.com.br/feed/" },
    { name: "Investing.com (BR)", url: "https://br.investing.com/webmaster-tools/rss" }
  ];

  // CORS proxy (sem key). Se um dia cair, trocamos facilmente.
  const proxy = (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
    }[m]));
  }

  function fmtDate(dateStr) {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  }

  function pickExcerpt(item) {
    // Try description / content
    const raw = item.querySelector("description")?.textContent || item.querySelector("content\\:encoded")?.textContent || "";
    const clean = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return clean.slice(0, 160) + (clean.length > 160 ? "…" : "");
  }

  async function fetchFeed(feed) {
    const res = await fetch(proxy(feed.url), { cache: "no-store" });
    const text = await res.text();
    const xml = new DOMParser().parseFromString(text, "text/xml");

    const items = Array.from(xml.querySelectorAll("item")).slice(0, 8).map((it) => {
      const title = it.querySelector("title")?.textContent?.trim() || "Sem título";
      const link = it.querySelector("link")?.textContent?.trim() || "#";
      const pubDate = it.querySelector("pubDate")?.textContent?.trim() || "";
      const excerpt = pickExcerpt(it) || "Clique para ler a notícia completa.";
      return { title, link, pubDate, excerpt, source: feed.name };
    });

    return items;
  }

  async function load() {
    try {
      const results = await Promise.allSettled(feeds.map(fetchFeed));
      const items = results
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value);

      if (!items.length) throw new Error("Sem itens de RSS");

      // Sort by date desc when possible
      items.sort((a, b) => {
        const da = Date.parse(a.pubDate) || 0;
        const db = Date.parse(b.pubDate) || 0;
        return db - da;
      });

      const top = items.slice(0, 9);

      grid.innerHTML = top.map((n) => `
        <a class="news-card" href="${escapeHtml(n.link)}" target="_blank" rel="noopener noreferrer">
          <div class="news-meta">
            <span class="news-source">${escapeHtml(n.source)}</span>
            <span class="news-date">${escapeHtml(fmtDate(n.pubDate))}</span>
          </div>
          <div class="news-title">${escapeHtml(n.title)}</div>
          <div class="news-excerpt">${escapeHtml(n.excerpt)}</div>
          <div class="news-cta">Ler na fonte →</div>
        </a>
      `).join("");

      const now = new Date();
      updated.textContent = `Atualizado em ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    } catch (e) {
      console.error("Erro no Radar Financeiro:", e);
      grid.innerHTML = `
        <div class="news-card">
          <div class="news-title">Não foi possível carregar as manchetes agora</div>
          <div class="news-excerpt">Isso pode ocorrer por instabilidade do RSS ou bloqueio temporário. Tente novamente em alguns minutos.</div>
        </div>
      `;
      if (updated) updated.textContent = "Indisponível no momento";
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();