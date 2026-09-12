"""Download Hitmarker Text woff2 files from COD shop CDN."""
from pathlib import Path
import urllib.request
import ssl

CTX = ssl.create_default_context()
FONT_DIR = Path(r"c:\Users\surfice\OneDrive\Desktop\lukano_cod\public\fonts\hitmarker")
FONT_DIR.mkdir(parents=True, exist_ok=True)

URLS = {
    "HitmarkerText-Regular.woff2": "https://shop.callofduty.com/cdn/shop/files/HitmarkerText-Regular.woff2?v=5672925658869538888",
    "HitmarkerText-Bold.woff2": "https://shop.callofduty.com/cdn/shop/files/HitmarkerText-Bold.woff2?v=11187636312696497098",
    # try common sibling names
    "HitmarkerText-Medium.woff2": "https://shop.callofduty.com/cdn/shop/files/HitmarkerText-Medium.woff2",
    "HitmarkerCondensed-Black.woff2": "https://shop.callofduty.com/cdn/shop/files/HitmarkerCondensed-Black.woff2",
    "Hitmarker-CondensedBlack.woff2": "https://shop.callofduty.com/cdn/shop/files/Hitmarker-CondensedBlack.woff2",
    "HitmarkerCondensedBlack.woff2": "https://shop.callofduty.com/cdn/shop/files/HitmarkerCondensedBlack.woff2",
}

# Also try brand asset CDN patterns
EXTRA = [
    "https://cdn.shopify.com/s/files/1/0599/9568/5113/files/HitmarkerText-Regular.woff2",
    "https://cdn.shopify.com/s/files/1/0599/9568/5113/files/HitmarkerText-Bold.woff2",
    "https://cdn.shopify.com/s/files/1/0599/9568/5113/files/HitmarkerText-Medium.woff2",
]

for name, url in URLS.items():
    dest = FONT_DIR / name
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=CTX, timeout=40) as r:
            data = r.read()
        if len(data) < 2000 or data[:4] == b"<!do" or data[:1] == b"{":
            print("SKIP", name, len(data), data[:40])
            continue
        dest.write_bytes(data)
        print("OK", name, len(data))
    except Exception as e:
        print("FAIL", name, e)

for url in EXTRA:
    name = url.rstrip("/").split("/")[-1].split("?")[0]
    dest = FONT_DIR / name
    if dest.exists() and dest.stat().st_size > 2000:
        print("have", name)
        continue
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=CTX, timeout=40) as r:
            data = r.read()
        if len(data) < 2000:
            print("SKIP extra", name, len(data))
            continue
        dest.write_bytes(data)
        print("OK extra", name, len(data))
    except Exception as e:
        print("FAIL extra", name, e)

print("dir:", list(FONT_DIR.glob("*")))
