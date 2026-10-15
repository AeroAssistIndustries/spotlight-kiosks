"""Landmark Digital — new logo system, designed to match the site.
Mark: a geometric L whose foot runs in the site gradient (cyan → violet) with a signal dot above the corner —
the landmark on the map. Wordmark: Bricolage Grotesque (the site's display face). Writes out/."""
import brandkit as k, os
NAVY="#0B1430"; CYAN="#17D9C8"; VIOLET="#6C5CFF"; WHITE="#FFFFFF"; MIST="#B9C6E6"
WF="BricolageGrotesque"
os.makedirs("out", exist_ok=True)
_gid = [0]

def mark(x=0, y=0, s=1.0, ink=NAVY, grad=True):
    """L monogram in a 100x100 box."""
    _gid[0] += 1; g = f"lmg{_gid[0]}"
    defs = f'<defs><linearGradient id="{g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{CYAN}"/><stop offset="1" stop-color="{VIOLET}"/></linearGradient></defs>' if grad else ""
    fill = f"url(#{g})" if grad else ink
    stem = f'<rect x="14" y="10" width="20" height="78" rx="10" fill="{ink}"/>'
    foot = f'<rect x="14" y="68" width="74" height="20" rx="10" fill="{fill}"/>'
    dot  = f'<circle cx="74" cy="28" r="12" fill="{fill}" class="lm-dot"/>'
    ring = f'<circle cx="74" cy="28" r="20" fill="none" stroke="{fill}" stroke-width="3" opacity=".35"/>'
    return f'{defs}<g transform="translate({x:.2f},{y:.2f}) scale({s:.4f})">{ring}{dot}{foot}{stem}</g>'

def svg(w, h, body, label="Landmark Digital"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">{body}</svg>'

def wordmark(size, c1, c2, x=0, digital=True):
    d1, w1, b1 = k.text_path("Landmark", WF, size, {"wght":700,"opsz":96,"wdth":100}, -0.025, x=x, baseline=0)
    body = f'<path d="{d1}" fill="{c1}"/>'; right = b1[2]; top = b1[1]; bot = b1[3]
    if digital:
        d2, w2, b2 = k.text_path("Digital", WF, size, {"wght":500,"opsz":96,"wdth":100}, -0.01, x=right + size*0.22, baseline=0)
        body += f'<path d="{d2}" fill="{c2}"/>'; right = b2[2]; bot = max(bot, b2[3])
    return body, right, top, bot

def horizontal(c1=NAVY, c2=VIOLET, ink=NAVY, digital=True, grad=True):
    S = 100; pad = 6
    wb, right, top, bot = wordmark(S, c1, c2, 0, digital)
    cap = -top; mh = cap*1.18; s = mh/100; gap = 20
    wb, right, top, bot = wordmark(S, c1, c2, 100*s + gap, digital)
    my = -cap/2 - mh/2                      # mark centred on the cap height (baseline = 0)
    y0 = min(top, my); y1 = max(bot, my + mh); H = y1 - y0
    body = f'<g transform="translate(0,{-y0:.2f})">{mark(0, my, s, ink, grad)}{wb}</g>'
    return svg(right + pad*2, H + pad*2, f'<g transform="translate({pad},{pad})">{body}</g>')

def stacked(c1=NAVY, c2=VIOLET, ink=NAVY, grad=True):
    S = 84; pad = 10
    wb, right, top, bot = wordmark(S, c1, c2, 0, True)
    W = right; ms = 1.9; mw = 100*ms; gapy = 26
    body = mark((W-mw)/2, 0, ms, ink, grad) + f'<g transform="translate(0,{100*ms + gapy - top:.2f})">{wb}</g>'
    return svg(W + pad*2, 100*ms + gapy + (bot-top) + pad*2, f'<g transform="translate({pad},{pad})">{body}</g>')

open("out/logo.svg","w").write(horizontal())
open("out/logo-light.svg","w").write(horizontal(WHITE, CYAN, WHITE))
open("out/logo-on-teal.svg","w").write(horizontal(NAVY, NAVY, NAVY, grad=False))
open("out/logo-stacked.svg","w").write(stacked())
open("out/logo-stacked-light.svg","w").write(stacked(WHITE, CYAN, WHITE))
open("out/logo-compact.svg","w").write(horizontal(digital=False))
open("out/logo-compact-light.svg","w").write(horizontal(WHITE, CYAN, WHITE, digital=False))
open("out/logo-mark.svg","w").write(svg(100, 100, mark(), "Landmark"))
open("out/logo-mark-light.svg","w").write(svg(100, 100, mark(ink=WHITE), "Landmark"))
tile = lambda: f'<rect width="128" height="128" rx="30" fill="{NAVY}"/>' + mark(14, 14, 1.0, WHITE)
open("out/app-icon.svg","w").write(svg(128,128, tile(), "Landmark"))
open("out/favicon.svg","w").write(svg(128,128, tile(), "Landmark"))
print("ok")
