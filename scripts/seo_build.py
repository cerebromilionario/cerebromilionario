#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

BASE_URL = "https://cerebromilionario.site"
ROOT = Path(__file__).resolve().parents[1]

EXCLUDE_DIRS = {".git", "node_modules", "images", "css", "js", "scripts", "vendor"}
EXCLUDE_FILES = {
    "404.html",
    "trilogia_snippet.html",
    "privacy-policy.html",
    "politica-de-privacidade.html",
    "calculadora-juros-compostos.html",
    "simulador-aposentadoria.html",
    "obrigado.html",
}

# Sitemap enxuto para priorizar URLs canônicas, rastreáveis e com maior valor editorial.
# Páginas fora destas listas continuam acessíveis por links internos, mas deixam de
# disputar orçamento de rastreamento no sitemap enviado ao Google.
SITEMAP_STATIC_FILES = (
    "index.html",
    "blog.html",
    "sobre.html",
    "contato.html",
    "politica-privacidade.html",
    "termos-uso.html",
    "politica-editorial.html",
    "perguntas-frequentes.html",
    "ferramentas.html",
    "mapa-do-site.html",
    "guia-iniciantes.html",
    "glossario-financeiro.html",
    "estrategia-investimentos.html",
    "calculadora.html",
    "comparador-cdb-lci-lca.html",
    "comparador-investimentos.html",
    "aposentadoria.html",
    "calculadora-valuation.html",
    "calculadora-ir-bolsa.html",
    "calculadora-ir-renda-fixa.html",
    "simulador-carteira.html",
    "simulador-dividendos.html",
)
POST_SITEMAP_LIMIT = 100
WEAK_POST_PATTERNS = ("-parte-",)

# Primeira parte de cada série longa — inclui no sitemap como ponto de entrada
SERIES_ENTRY_POSTS = (
    "acoes-institucional-parte-1.html",
    "biblia-da-aposentadoria-parte-1.html",
    "biblia-imposto-de-renda-investidor-parte-1.html",
    "enciclopedia-da-bolsa-parte-1-como-analisar-empresas.html",
    "enciclopedia-primeiro-milhao-parte-1.html",
    "etf-masterclass-carteira-global-parte-1.html",
    "guia-institucional-fiis-parte-1.html",
    "macroeconomia-institucional-parte-1.html",
    "warren-buffett-biografia-institucional-parte-1.html",
)


class SEOHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.description: str | None = None
        self.canonical: str | None = None
        self.has_viewport = False
        self.robots: str | None = None
        self.h1_count = 0
        self._in_title = False

    @property
    def title(self) -> str:
        return "".join(self.title_parts).strip()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attrs_map = {name.lower(): (value or "") for name, value in attrs}

        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = attrs_map.get("name", "").strip().lower()
            if name == "description" and self.description is None:
                self.description = attrs_map.get("content", "")
            elif name == "robots" and self.robots is None:
                self.robots = attrs_map.get("content", "")
            elif name == "viewport":
                self.has_viewport = True
        elif tag == "link":
            rel_values = attrs_map.get("rel", "").lower().split()
            if "canonical" in rel_values and self.canonical is None:
                self.canonical = attrs_map.get("href", "")
        elif tag == "h1":
            self.h1_count += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title_parts.append(data)


def parse_html_metadata(text: str) -> SEOHTMLParser:
    parser = SEOHTMLParser()
    parser.feed(text)
    parser.close()
    return parser


def find_html_pages(site_root: Path) -> list[Path]:
    pages = []
    for path in site_root.rglob("*.html"):
        rel = path.relative_to(site_root)
        if any(part in EXCLUDE_DIRS for part in rel.parts[:-1]):
            continue
        if rel.name in EXCLUDE_FILES or rel.name.startswith("google"):
            continue
        if rel.parts[0] == "js":
            continue
        pages.append(path)
    return sorted(pages)


def to_url(rel_path: Path) -> str:
    path = "/" + rel_path.as_posix()
    if path == "/index.html":
        path = "/"
    elif path.endswith("/index.html"):
        path = path[:-10] + "/"
    elif path.endswith(".html"):
        path = path[:-5]
    return BASE_URL + path


def priority_for(rel_path: Path) -> str:
    p = rel_path.as_posix()
    if p == "index.html":
        return "1.0"
    if p in {"blog.html", "ferramentas.html"}:
        return "0.9"
    if p.startswith("posts/"):
        return "0.8"
    return "0.7"


def changefreq_for(rel_path: Path) -> str:
    return "monthly" if rel_path.as_posix().startswith("posts/") else "weekly"


def is_noindex(metadata: SEOHTMLParser) -> bool:
    return metadata.robots is not None and "noindex" in metadata.robots.lower()


def is_self_canonical(site_root: Path, page: Path) -> bool:
    metadata = parse_html_metadata(page.read_text(encoding="utf-8", errors="ignore"))
    if metadata.canonical is None or is_noindex(metadata):
        return False
    return canonical_matches(metadata.canonical, page.relative_to(site_root))


def visible_word_count(page: Path) -> int:
    class TextCounter(HTMLParser):
        def __init__(self) -> None:
            super().__init__(convert_charrefs=True)
            self.words = 0
            self._skip_depth = 0

        def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
            if tag.lower() in {"script", "style", "noscript"}:
                self._skip_depth += 1

        def handle_endtag(self, tag: str) -> None:
            if tag.lower() in {"script", "style", "noscript"} and self._skip_depth:
                self._skip_depth -= 1

        def handle_data(self, data: str) -> None:
            if not self._skip_depth:
                self.words += len(data.split())

    counter = TextCounter()
    counter.feed(page.read_text(encoding="utf-8", errors="ignore"))
    counter.close()
    return counter.words


def select_sitemap_pages(site_root: Path, pages: list[Path]) -> list[Path]:
    eligible = [page for page in pages if is_self_canonical(site_root, page)]

    eligible_by_rel = {page.relative_to(site_root).as_posix(): page for page in eligible}
    static_pages = [eligible_by_rel[rel] for rel in SITEMAP_STATIC_FILES if rel in eligible_by_rel]

    post_candidates = []
    for page in eligible:
        rel = page.relative_to(site_root).as_posix()
        if not rel.startswith("posts/"):
            continue
        slug = page.stem.lower()
        if any(pattern in slug for pattern in WEAK_POST_PATTERNS):
            continue
        post_candidates.append((visible_word_count(page), rel, page))

    selected_posts = sorted(page for _words, _rel, page in sorted(post_candidates, reverse=True)[:POST_SITEMAP_LIMIT])

    # Add series entry posts (parte-1 of each multi-part series) so Google discovers the full series
    series_entries = []
    eligible_by_name = {page.name: page for page in eligible}
    for fname in SERIES_ENTRY_POSTS:
        if fname in eligible_by_name:
            entry = eligible_by_name[fname]
            if entry not in selected_posts:
                series_entries.append(entry)

    return static_pages + selected_posts + sorted(series_entries)


def generate_sitemap(site_root: Path, pages: list[Path]) -> Path:
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", ns)
    urlset = ET.Element(f"{{{ns}}}urlset")

    for page in pages:
        rel = page.relative_to(site_root)
        url = ET.SubElement(urlset, f"{{{ns}}}url")
        ET.SubElement(url, f"{{{ns}}}loc").text = to_url(rel)
        lastmod = dt.datetime.fromtimestamp(page.stat().st_mtime, tz=dt.timezone.utc).date().isoformat()
        ET.SubElement(url, f"{{{ns}}}lastmod").text = lastmod
        ET.SubElement(url, f"{{{ns}}}changefreq").text = changefreq_for(rel)
        ET.SubElement(url, f"{{{ns}}}priority").text = priority_for(rel)

    output = site_root / "sitemap.xml"
    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="  ")
    tree.write(output, encoding="utf-8", xml_declaration=True)
    output.write_text(output.read_text(encoding="utf-8") + "\n", encoding="utf-8")
    return output


def canonical_matches(found: str, rel: Path) -> bool:
    found = found.strip().rstrip("/")
    full = to_url(rel).rstrip("/")
    pretty = full.removesuffix(".html") if full.endswith(".html") else full
    return found in {full, pretty}


def validate_seo(site_root: Path, pages: list[Path], strict: bool) -> int:
    errors: dict[str, list[str]] = {}
    title_map: dict[str, list[str]] = {}

    for page in pages:
        rel = page.relative_to(site_root)
        text = page.read_text(encoding="utf-8", errors="ignore")
        page_errors = []

        metadata = parse_html_metadata(text)

        title = metadata.title
        if not title:
            page_errors.append("missing <title>")
        else:
            digest = hashlib.md5(title.lower().encode()).hexdigest()
            title_map.setdefault(digest, []).append(rel.as_posix())

        desc = metadata.description.strip() if metadata.description is not None else ""
        if metadata.description is None:
            page_errors.append("missing meta description")
        elif not desc:
            page_errors.append("empty meta description")

        if metadata.h1_count != 1:
            page_errors.append("page must contain exactly one <h1>")

        if metadata.robots is None:
            page_errors.append("missing meta robots")

        if metadata.canonical is None:
            page_errors.append("missing canonical")
        else:
            found = metadata.canonical.strip()
            if not canonical_matches(found, rel):
                page_errors.append(f"canonical mismatch (found: {found})")

        if not metadata.has_viewport:
            page_errors.append("missing meta viewport")

        if page_errors:
            errors[rel.as_posix()] = page_errors

    for title_hash, files in title_map.items():
        if len(files) > 1:
            for file in files:
                errors.setdefault(file, []).append("duplicate <title> across pages")

    print("\nSEO Validation Report")
    print("=" * 24)
    if not errors:
        print("No SEO issues found.")
        return 0

    for file, file_errors in sorted(errors.items()):
        print(f"\n- {file}")
        for err in file_errors:
            print(f"  • {err}")

    print(f"\nTotal pages com problemas: {len(errors)}")
    if strict:
        return 1
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate sitemap and run SEO checks")
    parser.add_argument("--root", default=".", help="Site root")
    parser.add_argument("--strict", action="store_true", help="Fail with non-zero code if SEO errors exist")
    args = parser.parse_args()

    site_root = Path(args.root).resolve()
    pages = find_html_pages(site_root)
    if not pages:
        print("No HTML pages found.")
        return 1

    sitemap_pages = select_sitemap_pages(site_root, pages)
    sitemap_path = generate_sitemap(site_root, sitemap_pages)
    print(f"Generated sitemap: {sitemap_path} ({len(sitemap_pages)} URLs from {len(pages)} valid HTML pages)")

    return validate_seo(site_root, pages, strict=args.strict)


if __name__ == "__main__":
    sys.exit(main())
