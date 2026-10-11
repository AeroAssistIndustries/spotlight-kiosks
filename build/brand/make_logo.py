"""CityPulse Kiosks logo system. Writes final SVGs into out/."""
import brandkit as k, re, os, math
import fontTools.svgLib.path as sp
from fontTools.pens.boundsPen import BoundsPen
NAVY="#0F1C2B"; TEAL="#22C7B6"; SLATE="#4A5C70"; WHITE="#FFFFFF"; MIST="#B5C2CF"
WF="BricolageGrotesque"; WAX={"wght":700,"opsz":96,"wdth":100}; WTR=-0.018
os.makedirs("out", exist_ok=True)
def bounds(d):
    bp=BoundsPen(None); sp.parse_path(d,bp); return bp.bounds
def contours(d): return [c.strip() for c in re.split(r'(?=M)', d) if c.strip()]
def arc(cx,cy,r,a0,a1):
    x0=cx+r*math.cos(math.radians(a0)); y0=cy-r*math.sin(math.radians(a0))
    x1=cx+r*math.cos(math.radians(a1)); y1=cy-r*math.sin(math.radians(a1))
    large=1 if (a1-a0)%360>180 else 0
    return f"M{x0:.2f} {y0:.2f}A{r:.2f} {r:.2f} 0 {large} 0 {x1:.2f} {y1:.2f}"
def word(size, x=0, base=0):
    """Returns (letters path, dot (cx,cy,r), advance, ink bounds)."""
    d,w,b=k.text_path("CityPulse",WF,size,WAX,WTR,x=x,baseline=base)
    info=[(c,bounds(c)) for c in contours(d)]
    dot=min((t for t in info if (t[1][3]-t[1][1])<size*0.2), key=lambda t:t[1][1])
    rest=" ".join(c for c,bb in info if c is not dot[0])
    bb=dot[1]; r=max(bb[2]-bb[0],bb[3]-bb[1])/2*1.1
    return rest,((bb[0]+bb[2])/2,(bb[1]+bb[3])/2,r),w,b
def ripple(cx,cy,R,arcs=2,gap=76,col=NAVY,dot=TEAL):
    """The icon: a dot and open rings forming a C. R = outer radius to stroke edge."""
    sw=R*0.215; g=""
    rs=[R-sw/2] if arcs==1 else [R-sw/2, R-sw/2-sw*1.85]
    for r in rs: g+=f'<path d="{arc(cx,cy,r,gap/2,360-gap/2)}" fill="none" stroke="{col}" stroke-width="{sw:.2f}" stroke-linecap="round"/>'
    dr=sw*(1.0 if arcs==2 else 1.25)
    g+=f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{dr:.2f}" fill="{dot}"/>'
    return g
def svg(w,h,body,label="CityPulse Kiosks"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{label}">{body}</svg>'
def lockup(ink=NAVY, sub=SLATE, dot=TEAL, descriptor=True, mode="under"):
    S=100; pad=4
    rest,(cx,cy,r),adv,b=word(S,0,0)
    x0=b[0]; top=min(b[1],cy-r)
    body=f'<path d="{rest}" fill="{ink}"/><circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{dot}" class="cp-dot"/>'
    h=b[3]-top; W=b[2]-x0
    if descriptor and mode=="under":
        fs=27; d0,w0,b0=k.text_path("KIOSKS","InstrumentSans",fs,{"wght":600,"wdth":100},0.26,x=0)
        right=b[2]-1
        dk,wk,bk=k.text_path("KIOSKS","InstrumentSans",fs,{"wght":600,"wdth":100},0.26,x=right-b0[2],baseline=fs*1.5)
        body+=f'<path d="{dk}" fill="{sub}"/>'; h=max(b[3],bk[3])-top
    if descriptor and mode=="right":
        fs=30
        x=b[2]+22
        body+=f'<rect x="{x:.2f}" y="-62" width="3" height="56" fill="{sub}" opacity=".45"/>'
        dk,wk,bk=k.text_path("KIOSKS","InstrumentSans",fs,{"wght":600,"wdth":100},0.16,x=x+22,baseline=-23)
        body+=f'<path d="{dk}" fill="{sub}"/>'; W=bk[2]-x0
    return svg(W+pad*2,h+pad*2,f'<g transform="translate({pad-x0:.2f},{pad-top:.2f})">{body}</g>')
open("out/logo.svg","w").write(lockup(mode="right"))
open("out/logo-light.svg","w").write(lockup(WHITE,MIST,mode="right"))
open("out/logo-on-teal.svg","w").write(lockup(NAVY,NAVY,WHITE,mode="right"))
open("out/logo-stacked.svg","w").write(lockup())
open("out/logo-stacked-light.svg","w").write(lockup(WHITE,MIST))
open("out/logo-compact.svg","w").write(lockup(descriptor=False))
open("out/logo-compact-light.svg","w").write(lockup(WHITE,MIST,descriptor=False))
# icon (transparent), app tile, favicon
open("out/logo-mark.svg","w").write(svg(128,128,ripple(64,64,58),"CityPulse"))
open("out/logo-mark-light.svg","w").write(svg(128,128,ripple(64,64,58,col=WHITE),"CityPulse"))
tile=lambda bg,fg,dt,arcs=2: f'<rect width="128" height="128" rx="30" fill="{bg}"/>'+ripple(67,64,40 if arcs==2 else 42,arcs,col=fg,dot=dt)
open("out/app-icon.svg","w").write(svg(128,128,tile(NAVY,WHITE,TEAL),"CityPulse"))
open("out/favicon.svg","w").write(svg(128,128,tile(NAVY,WHITE,TEAL,1),"CityPulse"))
print("ok")
