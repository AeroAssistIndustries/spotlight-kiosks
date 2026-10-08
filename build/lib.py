"""Shared layout, components and content data for the Spotlight Kiosks site.
Pages use {R} as a placeholder for the relative path back to the site root."""
import html, os

SITE = "Spotlight Kiosks"
EMAIL = "sales@spotlightkiosks.com"
SUPPORT = "support@spotlightkiosks.com"
PHONE = "602-887-4058"
TEL = "+16028874058"
ADDR1 = "4750 S 44th Pl, Suite E20"
ADDR2 = "Phoenix, AZ 85040"
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = html.escape

# ---------------------------------------------------------------- icons
_IC = {
  "pin": '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  "spark": '<path d="M12 3c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7z"/>',
  "people": '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9" r="2.4"/><path d="M15.5 14c2.6 0 4.4 1.6 5 4.5"/>',
  "mega": '<path d="M3 10v4h3l7 4V6L6 10H3zM16 9a4 4 0 0 1 0 6"/>',
  "home": '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
  "screen": '<rect x="6" y="2.5" width="12" height="15" rx="1.5"/><path d="M12 17.5v3.5M8 21h8"/>',
  "chev": '<path d="M6 9l6 6 6-6"/>',
  "search": '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
  "phone": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
  "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  "tap": '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v3.5a6.5 6.5 0 0 1-6.5 6.5h-.6a6 6 0 0 1-4.6-2.2L4.6 14.6a1.6 1.6 0 0 1 2.4-2.1L9 14"/>',
  "chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  "trend": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  "upload": '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "dash": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13v4M12 12v5M16 14v3"/>',
  "users": '<circle cx="8" cy="8" r="3"/><path d="M2.5 19c.5-3 2.6-5 5.5-5s5 2 5.5 5"/><path d="M17 8v6M14 11h6"/>',
  "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "arrowl": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  "wrench": '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
}
def icon(name, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{_IC[name]}</svg>'

# ---------------------------------------------------------------- navigation
NAV = [
  ("link", "The kiosk", "kiosk/"),
  ("menu", "Advertise", "advertise", [
    ("Advertise with Spotlight", "advertise/", "Placements, pricing and how a campaign comes together", True),
    ("Pricing & calculator", "pricing/", "Annual rates and a multi-kiosk estimate"),
    ("Campaign planner", "campaign-planner/", "Build a brief step by step"),
    ("Creative studio", "creative-studio/", "Preview your message on the kiosk"),
    ("Campaign ideas", "campaign-ideas/", "Eight local playbooks to adapt"),
    ("Who you can reach", "audience/", "Visitor moments in each venue"),
    ("Market planning", "locations/", "Cities and regions in our plans"),
    ("For agencies", "agencies/", "Start with a client brief"),
  ]),
  ("menu", "For venues", "venues", [
    ("Host a kiosk", "hosts/", "The managed offering, at no cost for qualified venues", True),
    ("Venues overview", "venues/", "Where Spotlight fits"),
    ("Prepare your venue", "resources/host-preparation/", "What to have ready for a first call"),
    ("Hotels & hospitality", "venues/hotels/", "A useful lobby experience"),
    ("Golf & country clubs", "venues/golf/", "A concierge for the clubhouse"),
    ("Medical offices", "venues/medical/", "Information while visitors wait"),
    ("Car dealerships", "venues/automotive/", "Sales and service lounges"),
    ("Restaurants & venues", "venues/restaurants/", "Menus, events and local discovery"),
  ]),
  ("menu", "Resources", "resources", [
    ("All resources", "resources/", "Guides, tools and inspiration", True),
    ("How it works", "how-it-works/", "The advertiser and host journeys"),
    ("Media overview", "media-kit/", "The concept in one place"),
    ("First campaign guide", "resources/first-local-campaign/", "From goal to a useful brief"),
    ("Creative guide", "resources/screen-creative/", "A screen message people can read"),
    ("Measurement guide", "measurement/", "What the numbers mean"),
    ("Common questions", "faqs/", "Answers for advertisers and hosts"),
    ("Help & support", "support/", "For existing kiosks and campaigns"),
  ]),
  ("link", "About", "about/"),
]

def header(active):
    out = []
    for item in NAV:
        if item[0] == "link":
            _, label, href = item
            cur = ' aria-current="page"' if active == href else ""
            out.append(f'<a href="{{R}}{href}"{cur}>{label}</a>')
        else:
            _, label, key, links = item
            cur = " current" if active and active.startswith(key) or any(active == l[1] for l in links) else ""
            mid = f"menu-{key}"
            lis = "".join(
                f'<a href="{{R}}{l[1]}"{" class=\"mega-lead\"" if len(l) > 3 else ""}><b>{l[0]}</b><span>{l[2]}</span></a>'
                for l in links)
            out.append(f'<div class="nav-item{cur}"><button class="nav-btn" aria-expanded="false" aria-controls="{mid}">{label}{icon("chev","")}</button><div class="mega" id="{mid}">{lis}</div></div>')
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="{{R}}" aria-label="Spotlight Kiosks home"><img src="{{R}}assets/logo.png" alt="Spotlight Kiosks" width="517" height="320"></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="sr">Menu</span><i></i><i></i></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      {"".join(out)}
      <a class="btn btn-small header-cta" href="{{R}}#get-started">Get started — $399</a>
    </nav>
  </div>
</header>'''

def footer():
    col = lambda title, links: f'<div><h2>{title}</h2><nav aria-label="{title}">' + "".join(f'<a href="{{R}}{h}">{t}</a>' for t, h in links) + "</nav></div>"
    return f'''<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand"><img src="{{R}}assets/logo-light.png" alt="Spotlight Kiosks" width="517" height="320"><p>Turning wait time into opportunity. Smart kiosks, useful information and local connection.</p></div>
    {col("Explore Spotlight", [("The kiosk","kiosk/"),("Venues","venues/"),("Who you can reach","audience/"),("Market planning","locations/"),("How it works","how-it-works/"),("About us","about/")])}
    {col("Advertise", [("Advertising options","advertise/"),("Pricing & calculator","pricing/"),("Campaign planner","campaign-planner/"),("Creative studio","creative-studio/"),("Campaign ideas","campaign-ideas/"),("Measurement guide","measurement/"),("For agencies","agencies/")])}
    {col("Keep it useful", [("Request a kiosk","hosts/#inquiry"),("Guides & resources","resources/"),("Media overview","media-kit/"),("Common questions","faqs/"),("Contact Spotlight","contact/"),("Help & support","support/")])}
    <div class="footer-talk"><h2>Let's talk</h2>
      <a class="big" href="mailto:{EMAIL}">{EMAIL}</a><a class="big" href="tel:{TEL}">{PHONE}</a>
      <p class="footer-addr">{ADDR1}<br>{ADDR2}</p>
      <p class="socials"><a href="https://www.instagram.com/spotlightkiosks/" rel="noopener" target="_blank">Instagram</a><a href="https://www.linkedin.com/company/spotlight-kiosks/" rel="noopener" target="_blank">LinkedIn</a><a href="https://www.facebook.com/profile.php?id=61581139512802" rel="noopener" target="_blank">Facebook</a><a href="https://x.com/spotlightkiosks" rel="noopener" target="_blank">X</a></p>
    </div>
  </div>
  <div class="wrap footer-base"><span>© <span id="year">2026</span> Spotlight Kiosks. All rights reserved.</span><nav aria-label="Legal"><a href="{{R}}privacy/">Privacy Policy</a><a href="{{R}}terms/">Terms &amp; Conditions</a></nav></div>
</footer>'''

PAGES = []

def page(path, title, desc, body, active=None, kiosk=False, extra_js=()):
    """path like 'advertise/' or '' for home."""
    depth = path.count("/")
    root = "../" * depth if depth else "./"
    full_title = f"{title} | {SITE}" if path else f"{SITE} — {title}"
    doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(full_title)}</title>
<meta name="description" content="{e(desc)}">
<meta property="og:title" content="{e(full_title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{{R}}assets/kiosk-clubhouse.jpg">
<link rel="icon" href="{{R}}assets/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="{{R}}assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{R}}assets/styles.css">
</head>
<body>
{header(active or path)}
<main id="main">
{body}
</main>
{footer()}
{'<script src="{R}assets/kiosk.js"></script>' if kiosk else ''}
<script src="{{R}}assets/config.js"></script>
<script src="{{R}}assets/integrations.js"></script>
{''.join(f'<script src="{{R}}assets/{j}"></script>' for j in extra_js)}
<script src="{{R}}assets/site.js"></script>
</body>
</html>
'''
    doc = doc.replace("{R}", root)
    dest = os.path.join(OUT, path, "index.html")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        f.write(doc)
    PAGES.append(path)

# ---------------------------------------------------------------- components
def crumbs(trail):
    items = ['<li><a href="{R}">Home</a></li>']
    for label, href in trail[:-1]:
        items.append(f'<li><a href="{{R}}{href}">{label}</a></li>')
    items.append(f'<li aria-current="page">{trail[-1][0]}</li>')
    return f'<ol class="crumbs" aria-label="Breadcrumb">{"".join(items)}</ol>'

def btns(*items):
    out = []
    for it in items:
        label, href = it[0], it[1]
        kind = it[2] if len(it) > 2 else ""
        out.append(f'<a class="btn {kind}" href="{{R}}{href}">{label}</a>' if not href.startswith(("http", "mailto", "tel", "#")) else f'<a class="btn {kind}" href="{href}">{label}</a>')
    return f'<div class="btn-row">{"".join(out)}</div>'

def page_hero(trail, h1, lede, buttons="", aside="", dark=False):
    cls = "page-hero dark" if dark else "page-hero"
    aside_html = f'<div class="hero-aside">{aside}</div>' if aside else ""
    return f'''<section class="{cls}"><div class="wrap">{crumbs(trail)}
  <div class="hero-grid{'' if aside else ' solo'}"><div><h1>{h1}</h1><p class="lede">{lede}</p>{buttons}</div>{aside_html}</div>
</div></section>'''

def cta_band(h="Let's put your space in the spotlight.", p="Host a useful amenity. Reach your next customer. Start with a conversation."):
    return f'''<section class="cta-band"><div class="wrap cta-inner"><div><h2>{h}</h2><p>{p}</p></div>
  {btns(("Plan a campaign","campaign-planner/"),("Request a kiosk","hosts/#inquiry","btn-ghost"))}</div></section>'''

def section(inner, cls="", id=None):
    idattr = f' id="{id}"' if id else ""
    return f'<section class="section {cls}"{idattr}><div class="wrap">{inner}</div></section>'

def head(h2, p="", hid=None):
    hid_attr = f' id="{hid}"' if hid else ""
    return f'<div class="section-head"><h2{hid_attr}>{h2}</h2>{f"<p>{p}</p>" if p else ""}</div>'

def check_list(items):
    return '<ul class="check-list">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"

# mini kiosk illustration
TILEG = {
  "Dining": "linear-gradient(135deg,#7a3b1f,#c9773a)", "Amenities": "linear-gradient(135deg,#1f6f78,#7cc4c0)",
  "Local guide": "linear-gradient(120deg,#2b5876,#c2702f)", "Events": "linear-gradient(135deg,#2a2f5c,#8a64b0)",
  "Course guide": "linear-gradient(135deg,#1f5a32,#8fbf5a)", "Tee times": "linear-gradient(135deg,#2f6b34,#b7d36a)",
  "Check-in": "linear-gradient(135deg,#1b6ca8,#62b6cb)", "Pharmacy": "linear-gradient(135deg,#227a5c,#8ccfa6)",
  "Service": "linear-gradient(135deg,#2d3436,#e17055)", "Vehicles": "linear-gradient(135deg,#24343f,#5f7a8a)",
  "Menu": "linear-gradient(135deg,#7a3b1f,#c9773a)", "Specials": "linear-gradient(135deg,#a2740a,#e8b923)",
  "Wellness": "linear-gradient(135deg,#6e4772,#d29ab0)", "Offers": "linear-gradient(135deg,#a2740a,#e8b923)",
}
def mini(venue="your venue", tiles=("Dining", "Amenities", "Local guide", "Events"), finish="black", ad=True, extra_cls=""):
    t = "".join(f'<span style="--g:{TILEG.get(x, "#556")}">{x}</span>' for x in tiles)
    adhtml = '<div class="mini-ad"><i>YOUR AD HERE<em>Ad space for local businesses</em></i></div>' if ad else ""
    return f'''<div class="mini" data-finish="{finish}" aria-hidden="true"><div class="mini-head"><div class="mini-screen {extra_cls}"><b>Welcome</b><small>to {e(venue)}</small><div class="mini-tiles">{t}</div>{adhtml}</div></div><div class="mini-pole"></div><div class="mini-base"></div></div>'''

def placement_mini(kind):
    ph = {"ph-banner": "Featured banner", "ph-panel": "YOUR AD HERE", "ph-qr": "<i></i>QR offer"}[kind]
    return f'''<div class="mini" data-finish="black" aria-hidden="true"><div class="mini-head"><div class="mini-screen {kind}"><b>Welcome</b><small>to your venue</small><div class="mini-tiles"><span style="--g:{TILEG["Dining"]}">Dining</span><span style="--g:{TILEG["Events"]}">Events</span></div><div class="ph">{ph}</div></div></div><div class="mini-pole"></div><div class="mini-base"></div></div>'''

def demo_block(heading="Try the kiosk.", hid="demo-title"):
    return f'''<section class="demo" id="demo" aria-labelledby="{hid}">
  <div class="wrap">
    <div class="demo-head">
      <h2 id="{hid}">{heading}</h2>
      <p>This is the screen your guests use. Pick a venue and tap around the way a visitor would. The strip along the bottom of the screen is the ad space local businesses buy — swipe it, or tap "Your ad here" to see the packages.</p>
    </div>
    <div class="venue-switch" role="radiogroup" aria-label="Choose a venue">
      <button role="radio" aria-checked="true" data-venue="golf">Golf clubhouse</button>
      <button role="radio" aria-checked="false" data-venue="hotel">Hotel lobby</button>
      <button role="radio" aria-checked="false" data-venue="medical">Medical office</button>
      <button role="radio" aria-checked="false" data-venue="auto">Dealership lounge</button>
    </div>
    <div class="demo-grid">
      <div class="device" id="device" data-finish="black">
        <div class="device-head"><div class="screen" id="screen" data-root="{{R}}" aria-live="polite"></div></div>
        <div class="device-pole"><span class="device-slot"></span></div>
        <div class="device-base"></div>
      </div>
      <aside class="console" aria-labelledby="console-title">
        <h3 id="console-title">Behind the screen</h3>
        <p class="console-note">Counts update as you tap. Reports show totals, never who tapped.</p>
        <div class="ad-note"><div><b>The bottom of the screen is for sale.</b>Every visitor sees the ad space while they browse. $399 a year for one location, $1,099 for three, $1,200 for five — or $60 a month. <a href="{{R}}pricing/">See packages</a></div></div>
        <dl class="stats">
          <div><dt>Sessions</dt><dd id="st-sessions">0</dd></div>
          <div><dt>Screens viewed</dt><dd id="st-views">0</dd></div>
          <div><dt>Ad impressions</dt><dd id="st-impr">0</dd></div>
          <div><dt>Taken home by phone</dt><dd id="st-scans">0</dd></div>
        </dl>
        <h4>Activity</h4>
        <ol class="feed" id="feed"><li class="feed-empty">Tap the kiosk screen to start a session.</li></ol>
        <button class="btn btn-ghost btn-small" id="reset-demo" type="button">Reset demo</button>
      </aside>
    </div>
  </div>
</section>'''

def faq_html(items, tags=False):
    out = []
    for q, a, cat in items:
        tag = f'<span class="tag">{"Hosts" if cat=="hosts" else "Advertisers"}</span>' if tags else ""
        body = "".join(f"<p>{p}</p>" for p in (a if isinstance(a, (list, tuple)) else [a]))
        out.append(f'<details data-item data-cat="{cat}"><summary>{q}{tag}</summary><div>{body}</div></details>')
    return "".join(out)

def search_box(ph, label):
    return f'<label class="search"><span class="sr">{label}</span>{icon("search","")}<input type="search" data-search placeholder="{ph}"></label>'

def chips(options):
    return '<div class="chips" role="group" aria-label="Filter">' + "".join(
        f'<button type="button" class="chip" data-filter="{v}" aria-pressed="{str(i==0).lower()}">{l}</button>' for i, (v, l) in enumerate(options)) + "</div>"

def empty_state(text, extra=""):
    return f'<div class="empty-state" data-empty hidden><b>Nothing matches that yet.</b><p>{text}</p><button class="btn btn-small btn-ghost" type="button" data-clear>Clear filters</button>{extra}</div>'

# ---------------------------------------------------------------- forms
def field(label, name, kind="text", required=False, options=None, full=False, ph="", opt=False, hint="", value=""):
    req = " required" if required else ""
    cls = "field full" if full else "field"
    optl = ' <span class="opt">(optional)</span>' if opt else ""
    phattr = f' placeholder="{e(ph)}"' if ph else ""
    if kind == "select":
        opts = '<option value="">Choose an option</option>' + "".join(f'<option{" selected" if o==value else ""}>{e(o)}</option>' for o in options)
        ctl = f'<select name="{e(name)}"{req}>{opts}</select>'
    elif kind == "textarea":
        ctl = f'<textarea name="{e(name)}" rows="4"{req}{phattr}>{e(value)}</textarea>'
    else:
        auto = {"email": ' autocomplete="email"', "tel": ' autocomplete="tel"', "url": ' autocomplete="url"'}.get(kind, "")
        if name == "Contact name": auto = ' autocomplete="name"'
        ctl = f'<input type="{kind}" name="{e(name)}"{req}{phattr}{auto}{f" value=\"{e(value)}\"" if value else ""}>'
    hint_html = f"<small>{hint}</small>" if hint else ""
    return f'<label class="{cls}"><span>{label}{optl}</span>{ctl}{hint_html}</label>'

def draft_form(fid, to, subject, fieldsets, ack, button, handoff=False, subject_field=None):
    fs = "".join(f'<fieldset><legend>{legend}</legend>{"".join(fields)}</fieldset>' for legend, fields in fieldsets)
    ho = " data-handoff" if handoff else ""
    sf = f' data-subject-field="{subject_field}"' if subject_field else ""
    return f'''<form class="draft-form" id="{fid}" data-to="{to}" data-subject="{e(subject)}" data-review="{fid}-review"{ho}{sf} novalidate>
  {fs}
  <label class="ack"><input type="checkbox" name="ack" required> <span>{ack}</span></label>
  <p class="form-error" role="alert" hidden></p>
  <div class="form-foot"><button class="btn" type="submit">{button}</button><span class="fine">We reply within one business day.</span></div>
</form>
<div class="draft-review" id="{fid}-review" hidden>
  <h3 tabindex="-1">Your email is ready.</h3>
  <p class="review-lede">Check the details, then open it in your email app and press send. You can also copy or save it.</p>
  <pre></pre>
  <div class="btn-row"><button class="btn" type="button" data-draft="open">Open in email</button><button class="btn btn-ghost" type="button" data-draft="copy">Copy text</button><button class="btn btn-ghost" type="button" data-draft="download">Download</button><button class="btn btn-ghost" type="button" data-draft="edit">Edit details</button></div>
  <p class="copied" role="status"></p>
</div>'''

def form_section(fid, h2, p, steps, form_html, dark=False):
    sl = "".join(f"<li><span>{i+1}</span>{s}</li>" for i, s in enumerate(steps))
    cls = "section dark" if dark else "section"
    return f'''<section class="{cls}" id="{fid}"><div class="wrap form-wrap">
  <div><h2>{h2}</h2><p class="lede" style="margin-top:16px">{p}</p><ol class="steps-mini">{sl}</ol>
    <div class="talk"><span class="fine">Prefer to talk?</span><a href="tel:{TEL}">{PHONE}</a><a href="mailto:{EMAIL}">{EMAIL}</a></div></div>
  <div>{form_html}</div>
</div></section>'''

CATEGORIES = ["Dining & entertainment", "Medical & wellness", "Automotive services", "Retail & lifestyle", "Travel & local experiences", "Professional services", "Events & community", "Other"]
PLACEMENTS = ["Help me choose", "Kiosk ad space (lower screen)", "Featured banner", "Rotating panel", "QR offer tile"]
PRICING = ["Help me choose", "1 location — $399/yr", "3 locations — $1,099/yr", "5 locations — $1,200/yr", "More than 5 locations — $1,200 + $300 per extra location/yr", "Monthly — $60 per location per month"]

def advertiser_form():
    return draft_form("inquiry-form", EMAIL, "Advertising inquiry", [
        ("Your campaign", [
            field("Business name", "Business", required=True),
            field("Business category", "Category", "select", options=CATEGORIES),
            field("Target city / state", "Target city / state", required=True, ph="e.g. Phoenix, AZ"),
            field("Placement interest", "Placement", "select", options=PLACEMENTS),
            field("Campaign goal", "Goal", "select", options=["Local awareness", "Visits / local discovery", "Offer / QR engagement", "Calls / inquiries", "Other"]),
            field("Pricing", "Pricing", "select", options=PRICING),
            field("Desired start date", "Desired start date", "date", opt=True),
        ]),
        ("Your contact details", [
            field("Your name", "Contact name", required=True),
            field("Email", "Email", "email", required=True),
            field("Phone", "Phone", "tel", opt=True),
            field("Website", "Website", "url", opt=True, ph="https://"),
            field("Anything else we should know?", "Notes", "textarea", full=True, opt=True),
        ]),
    ], "I understand placement availability, pricing and campaign terms are confirmed by the Spotlight team.", "Review my inquiry", handoff=True)

def host_form():
    return draft_form("host-form", EMAIL, "Kiosk hosting inquiry", [
        ("Your venue", [
            field("Venue name", "Venue name", required=True),
            field("Venue type", "Venue type", "select", options=["Hotel / resort", "Golf / country club", "Medical office", "Car dealership", "Restaurant / venue", "Vacation rental / condo", "Other"]),
            field("Street address", "Street address"),
            field("City / state", "City / state", required=True),
            field("Your role", "Role"),
            field("Decision timeline", "Timeline", "select", options=["Ready now", "Within 30 days", "Longer than 30 days", "Exploring options"]),
            field("Are you the decision maker?", "Decision maker", "select", options=["Yes", "No"]),
            field("Decision maker's name and contact", "Decision maker contact", opt=True),
        ]),
        ("The space", [
            field("Preferred placement", "Placement", "select", options=["Near the front desk / reception", "Near the entrance", "Waiting / service lounge", "Help me choose", "Other"]),
            field("Power available?", "Power", "select", options=["Yes", "No", "Unsure"]),
            field("Internet available?", "Internet", "select", options=["Yes", "No", "Unsure"]),
        ]),
        ("Your contact details", [
            field("Your name", "Contact name", required=True),
            field("Email", "Email", "email", required=True),
            field("Phone", "Phone", "tel", opt=True),
            field("Website", "Website", "url", opt=True, ph="https://"),
            field("Anything else we should know?", "Notes", "textarea", full=True, opt=True),
        ]),
    ], "I'm authorized to discuss this venue and understand participation requires a site review and a signed Host Agreement.", "Review my request", subject_field="Venue name")

def support_form():
    return draft_form("support-form", SUPPORT, "Support request", [
        ("Your request", [
            field("Venue or business name", "Venue / business", required=True),
            field("What can we help with?", "Request type", "select", options=["Kiosk equipment", "Venue information / content", "Advertising creative / campaign", "Installation question", "Other"], required=True),
            field("City / state", "City / state"),
            field("Kiosk or campaign reference", "Reference", opt=True),
            field("Describe your request", "Details", "textarea", full=True, required=True),
        ]),
        ("Your contact details", [
            field("Your name", "Contact name", required=True),
            field("Email", "Email", "email", required=True),
            field("Phone", "Phone", "tel", opt=True),
        ]),
    ], "I'll keep patient information, passwords and payment details out of this request.", "Review my request", subject_field="Venue / business")

# ---------------------------------------------------------------- content data
IDEAS = [
  dict(id="dinner-nearby", brand="Willow Kitchen", headline="A good evening starts nearby.", cta="Explore the menu", color="#1F4433", light=False, cat="dining", kind="Dining & drinks · hotel lobby", title="The next dinner decision", summary="Introduce a welcoming dinner option with a useful menu link.", moment="A hotel guest is choosing where to spend the evening.", offer="Feature a signature meal or a clear reason to visit. Keep opening hours accurate on the destination page.", creative="A short invitation, one food image in the final artwork and an easy route to the menu.", confirm="Venue fit, distance, current hours, placement availability and any offer conditions.", next="Explore the menu."),
  dict(id="weekend-experience", brand="Mesa Trail Tours", headline="A little adventure. Close by.", cta="View the experience", color="linear-gradient(135deg,#b4492c,#e8955a)", light=False, cat="experiences", kind="Local experiences · hotel lobby", title="Make more of the weekend", summary="Give visitors a starting point for an experience they can plan from the lobby.", moment="A visitor is looking for something memorable to do during their stay.", offer="Highlight one experience and what's needed to plan it: duration, meeting point and booking conditions.", creative="One clear experience, an inviting headline and a mobile page with the details.", confirm="Availability, seasonal conditions, accurate travel time and booking requirements.", next="View the experience."),
  dict(id="service-reminder", brand="Northside Auto Care", headline="Your next service, made simple.", cta="See service options", color="linear-gradient(135deg,#1c3f8a,#3f7ad8)", light=False, cat="automotive", kind="Automotive & services · service lounge", title="A useful service reminder", summary="Explain one service and give customers a clear way to learn more.", moment="A dealership or service-lounge visitor has time to think about future vehicle needs.", offer="Introduce a specific service or maintenance reminder. Coordinate category fit with the host venue.", creative="Focus on the service, a clear business identity and one inquiry destination.", confirm="Host approval, competitive restrictions, service details and the accuracy of any pricing.", next="See service options."),
  dict(id="new-opening", brand="Juniper Market", headline="Meet your new local favorite.", cta="Plan a visit", color="#2E4439", light=False, cat="retail", kind="Retail & local business", title="Introduce a new local opening", summary="Help people discover a new shop and what makes a visit worthwhile.", moment="A guest or visitor is open to discovering something in the neighborhood.", offer="Lead with what the business offers and where to find it. Put opening details on the landing page.", creative="The business name, one memorable promise and a short route to hours and directions.", confirm="Confirmed opening date, actual address, hours and placement suitability.", next="Plan a visit."),
  dict(id="local-event", brand="Riverwalk Sessions", headline="Your Friday plans, found.", cta="See event details", color="linear-gradient(135deg,#5a2c82,#e2a65b)", light=False, cat="events", kind="Events & community", title="Put the date on their radar", summary="Introduce a local event with a clear date and a useful details page.", moment="A visitor is deciding what to do later, or planning a return trip.", offer="Present one event, its date and the reason to go. Keep ticket and entry details current.", creative="Make the event and date easy to read. Send interested visitors to a page with complete details.", confirm="Correct date, venue, ticket availability, age restrictions where applicable and campaign end timing.", next="See event details."),
  dict(id="local-service", brand="Oakwell Dental", headline="A local team to know.", cta="Meet the practice", color="linear-gradient(135deg,#1b6ca8,#62b6cb)", light=False, cat="services", kind="Professional services · waiting area", title="Introduce a helpful local service", summary="Introduce a practice or service with straightforward information and a clear next step.", moment="A visitor is looking for relevant information in a suitable waiting area.", offer="Describe the service accurately, using general information approved by the advertiser and venue.", creative="A reassuring introduction, readable service wording and a destination with contact details.", confirm="Venue approval, factual service claims, required disclosures and content suited to the setting.", next="Meet the practice."),
  dict(id="family-day", brand="Little Canyon Discovery", headline="Big ideas for a family day.", cta="Explore a day out", color="linear-gradient(135deg,#c2702f,#f2c46d)", light=True, cat="experiences", kind="Local experiences · families", title="Help a family plan the day", summary="Make a nearby activity easy to discover and understand.", moment="A visiting family is comparing things to do near the property.", offer="Feature a single activity and link to age guidance, opening hours and the practical details.", creative="A warm invitation, a recognizable activity and a mobile-friendly information page.", confirm="Current hours, age suitability, access needs, booking details and real availability.", next="Explore a day out."),
  dict(id="takeaway-next", brand="Corner Cup & Co.", headline="Something good for the way home.", cta="View the menu", color="#FFCE22", light=True, cat="dining", kind="Dining & drinks · service lounge", title="Be the convenient next stop", summary="Introduce a nearby cafe or takeaway option for a visitor planning the next stop.", moment="A customer is finishing a wait and thinking about food or a drink nearby.", offer="Promote a simple menu highlight with accurate directions and hours on the destination page.", creative="One product or invitation, a clear business name and an easy menu link.", confirm="Venue fit, realistic convenience, current hours and fulfillment of any promoted offer.", next="View the menu."),
]

def creative(i):
    light = " light" if i["light"] else ""
    return f'<div class="creative{light}" style="--cbg:{i["color"]}"><small>{e(i["brand"])}</small><strong>{e(i["headline"])}</strong><span>{e(i["cta"])} ↗</span><em>Example concept</em></div>'

def concept_card(i, full=False):
    if full:
        body = f'''<details><summary>Explore the playbook</summary><dl>
          <div><dt>The visitor moment</dt><dd>{i["moment"]}</dd></div>
          <div><dt>The offer to plan</dt><dd>{i["offer"]}</dd></div>
          <div><dt>The creative direction</dt><dd>{i["creative"]}</dd></div>
          <div><dt>Confirm before a campaign</dt><dd>{i["confirm"]}</dd></div></dl></details>'''
    else:
        body = f'''<dl><div><dt>The visitor moment</dt><dd>{i["moment"]}</dd></div><div><dt>The message</dt><dd>{i["summary"]}</dd></div><div><dt>The next step</dt><dd>{i["next"]}</dd></div></dl>'''
    return f'''<article class="concept" data-item data-cat="{i["cat"]}">{creative(i)}
  <div class="concept-body"><span class="kind">{i["kind"]}</span><h3>{i["title"]}</h3>{f"<p>{i['summary']}</p>" if full else ""}{body}
    <div class="concept-links"><a class="text-link" href="{{R}}campaign-planner/?idea={i["id"]}">Adapt this idea</a><a class="text-link" href="{{R}}creative-studio/?idea={i["id"]}">Preview the creative</a></div></div></article>'''

VENUES = [
  dict(slug="hotels", tab="Hotels", name="Hotels & hospitality", h="A better stay starts in the lobby.", lede="Help guests discover dining, attractions, transportation and your property's amenities from one welcoming screen.", bullets=["Digital concierge and local discovery", "Property amenities and useful FAQs", "Dining, activities and transportation information"], moment="Guests planning what to do next", mh="Discover your next local favorite.", venue="The Arden Hotel", tiles=("Dining", "Amenities", "Local guide", "Events"), finish="silver", photo="kiosk-lobby-sm.jpg", photo_alt="Silver Spotlight kiosk in a hotel lobby"),
  dict(slug="golf", tab="Golf clubs", name="Golf & country clubs", h="A concierge for the clubhouse.", lede="Give members and guests course conditions, tee times, dining, events and the pro shop — plus the best of the neighborhood.", bullets=["Course guide, conditions and tee times", "Dining, events and membership information", "Pro shop highlights and local discovery"], moment="Members between rounds", mh="Everything about today, in one place.", venue="Saguaro Hills Golf Club", tiles=("Course guide", "Tee times", "Dining", "Events"), finish="black", photo="kiosk-clubhouse-sm.jpg", photo_alt="Matte black Spotlight kiosk in a golf clubhouse"),
  dict(slug="medical", tab="Medical", name="Medical offices", h="Make the waiting room more useful.", lede="Give visitors an easy way to explore practice information, patient education, directions and relevant local services.", bullets=["Practice services and visitor FAQs", "General educational content selected by the practice", "Directions, wellness and local service information"], moment="Visitors looking for practical information", mh="Useful information while you wait.", venue="Camelback Family Health", tiles=("Check-in", "Pharmacy", "Wellness", "Local guide"), finish="silver", note="Keep healthcare content informational. This use case focuses on visitor information and practice-selected educational content. Kiosks don't collect patient records or personal health information."),
  dict(slug="automotive", tab="Automotive", name="Car dealerships", h="Put the waiting area to work.", lede="Showcase vehicle highlights, service information and relevant offers while customers spend time in your sales or service lounge.", bullets=["Featured vehicles and inventory highlights", "Financing, service and warranty information", "Promotions and QR links to take the next step"], moment="Sales and service customers considering their options", mh="Your next move starts here.", venue="Valley Motors", tiles=("Service", "Vehicles", "Dining", "Offers"), finish="black"),
  dict(slug="restaurants", tab="Restaurants", name="Restaurants & venues", h="Give guests a reason to explore more.", lede="Spotlight menu highlights, specials, events and nearby experiences through a simple interactive display.", bullets=["Menu highlights and daily specials", "Events and promotional content", "Local attractions and partner visibility"], moment="Guests discovering menus, events and experiences", mh="There's more on the menu.", venue="Salt & Ember", tiles=("Menu", "Specials", "Events", "Local guide"), finish="black"),
]

def venue_tabs(link_label=True):
    tabs = "".join(f'<button role="tab" id="tab-{v["slug"]}" aria-controls="panel-{v["slug"]}" aria-selected="{str(i==0).lower()}" tabindex="{0 if i==0 else -1}">{v["tab"]}</button>' for i, v in enumerate(VENUES))
    panels = ""
    for i, v in enumerate(VENUES):
        panels += f'''<div class="tab-panel" role="tabpanel" id="panel-{v["slug"]}" aria-labelledby="tab-{v["slug"]}"{"" if i==0 else " hidden"}>
  <div><h3>{v["h"]}</h3><p>{v["lede"]}</p>{check_list(v["bullets"])}<a class="text-link" href="{{R}}venues/{v["slug"]}/">Explore {v["name"].lower()}</a></div>
  <div class="moment">{mini(v["venue"], v["tiles"], v["finish"])}<dl><dt>The visitor moment</dt><dd>{v["moment"]}</dd><dt>On screen</dt><dd>{v["mh"]}</dd></dl></div>
</div>'''
    return f'<div data-tabs><div class="tabs" role="tablist" aria-label="Venue types">{tabs}</div>{panels}</div>'

FAQS = [
  ("Is there a cost to host a kiosk?", "Qualified venues get kiosk hardware, software, installation, content updates and ongoing maintenance at no cost. Participation depends on a site review and a signed Host Agreement.", "hosts"),
  ("What does my venue need to provide?", "A visible, accessible spot with a standard power outlet. We review internet availability and the right installation setup with your team.", "hosts"),
  ("Who looks after the kiosk?", "Spotlight manages the equipment, software, content updates and routine maintenance. Contact support for installation or service questions.", "hosts"),
  ("Do host venues receive revenue sharing?", "The standard Host Agreement provides the kiosk at no cost and doesn't include payments or revenue sharing. Any separate arrangement has to be agreed in writing.", "hosts"),
  ("Can we choose what appears on our kiosk?", "Yes. Your venue information is planned with your team, and advertising is reviewed for fit with your setting. Category restrictions, such as competitors, can be discussed before you sign.", "hosts"),
  ("Who can advertise?", "Local businesses, restaurants and entertainment, medical and wellness services, automotive businesses and retail brands can ask about placements that fit.", "advertisers"),
  ("What does advertising cost?", "$399 a year for one location, $1,099 a year for three locations and $1,200 a year for five. Each location after five is $300 a year. You can also pay monthly at $60 per location. Every package includes ad artwork, digital copy and 12 months on screen.", "advertisers"),
  ("What's included in a package?", "Ad artwork and digital copy, your logo and business details, and 12 months in the kiosk ad space at each location. Your quote confirms the exact venues, ad format and reporting.", "advertisers"),
  ("Can I pay monthly?", "Yes. Monthly is $60 per location, per month — $60 for one location, $180 for three, $300 for five. Paying annually costs less.", "advertisers"),
  ("Can I update my ad?", "Creative changes and seasonal offers can be discussed with the team. Your campaign agreement sets the process, schedule and number of updates.", "advertisers"),
  ("How are campaign results measured?", "Reporting covers display impressions, screen interactions and QR activity where supported. A display impression doesn't identify a unique viewer or confirm a sale. See the measurement guide for what each number means.", "advertisers"),
  ("Is every market on the map available now?", "Availability changes as kiosks are placed. Contact the team to check current kiosks in your market.", "advertisers"),
]

RESOURCES = [
  ("advertisers", "Campaign planning", "Plan your first local kiosk campaign", "Turn a business goal into a useful venue, message and next step.", "6 min read", "resources/first-local-campaign/"),
  ("creative", "Creative guide", "Create a screen message people can read", "Hierarchy, contrast, one offer and a clear destination.", "5 min read", "resources/screen-creative/"),
  ("hosts", "Host preparation", "Get your venue ready for a conversation", "The space, power, connectivity and information to review with the team.", "5 min read", "resources/host-preparation/"),
  ("advertisers", "Interactive tool", "Build a campaign brief", "A guided planner for your market, goal, timing and creative needs.", "Brief builder", "campaign-planner/"),
  ("creative", "Interactive tool", "Try the creative studio", "Write a message, see it in the kiosk ad space and download a concept.", "Live preview", "creative-studio/"),
  ("advertisers creative", "Campaign inspiration", "Explore campaign ideas", "Eight local campaign concepts to adapt for your business.", "8 playbooks", "campaign-ideas/"),
  ("advertisers", "Reporting guide", "Understand campaign measurement", "The difference between plays, impressions, interactions and outcomes.", "Plain-language guide", "measurement/"),
  ("advertisers hosts", "Getting started", "Follow the Spotlight process", "The steps for hosts and advertisers, from first brief to confirmed terms.", "Process overview", "how-it-works/"),
  ("advertisers hosts", "At a glance", "Read the media overview", "The concept, venues, formats and pricing in one place.", "Overview", "media-kit/"),
]

LOCATIONS = {
  "Arizona": ["Phoenix", "Tempe", "Gilbert", "Fountain Hills", "Maricopa", "Flagstaff", "Williams", "Holbrook"],
  "California": ["San Francisco", "San Bruno", "Downey", "Moreno Valley"],
  "Texas": ["Plano"],
  "Tennessee": ["Nashville"],
  "Pennsylvania": ["Philadelphia"],
}
ABBR = {"Arizona": "AZ", "California": "CA", "Texas": "TX", "Tennessee": "TN", "Pennsylvania": "PA"}

def article(trail, title, lede, sections, after="", meta="", cta=None):
    toc = "".join(f'<li><a href="#s{i+1}">{h}</a></li>' for i, (h, _) in enumerate(sections))
    body = "".join(f'<h2 id="s{i+1}">{h}</h2>{b}' for i, (h, b) in enumerate(sections))
    cta_html = f'<div class="callout"><b>{cta[0]}</b><p>{cta[1]}</p>{btns((cta[2], cta[3]))}</div>' if cta else ""
    return page_hero(trail, title, lede) + f'''<section class="section"><div class="wrap article">
  <aside class="toc"><b>In this guide</b><ol>{toc}</ol><p class="meta">{meta}</p><p class="meta"><a class="text-link" href="{{R}}resources/">All resources</a></p></aside>
  <div class="prose">{body}{after}{cta_html}</div>
</div></section>'''

# ---------------------------------------------------------------- ad cycle graphic
CYCLE = [
  ("eye", "Ad viewed", "Visitors see your ad every time they use the kiosk."),
  ("tap", "Customer taps", "They tap your ad or scan the QR code to take it with them."),
  ("chart", "Trackable data", "Every view, tap and scan is counted in your report."),
  ("trend", "High ROI", "From about $1.09 a day per location — one new customer can cover the year."),
]
def cycle(variant="small"):
    areas = ["a", "b", "c", "d"]
    nodes = "".join(f'<li class="cy-node" style="grid-area:{areas[i]}"><span class="cy-ico">{icon(ic, "")}<i>{i+1}</i></span><span class="cy-txt"><b>{t}</b><span class="cy-d">{d}</span></span></li>' for i, (ic, t, d) in enumerate(CYCLE))
    arr = lambda area, rot: f'<span class="cy-arr" style="grid-area:{area};--r:{rot}deg" aria-hidden="true">{icon("arrow", "")}</span>'
    return f'''<div class="cycle cycle-{variant}" data-cycle role="group" aria-label="How kiosk advertising works">
  <ol class="cy-list">{nodes}</ol>
  {arr("r1", 0)}{arr("r2", 90)}{arr("r3", 180)}{arr("r4", 270)}
  <span class="cy-hub" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg><span>Every visit</span></span>
</div>'''

# ---------------------------------------------------------------- markets + map
import json as _json
from locations_data import MARKETS
_MAP = _json.load(open(os.path.join(os.path.dirname(__file__), "usmap.json")))

def market_label(city, ab):
    return city if city.endswith("D.C.") else f"{city}, {ab}"

def market_options(selected=""):
    groups = []
    for st, (ab, cities) in MARKETS.items():
        opts = "".join(f'<option>{e(market_label(c, ab))}</option>' for c, _, _ in cities)
        groups.append(f'<optgroup label="{e(st)}">{opts}</optgroup>')
    return '<option value="">Choose a city</option>' + "".join(groups) + '<option value="other">Somewhere else — I\'ll type it</option>'

def _clusters(radius=14):
    groups = []
    for c in _MAP["cities"]:
        lab = market_label(c["c"], c["ab"])
        for g in groups:
            if (g["x"] - c["x"]) ** 2 + (g["y"] - c["y"]) ** 2 < radius ** 2 and g["st"] == c["st"]:
                g["m"].append(lab); break
        else:
            groups.append({"x": c["x"], "y": c["y"], "st": c["st"], "m": [lab]})
    return groups

def us_map(link=True):
    paths = "".join(f'<path class="st" data-state="{e(s["name"])}" d="{s["d"]}"><title>{e(s["name"])}</title></path>' for s in _MAP["states"])
    pins = ""
    for g in _clusters():
        n = len(g["m"])
        name = g["m"][0] if n == 1 else g["m"][0].split(",")[0] + " area"
        aria = g["m"][0] if n == 1 else f'{name}: {", ".join(g["m"])}'
        pins += f'<circle class="pin{" multi" if n > 1 else ""}" cx="{g["x"]}" cy="{g["y"]}" r="{5 if n == 1 else 7}" tabindex="0" role="button" data-name="{e(name)}" data-markets="{e("|".join(g["m"]))}" data-state="{e(g["st"])}" aria-label="{e(aria)}"/>'
    return f'''<div class="usmap" data-usmap>
  <svg viewBox="0 0 975 610" role="group" aria-label="Map of Spotlight kiosk markets in all 50 states">{paths}<g class="pins">{pins}</g></svg>
  <div class="map-tip" role="status" hidden><b></b><span class="tip-links"></span></div>
</div>'''

N_MARKETS = sum(len(c) for _, c in MARKETS.values())

# ---------------------------------------------------------------- self-serve checkout
CTAS = ["Visit us today", "View the menu", "Book now", "Call us", "Get the offer", "Learn more"]
def checkout_section():
    cats = "".join(f"<option>{c}</option>" for c in CATEGORIES)
    venues = "".join(f"<option>{v}</option>" for v in ["Any venue (fastest)", "Hotels & hospitality", "Golf & country clubs", "Medical offices", "Car dealerships", "Restaurants & venues"])
    ctas = "".join(f'<option value="{c}">' for c in CTAS)
    return f'''<section class="section checkout" id="get-started" aria-labelledby="co-title"><div class="wrap">
  <div class="section-head"><h2 id="co-title">Get on a kiosk today.</h2><p>One location, $399 a year. Pick your city, upload your logo or ad, and check out — it takes about five minutes. Want 3 or 5 locations? <a class="text-link" href="{{R}}pricing/">See packages</a></p></div>
  <div class="co-grid">
  <form id="checkout" class="co-form" novalidate data-welcome="{{R}}welcome/">
    <ol class="co-steps" aria-label="Checkout steps"><li class="on"><span>1</span>Plan</li><li><span>2</span>Business</li><li><span>3</span>Your ad</li><li><span>4</span>Pay</li></ol>

    <fieldset class="co-step" data-step="1"><legend>Choose your plan and city</legend>
      <div class="co-bill">
        <label class="co-opt"><input type="radio" name="billing" value="annual" checked><span><b>Yearly — $399</b><small>Best price · about $1.09 a day</small></span></label>
        <label class="co-opt"><input type="radio" name="billing" value="monthly"><span><b>Monthly — $60/mo</b><small>Billed every month</small></span></label>
      </div>
      <label class="field full"><span>City</span><select name="market" required data-label="City">{market_options()}</select><small>{N_MARKETS} cities across all 50 states. We'll confirm the exact venue before your ad goes live.</small></label>
      <label class="field full" data-other hidden><span>Your city and state</span><input name="market_other" data-label="City (other)" placeholder="e.g. Bakersfield, CA"></label>
      <div class="grid2">
        <label class="field"><span>Venue preference</span><select name="venue_type">{venues}</select></label>
        <label class="field"><span>Start date <span class="opt">(optional)</span></span><input type="date" name="start_date"></label>
      </div>
    </fieldset>

    <fieldset class="co-step" data-step="2" hidden><legend>About your business</legend>
      <div class="grid2">
        <label class="field"><span>Business name</span><input name="business" required autocomplete="organization" data-label="Business name"></label>
        <label class="field"><span>Category</span><select name="category"><option value="">Choose one</option>{cats}</select></label>
        <label class="field"><span>Your name</span><input name="name" required autocomplete="name" data-label="Your name"></label>
        <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email" data-label="Email"></label>
        <label class="field"><span>Phone</span><input name="phone" type="tel" required autocomplete="tel" data-label="Phone"></label>
        <label class="field"><span>Website <span class="opt">(optional)</span></span><input name="website" type="url" placeholder="https://" autocomplete="url"></label>
      </div>
    </fieldset>

    <fieldset class="co-step" data-step="3" hidden><legend>Your ad</legend>
      <div class="co-bill">
        <label class="co-opt"><input type="radio" name="ad_source" value="design" checked><span><b>Design it for me</b><small>Included. Send your logo and a headline.</small></span></label>
        <label class="co-opt"><input type="radio" name="ad_source" value="upload"><span><b>I have a finished ad</b><small>Upload artwork, 1080 × 480 px</small></span></label>
      </div>
      <div class="drop" data-drop="logo"><input type="file" name="logo" id="co-logo" accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf" data-label="Logo">
        <label for="co-logo"><b>Upload your logo</b><span>PNG, JPG, SVG or PDF · up to 5 MB</span></label><p class="drop-file" hidden></p></div>
      <div class="drop" data-drop="artwork" hidden><input type="file" name="artwork" id="co-art" accept="image/png,image/jpeg,image/webp,application/pdf" data-label="Ad artwork">
        <label for="co-art"><b>Upload your ad artwork</b><span>1080 × 480 px PNG or JPG (a PDF works too) · up to 5 MB</span></label><p class="drop-file" hidden></p></div>
      <div class="grid2" data-design>
        <label class="field full"><span>Headline <span class="count" id="co-hl-count">0 of 60</span></span><input name="headline" maxlength="60" placeholder="e.g. A good evening starts nearby." data-label="Headline"></label>
        <label class="field"><span>Button text</span><input name="cta" list="co-ctas" placeholder="Visit us today"><datalist id="co-ctas">{ctas}</datalist></label>
        <label class="field"><span>Offer <span class="opt">(optional)</span></span><input name="offer" maxlength="60" placeholder="e.g. 10% off your first visit"></label>
      </div>
      <label class="field full"><span>Where should the QR code go? <span class="opt">(optional)</span></span><input name="destination_url" type="url" placeholder="https://yourbusiness.com/offer"><small>Visitors scan it to take your ad home on their phone.</small></label>
      <label class="field full"><span>Anything else for our designer? <span class="opt">(optional)</span></span><textarea name="notes" rows="3" placeholder="Colors, photos you like, what to avoid…"></textarea></label>
    </fieldset>

    <fieldset class="co-step" data-step="4" hidden><legend>Review and pay</legend>
      <dl class="co-review" id="co-review"></dl>
      <div class="co-total"><span id="co-due-label">Due today</span><b id="co-due">$399</b></div>
      <label class="ack"><input type="checkbox" name="agree_terms" required data-label="Terms"> <span>I agree to the <a href="{{R}}terms/" target="_blank">Terms &amp; Conditions</a>, including billing and renewal.</span></label>
      <label class="ack"><input type="checkbox" name="agree_rights" required data-label="Artwork rights"> <span>I own or have permission to use the logo and artwork I'm sending.</span></label>
      <p class="fine">Payment is handled securely by Stripe. Your card details never touch our site.</p>
    </fieldset>

    <p class="form-error" role="alert" hidden></p>
    <div class="co-nav"><button class="btn btn-ghost btn-small" type="button" data-co="back" disabled>Back</button><span class="fine" data-co="label">Step 1 of 4</span><button class="btn" type="button" data-co="next">Continue</button><button class="btn" type="submit" data-co="pay" hidden>Continue to secure payment</button></div>
  </form>

  <aside class="co-side" aria-label="Your order">
    <div class="co-preview">
      <div class="mini co-kiosk" data-finish="black"><div class="mini-head"><div class="mini-screen"><b>Welcome</b><small id="co-venue-name">to a venue near you</small><div class="mini-tiles"><span style="--g:{TILEG["Dining"]}">Dining</span><span style="--g:{TILEG["Events"]}">Events</span><span style="--g:{TILEG["Local guide"]}">Local guide</span><span style="--g:{TILEG["Amenities"]}">Amenities</span></div><div class="co-ad" id="co-ad"></div></div></div><div class="mini-pole"></div><div class="mini-base"></div></div>
      <div class="co-ad-big" aria-label="Close-up of your ad"><div class="co-ad" id="co-ad-big"></div></div>
      <p class="fine">Live preview of your ad on the kiosk</p>
    </div>
    <dl class="co-sum"><div><dt>Plan</dt><dd id="co-sum-plan">1 location · yearly</dd></div><div><dt>City</dt><dd id="co-sum-city">Not chosen yet</dd></div><div><dt>Total</dt><dd id="co-sum-total">$399/yr</dd></div></dl>
    <ul class="check-list co-incl"><li>Ad design and copy included</li><li>12 months on screen (or month to month)</li><li>QR code to your website</li><li>Report of views, taps and scans</li></ul>
  </aside>
  </div>

  <div class="co-done" id="co-done" hidden tabindex="-1"><h3>Order received.</h3><p></p><div class="btn-row"></div></div>
</div></section>'''

# ---------------------------------------------------------------- customer journey (animated)
JOURNEY = [
  ("pin", "Pick your kiosk location", "Choose a city — we have hosts in all 50 states."),
  ("upload", "Upload your ad", "Send a finished ad, or just your logo and we'll design it."),
  ("clock", "Live in about 2 days", "We review it, place it and switch it on — typically within two days."),
  ("eye", "Guests see your ad", "Hotel guests, golfers, patients and customers browse the kiosk every day."),
  ("chart", "You get the numbers", "Views, taps and QR scans — counted for you."),
  ("dash", "Your own dashboard", "See how your ad is doing, any time, in one place."),
  ("users", "More customers", "Visitors walk through your door. That's the whole point."),
]
def _scene(i):
    if i == 0:
        dots = "".join(f'<i style="left:{x}%;top:{y}%"></i>' for x, y in [(14,30),(30,58),(44,26),(58,48),(70,22),(82,62),(24,74),(66,78),(88,36)])
        return f'<div class="sc sc-map">{dots}<span class="sc-pin">{icon("pin","")}<em>Phoenix, AZ</em></span></div>'
    if i == 1:
        return f'<div class="sc sc-upload"><span class="sc-file">{icon("upload","")}<em>my-ad.png</em></span><span class="sc-strip"><b>YOUR AD</b></span><span class="sc-bar"><i></i></span></div>'
    if i == 2:
        days = "".join(f'<span class="d{n}"><small>{d}</small><b>{n+1}</b></span>' for n, d in enumerate(["Mon", "Tue", "Wed"]))
        return f'<div class="sc sc-live"><div class="sc-days">{days}</div><span class="sc-badge">Live</span></div>'
    if i == 3:
        ppl = "".join(f'<i style="--d:{n*0.12}s">{icon("eye","")}</i>' for n in range(6))
        return f'<div class="sc sc-eyes"><div class="sc-ppl">{ppl}</div><p><b data-count-to="1284">0</b> views this month</p></div>'
    if i == 4:
        bars = "".join(f'<div><span>{l}</span><i style="--w:{w}%"></i><b>{v}</b></div>' for l, w, v in [("Views", 92, "1,284"), ("Taps", 46, "212"), ("QR scans", 22, "64")])
        return f'<div class="sc sc-bars">{bars}</div>'
    if i == 5:
        return '<div class="sc sc-dash"><div class="sc-win"><span class="sc-top"><i></i><i></i><i></i></span><div class="sc-kpis"><b>1,284<small>views</small></b><b>212<small>taps</small></b><b>64<small>scans</small></b></div><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 52 L25 46 L50 48 L75 36 L100 38 L125 26 L150 28 L175 14 L200 10"/></svg></div></div>'
    return f'<div class="sc sc-shop"><span class="sc-door">{icon("home","")}</span>' + "".join(f'<i style="--d:{n*0.35}s">{icon("people","")}</i>' for n in range(3)) + '<em>+ new customers</em></div>'

def journey():
    rail = "".join(f'<li class="jr{" on" if i == 0 else ""}"><button type="button" data-j="{i}" aria-label="Step {i+1}: {t}"><span class="jr-n">{i+1}</span><span class="jr-t">{t}</span></button></li>' for i, (_, t, _) in enumerate(JOURNEY))
    stages = "".join(f'<div class="js{" on" if i == 0 else ""}" data-js="{i}"><div class="js-txt"><span class="js-step">Step {i+1} of {len(JOURNEY)}</span><h3>{t}</h3><p>{d}</p></div>{_scene(i)}</div>' for i, (_, t, d) in enumerate(JOURNEY))
    return f'''<div class="journey" data-journey>
  <div class="j-stage" aria-live="polite">{stages}<div class="j-prog"><i></i></div></div>
  <ol class="j-rail">{rail}</ol>
</div>'''
