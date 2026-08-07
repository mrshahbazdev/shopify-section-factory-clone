#!/usr/bin/env python3
"""
Scrape real Section Store demo pages and write each section's rendered markup
as a Shopify Liquid file under app/sections/{handle}.liquid.
"""
import json
import time
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).parent.parent
SECTIONS_FILE = ROOT / "app" / "data" / "sections.json"
OUTPUT_DIR = ROOT / "app" / "sections"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

session = requests.Session()
session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
)


def extract_candidates(soup):
    main = soup.find("main") or soup.body
    if not main:
        return []
    return [
        c
        for c in main.find_all(class_="shopify-section")
        if "__main" not in (c.get("id") or "")
    ]


def section_keywords(handle: str, anchor: str, slug: str) -> list:
    parts = []
    if anchor:
        parts.extend(re.split(r"[-_]+", anchor.lower()))
    if slug and slug not in ("pages", ""):
        parts.extend(re.split(r"[-_]+", slug.lower()))
    parts.extend(re.split(r"[-_]+", handle.lower()))
    return [p for p in parts if len(p) > 2]


def score_section(section, keywords):
    classes = " ".join(section.get("class", []))
    for el in section.find_all()[:50]:
        classes += " " + " ".join(el.get("class", []))
    text = section.get_text(" ", strip=True).lower()
    score = 0
    for kw in set(keywords):
        if kw in classes.lower():
            score += 3
        if kw in text:
            score += 1
    return score


def scrape_section(section):
    link = section["link"]
    handle = section["handle"]
    title = section["title"]
    parsed = urlparse(link)

    if parsed.netloc != "section.store":
        return (handle, "skipped", "external domain")

    path = parsed.path.strip()
    if not path or path == "/":
        return (handle, "skipped", "empty path")

    url = f"{parsed.scheme}://{parsed.netloc}{path}"
    anchor = parsed.fragment
    slug = path.split("/")[-1].lower()

    try:
        resp = session.get(url, timeout=25)
        resp.raise_for_status()
    except Exception as exc:
        return (handle, "error", f"fetch: {exc}")

    soup = BeautifulSoup(resp.text, "html.parser")
    candidates = extract_candidates(soup)
    if not candidates:
        return (handle, "error", "no candidates")

    # Anchor exact match first
    matched = None
    if anchor:
        el = soup.find(id=anchor)
        if el:
            matched = el.find_parent(class_="shopify-section")

    if not matched:
        keywords = section_keywords(handle, anchor, slug)
        if not keywords:
            return (handle, "error", "no keywords")
        best_score = 0
        for c in candidates:
            score = score_section(c, keywords)
            if score > best_score:
                best_score = score
                matched = c
        if best_score == 0:
            return (handle, "error", "no keyword match")

    children = "".join(str(c) for c in matched.contents).strip()
    schema = {
        "name": title,
        "tag": "section",
        "presets": [{"name": title}],
    }
    liquid = children + "\n{% schema %}\n" + json.dumps(schema, indent=2, ensure_ascii=False) + "\n{% endschema %}\n"

    out_path = OUTPUT_DIR / f"{handle}.liquid"
    out_path.write_text(liquid, encoding="utf-8")
    return (handle, "ok", len(liquid))


def main():
    with open(SECTIONS_FILE, "r", encoding="utf-8") as f:
        sections = json.load(f)

    stats = {"ok": 0, "error": 0, "skipped": 0}
    start = time.time()

    def worker(sec):
        time.sleep(0.15)  # be polite
        return scrape_section(sec)

    with ThreadPoolExecutor(max_workers=6) as executor:
        future_to_sec = {executor.submit(worker, s): s for s in sections}
        for future in as_completed(future_to_sec):
            handle, status, detail = future.result()
            stats[status] = stats.get(status, 0) + 1
            if status == "ok":
                print(f"[OK] {handle} ({detail} bytes)")
            else:
                print(f"[{status.upper()}] {handle}: {detail}")

    elapsed = time.time() - start
    print(f"Scraped {stats['ok']} / {len(sections)} sections in {elapsed:.1f}s")
    print(f"Errors: {stats['error']}, Skipped: {stats['skipped']}")


if __name__ == "__main__":
    main()
