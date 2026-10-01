#!/usr/bin/env python3
"""Assemble the single-file app (index.html) from src/.

The output is one self-contained HTML file: it can be opened by
double-click, installed on a phone home screen or deployed on Netlify.
"""
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"


def read(name):
    return (SRC / name).read_text(encoding="utf-8")


html = f"""<!DOCTYPE html>
<html lang="fr" data-theme="clair">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="SuperAnki">
<meta name="theme-color" content="#ffffff">
<meta name="description" content="SuperAnki Pro : cartes mémoire avec répétition espacée, quiz, écriture et chrono.">
{read("head-icons.html").strip()}
<title>SuperAnki Pro</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&family=Lora:wght@400;600;700&family=Nunito:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:wght@600;700;800&family=Patrick+Hand&family=Press+Start+2P&family=VT323&display=swap">
<style>
{read("styles.css")}
</style>
</head>
<body>
{read("body.html")}
<script>
{read("seed-data.js").strip()}
</script>
<script>
{read("fsrs.js")}
{read("app.js")}
{read("stats.js")}
{read("features.js")}
{read("sync.js")}
{read("boot.js")}
</script>
</body>
</html>
"""

(ROOT / "index.html").write_text(html, encoding="utf-8")
print(f"index.html written ({len(html.encode('utf-8')) // 1024} Ko)")
