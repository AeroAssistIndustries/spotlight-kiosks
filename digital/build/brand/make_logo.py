"""Landmark Digital logo system — a modern redraw of the original "ld" monogram.
The lowercase l (plum) flows into the bowl of the d (navy): one continuous landmark.
Writes final SVGs into out/."""
import brandkit as k, os
PLUM="#7D3C66"; NAVY="#1D3A5F"; PLUM_L="#D27DB0"; WHITE="#FFFFFF"; MIST="#B9C6E6"; SLATE="#4A5C70"
WF="BricolageGrotesque"
os.makedirs("out", exist_ok=True)

def monogram(x=0, y=0, s=1.0, l=PLUM, d=NAVY, dot=None):
    """ld mark in a 100x100 box. Stroke-built so it scales crisply."""
    sw = 15
    # d: bowl + right stem (navy)
    bowl = f'<circle cx="60" cy="66" r="24" fill="none" stroke="{d}" stroke-width="{sw}"/>'
    stem = f'<path d="M84 8 V 82" fill="none" stroke="{d}" stroke-width="{sw}" stroke-linecap="round"/>'
    # l: tall stem curving into the bottom of the bowl (plum)
    ell = f'<path d="M19 6 V 54 C19 74 34 90 60 90" fill="none" stroke="{l}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
    # signal dot in the bowl (optional accent)
    pip = f'<circle cx="60" cy="66" r="6" fill="{dot}" class="lm-dot"/>' if dot else ""
    return f'<g transform="translate({x:.2f},{y:.2f}) scale({s:.4f})">{stem}{bowl}{ell}{pip}</g>'

def svg(w, h, body, label="Landmark Digital"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">{body}</svg>'

def words(size, c1, c2, x=0, gap=0.07, two=True):
    """LANDMARK over DIGITAL, left-aligned. Returns (body, width, height)."""
    ax = {"wght":800,"opsz":96,"wdth":100}
    d1, w1, b1 = k.text_path("LANDMARK", WF, size, ax, -0.01, x=x, baseline=0)
    body = f'<path d="{d1}" fill="{c1}"/>'
    cap = -b1[1]; W = b1[2]; H = cap
    if two:
        s2 = size*0.98; base2 = cap*(1+gap)+cap*0.98
        # justify DIGITAL to LANDMARK's width by solving tracking from two measurements
        _, _, bA = k.text_path("DIGITAL", WF, s2, ax, 0.0, x=x, baseline=base2)
        _, _, bB = k.text_path("DIGITAL", WF, s2, ax, 0.1, x=x, baseline=base2)
        target = b1[2]-b1[0]; wA = bA[2]-bA[0]; wB = bB[2]-bB[0]
        tr = 0.1*(target-wA)/(wB-wA)
        d2, w2, b2 = k.text_path("DIGITAL", WF, s2, ax, tr, x=x, baseline=base2)
        body += f'<path d="{d2}" fill="{c2}"/>'; W = max(W, b2[2]); H = b2[3]
    return body, W, H, cap

def horizontal(c1=PLUM, c2=NAVY, dot=None, two=True):
    pad = 6; size = 54
    wb, W, H, cap = words(size, c1, c2, x=0, two=two)
    tot = (cap + H) if two else cap           # total wordmark height
    mh = tot*1.12 if two else cap*1.75        # monogram height
    s = mh/92; tx = 100*s*0.92 + 16
    wb, W, H, cap = words(size, c1, c2, x=tx, two=two)
    box = max(tot, mh)
    body = monogram(0, (box-mh)/2 - 4*s, s, c1, c2, dot) + f'<g transform="translate(0,{(box-tot)/2 + cap:.2f})">{wb}</g>'
    return svg(W+pad*2, box+pad*2, f'<g transform="translate({pad},{pad})">{body}</g>')

def stacked(c1=PLUM, c2=NAVY, dot=None):
    pad = 8; size = 46
    wb, W, H, cap = words(size, c1, c2, x=0)
    ms = 1.5; mw = 100*ms; top = 108*ms
    body = monogram((W-mw)/2, 0, ms, c1, c2, dot) + f'<g transform="translate(0,{top+cap:.2f})">{wb}</g>'
    return svg(W+pad*2, top+cap+H+pad*2, f'<g transform="translate({pad},{pad})">{body}</g>')

open("out/logo.svg","w").write(horizontal())
open("out/logo-light.svg","w").write(horizontal(WHITE, MIST))
open("out/logo-on-teal.svg","w").write(horizontal(NAVY, NAVY))
open("out/logo-stacked.svg","w").write(stacked())
open("out/logo-stacked-light.svg","w").write(stacked(WHITE, MIST))
open("out/logo-compact.svg","w").write(horizontal(two=False))
open("out/logo-compact-light.svg","w").write(horizontal(WHITE, MIST, two=False))
open("out/logo-mark.svg","w").write(svg(100, 100, monogram(0, 0, 1), "Landmark"))
open("out/logo-mark-light.svg","w").write(svg(100, 100, monogram(0, 0, 1, WHITE, MIST), "Landmark"))
tile = lambda bg, l, d: f'<rect width="128" height="128" rx="30" fill="{bg}"/>' + monogram(20, 18, 0.9, l, d)
open("out/app-icon.svg","w").write(svg(128,128, tile(NAVY, PLUM_L, WHITE), "Landmark"))
open("out/favicon.svg","w").write(svg(128,128, tile(NAVY, PLUM_L, WHITE), "Landmark"))
print("ok")
