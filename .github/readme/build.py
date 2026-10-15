#!/usr/bin/env python3
"""Builds the README images in .github/readme/out/ (light and dark).

  pip install fonttools brotli && python3 .github/readme/build.py

Uses svgkit.py, the same generator as the seiunhim profile, so both share one look.
"""
from pathlib import Path

from svgkit import THEMES, W, demo_window, pill, svg, t, width

OUT = Path(__file__).resolve().parent / "out"


def hero(c):
    faces = ["mono", "mono-m", "display", "body"]
    b, css = [], []
    X = 4
    # breadcrumb with the app's folder mark and a blinking cursor
    b.append(f'<path transform="translate({X} 22)" fill="none" stroke="{c["accent"]}" stroke-width="2" stroke-linejoin="round" '
             'd="M1 3a2 2 0 0 1 2-2h4.5l2 2.4H15a2 2 0 0 1 2 2V12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z"/>')
    b.append(t(X + 26, 34, "~ / ", "mono", 16, c["muted"]))
    bw = width("~ / ", "mono", 16)
    b.append(t(X + 26 + bw, 34, "organizy", "mono-m", 16, c["fg"]))
    cw = width("organizy", "mono-m", 16)
    b.append(f'<rect class="cursor" x="{X + 26 + bw + cw + 5:.1f}" y="21" width="8" height="16" fill="{c["accent"]}"/>')
    css.append(".cursor{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}")
    p, w = pill(X, 62, "MACOS 14+", c, "mono-m", 12.5, h=24); b.append(p)
    b.append(t(X + w + 12, 78.5, "FREE · OPEN SOURCE", "mono-m", 12.5, c["ink"]))
    b.append(t(X - 3, 182, "Organizy", "display", 82, c["fg"], extra='letter-spacing="-2.5"'))
    nw = width("Organizy", "display", 82) - 2.5 * len("Organizy")
    b.append(t(X - 3 + nw, 182, ".", "display", 82, c["accent"]))
    for i, line in enumerate(["Point it at a messy folder.", "It suggests where every file goes,", "and moves nothing until you say so."]):
        b.append(t(X, 232 + i * 30, line, "body", 21, c["muted"]))
    b.append(t(X, 346, "review → move → undo", "mono", 14, c["muted"]))
    wh = demo_window(b, css, c, 452, 6, 444)
    return svg(W, 6 + wh + 8, "".join(b), faces, "".join(css),
               "Organizy. Point it at a messy folder. It suggests where every file goes, and moves nothing until you say so.")


STEPS = [
    ("choose", "Pick a folder, or drop one on the Dock icon."),
    ("scan", "Organizy reads names, types, sizes and contents."),
    ("review", "Change any destination or untick what should stay."),
    ("move", "Press Move Files. Only ticked files move."),
    ("undo", "Every batch is in History. One click puts it back."),
]


def wrap(text, face, size, max_w):
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if width(trial, face, size) <= max_w:
            cur = trial
        else:
            lines.append(cur); cur = word
    return lines + [cur]


def steps(c):
    faces = ["mono", "mono-m", "body"]
    gap = 10
    cw = (W - gap * (len(STEPS) - 1)) / len(STEPS)
    H = 132
    b = []
    for i, (name, desc) in enumerate(STEPS):
        x = i * (cw + gap)
        b.append(f'<rect x="{x+.5:.1f}" y="0.5" width="{cw-1:.1f}" height="{H-1}" rx="12" fill="{c["surface"]}" stroke="{c["line"]}"/>')
        p, w = pill(x + 14, 14, str(i + 1), c, "mono-m", 12, h=22, pad=8); b.append(p)
        b.append(t(x + 14 + w + 8, 30, name, "mono-m", 14.5, c["fg"]))
        if i < len(STEPS) - 1:
            b.append(t(x + cw - 12, 30, "→", "body", 15, c["muted"], "end"))
        for j, line in enumerate(wrap(desc, "body", 15, cw - 28)):
            b.append(t(x + 14, 66 + j * 21, line, "body", 15, c["muted"]))
    return svg(W, H, "".join(b), faces, title="How it works: " + "; ".join(f"{i+1}. {n}: {d}" for i, (n, d) in enumerate(STEPS)))


def main():
    OUT.mkdir(exist_ok=True)
    for theme, c in THEMES.items():
        (OUT / f"hero-{theme}.svg").write_text(hero(c))
        (OUT / f"steps-{theme}.svg").write_text(steps(c))
    print("built", sorted(p.name for p in OUT.glob("*.svg")))


if __name__ == "__main__":
    main()
