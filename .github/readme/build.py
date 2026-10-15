#!/usr/bin/env python3
"""Builds the README images in .github/readme/out/ (light and dark).

  pip install fonttools brotli && python3 .github/readme/build.py

Uses svgkit.py, the same kit as the koschei-dev profile, so the profile, this README and the
website share one look: Bodoni Moda for display, Jost for text, DM Mono for file names.
"""
from pathlib import Path

from svgkit import HERE, THEMES, fit_size, monument, png_data, svg, t, width, wrap

OUT = HERE / "out"
W = 900
ICON = png_data(HERE / "icon.png")


# ---------------------------------------------------------------- hero
def hero(c):
    b, css = [], []
    b.append(t(0, 20, "Free and open source", "text", 16, c["muted"]))
    b.append(t(W, 20, "macOS 14 or later", "text", 16, c["muted"], "end"))
    size = fit_size("Organizy", W, icon=True)
    base = 40 + size * 0.80
    m, mcss, _ = monument("Organizy", size, 0, base, c["ink"], icon=ICON, cls="h")
    b.append(m); css.append(mcss)
    y = base + size * 0.30 + 30
    lines = wrap("A free Mac app that reads a messy folder, suggests where every file belongs, "
                 "and moves nothing until you confirm.", "text", 21, 470)
    foot = "".join(t(W - 470, y + i * 31, line, "text", 21, c["ink"]) for i, line in enumerate(lines))
    foot += t(0, y + (len(lines) - 1) * 31, "Every move can be undone.", "text", 16, c["muted"])
    b.append(f'<g class="h-foot">{foot}</g>')
    css.append(".h-foot{animation:h-foot .7s cubic-bezier(.22,1,.36,1) .7s both}@keyframes h-foot{from{opacity:0;transform:translateY(10px)}}")
    H = int(y + (len(lines) - 1) * 31 + 12)
    return svg(W, H, "".join(b), ["display", "text"], "".join(css),
               "Organizy. A free Mac app that reads a messy folder, suggests where every file belongs, and moves nothing until you confirm.")


# ---------------------------------------------------------------- the app, sorting a folder
# Real results from the website demo's engine (web/src/engine.ts) with Local AI on.
ROWS = [
    ("INV-2026-0042.txt", "128 bytes", "Invoices & Receipts", "Rule"),
    ("statement_sept.txt", "139 bytes", "Bank Statements", "Rule"),
    ("ticket_supermercado.txt", "219 bytes", "Invoices & Receipts", "AI"),
    ("1099_INT_2025.txt", "99 bytes", "Taxes", "Rule"),
    ("jsmith_experience.md", "238 bytes", "Resumes & CVs", "AI"),
    ("Resume_Alex_Kim.docx", "4 KB", "Resumes & CVs", "Rule"),
    ("lease_agreement.txt", "177 bytes", "Documents", "AI"),
    ("hotel_folio.rtf", "514 bytes", "Invoices & Receipts", "AI"),
]
LOOP = 12  # seconds


def kf(name, frames):
    """frames: list of (percent, css declarations)."""
    return f"@keyframes {name}{{" + "".join(f"{p:.1f}%{{{d}}}" for p, d in frames) + "}"


def anim(cls, name, frames, extra=""):
    return f".{cls}{{animation:{name} {LOOP}s linear infinite;{extra}}}" + kf(name, frames)


def window(c):
    b, css = [], []
    X, Y, WW = 16, 10, W - 32
    SIDE, HEAD, TOOL, TH, ROW, FOOT = 156, 46, 44, 28, 32, 50
    n = len(ROWS)
    WH = HEAD + TOOL + TH + n * ROW + FOOT
    H = Y + WH + 30
    b.append(f'<defs><filter id="sh" x="-10%" y="-10%" width="120%" height="140%">'
             f'<feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="{c["shadow"]}"/></filter>'
             f'<clipPath id="win"><rect x="{X}" y="{Y}" width="{WW}" height="{WH}" rx="12"/></clipPath></defs>')
    b.append(f'<rect x="{X}" y="{Y}" width="{WW}" height="{WH}" rx="12" fill="{c["win"]}" filter="url(#sh)"/>')
    b.append(f'<g clip-path="url(#win)">')
    # sidebar
    b.append(f'<rect x="{X}" y="{Y}" width="{SIDE}" height="{WH}" fill="{c["side"]}"/>')
    for i, col in enumerate(["#FF5F57", "#FEBC2E", "#28C840"]):
        b.append(f'<circle cx="{X + 20 + i * 19}" cy="{Y + 22}" r="6" fill="{col}"/>')
    for i, label in enumerate(["Organize", "Rules", "History", "Settings"]):
        iy = Y + 62 + i * 30
        if i == 0:
            b.append(f'<rect x="{X + 10}" y="{iy - 17}" width="{SIDE - 20}" height="26" rx="6" fill="{c["select"]}"/>')
        b.append(t(X + 22, iy, label, "text", 14, c["wtext"]))
    mx, mw = X + SIDE, WW - SIDE
    # title bar
    b.append(f'<rect x="{mx}" y="{Y}" width="{mw}" height="{HEAD}" fill="{c["bar"]}"/>')
    b.append(t(mx + 18, Y + 29, "Organize", "text-m", 16, c["wtext2"]))
    b.append(f'<rect x="{mx}" y="{Y + HEAD - 1}" width="{mw}" height="1" fill="{c["wline"]}"/>')
    # toolbar
    ty = Y + HEAD
    b.append(f'<path transform="translate({mx + 18} {ty + 15})" fill="{c["folder"]}" '
             'd="M0 2a2 2 0 0 1 2-2h4.2l1.8 2.2H14a2 2 0 0 1 2 2V11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"/>')
    b.append(t(mx + 42, ty + 27, "~/Downloads", "text", 14, c["wtext2"]))
    bx = X + WW - 16
    sw = width("Scan Again", "text", 13.5) + 22
    b.append(f'<rect x="{bx - sw:.1f}" y="{ty + 10}" width="{sw:.1f}" height="24" rx="6" fill="{c["win"]}" stroke="{c["control_line"]}"/>')
    b.append(t(bx - sw / 2, ty + 27, "Scan Again", "text", 13.5, c["wtext"], "middle"))
    lx = bx - sw - 22
    b.append(f'<circle cx="{lx}" cy="{ty + 22}" r="4" fill="{c["ok"]}"/>')
    b.append(t(lx - 12, ty + 27, "Local AI", "text", 14, c["wtext"], "end"))
    cbx = lx - 12 - width("Local AI", "text", 14) - 22
    b.append(f'<rect x="{cbx:.1f}" y="{ty + 15}" width="14" height="14" rx="4" fill="{c["tint"]}"/>'
             f'<path transform="translate({cbx + 3.5:.1f} {ty + 18.5})" fill="none" stroke="{c["on_tint"]}" stroke-width="1.7" '
             'stroke-linecap="round" stroke-linejoin="round" d="M0 3.6 2.4 6 7 0.8"/>')
    b.append(f'<rect x="{mx}" y="{ty + TOOL - 1}" width="{mw}" height="1" fill="{c["wline"]}"/>')
    # table header
    hy = ty + TOOL
    CN, CS, CD, CW = mx + 18, mx + 262, mx + 352, X + WW - 18
    for x, label, a in [(CN, "Name", "start"), (CS, "Size", "start"), (CD, "Goes to", "start"), (CW, "Why", "end")]:
        b.append(t(x, hy + 19, label, "text", 12.5, c["wtext2"], a))
    b.append(f'<rect x="{mx}" y="{hy + TH - 1}" width="{mw}" height="1" fill="{c["wline"]}"/>')

    # timeline (percent of LOOP)
    SCAN0, SCAN1, MOVE, BACK = 8, 32, 60, 92
    ry0 = hy + TH
    for i, (name, size, dest, why) in enumerate(ROWS):
        y = ry0 + i * ROW
        decided = SCAN0 + (SCAN1 - SCAN0) * (i + 0.6) / n
        out = MOVE + i * 0.8
        row = []
        if i % 2:
            row.append(f'<rect x="{mx}" y="{y}" width="{mw}" height="{ROW}" fill="{c["bar"]}"/>')
        row.append(t(CN, y + 21, name, "mono", 13, c["wtext"]))
        row.append(t(CS, y + 21, size, "text", 13.5, c["wtext2"]))
        row.append(f'<g class="p{i}">{t(CD, y + 21, "Not sorted yet", "text", 13.5, c["wtext2"])}</g>')
        bw = width(why, "text-m", 12) + 16
        badge = (f'<rect x="{CW - bw:.1f}" y="{y + 7}" width="{bw:.1f}" height="19" rx="9.5" '
                 f'fill="{c["tint"] if why == "AI" else c["tint_soft"]}"/>'
                 + t(CW - bw / 2, y + 20.5, why, "text-m", 12, c["on_tint"] if why == "AI" else c["tint_ink"], "middle"))
        row.append(f'<g class="d{i}">{t(CD, y + 21, dest, "text-m", 14, c["tint_ink"])}{badge}</g>')
        b.append(f'<g class="r{i}">{"".join(row)}</g>')
        css.append(anim(f"p{i}", f"p{i}", [(0, "opacity:1"), (decided - 1.2, "opacity:1"), (decided, "opacity:0"),
                                           (BACK + 2, "opacity:0"), (BACK + 4, "opacity:1"), (100, "opacity:1")]))
        css.append(anim(f"d{i}", f"d{i}", [(0, "opacity:0;transform:translateX(-6px)"), (decided, "opacity:0;transform:translateX(-6px)"),
                                           (decided + 2, "opacity:1;transform:none"), (BACK + 2, "opacity:1;transform:none"),
                                           (BACK + 3, "opacity:0;transform:none"), (100, "opacity:0")]))
        css.append(anim(f"r{i}", f"r{i}", [(0, "opacity:1;transform:none"), (out, "opacity:1;transform:none"),
                                           (out + 3, "opacity:0;transform:translateX(36px)"), (BACK, "opacity:0;transform:translateX(36px)"),
                                           (BACK + 0.1, "opacity:0;transform:none"), (BACK + 3, "opacity:1;transform:none"), (100, "opacity:1")]))
    # scan line
    sh = n * ROW
    b.append(f'<rect class="scan" x="{mx}" y="{ry0}" width="{mw}" height="2" fill="{c["tint"]}"/>')
    css.append(anim("scan", "scan", [(0, "opacity:0;transform:none"), (SCAN0, "opacity:0;transform:none"), (SCAN0 + .5, "opacity:1"),
                                     (SCAN1, f"opacity:1;transform:translateY({sh - 2}px)"), (SCAN1 + 1, f"opacity:0;transform:translateY({sh - 2}px)"),
                                     (100, f"opacity:0;transform:translateY({sh - 2}px)")]))
    # empty-state note after the move
    b.append(f'<g class="empty">{t(mx + mw / 2, ry0 + sh / 2 - 4, "Downloads is tidy.", "display-m", 30, c["wtext"], "middle")}'
             f'{t(mx + mw / 2, ry0 + sh / 2 + 26, "8 files moved into Documents › Organizy", "text", 14.5, c["wtext2"], "middle")}</g>')
    css.append(anim("empty", "empty", [(0, "opacity:0"), (MOVE + 9, "opacity:0"), (MOVE + 12, "opacity:1"), (BACK - 3, "opacity:1"),
                                      (BACK - 1, "opacity:0"), (100, "opacity:0")]))
    # footer
    fy = ry0 + sh
    b.append(f'<rect x="{mx}" y="{fy}" width="{mw}" height="1" fill="{c["wline"]}"/>')
    msgs = [("8 files in Downloads", [(0, 1), (SCAN0, 1), (SCAN0 + 1, 0), (BACK + 2, 0), (BACK + 3, 1), (100, 1)]),
            ("Reading names and contents…", [(0, 0), (SCAN0 + 1, 0), (SCAN0 + 2, 1), (SCAN1, 1), (SCAN1 + 1, 0), (100, 0)]),
            ("8 files will move. Nothing moves until you click.", [(0, 0), (SCAN1 + 1, 0), (SCAN1 + 2, 1), (MOVE, 1), (MOVE + 1, 0), (100, 0)]),
            ("Moved 8 files. Undo anytime from History.", [(0, 0), (MOVE + 1, 0), (MOVE + 2, 1), (BACK + 2, 1), (BACK + 3, 0), (100, 0)])]
    for k, (msg, frames) in enumerate(msgs):
        b.append(f'<g class="m{k}">{t(mx + 18, fy + 31, msg, "text", 14, c["wtext2"])}</g>')
        css.append(anim(f"m{k}", f"m{k}", [(p, f"opacity:{o}") for p, o in frames]))
    mvw = width("Move Files", "text-m", 13.5) + 26
    b.append(f'<g class="btn"><rect x="{bx - mvw:.1f}" y="{fy + 12}" width="{mvw:.1f}" height="26" rx="6" fill="{c["tint"]}"/>'
             + t(bx - mvw / 2, fy + 30, "Move Files", "text-m", 13.5, c["on_tint"], "middle") + "</g>")
    css.append(anim("btn", "btn", [(0, "opacity:.45;transform:none"), (SCAN1, "opacity:.45;transform:none"), (SCAN1 + 1, "opacity:1"),
                                   (MOVE - 3, "opacity:1;transform:none"), (MOVE - 2, "opacity:1;transform:scale(.94)"),
                                   (MOVE - 1, "opacity:1;transform:none"), (MOVE + 1, "opacity:.45"), (100, "opacity:.45")],
                    "transform-box:fill-box;transform-origin:center"))
    b.append("</g>")
    return svg(W, H, "".join(b), ["display-m", "text", "text-m", "mono"], "".join(css),
               "Organizy sorting a Downloads folder: it reads eight files, suggests a folder for each with the reason, "
               "Rule or AI, and moves them only after you click Move Files.")


def main():
    OUT.mkdir(exist_ok=True)
    for theme, c in THEMES.items():
        (OUT / f"hero-{theme}.svg").write_text(hero(c))
        (OUT / f"app-{theme}.svg").write_text(window(c))
    print("built", sorted(p.name for p in OUT.glob("*.svg")))


if __name__ == "__main__":
    main()
