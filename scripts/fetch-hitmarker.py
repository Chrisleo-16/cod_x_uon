"""Download Hitmarker webfonts for local next/font use (COD brand / non-commercial)."""
from __future__ import annotations

import re
import ssl
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

CTX = ssl.create_default_context()
ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "public" / "fonts" / "hitmarker"
OUT = ROOT / "_font_probe2.txt"


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=CTX, timeout=45) as r:
        return r.read()


def main() -> None:
    lines: list[str] = []
    found: set[str] = set()
    pages = [
        "https://www.callofduty.com/",
        "https://www.callofduty.com/blog",
        "https://blog.callofduty.com/",
        "https://www.activision.com/",
    ]

    for u in pages:
        try:
            html = get(u).decode("utf-8", "ignore")
            lines.append(f"OK {u} {len(html)}")
            css_urls = re.findall(r"https?://[^\"')\s]+\.css[^\"')\s]*", html)
            css_urls += [
                urljoin(u, m)
                for m in re.findall(r"[\"'](/[^\"']+\.css)[\"']", html)
            ]
            for m in re.findall(r"https?://[^\"')\s]+\.woff2", html):
                found.add(m.split("?")[0])
            for css_url in list(dict.fromkeys(css_urls))[:25]:
                try:
                    css = get(css_url).decode("utf-8", "ignore")
                    if re.search(r"hitmarker", css, re.I):
                        lines.append(f"HIT CSS {css_url}")
                    for w in re.findall(r"url\(([^)]+\.woff2[^)]*)\)", css):
                        w = w.strip("\"' ")
                        if w.startswith("http"):
                            found.add(w.split("?")[0])
                        else:
                            found.add(urljoin(css_url, w).split("?")[0])
                except Exception as e:  # noqa: BLE001
                    lines.append(f"css fail {css_url[:90]} {e}")
        except Exception as e:  # noqa: BLE001
            lines.append(f"FAIL {u} {e}")

    # Known Activision CDN patterns (often used on COD web)
    candidates = [
        "https://www.callofduty.com/content/dam/atvi/global/resources/fonts/HitmarkerText-Regular.woff2",
        "https://www.callofduty.com/content/dam/atvi/global/resources/fonts/HitmarkerText-Medium.woff2",
        "https://www.callofduty.com/content/dam/atvi/global/resources/fonts/HitmarkerText-Bold.woff2",
        "https://www.callofduty.com/content/dam/atvi/callofduty/hub-shared/fonts/HitmarkerText-Regular.woff2",
    ]
    for c in candidates:
        found.add(c)

    hit = [f for f in sorted(found) if "hit" in f.lower() or "Hitmarker" in f]
    lines.append(f"FOUND total={len(found)} hit={len(hit)}")
    for f in hit or sorted(found)[:40]:
        lines.append(f)

    FONT_DIR.mkdir(parents=True, exist_ok=True)
    saved = 0
    targets = hit if hit else [f for f in sorted(found) if f.endswith(".woff2")][:12]
    for url in targets:
        name = url.rstrip("/").split("/")[-1]
        if not re.search(r"hitmarker", name, re.I) and hit:
            continue
        dest = FONT_DIR / name
        try:
            data = get(url)
            if len(data) < 1000 or data[:4] == b"<!do":
                lines.append(f"SKIP bad {url} len={len(data)}")
                continue
            dest.write_bytes(data)
            saved += 1
            lines.append(f"SAVED {dest.name} {len(data)}")
        except Exception as e:  # noqa: BLE001
            lines.append(f"DL fail {url} {e}")

    lines.append(f"saved={saved}")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines[-30:]))


if __name__ == "__main__":
    main()
