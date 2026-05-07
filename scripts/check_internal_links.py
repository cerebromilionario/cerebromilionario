#!/usr/bin/env python3
"""Crawl static HTML files and report broken internal navigation links.

The site publishes static ``.html`` files but commonly links to extensionless URLs
(for example, ``/blog`` for ``blog.html``). This checker resolves those pretty
URLs locally and fails when an internal ``<a href>`` points to a page that does
not exist or to a missing fragment on an existing page.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

SKIP_DIRS = {".git", "node_modules", "vendor"}
IGNORED_PREFIXES = ("#", "mailto:", "tel:", "javascript:", "data:")


@dataclass(frozen=True)
class Link:
    source: Path
    line: int
    href: str


class AnchorCrawler(HTMLParser):
    def __init__(self, source: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.source = source
        self.links: list[Link] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {name.lower(): value for name, value in attrs if value is not None}
        element_id = attrs_dict.get("id") or attrs_dict.get("name")
        if element_id:
            self.ids.add(element_id)

        if tag.lower() == "a" and "href" in attrs_dict:
            self.links.append(Link(self.source, self.getpos()[0], attrs_dict["href"]))


def iter_html_files(root: Path) -> list[Path]:
    pages: list[Path] = []
    for path in root.rglob("*.html"):
        rel = path.relative_to(root)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        pages.append(path)
    return sorted(pages)


def candidate_files(root: Path, url_path: str) -> list[Path]:
    decoded = unquote(url_path)
    if decoded in {"", "/"}:
        return [root / "index.html"]

    rel = decoded.lstrip("/")
    candidates = [root / rel]
    if not Path(rel).suffix:
        candidates.extend([root / f"{rel}.html", root / rel / "index.html"])
    return candidates


def resolve_internal(root: Path, current_file: Path, href_path: str) -> Path | None:
    if href_path.startswith("/"):
        candidates = candidate_files(root, href_path)
    else:
        base = current_file.parent
        decoded = unquote(href_path)
        candidates = [base / decoded]
        if not Path(decoded).suffix:
            candidates.extend([base / f"{decoded}.html", base / decoded / "index.html"])

    for candidate in candidates:
        try:
            normalized = candidate.resolve().relative_to(root)
        except ValueError:
            continue
        resolved = root / normalized
        if resolved.is_file():
            return resolved
    return None


def should_skip(href: str) -> bool:
    return not href or href.startswith(IGNORED_PREFIXES)


def crawl(root: Path) -> int:
    pages = iter_html_files(root)
    parsed: dict[Path, AnchorCrawler] = {}
    for page in pages:
        parser = AnchorCrawler(page)
        parser.feed(page.read_text(encoding="utf-8", errors="ignore"))
        parsed[page] = parser

    missing_pages: list[Link] = []
    missing_fragments: list[tuple[Link, Path, str]] = []

    for page, parser in parsed.items():
        for link in parser.links:
            href = link.href.strip()
            if should_skip(href):
                continue

            parsed_url = urlparse(href)
            if parsed_url.scheme or parsed_url.netloc:
                continue

            target = resolve_internal(root, page, parsed_url.path)
            if target is None:
                missing_pages.append(link)
                continue

            if parsed_url.fragment:
                target_ids = parsed.get(target)
                if target_ids is None:
                    target_ids = AnchorCrawler(target)
                    target_ids.feed(target.read_text(encoding="utf-8", errors="ignore"))
                    parsed[target] = target_ids
                if unquote(parsed_url.fragment) not in target_ids.ids:
                    missing_fragments.append((link, target, parsed_url.fragment))

    if not missing_pages and not missing_fragments:
        print(f"No broken internal anchor links found across {len(pages)} HTML files.")
        return 0

    if missing_pages:
        print("Broken internal pages:")
        for link in missing_pages:
            rel = link.source.relative_to(root).as_posix()
            print(f"- {rel}:{link.line} -> {link.href}")

    if missing_fragments:
        print("Broken internal fragments:")
        for link, target, fragment in missing_fragments:
            rel = link.source.relative_to(root).as_posix()
            target_rel = target.relative_to(root).as_posix()
            print(f"- {rel}:{link.line} -> {link.href} (missing #{fragment} in {target_rel})")

    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Check broken internal <a href> links in static HTML files.")
    parser.add_argument("--root", default=".", help="Site root directory")
    args = parser.parse_args()
    return crawl(Path(args.root).resolve())


if __name__ == "__main__":
    raise SystemExit(main())
