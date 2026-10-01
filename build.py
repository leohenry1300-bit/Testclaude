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


# ---------------------------------------------------------------
# Library packs: content/*.txt  ->  src/packs-data.js
#   @pack id | title | emoji | description        (one per file)
#   @tags a, b                                    (tags for every card)
#   ## Sub-deck name | emoji
#   front ;; back ;; hint                         (basic card)
#   C: text with {{c1::cloze}} ;; extra           (cloze card)
# ---------------------------------------------------------------
import json, re

PACK_ORDER = [
    ("anglais-bases", "anglais"), ("toeic-vocab", "anglais"), ("toeic-grammaire", "anglais"),
    ("toeic-verbes", "anglais"), ("toeic-faux-amis", "anglais"), ("toeic-expressions", "anglais"),
    ("banque-produits", "banque"), ("assurance", "banque"), ("finance-marches", "banque"), ("credit-fiscalite", "banque"),
    ("but-tc-marketing", "buttc"), ("but-tc-vente", "buttc"), ("but-tc-gestion-droit", "buttc"),
]
GROUPS = {
    "anglais": {"name": "Anglais & TOEIC", "emoji": "🇬🇧", "desc": "Du niveau débutant jusqu'aux pièges du TOEIC."},
    "banque": {"name": "Banque, assurance & finance", "emoji": "🏦", "desc": "Produits bancaires, assurance, marchés, crédit, fiscalité."},
    "buttc": {"name": "BUT TC", "emoji": "🎓", "desc": "Marketing, vente, gestion, droit, économie : les bases du BUT Techniques de commercialisation."},
}


def parse_pack(name, group):
    pack = {"group": group, "tags": [], "decks": []}
    deck = None
    for n, raw in enumerate((ROOT / "content" / f"{name}.txt").read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        if not line:
            continue
        if line.startswith("@pack"):
            p = [x.strip() for x in line[5:].split("|")]
            pack.update(id=p[0], title=p[1], emoji=p[2], desc=p[3])
        elif line.startswith("@tags"):
            pack["tags"] = [t.strip() for t in line[5:].split(",") if t.strip()]
        elif line.startswith("## "):
            p = [x.strip() for x in line[3:].split("|")]
            deck = {"name": p[0], "emoji": p[1] if len(p) > 1 else "📁", "cards": []}
            pack["decks"].append(deck)
        else:
            parts = [x.strip() for x in re.split(r"\s*;;\s*", line)]
            if line.startswith("C:"):
                parts[0] = parts[0][2:].strip()
                if "{{c" not in parts[0]:
                    raise SystemExit(f"{name}.txt:{n}: cloze without {{{{c1::}}}}")
                deck["cards"].append(["c", parts[0], parts[1] if len(parts) > 1 else ""])
            else:
                if len(parts) < 2 or not parts[0] or not parts[1]:
                    raise SystemExit(f"{name}.txt:{n}: card needs 'front ;; back'  -> {line[:60]}")
                deck["cards"].append(["b", parts[0], parts[1], parts[2] if len(parts) > 2 else ""])
    return pack


packs = [parse_pack(n, g) for n, g in PACK_ORDER]
(SRC / "packs-data.js").write_text(
    "const PACK_GROUPS = " + json.dumps(GROUPS, ensure_ascii=False) + ";\nconst PACKS = " + json.dumps(packs, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8")
print("packs:", sum(len(d["cards"]) for p in packs for d in p["decks"]), "cards in", len(packs), "packs")


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
{read("packs-data.js").strip()}
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
