"""Landmark Digital — faithful HD redraw of the original logo (ld monogram + LANDMARK / DIGITAL / SOLUTIONS),
in red and black. Writes out/original-*.svg"""
import brandkit as k, os
RED="#C8102E"; BLACK="#111111"; WHITE="#FFFFFF"; GREY="#D9D9D9"
MF="Montserrat"
os.makedirs("out", exist_ok=True)

def monogram(x, y, s, l=RED, d=BLACK):
    """Original proportions: tall l (left) hooking under into the d bowl; d stem on the right, slightly taller."""
    sw = 19
    stem = f'<path d="M88 6 V 86" fill="none" stroke="{d}" stroke-width="{sw}" stroke-linecap="round"/>'
    bowl = f'<circle cx="62" cy="70" r="26" fill="none" stroke="{d}" stroke-width="{sw}"/>'
    ell  = f'<path d="M16 8 V 62 C16 84 34 96 62 96" fill="none" stroke="{l}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
    return f'<g transform="translate({x:.2f},{y:.2f}) scale({s:.4f})">{ell}{stem}{bowl}</g>'

def line(text, size, wght, color, tracking, target=None, baseline=0):
    ax = {"wght": wght}
    if target:  # solve tracking so the line is exactly `target` wide
        _, _, a = k.text_path(text, MF, size, ax, 0.0, baseline=baseline)
        _, _, b = k.text_path(text, MF, size, ax, 0.2, baseline=baseline)
        tracking = 0.2*(target-(a[2]-a[0]))/((b[2]-b[0])-(a[2]-a[0]))
    d, w, bb = k.text_path(text, MF, size, ax, tracking, baseline=baseline)
    return d, bb, color

def build(l=RED, d=BLACK, sub=None, solutions=True):
    sub = sub or d
    S = 60
    d1, b1, c1 = line("LANDMARK", S, 800, l, -0.01)
    W = b1[2]-b1[0]; cap = -b1[1]
    y2 = cap*0.72 + cap*0.98
    d2, b2, c2 = line("DIGITAL", S*0.98, 800, d, 0, target=W, baseline=y2)
    rows = [(d1, b1, c1), (d2, b2, c2)]
    bottom = b2[3]
    if solutions:
        y3 = y2 + cap*0.30 + cap*0.56
        d3, b3, c3 = line("SOLUTIONS", S*0.5, 400, sub, 0, target=W*0.96, baseline=y3)
        rows.append((d3, b3, c3)); bottom = b3[3]
    ms = W/100*0.64; mw = 100*ms; mh = 100*ms
    top = mh + cap*0.40
    body = monogram((W-mw)/2 + 2*ms, 0, ms, l, d)
    body += f'<g transform="translate({-b1[0]:.2f},{top+cap:.2f})">' + "".join(f'<path d="{dd}" fill="{c}"/>' for dd, _, c in rows) + "</g>"
    H = top + cap + bottom; pad = 24
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W+pad*2:.0f} {H+pad*2:.0f}" width="{W+pad*2:.0f}" height="{H+pad*2:.0f}" role="img" aria-label="Landmark Digital"><g transform="translate({pad},{pad})">{body}</g></svg>'

def horizontal(l=RED, d=BLACK, two=True):
    S = 60
    d1, b1, c1 = line("LANDMARK", S, 800, l, -0.01); W = b1[2]-b1[0]; cap = -b1[1]
    rows = [(d1, b1, c1)]; bottom = 0
    if two:
        y2 = cap*0.72 + cap*0.98
        d2, b2, c2 = line("DIGITAL", S*0.98, 800, d, 0, target=W, baseline=y2); rows.append((d2, b2, c2)); bottom = b2[3]
    tot = cap + bottom; ms = tot/100*1.08; mw = 100*ms; gap = 30
    body = monogram(0, (tot-100*ms)/2, ms, l, d) + f'<g transform="translate({mw+gap-b1[0]:.2f},{cap:.2f})">' + "".join(f'<path d="{dd}" fill="{c}"/>' for dd, _, c in rows) + "</g>"
    TW = mw + gap + W; pad = 6
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TW+pad*2:.0f} {tot+pad*2:.0f}" width="{TW+pad*2:.0f}" height="{tot+pad*2:.0f}" role="img" aria-label="Landmark Digital"><g transform="translate({pad},{pad})">{body}</g></svg>'
open("out/original-horizontal.svg","w").write(horizontal())
open("out/original-horizontal-light.svg","w").write(horizontal(RED, WHITE))
open("out/original-compact.svg","w").write(horizontal(two=False))
open("out/original-compact-light.svg","w").write(horizontal(RED, WHITE, two=False))
open("out/original.svg","w").write(build())
open("out/original-light.svg","w").write(build(RED, WHITE, GREY))
open("out/original-no-solutions.svg","w").write(build(solutions=False))
open("out/original-mark.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">{monogram(0,0,1)}</svg>')
print("ok")

tile = lambda bg, l, d: f'<rect width="128" height="128" rx="30" fill="{bg}"/>' + monogram(16, 14, 0.96, l, d)
open("out/original-app-icon.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">{tile(BLACK, RED, WHITE)}</svg>')
open("out/original-mark-light.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">{monogram(0,0,1,RED,WHITE)}</svg>')
