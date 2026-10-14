"""Shared layout, components and content data for the CityPulse Digital site.
Pages use {R} as a placeholder for the relative path back to the site root."""
import html, os
import pricing
from content import ANNOUNCEMENTS, STORIES, GUIDES, PLATFORMS, INDUSTRY_DETAIL

SITE = "CityPulse Digital"
LEGAL = "City Pulse Digital LLC"
DOMAIN = "citypulsedigital.com"
EMAIL = "hello@citypulsedigital.com"
SUPPORT = "support@citypulsedigital.com"
PHONE = "602-887-4058"
TEL = "+16028874058"
ADDR1 = "4750 S 44th Pl, Suite E20"
ADDR2 = "Phoenix, AZ 85040"
KIOSKS_URL = "https://citypulsekiosks.com/"
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = html.escape

# ---------------------------------------------------------------- icons
_IC = {
  "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  "search": '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  "star": '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z"/>',
  "pin": '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  "spark": '<path d="M12 3c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7z"/>',
  "chev": '<path d="M6 9l6 6 6-6"/>',
  "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
  "phone": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
  "chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  "trend": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  "screen": '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  "bolt": '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  "shield": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "users": '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9" r="2.4"/><path d="M15.5 14c2.6 0 4.4 1.6 5 4.5"/>',
  "ai": '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',
  "layers": '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>',
  "msg": '<path d="M4 5h16v11H9l-5 4z"/>',
  "cam": '<rect x="3" y="7" width="13" height="11" rx="2"/><path d="M16 11l5-3v9l-5-3z"/>',
}
def icon(name, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{_IC[name]}</svg>'

# ---------------------------------------------------------------- services (the core data)
SERVICES = [
  dict(slug="websites", icon="screen", name="Website design", short="Websites",
       h="A website that works as hard as you do.", one="Fast, beautiful WordPress sites built to turn visitors into calls, bookings and orders.",
       lede="Your website is the one piece of marketing you own outright. We design it to load fast, read clearly on a phone and make the next step obvious — then we keep it running.",
       bullets=["Custom design, built on WordPress so you can edit it yourself", "Mobile-first, accessible and quick to load", "Copywriting, photography direction and on-page SEO included", "Booking, menus, inventory and e-commerce when you need them", "Hosting, backups, security and updates with a care plan"],
       proof="Hotel Lexen saw over 1,000 direct bookings in the first 12 months after its new site launched.",
       faqs=[("How long does a website take?", "A launch site takes 2–3 weeks; a business site 3–5 weeks. Custom builds depend on the scope we agree in discovery."),
             ("Do I own the website?", "Yes. The domain, hosting account and WordPress site are yours. If you ever leave, you take everything with you."),
             ("Can you work with my existing site?", "Often, yes. We'll audit it first and tell you honestly whether to rebuild or improve what you have.")]),
  dict(slug="seo", icon="search", name="Search engine optimization", short="SEO",
       h="Show up when it matters: the moment someone searches.", one="Local SEO that gets you on the map, in the pack and on page one for the searches that bring customers.",
       lede="Most local customers start with a search. We make sure your business is the one they find — on Google Maps, in the local pack, in organic results and increasingly in AI answers.",
       bullets=["Keyword research based on how your customers actually search", "Google Business Profile optimization and weekly posting", "On-page and technical SEO: speed, structure, schema markup", "Local citations and listings kept accurate everywhere", "Local content and landing pages for each service and area", "Monthly rankings, traffic and lead reports you can read in two minutes"],
       proof="We track leads, calls and bookings — not just rankings — so you know what the work is worth.",
       faqs=[("How long until SEO works?", "Google Business Profile improvements often show within weeks. Competitive organic rankings usually take 3–6 months of consistent work."),
             ("Do you guarantee page one?", "No one honest does. We guarantee the work, transparent reporting and a plan built on your real competition."),
             ("What is AI search visibility?", "People now ask ChatGPT, Gemini and Perplexity for recommendations. We structure your content and data so those engines understand and cite your business.")]),
  dict(slug="social-media", icon="heart", name="Social media management", short="Social media",
       h="A feed that looks like a brand, not a chore.", one="Planned, designed and posted for you — with replies, stories and the kind of consistency that builds a following.",
       lede="Posting now and then doesn't move the needle. A steady, well-designed presence does. We plan a month at a time, design every post to your brand and handle the comments and messages.",
       bullets=["Monthly content calendar approved by you before anything goes out", "Posts, stories and reels designed in your brand", "Community management: comments and DMs answered", "Instagram, Facebook, TikTok, LinkedIn and Google posts", "Short-form video editing from footage you send us", "Paid boosts and ad campaigns when you want reach fast"],
       proof="Every post is designed by a person, scheduled on purpose and tied to something you're trying to sell that month.",
       faqs=[("Which platforms should I be on?", "Where your customers are. For most local businesses that means Instagram, Facebook and Google; for B2B it's LinkedIn. We'll recommend 2–3 and do them well."),
             ("Do I need to send you content?", "Photos and short clips from your phone go a long way. We'll give you a simple monthly shot list, and we handle the rest."),
             ("Can you run ads too?", "Yes. Paid social and Google Ads are included in Pulse Max, or added to any plan. Ad spend is billed to your own ad account.")]),
  dict(slug="reputation", icon="star", name="Reputation management", short="Reputation",
       h="Reviews are the new word of mouth. Own them.", one="More five-star reviews, fast responses to every one, and listings that say the same thing everywhere.",
       lede="Before anyone calls, books or walks in, they read your reviews. We help you earn more of the good ones, respond to all of them within a business day and keep your name, hours and details consistent across the web.",
       bullets=["Automated review requests by text and email after every visit", "Monitoring across Google, Yelp, Facebook, TripAdvisor and industry sites", "Thoughtful, on-brand responses to every review within one business day", "Alerts and a calm playbook for negative reviews", "Listings management: one correct name, address, phone and hours everywhere", "Reputation score and competitor comparison in your monthly report"],
       proof="Businesses that reply to reviews are seen as 1.7× more trustworthy, and a one-star improvement can lift revenue 5–9%.",
       faqs=[("Can you remove bad reviews?", "Only reviews that break a platform's rules can be flagged, and we do that. For the rest, a prompt, professional response does more good than most people expect."),
             ("Is asking for reviews allowed?", "Yes, as long as you ask everyone and don't pay for them. Our requests follow each platform's guidelines."),
             ("What about listings?", "Wrong hours or an old phone number on a directory costs you customers quietly. We fix and lock your listings across 40+ sites.")]),
  dict(slug="local-listings", icon="pin", name="Local listings & Google Business Profile", short="Local listings",
       h="One correct answer, everywhere people look.", one="Google Business Profile, Apple Maps, Bing, Yelp and 40+ directories — set up, verified and kept in sync.",
       lede="Your Google Business Profile is often the first thing a customer sees. We claim it, complete it, post to it weekly and keep every other listing matching, so maps, voice assistants and AI engines all agree about who you are.",
       bullets=["Claiming, verification and full profile completion", "Categories, services, products, photos and Q&A", "Weekly Google posts and offers", "Duplicate removal and sync across 40+ directories", "Apple Business Connect and Bing Places", "Insights: calls, direction requests and website taps every month"],
       proof="Complete, active profiles get more calls and direction requests than listings that are merely claimed.",
       faqs=[("I already have a Google listing. Why do I need this?", "Most profiles are 40% complete and never posted to. Completing and feeding yours is one of the highest-return things in local marketing."),
             ("Does this help with AI search?", "Yes. AI engines lean on consistent structured data about your business. Clean listings are the foundation.")]),
  dict(slug="ai-search", icon="ai", name="AI search visibility", short="AI search (GEO)",
       h="Be the business the AI recommends.", one="Generative engine optimization: content and structured data that get you cited by ChatGPT, Gemini and Perplexity.",
       lede="A growing share of “where should I eat?” and “who's the best dentist near me?” questions are asked to AI assistants. They answer from sources they trust. We make your business one of them.",
       bullets=["AI visibility audit: how ChatGPT, Gemini and Perplexity describe you today", "Schema markup for your business, services, menus, reviews and FAQs", "Answer-first content: FAQs and guides written the way people ask", "Entity consistency across listings, social and your site", "Monthly check of prompts, mentions and citations", "Included in Pulse Pro, or add it to any plan"],
       proof="The same work that helps AI engines — clear structure, consistent facts, useful answers — also lifts traditional SEO.",
       faqs=[("Is this just SEO with a new name?", "It overlaps, but AI engines weigh different signals: structured data, third-party mentions and content that answers a question directly. We do both."),
             ("How do you measure it?", "We run a set of real customer prompts every month and report whether and how your business is mentioned.")]),
]
SERVICE_BY = {s["slug"]: s for s in SERVICES}

INDUSTRIES = [
  dict(slug="hotels", name="Hotels & hospitality", h="More direct bookings, fewer commissions.", lede="A fast booking-first website, listings that say you're open, and reviews answered before the next guest reads them.", points=["Direct booking websites and metasearch presence", "TripAdvisor, Google and OTA review management", "Social content that sells the neighborhood, not just the room"], proof="Hotel Lexen, North Hollywood: 1,000+ direct bookings in 12 months."),
  dict(slug="restaurants", name="Restaurants & bars", h="Full tables start on a phone.", lede="Menus that load instantly, Google profiles that show tonight's special and a feed that makes people hungry.", points=["Menu, reservations and online ordering built in", "Weekly Google posts and specials", "Reels and stories from your own kitchen footage"], proof="Review response within a business day — every platform."),
  dict(slug="medical", name="Medical & dental", h="Trust, before the first appointment.", lede="Patients choose by reviews and convenience. We make both work for you, within the rules.", points=["HIPAA-aware review responses and request flows", "Service pages that answer real patient questions", "Listings and hours correct across every directory"], proof="Reputation and local SEO built for practices."),
  dict(slug="automotive", name="Car dealerships & auto services", h="Be the first stop for sales and service.", lede="Inventory-ready websites, service specials on Google and reviews that keep the service lane busy.", points=["Inventory and service landing pages", "Google Business Profile for sales and service", "Review generation after every repair order"], proof="Local SEO for sales and service as separate journeys."),
  dict(slug="home-services", name="Home services & professionals", h="The call goes to whoever shows up first.", lede="Plumbers, contractors, lawyers and accountants win on local search and reviews. That's what we do.", points=["Service-area pages for every city you serve", "Review generation that runs itself", "Google Local Services Ads setup"], proof="Lead tracking so you know which jobs came from where."),
]

# ---------------------------------------------------------------- navigation
NAV = [
  ("menu", "Services", "services", [
    ("All services", "services/", "Websites, SEO, social, reputation, listings and AI search — together or one at a time", True),
  ] + [(s["name"], f"services/{s['slug']}/", s["one"].split(" — ")[0][:70].rstrip(".")) for s in SERVICES]),
  ("menu", "Industries", "industries", [
    ("Who we work with", "industries/", "Marketing built around how your customers choose", True),
  ] + [(i["name"], f"industries/{i['slug']}/", i["h"]) for i in INDUSTRIES]),
  ("menu", "Results", "customer-stories", [
    ("Customer stories", "customer-stories/", "What happened when businesses handed us the work", True),
  ] + [(st["name"], f"customer-stories/{st['slug']}/", st["headline"]) for st in STORIES] + [("Our work", "work/", "Selected projects and testimonials")]),
  ("menu", "Resources", "resources", [
    ("Guides & resources", "resources/", "Plain-English guides from the team", True),
  ] + [(g["title"][:52] + ("…" if len(g["title"]) > 52 else ""), f"resources/{g['slug']}/", g["cat"]) for g in GUIDES[:5]] + [("Common questions", "faqs/", "Contracts, reporting, ownership")]),
  ("link", "Pricing", "pricing/"),
  ("menu", "Company", "company", [
    ("About CityPulse Digital", "about/", "A Phoenix team with a national reach", True),
    ("How we work", "how-we-work/", "From audit to launch to monthly growth"),
    ("Contact us", "contact/", "Talk with the team"),
    ("Client support", "support/", "For current clients"),
    ("CityPulse Kiosks", KIOSKS_URL, "Our sister company: ads on venue kiosks"),
  ]),
]

BRAND_LOGO = ('<picture><source media="(max-width: 560px)" srcset="{R}assets/logo-compact.svg">'
              '<img src="{R}assets/logo-anim.svg" alt="CityPulse Digital" width="591" height="97"></picture>')

def _href(h):
    return h if h.startswith("http") else "{R}" + h

def header(active):
    out = []
    for item in NAV:
        if item[0] == "link":
            _, label, href = item
            cur = ' aria-current="page"' if active == href else ""
            out.append(f'<a href="{_href(href)}"{cur}>{label}</a>')
        else:
            _, label, key, links = item
            cur = " current" if (active and active.startswith(key)) or any(active == l[1] for l in links) else ""
            mid = f"menu-{key}"
            lis = "".join(
                f'<a href="{_href(l[1])}"{" class=\"mega-lead\"" if len(l) > 3 else ""}{" target=\"_blank\" rel=\"noopener\"" if l[1].startswith("http") else ""}><b>{l[0]}</b><span>{l[2]}</span></a>'
                for l in links)
            out.append(f'<div class="nav-item{cur}"><button class="nav-btn" aria-expanded="false" aria-controls="{mid}">{label}{icon("chev","")}</button><div class="mega" id="{mid}">{lis}</div></div>')
    ann = "".join(f'<a class="ann{" on" if i == 0 else ""}" href="{_href(h)}"><b>{t}</b><span>{m}</span>{icon("arrow","")}</a>' for i, (t, m, h) in enumerate(ANNOUNCEMENTS))
    return f'''<a class="skip" href="#main">Skip to content</a>
<div class="ann-bar" data-ann><div class="wrap ann-inner"><button class="ann-nav" type="button" data-ann-prev aria-label="Previous announcement">{icon("chev","")}</button><div class="ann-track">{ann}</div><button class="ann-nav" type="button" data-ann-next aria-label="Next announcement">{icon("chev","")}</button><a class="ann-cta" href="{{R}}free-audit/">Is your business ready for AI search? <b>Request a free audit</b></a></div></div>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="{{R}}" aria-label="CityPulse Digital home">{BRAND_LOGO}</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="sr">Menu</span><i></i><i></i></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      {"".join(out)}
      <a class="btn btn-small header-cta" href="{{R}}free-audit/">Free audit</a>
    </nav>
  </div>
</header>'''

SOCIALS = []  # e.g. ("Instagram", "https://www.instagram.com/citypulsedigital/")
def socials_html():
    return ('<p class="socials">' + "".join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in SOCIALS) + '</p>') if SOCIALS else ""

def footer():
    col = lambda title, links: f'<div><h2>{title}</h2><nav aria-label="{title}">' + "".join(f'<a href="{_href(h)}">{t}</a>' for t, h in links) + "</nav></div>"
    return f'''<section class="news-band" aria-labelledby="news-title"><div class="wrap news-grid">
  <div><p class="eyebrow">Stay ahead with us</p><h2 id="news-title">Learn with us &amp; stay connected.</h2><p>One email a month: what changed in local search, reviews and AI answers, and what to do about it. No spam, ever.</p></div>
  <form class="news-form draft-form" id="newsletter" data-to="{EMAIL}" data-subject="Newsletter signup" data-review="newsletter-review" data-done="You're on the list. Welcome." novalidate>
    <label class="sr" for="news-email">Email</label><input id="news-email" type="email" name="Email" placeholder="Enter your email" required autocomplete="email"><input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn" type="submit">Subscribe</button>
    <p class="form-error" role="alert" hidden></p><p class="fine">We won't distribute or sell your information. <a href="{{R}}privacy/">Privacy policy</a>.</p>
  </form>
  <div class="draft-review" id="newsletter-review" hidden><h3 tabindex="-1">Almost there.</h3><p class="review-lede">We couldn't add you automatically — open the email and press send.</p><pre></pre><div class="btn-row"><button class="btn" type="button" data-draft="open">Open in email</button><button class="btn btn-ghost" type="button" data-draft="edit">Try again</button></div><p class="copied" role="status"></p></div>
  <div class="form-done" id="newsletter-done" hidden><span class="done-ico">{icon("check","")}</span><h3 tabindex="-1">You're in.</h3><p>Welcome — the next issue will find you.</p></div>
</div></section>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand"><img src="{{R}}assets/logo-stacked-light.svg" alt="CityPulse Digital" width="402" height="122"><p>Websites, search, social and reputation for businesses that want to be found — and chosen.</p>
      <p class="footer-addr"><b>Headquarters</b>{ADDR1}<br>{ADDR2}</p>
      <p class="footer-addr"><b>Sales</b><a href="tel:{TEL}">{PHONE}</a><b>Support</b><a href="mailto:{SUPPORT}">{SUPPORT}</a><b>Email</b><a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
    {col("Services", [(s["short"], f"services/{s['slug']}/") for s in SERVICES] + [("Pricing", "pricing/")])}
    {col("Industries", [(i["name"], f"industries/{i['slug']}/") for i in INDUSTRIES])}
    {col("Company", [("About us","about/"),("How we work","how-we-work/"),("Customer stories","customer-stories/"),("Our work","work/"),("Guides & resources","resources/"),("Common questions","faqs/"),("Contact us","contact/"),("Client support","support/")])}
    {col("CityPulse", [("Free digital audit","free-audit/"),("CityPulse Kiosks", KIOSKS_URL),("Terms & Conditions","terms/"),("Privacy Policy","privacy/")])}
  </div>
  <div class="wrap footer-base"><span>© <span id="year">2026</span> {LEGAL}. All rights reserved.</span><nav aria-label="Legal"><a href="{{R}}privacy/">Privacy Policy</a><a href="{{R}}terms/">Terms &amp; Conditions</a><a href="{{R}}contact/">Contact</a></nav>{socials_html()}</div>
</footer>
<div class="m-cta" id="m-cta"><span><b>Free digital audit</b>See how you rank, in 2 business days</span><a class="btn" href="{{R}}free-audit/">Get it</a></div>'''

PAGES = []
PAGE_DATA = []  # used by build/export_wp.py

def page(path, title, desc, body, active=None, extra_js=()):
    """path like 'services/' or '' for home."""
    PAGE_DATA.append(dict(path=path, title=title, desc=desc, body=body, active=active, extra_js=list(extra_js)))
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
<meta property="og:image" content="https://{DOMAIN}/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="{SITE}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0F1C2B">
<link rel="icon" href="{{R}}assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="{{R}}assets/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="{{R}}assets/apple-touch-icon.png">
<link rel="manifest" href="{{R}}assets/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{R}}assets/styles.css?v=1">
</head>
<body>
{header(active or path)}
<main id="main">
{body}
</main>
{footer()}
<script src="{{R}}assets/config.js"></script>
<script src="{{R}}assets/integrations.js"></script>
{''.join(f'<script src="{{R}}assets/{j}"></script>' for j in extra_js)}
<script src="{{R}}assets/site.js?v=1"></script>
</body>
</html>
'''
    doc = pricing.fill(doc.replace("{R}", root))
    doc = doc.replace("</head>", structured_data(path, title, body) + "</head>")
    dest = os.path.join(OUT, path, "index.html")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w") as f:
        f.write(doc)
    PAGES.append(path)

import re as _re, json as _j
def _strip(h):
    return html.unescape(_re.sub(r"<[^>]+>", "", h)).strip()
def structured_data(path, title, body):
    """FAQPage and BreadcrumbList JSON-LD derived from the page's own markup."""
    out = []
    faqs = _re.findall(r"<details[^>]*>\s*<summary>(.*?)</summary>\s*<div>(.*?)</div>\s*</details>", body, _re.S)
    if faqs:
        out.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": _strip(q), "acceptedAnswer": {"@type": "Answer", "text": _strip(a)}} for q, a in faqs]})
    crumbs_m = _re.search(r'<ol class="crumbs"[^>]*>(.*?)</ol>', body, _re.S)
    if crumbs_m:
        items = _re.findall(r'<li[^>]*>(?:<a href="\{R\}([^"]*)">)?(.*?)(?:</a>)?</li>', crumbs_m.group(1))
        lst = [{"@type": "ListItem", "position": i + 1, "name": _strip(n), "item": f"https://{DOMAIN}/{h}"} for i, (h, n) in enumerate(items)]
        out.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": lst})
    if not path:
        out.append({"@context": "https://schema.org", "@type": "ProfessionalService", "name": SITE, "legalName": LEGAL, "url": f"https://{DOMAIN}/", "logo": f"https://{DOMAIN}/assets/logo.png", "image": f"https://{DOMAIN}/assets/og-card.png", "telephone": "+1-602-887-4058", "email": EMAIL,
                    "address": {"@type": "PostalAddress", "streetAddress": ADDR1, "addressLocality": "Phoenix", "addressRegion": "AZ", "postalCode": "85040", "addressCountry": "US"}, "areaServed": "US", "priceRange": "$$",
                    "knowsAbout": [x["name"] for x in SERVICES]})
    return "".join(f'<script type="application/ld+json">{_j.dumps(o, ensure_ascii=False)}</script>\n' for o in out)

# ---------------------------------------------------------------- components
def crumbs(trail):
    items = ['<li><a href="{R}">Home</a></li>']
    for label, href in trail[:-1]:
        items.append(f'<li><a href="{{R}}{href}">{label}</a></li>')
    items.append(f'<li aria-current="page">{trail[-1][0]}</li>')
    return f'<ol class="crumbs" aria-label="Breadcrumb">{"".join(items)}</ol>'

def btns(*items, cls="btn-row"):
    out = []
    for it in items:
        label, href = it[0], it[1]
        kind = it[2] if len(it) > 2 else ""
        ext = href.startswith(("http", "mailto", "tel", "#"))
        out.append(f'<a class="btn {kind}" href="{href if ext else "{R}" + href}">{label}</a>')
    return f'<div class="{cls}">{"".join(out)}</div>'

def page_hero(trail, h1, lede, buttons="", aside="", dark=True, eyebrow=""):
    cls = "page-hero dark" if dark else "page-hero"
    aside_html = f'<div class="hero-aside">{aside}</div>' if aside else ""
    eb = f'<p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
    return f'''<section class="{cls}"><div class="wrap">{crumbs(trail)}
  <div class="hero-grid{'' if aside else ' solo'}"><div>{eb}<h1>{h1}</h1><p class="lede">{lede}</p>{buttons}</div>{aside_html}</div>
</div></section>'''

def section(inner, cls="", id=None):
    idattr = f' id="{id}"' if id else ""
    return f'<section class="section {cls}"{idattr}><div class="wrap">{inner}</div></section>'

def head(h2, p="", eyebrow="", hid=None):
    hid_attr = f' id="{hid}"' if hid else ""
    eb = f'<p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
    return f'<div class="section-head"><div>{eb}<h2{hid_attr}>{h2}</h2></div>{f"<p>{p}</p>" if p else ""}</div>'

def check_list(items):
    return '<ul class="check-list">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"

def service_cards(items=None, compact=False):
    items = items or SERVICES
    cards = "".join(f'''<a class="svc-card" href="{{R}}services/{s["slug"]}/"><span class="svc-ico">{icon(s["icon"], "")}</span><h3>{s["name"]}</h3><p>{s["one"]}</p><span class="svc-more">Learn more {icon("arrow","")}</span></a>''' for s in items)
    return f'<div class="svc-grid{" compact" if compact else ""}">{cards}</div>'

def faq_html(items):
    return "".join(f'<details data-item><summary>{q}</summary><div><p>{a}</p></div></details>' for q, a in items)

def stats(items, dark=False):
    return f'<dl class="stats{" dark" if dark else ""}">' + "".join(f'<div><dd data-count="{n}">{n}</dd><dt>{l}</dt></div>' for n, l in items) + "</dl>"

TESTIMONIALS = [
  ("D. Desai", "Hotel Lexen, North Hollywood", "The team delivered an exceptional new website for our Lexen hotel property. Since its launch I have seen over 1,000 bookings in the last 12 months alone. I would recommend them to every business owner."),
  ("G. Agarwal", "E-commerce brand", "They did an outstanding job reinventing our brand. We saw a direct positive impact in our e-commerce sales growth over the last two years, which we can attribute to their work."),
  ("P. Moreno", "Restaurant owner", "We are so happy with our new restaurant website and the help with social media. Thank you for all your help and hard work!"),
  ("D. David", "Professional services", "A great job on our new website UX/UI. Happy for their support!"),
  ("J. Pedro", "Local business", "We are very happy with our new logo! Would recommend them all day."),
]
def testimonials(n=3, cls=""):
    cards = "".join(f'<figure class="quote"><blockquote>“{q}”</blockquote><figcaption><b>{who}</b><span>{where}</span></figcaption></figure>' for who, where, q in TESTIMONIALS[:n])
    return f'<div class="quotes {cls}">{cards}</div>'

def cta_band(h="Let's find out where you stand.", p="A free digital audit shows how you rank, how you look and what to fix first. No pitch deck, no pressure.", primary=("Get my free audit", "free-audit/"), secondary=("Talk to us", "contact/")):
    return f'''<section class="cta-band"><div class="wrap cta-inner"><div><h2>{h}</h2><p>{p}</p></div>
  {btns(primary, (secondary[0], secondary[1], "btn-ghost"))}</div></section>'''

def kiosk_band():
    return f'''<section class="kiosk-band"><div class="wrap kiosk-grid">
  <div><p class="eyebrow">Sister company</p><h2>Online and in the lobby.</h2>
    <p>CityPulse Digital clients can also run their ad on CityPulse Kiosks — touch-screen concierge kiosks in hotel lobbies, waiting rooms and dealerships across the US. One brand, seen on the phone and in the room.</p>
    <div class="btn-row"><a class="btn btn-ghost" href="{KIOSKS_URL}" target="_blank" rel="noopener">Visit CityPulse Kiosks</a></div></div>
  <div class="kiosk-art" aria-hidden="true"><div class="kb-screen"><span class="kb-top"></span><span class="kb-tiles"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="kb-ad"><b>Your ad here</b></span></div></div>
</div></section>'''

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

def draft_form(fid, to, subject, fieldsets, ack, button, subject_field=None, done="Thanks — we'll be in touch within one business day."):
    fs = "".join(f'<fieldset><legend>{legend}</legend>{"".join(fields)}</fieldset>' for legend, fields in fieldsets)
    sf = f' data-subject-field="{subject_field}"' if subject_field else ""
    return f'''<form class="draft-form" id="{fid}" data-to="{to}" data-subject="{e(subject)}" data-review="{fid}-review" data-done="{e(done)}"{sf} novalidate>
  {fs}
  <input type="text" name="_gotcha" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <label class="ack"><input type="checkbox" name="ack" required> <span>{ack}</span></label>
  <p class="form-error" role="alert" hidden></p>
  <div class="form-foot"><button class="btn" type="submit">{button}</button><span class="fine">We reply within one business day.</span></div>
</form>
<div class="draft-review" id="{fid}-review" hidden>
  <h3 tabindex="-1">Your message is ready.</h3>
  <p class="review-lede">We couldn't send it automatically, so open it in your email app and press send — or copy it.</p>
  <pre></pre>
  <div class="btn-row"><button class="btn" type="button" data-draft="open">Open in email</button><button class="btn btn-ghost" type="button" data-draft="copy">Copy text</button><button class="btn btn-ghost" type="button" data-draft="edit">Edit details</button></div>
  <p class="copied" role="status"></p>
</div>
<div class="form-done" id="{fid}-done" hidden><span class="done-ico">{icon("check","")}</span><h3 tabindex="-1">Sent.</h3><p>{done}</p></div>'''

def form_section(fid, h2, p, steps, form_html, dark=False, eyebrow=""):
    sl = "".join(f"<li><span>{i+1}</span>{s}</li>" for i, s in enumerate(steps))
    cls = "section dark" if dark else "section"
    eb = f'<p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
    return f'''<section class="{cls}" id="{fid}"><div class="wrap form-wrap">
  <div>{eb}<h2>{h2}</h2><p class="lede" style="margin-top:16px">{p}</p><ol class="steps-mini">{sl}</ol>
    <div class="talk"><span class="fine">Prefer to talk?</span><a href="tel:{TEL}">{PHONE}</a><a href="mailto:{EMAIL}">{EMAIL}</a></div></div>
  <div>{form_html}</div>
</div></section>'''

CATEGORIES = ["Hotel / hospitality", "Restaurant / bar", "Medical / dental", "Car dealership / auto services", "Home services / contractor", "Retail / e-commerce", "Professional services", "Real estate", "Other"]
INTERESTS = ["Help me choose", "Website design", "SEO / local search", "Social media management", "Reputation management", "Local listings / Google Business Profile", "AI search visibility", "Everything — a growth plan"]
BUDGETS = ["Under $500 / month", "$500 – $1,000 / month", "$1,000 – $2,000 / month", "$2,000 – $5,000 / month", "More than $5,000 / month", "One-time project"]

def audit_form():
    return draft_form("audit-form", EMAIL, "Free digital audit request", [
        ("Your business", [
            field("Website address", "Website", "url", required=True, ph="https://yourbusiness.com", full=True, hint="No website yet? Type “none” and we'll audit your listings and social instead."),
            field("Business name", "Business", required=True),
            field("Industry", "Category", "select", options=CATEGORIES),
            field("City / state", "City / state", required=True, ph="e.g. Phoenix, AZ"),
            field("What matters most right now?", "Priority", "select", options=["More calls and leads", "More bookings or orders", "Better reviews and reputation", "A better website", "Showing up on Google and AI search", "Social media that looks professional", "Not sure — tell me"]),
        ]),
        ("Where to send it", [
            field("Your name", "Contact name", required=True),
            field("Email", "Email", "email", required=True),
            field("Phone", "Phone", "tel", opt=True),
            field("Anything we should know?", "Notes", "textarea", full=True, opt=True, ph="Competitors you watch, goals, what you've tried…"),
        ]),
    ], "I'd like CityPulse Digital to review my online presence and send me the results. No obligation.", "Send my audit request", subject_field="Business",
       done="Thanks — your audit will be in your inbox within two business days.")

def contact_form():
    return draft_form("contact-form", EMAIL, "Website inquiry", [
        ("How can we help?", [
            field("I'm interested in", "Interest", "select", options=INTERESTS),
            field("Monthly budget", "Budget", "select", options=BUDGETS, opt=True),
            field("Business name", "Business", required=True),
            field("Website", "Website", "url", opt=True, ph="https://"),
            field("Tell us about your business and goals", "Message", "textarea", full=True, required=True),
        ]),
        ("Your contact details", [
            field("Your name", "Contact name", required=True),
            field("Email", "Email", "email", required=True),
            field("Phone", "Phone", "tel", opt=True),
        ]),
    ], "I understand this starts a conversation, not a contract. Pricing and scope are confirmed in a written proposal.", "Send message", subject_field="Business")

def support_form():
    return draft_form("support-form", SUPPORT, "Client support request", [
        ("Your request", [
            field("Business name", "Business", required=True),
            field("What do you need?", "Request type", "select", options=["Website change or fix", "Social media post or calendar", "Review or listing issue", "Report or billing question", "Something else"], required=True),
            field("How urgent is it?", "Urgency", "select", options=["Whenever — this week is fine", "Soon — within 2 business days", "Urgent — site down or wrong information live"]),
            field("Describe the request", "Details", "textarea", full=True, required=True, ph="Links, screenshots you'll email, what should change…"),
        ]),
        ("Your contact details", [
            field("Your name", "Contact name", required=True),
            field("Email", "Email", "email", required=True),
            field("Phone", "Phone", "tel", opt=True),
        ]),
    ], "I'll keep passwords and payment details out of this request.", "Send request", subject_field="Business",
       done="Got it. Urgent requests are picked up within hours; everything else within one business day.")

FAQS = [
  ("Do I have to sign a long contract?", "No. Monthly plans run month to month after an initial three months, which is the minimum time for SEO and social to show results. Website projects are a one-time agreement with a 50% deposit."),
  ("What does the free audit include?", "A written review of your website (speed, mobile, SEO basics), your Google Business Profile and listings, your reviews and your social presence, with the three things we'd fix first. It takes us about two business days."),
  ("Who owns the website, content and accounts?", "You do. Your domain, hosting, WordPress site, social accounts and ad accounts stay in your name. We work inside them as a manager, and we hand everything back cleanly if you ever leave."),
  ("How do you report results?", "A one-page monthly report in plain English: what we did, what moved (calls, leads, rankings, reviews, followers) and what's next. Pulse Pro and Max clients also get a quarterly or monthly strategy call."),
  ("Can I start with one service?", "Yes. Social media, local SEO, reputation and AI search visibility are each available on their own. Most clients start with one and bundle into a plan once they see the reports."),
  ("Do you work with businesses outside Arizona?", "Yes. We're based in Phoenix and work with clients across the US. Everything is handled by video call, email and a shared monthly plan."),
  ("How is CityPulse Digital related to CityPulse Kiosks?", "Same founders, two companies. CityPulse Kiosks places ads on touch-screen kiosks in hotels and venues; CityPulse Digital handles your online presence. Clients of one get introductions and bundles with the other."),
  ("What happens if I'm not happy?", "Tell us. We'll fix the work first. If it still isn't right, monthly plans can be cancelled with 30 days' notice after the initial term, and you keep everything we've built."),
]

# ---------------------------------------------------------------- deep-site components
def subnav(items, active):
    """Pill sub-navigation under a page hero (service or industry families)."""
    lis = "".join(f'<a href="{{R}}{h}"{" aria-current=\"page\"" if h == active else ""}>{l}</a>' for l, h in items)
    return f'<nav class="subnav" aria-label="Section"><div class="wrap">{lis}</div></nav>'

def feature_sections(items, art_icon="spark"):
    """Alternating heading + paragraph + bullets blocks (Milestone-style)."""
    out = []
    for i, (h, p, bullets) in enumerate(items):
        side = "flip" if i % 2 else ""
        n = f"{i+1:02d}"
        out.append(f'''<section class="feature {side}"><div class="wrap feature-grid">
  <div class="feature-copy"><span class="f-num">{n}</span><h2>{h}</h2><p>{p}</p>{check_list(bullets)}</div>
  <div class="feature-art" aria-hidden="true"><div class="f-card"><span class="f-ico">{icon(art_icon,"")}</span><ul>{"".join(f"<li>{b.split(chr(58))[0].split(chr(44))[0]}</li>" for b in bullets[:4])}</ul></div></div>
</div></section>''')
    return "".join(out)

def expect_timeline(items):
    return '<ol class="timeline">' + "".join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in items) + "</ol>"

VALUES = [
  ("Collaborative", "We work inside your accounts with you, not around you. You see every post, page and reply before or as it goes out."),
  ("Plain-spoken", "No jargon, no vanity metrics. Reports talk about calls, bookings, reviews and revenue."),
  ("Nimble", "A Phoenix team that answers the phone. Changes happen in days, not quarters."),
  ("Local-first", "Hotels, restaurants, practices, dealerships and trades are the whole business — where being found locally decides the month."),
]
def value_cards():
    return '<div class="values">' + "".join(f'<div class="value"><span class="v-ico">{icon("check","")}</span><h3>{t}</h3><p>{d}</p></div>' for t, d in VALUES) + "</div>"

def counters(items, dark=True):
    return f'<dl class="counters{" dark" if dark else ""}">' + "".join(f'<div><dd><span data-counter="{n}">{n}</span></dd><dt>{l}</dt></div>' for n, l in items) + "</dl>"

def story_card(st):
    bg = f'style="--c:{st["color"]};background-image:linear-gradient(180deg,rgba(15,28,43,.1),rgba(15,28,43,.85)),url({{R}}assets/{st["photo"]})"' if st.get("photo") else f'style="--c:{st["color"]}"'
    return f'''<a class="story-card" href="{{R}}customer-stories/{st["slug"]}/" {bg}><span class="case-pill">{st["industry"]}</span><b>{st["name"]}</b><span class="story-h">{st["headline"]}</span><span class="svc-more">Read the story {icon("arrow","")}</span></a>'''

def story_grid(slugs=None):
    items = [s for s in STORIES if not slugs or s["slug"] in slugs]
    return '<div class="story-grid">' + "".join(story_card(s) for s in items) + "</div>"

def guide_card(g):
    return f'<a class="guide-card" href="{{R}}resources/{g["slug"]}/"><span class="kind">{g["cat"]}</span><h3>{g["title"]}</h3><p>{g["lede"]}</p><span class="meta">{g["read"]} read</span></a>'

def guide_grid(n=None, cls=""):
    return f'<div class="guide-grid {cls}">' + "".join(guide_card(g) for g in (GUIDES[:n] if n else GUIDES)) + "</div>"

import json as _json
LOGOS = _json.load(open(os.path.join(os.path.dirname(__file__), "logos.json")))
def platform_strip():
    """Marquee of the platforms we work in, using each company's own mark (monochrome, from the Simple Icons set)."""
    items = "".join(f'<span><img src="{{R}}assets/logos/{slug}.svg" alt="" width="22" height="22" loading="lazy">{title}</span>' for slug, title in LOGOS)
    return f'<div class="platforms" aria-label="Platforms we work in"><p class="platforms-lbl">Platforms we work in every day</p><div class="platforms-track">{items}{items}</div></div>'

def scorecard():
    """Instant digital-presence scorecard: eight questions, a score out of 100 and the three fixes to make first."""
    Q = [
      ("profile", "Google Business Profile", "Is your Google Business Profile complete — categories, services, 20+ photos — and posted to at least weekly?"),
      ("speed", "Website speed", "Does your website load in under three seconds on a phone, with the phone number visible without scrolling?"),
      ("reviews", "Reviews", "Is your Google rating 4.5 or higher, with new reviews every month?"),
      ("replies", "Review responses", "Does someone reply to every review — good and bad — within a business day?"),
      ("asking", "Review requests", "Do you ask every customer for a review automatically after a visit?"),
      ("listings", "Listings", "Are your name, address, phone and hours identical on Google, Apple, Yelp, Facebook and your site?"),
      ("social", "Social media", "Do you post designed content at least twice a week and answer comments and messages the same day?"),
      ("ai", "AI search", "Does your site have schema markup and an FAQ page written the way customers ask questions?"),
      ("tracking", "Lead tracking", "Do you know how many calls, forms and bookings came from search, social and your site last month?"),
    ]
    qs = "".join(f'''<fieldset class="sc-q" data-key="{k}" data-label="{e(l)}"><legend><span class="sc-qn">{i+1}</span>{q}</legend>
      <div class="sc-opts"><label><input type="radio" name="{k}" value="2"><span>Yes</span></label><label><input type="radio" name="{k}" value="1"><span>Partly</span></label><label><input type="radio" name="{k}" value="0"><span>No / not sure</span></label></div></fieldset>''' for i, (k, l, q) in enumerate(Q))
    return f'''<section class="section scorecard" id="scorecard" aria-labelledby="scorecard-title"><div class="wrap">
  {head("Score your digital presence in two minutes.", "Nine questions, an instant score out of 100 and the three fixes we'd make first. Then request the full audit if you want us to check it properly.", "Instant scorecard", hid="scorecard-title")}
  <div class="sc-grid">
    <form class="sc-form" data-scorecard data-root="{{R}}" novalidate>{qs}
      <p class="form-error" role="alert" hidden></p>
      <div class="form-foot"><button class="btn" type="submit">Show my score</button><span class="fine">Nothing is sent — it runs in your browser.</span></div>
    </form>
    <aside class="sc-placeholder" data-sc-placeholder><div class="sc-ring"><svg viewBox="0 0 120 120"><circle class="sc-track" cx="60" cy="60" r="52"/></svg><div class="sc-num"><b>?</b><span>out of 100</span></div></div><b>Your score appears here.</b><p>Answer the nine questions and press “Show my score”.</p></aside>
    <aside class="sc-result" data-sc-result hidden aria-live="polite">
      <div class="sc-ring"><svg viewBox="0 0 120 120"><circle class="sc-track" cx="60" cy="60" r="52"/><circle class="sc-prog" cx="60" cy="60" r="52" style="stroke-dashoffset:327"/></svg><div class="sc-num"><b data-sc-score>0</b><span>out of 100</span></div></div>
      <p class="sc-verdict" data-sc-verdict></p>
      <ul class="sc-bars" data-sc-bars></ul>
      <h3>Fix these first</h3><ol class="sc-fixes" data-sc-fixes></ol>
      <div class="btn-row"><a class="btn" href="#audit" data-sc-cta>Get the full audit — free</a><button class="btn btn-ghost" type="button" data-sc-reset>Start over</button></div>
    </aside>
  </div>
</div></section>'''

PLAN_MATRIX = [
  ("Google Business Profile optimization & weekly posts", (1, 1, 1)),
  ("Listings synced across 40+ directories", (1, 1, 1)),
  ("Review monitoring & responses within a business day", (1, 1, 1)),
  ("Automated review requests", (1, 1, 1)),
  ("Social media — platforms / posts a month", ("2 / 8", "3 / 16", "3 / 16")),
  ("Stories, reels & community replies", (0, 1, 1)),
  ("Local SEO: keywords, on-page, technical, local content", (0, 1, 1)),
  ("AI search visibility (GEO)", (0, 1, 1)),
  ("Review generation campaigns & competitor tracking", (0, 1, 1)),
  ("Website care plan: updates, backups, security, edits", (0, 1, 1)),
  ("Locations included", ("1", "1", "3")),
  ("Blog articles or landing pages a month", ("—", "—", "2")),
  ("Paid social & Google Ads management", (0, 0, 1)),
  ("Short-form video edits a month", ("—", "—", "4")),
  ("Strategy calls", ("Onboarding", "Quarterly", "Monthly")),
  ("Dedicated account manager", (0, 0, 1)),
  ("Monthly plain-English report", (1, 1, 1)),
]
def plan_matrix():
    cell = lambda v: f'<td class="num">{v}</td>' if isinstance(v, str) else (f'<td class="yes">{icon("check","")}<span class="sr">Included</span></td>' if v else '<td class="no">—</td>')
    rows = "".join(f'<tr><th>{f}</th>{"".join(cell(v) for v in vals)}</tr>' for f, vals in PLAN_MATRIX)
    heads = "".join(f'<th class="num">{p["name"]}<small>{pricing.money(p["price"])}/mo</small></th>' for p in pricing.PLANS)
    return f'<div class="matrix-wrap"><table class="matrix"><thead><tr><th>What\'s included</th>{heads}</tr></thead><tbody>{rows}</tbody></table></div>'


def article_page(trail, title, lede, sections, meta="", cta=None, eyebrow=""):
    toc = "".join(f'<li><a href="#s{i+1}">{h}</a></li>' for i, (h, _) in enumerate(sections))
    body = "".join(f'<h2 id="s{i+1}">{h}</h2>{b}' for i, (h, b) in enumerate(sections))
    cta_html = f'<div class="callout static"><b>{cta[0]}</b><p>{cta[1]}</p>{btns(("Get a free audit", "free-audit/", "btn-small"), ("See pricing", "pricing/", "btn-small btn-ghost"))}</div>' if cta else ""
    return page_hero(trail, title, lede, eyebrow=eyebrow) + f'''<section class="section"><div class="wrap article">
  <aside class="toc"><b>In this guide</b><ol>{toc}</ol><p class="meta">{meta}</p><p class="meta"><a class="text-link" href="{{R}}resources/">All guides</a></p></aside>
  <div class="prose">{body}{cta_html}</div>
</div></section>'''
