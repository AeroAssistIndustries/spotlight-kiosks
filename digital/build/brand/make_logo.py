"""Landmark Digital logo system. Writes final SVGs into out/.
Icon: a map pin — the landmark — with a glowing teal signal dot. Wordmark: Bricolage Grotesque."""
import brandkit as k, os
NAVY="#0F1C2B"; TEAL="#22C7B6"; SLATE="#4A5C70"; WHITE="#FFFFFF"; MIST="#B5C2CF"
WF="BricolageGrotesque"; WAX={"wght":700,"opsz":96,"wdth":100}; WTR=-0.022
os.makedirs("out", exist_ok=True)

def pin(cx, cy, R, col=NAVY, dot=TEAL, sw=None):
    """Map-pin outline centred on the head at (cx,cy) with head radius R; tip at cy+R*1.7."""
    sw = sw or R*0.3
    tip = cy + R*1.7
    d = (f"M{cx:.2f} {tip:.2f} C{cx:.2f} {tip:.2f} {cx-R:.2f} {cy+R*0.72:.2f} {cx-R:.2f} {cy:.2f} "
         f"A{R:.2f} {R:.2f} 0 1 1 {cx+R:.2f} {cy:.2f} C{cx+R:.2f} {cy+R*0.72:.2f} {cx:.2f} {tip:.2f} {cx:.2f} {tip:.2f} Z")
    return (f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{sw:.2f}" stroke-linejoin="round"/>'
            f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{R*0.36:.2f}" fill="{dot}" class="lm-dot"/>')

def svg(w, h, body, label="Landmark Digital"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">{body}</svg>'

def lockup(ink=NAVY, sub=SLATE, dot=TEAL, descriptor=True, mode="right"):
    S = 100; pad = 4
    d, adv, b = k.text_path("Landmark", WF, S, WAX, WTR, x=0, baseline=0)
    cap = -b[1]                       # cap height above baseline
    R = cap*0.30; cx = R*1.15+R*0.15; cy = -cap + R*1.15
    icon = pin(cx, cy, R, ink, dot)
    tx = cx + R*1.15 + R*0.55
    d, adv, b = k.text_path("Landmark", WF, S, WAX, WTR, x=tx, baseline=0)
    body = icon + f'<path d="{d}" fill="{ink}"/>'
    x0 = 0; top = min(b[1], cy-R-R*0.15); W = b[2]; H = max(b[3], cy+R*1.7+R*0.15)
    if descriptor and mode == "under":
        fs = 27
        d0, w0, b0 = k.text_path("DIGITAL", "InstrumentSans", fs, {"wght":600,"wdth":100}, 0.26, x=0)
        dk, wk, bk = k.text_path("DIGITAL", "InstrumentSans", fs, {"wght":600,"wdth":100}, 0.26, x=b[2]-b0[2], baseline=fs*1.5)
        body += f'<path d="{dk}" fill="{sub}"/>'; H = max(H, bk[3])
    if descriptor and mode == "right":
        fs = 30; x = b[2] + 22
        body += f'<rect x="{x:.2f}" y="{-cap+6:.2f}" width="3" height="{cap-6:.2f}" fill="{sub}" opacity=".45"/>'
        dk, wk, bk = k.text_path("DIGITAL", "InstrumentSans", fs, {"wght":600,"wdth":100}, 0.16, x=x+22, baseline=-cap*0.33)
        body += f'<path d="{dk}" fill="{sub}"/>'; W = bk[2]
    h = H - top
    return svg(W+pad*2, h+pad*2, f'<g transform="translate({pad-x0:.2f},{pad-top:.2f})">{body}</g>')

open("out/logo.svg","w").write(lockup(mode="right"))
open("out/logo-light.svg","w").write(lockup(WHITE, MIST, mode="right"))
open("out/logo-on-teal.svg","w").write(lockup(NAVY, NAVY, WHITE, mode="right"))
open("out/logo-stacked.svg","w").write(lockup(mode="under"))
open("out/logo-stacked-light.svg","w").write(lockup(WHITE, MIST, mode="under"))
open("out/logo-compact.svg","w").write(lockup(descriptor=False))
open("out/logo-compact-light.svg","w").write(lockup(WHITE, MIST, descriptor=False))
open("out/logo-mark.svg","w").write(svg(128,128, pin(64,50,36), "Landmark"))
open("out/logo-mark-light.svg","w").write(svg(128,128, pin(64,50,36,col=WHITE), "Landmark"))
tile = lambda bg, fg, dt: f'<rect width="128" height="128" rx="30" fill="{bg}"/>' + pin(64, 52, 30, fg, dt)
open("out/app-icon.svg","w").write(svg(128,128, tile(NAVY, WHITE, TEAL), "Landmark"))
open("out/favicon.svg","w").write(svg(128,128, tile(NAVY, WHITE, TEAL), "Landmark"))
print("ok")
