#!/usr/bin/env python3
"""Validate the blog posts index without confusing metadata for post entries.

``posts/posts.json`` is intentionally an object with root-level metadata
(``generatedAt`` and ``totalPosts``) plus the canonical ``posts`` array.
This checker reads only ``data["posts"]`` when counting entries so audit and
feed scripts do not accidentally count metadata keys.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INDEX = ROOT / "posts" / "posts.json"
REQUIRED_POST_FIELDS = ("title", "url", "slug")


def load_index(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise ValueError("posts index must be a JSON object with a 'posts' array")
    if not isinstance(data.get("posts"), list):
        raise ValueError("posts index must expose entries in data['posts']")
    return data


def validate_index(path: Path) -> list[str]:
    data = load_index(path)
    posts = data["posts"]
    errors: list[str] = []

    total_posts = data.get("totalPosts")
    if total_posts != len(posts):
        errors.append(f"totalPosts={total_posts!r} does not match len(data['posts'])={len(posts)}")

    seen_slugs: set[str] = set()
    seen_urls: set[str] = set()
    for index, post in enumerate(posts, start=1):
        if not isinstance(post, dict):
            errors.append(f"posts[{index}] must be an object")
            continue

        for field in REQUIRED_POST_FIELDS:
            if not post.get(field):
                errors.append(f"posts[{index}] is missing required field '{field}'")

        slug = post.get("slug")
        if slug in seen_slugs:
            errors.append(f"duplicate slug: {slug}")
        elif isinstance(slug, str):
            seen_slugs.add(slug)

        url = post.get("url")
        if url in seen_urls:
            errors.append(f"duplicate url: {url}")
        elif isinstance(url, str):
            seen_urls.add(url)

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate posts/posts.json using data['posts'] as the canonical post list."
    )
    parser.add_argument("path", nargs="?", default=DEFAULT_INDEX, type=Path, help="Path to posts index JSON")
    args = parser.parse_args()

    path = args.path.resolve()
    errors = validate_index(path)
    if errors:
        print(f"Posts index validation failed for {path}:")
        for error in errors:
            print(f"- {error}")
        return 1

    data = load_index(path)
    print(f"Posts index OK: {len(data['posts'])} posts in data['posts'] (metadata keys ignored).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
