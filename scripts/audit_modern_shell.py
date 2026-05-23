#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "brand-watermark",
    "nav-toggle",
    "mobileMenu",
    "wa-fab",
    "accessibility-widget.js",
]
OLD_MARKERS = ["nav-inner", "logo-tag", "whatsapp-float"]
BAD_30 = [
    r"First\s+30",
    r"primeros\s+30",
    r"30\s+העסקים",
    r"أول\s+30",
]

failures = []
warnings = []
for path in sorted(ROOT.rglob("*.html")):
    rel = path.relative_to(ROOT)
    text = path.read_text(encoding="utf-8", errors="ignore")
    for marker in REQUIRED:
        if marker not in text:
            failures.append(f"{rel}: missing {marker}")
    for marker in OLD_MARKERS:
        if marker in text:
            warnings.append(f"{rel}: old marker still present: {marker}")
    for pattern in BAD_30:
        if re.search(pattern, text, re.I):
            warnings.append(f"{rel}: possible stale launch-offer 30 copy: {pattern}")
    if text.count('id="mobileMenu"') != 1:
        failures.append(f"{rel}: expected exactly one mobileMenu, found {text.count('id=\"mobileMenu\"')}")
    if text.count('accessibility-widget.js') != 1:
        failures.append(f"{rel}: expected exactly one accessibility-widget.js, found {text.count('accessibility-widget.js')}")

if warnings:
    print("WARNINGS:")
    for item in warnings:
        print("-", item)
if failures:
    print("FAILURES:")
    for item in failures:
        print("-", item)
    sys.exit(1)
print(f"PASS: {len(list(ROOT.rglob('*.html')))} HTML pages include the modern Clarvix shell markers.")
