"""Six logo concepts for Landmark Digital, each as mark + lockup, light and dark. Writes out/concepts/*.svg"""
import brandkit as k, os
NAVY="#0B1430"; CYAN="#17D9C8"; VIOLET="#6C5CFF"; PINK="#F23FC7"; WHITE="#FFFFFF"; MIST="#B9C6E6"
WF="BricolageGrotesque"; OUT="out/concepts"; os.makedirs(OUT, exist_ok=True)
_g=[0]
def grad(vertical=False, c1=CYAN, c2=VIOLET):
    _g[0]+=1; i=f"g{_g[0]}"
    x2,y2=("0","1") if vertical else ("1","0")
    return i, f'<linearGradient id="{i}" x1="0" y1="0" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>'

# ---- marks: each returns (defs, body) in a 100x100 box; ink = solid colour for dark/light variants
def m_signal(ink):      # A. L with signal dot (current)
    i,d=grad(); f=f"url(#{i})"
    return d, f'<circle cx="74" cy="28" r="20" fill="none" stroke="{f}" stroke-width="3" opacity=".35"/><circle cx="74" cy="28" r="12" fill="{f}"/><rect x="14" y="68" width="74" height="20" rx="10" fill="{f}"/><rect x="14" y="10" width="20" height="78" rx="10" fill="{ink}"/>'
def m_pin(ink):         # B. map pin with an L cut out of it
    i,d=grad(True); f=f"url(#{i})"
    pin="M50 96 C50 96 16 60 16 40 A34 34 0 1 1 84 40 C84 60 50 96 50 96 Z"
    return d, f'<path d="{pin}" fill="{f}"/><path d="M40 24 V 54 H 62" fill="none" stroke="{WHITE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'
def m_beacon(ink):      # C. L corner with rising signal arcs (the beacon)
    i,d=grad(); f=f"url(#{i})"
    arcs="".join(f'<path d="M{40+r*0.0:.0f} {70-r:.0f} A{r} {r} 0 0 1 {40+r:.0f} 70" fill="none" stroke="{f}" stroke-width="9" stroke-linecap="round" opacity="{o}"/>' for r,o in [(22,1),(40,.7),(58,.4)])
    return d, f'<rect x="12" y="10" width="18" height="80" rx="9" fill="{ink}"/><rect x="12" y="72" width="54" height="18" rx="9" fill="{ink}"/>{arcs}'
def m_ld(ink):          # D. L + D merged monogram
    i,d=grad(True); f=f"url(#{i})"
    return d, f'<path d="M48 14 H 60 A 36 36 0 0 1 60 86 H 48 Z" fill="{f}"/><rect x="12" y="10" width="20" height="78" rx="10" fill="{ink}"/><rect x="12" y="68" width="48" height="20" rx="10" fill="{ink}"/>'
def m_flag(ink):        # E. landmark flag: stem + gradient pennant
    i,d=grad(); f=f"url(#{i})"
    return d, f'<rect x="20" y="8" width="16" height="84" rx="8" fill="{ink}"/><path d="M36 14 H 80 A 8 8 0 0 1 86 27 L 70 38 L 86 49 A 8 8 0 0 1 80 62 H 36 Z" fill="{f}"/>'
def m_tile(ink):        # F. rounded-square tile with a bold white L and gradient corner dot
    i,d=grad(True); f=f"url(#{i})"
    return d, f'<rect x="6" y="6" width="88" height="88" rx="24" fill="{ink}"/><path d="M30 26 V 74 H 70" fill="none" stroke="{WHITE}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="68" cy="32" r="9" fill="{f}"/>'

CONCEPTS=[("A","Signal L",m_signal),("B","Pin L",m_pin),("C","Beacon",m_beacon),("D","LD monogram",m_ld),("E","Landmark flag",m_flag),("F","Tile L",m_tile)]

def wordmark(size, c1, c2, x, style):
    ax=lambda w:{"wght":w,"opsz":96,"wdth":100}
    if style=="two":
        d1,_,b1=k.text_path("Landmark",WF,size,ax(700),-0.025,x=x,baseline=0); d2,_,b2=k.text_path("Digital",WF,size,ax(500),-0.01,x=b1[2]+size*0.22,baseline=0)
        return f'<path d="{d1}" fill="{c1}"/><path d="{d2}" fill="{c2}"/>', b2[2], b1[1], max(b1[3],b2[3])
    if style=="caps":
        d1,_,b1=k.text_path("LANDMARK",WF,size*0.86,ax(800),0.02,x=x,baseline=0)
        d2,_,b2=k.text_path("DIGITAL","InstrumentSans",size*0.34,{"wght":600,"wdth":100},0.32,x=x+1,baseline=size*0.42)
        return f'<path d="{d1}" fill="{c1}"/><path d="{d2}" fill="{c2}"/>', max(b1[2],b2[2]), b1[1], b2[3]
    d1,_,b1=k.text_path("landmark",WF,size*1.04,ax(700),-0.03,x=x,baseline=0)
    d2,_,b2=k.text_path("digital","InstrumentSans",size*0.36,{"wght":500,"wdth":100},0.22,x=x+2,baseline=size*0.42)
    return f'<path d="{d1}" fill="{c1}"/><path d="{d2}" fill="{c2}"/>', max(b1[2],b2[2]), b1[1], b2[3]

def lockup(fn, dark, style="two"):
    ink = WHITE if dark else NAVY; c1 = WHITE if dark else NAVY; c2 = CYAN if dark else VIOLET
    S=60; defs,body=fn(ink)
    wb,right,top,bot=wordmark(S,c1,c2,0,style); cap=-top; mh=(bot-top)*1.1 if style!="two" else cap*1.2; s=mh/100
    wb,right,top,bot=wordmark(S,c1,c2,100*s+16,style)
    my=(top+bot)/2-mh/2; y0=min(top,my); y1=max(bot,my+mh); pad=10
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {right+pad*2:.0f} {y1-y0+pad*2:.0f}" width="{right+pad*2:.0f}" height="{y1-y0+pad*2:.0f}"><defs>{defs}</defs><g transform="translate({pad},{pad-y0:.2f})"><g transform="translate(0,{my:.2f}) scale({s:.4f})">{body}</g>{wb}</g></svg>'

def markonly(fn, dark):
    defs,body=fn(WHITE if dark else NAVY)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs>{defs}</defs>{body}</svg>'

for key,name,fn in CONCEPTS:
    for style in ("two","caps","lower"):
        open(f"{OUT}/{key}-{style}.svg","w").write(lockup(fn,False,style)); open(f"{OUT}/{key}-{style}-dark.svg","w").write(lockup(fn,True,style))
    open(f"{OUT}/{key}-mark.svg","w").write(markonly(fn,False)); open(f"{OUT}/{key}-mark-dark.svg","w").write(markonly(fn,True))
print("ok")
