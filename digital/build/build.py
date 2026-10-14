"""Every page of the CityPulse Digital site. Run: python3 build/build.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
import legal, pricing
from content import FEATURES, INDUSTRY_DETAIL, STORIES, STORY_BY, GUIDES, GUIDE_BY

# ---------------------------------------------------------------- shared pieces
def score_card():
    """The hero graphic: a 'digital presence' report that fills in as you watch."""
    rows = [("Google ranking", 34, 92, "#3 for “hotel north hollywood”"), ("Reviews", 41, 96, "4.8 ★ · 212 reviews"),
            ("Website speed", 38, 95, "Loads in 1.1s on mobile"), ("Social reach", 22, 88, "+3,400 followers"), ("AI search", 12, 84, "Cited by ChatGPT & Gemini")]
    r = "".join(f'<li style="--a:{a};--b:{b};--i:{i}"><span class="sc-lbl">{l}</span><span class="sc-bar"><i></i></span><span class="sc-val"><s>{a}</s><b>{b}</b></span><small>{n}</small></li>' for i, (l, a, b, n) in enumerate(rows))
    return f'''<div class="score-card" data-score aria-hidden="true">
  <div class="sc-head"><span class="sc-dot"></span><b>Digital presence</b><span class="sc-tag">Live</span></div>
  <div class="sc-ring"><svg viewBox="0 0 120 120"><circle class="sc-track" cx="60" cy="60" r="52"/><circle class="sc-prog" cx="60" cy="60" r="52"/></svg><div class="sc-num"><b data-from="42" data-to="91">42</b><span>out of 100</span></div></div>
  <ul class="sc-rows">{r}</ul>
  <div class="sc-foot"><span>Before</span><span class="sc-arrow">{icon("arrow","")}</span><span>After 90 days with CityPulse</span></div>
</div>'''

def process_steps():
    steps = [("Audit", "We review your site, search, reviews and social and tell you plainly what's working and what isn't. Free, in two business days."),
             ("Plan", "One page: what we'll do, what it costs and what you should expect by when. You keep it even if you don't hire us."),
             ("Build", "Website, profiles, listings, content calendar and review flows set up in the first 30 days."),
             ("Grow", "Every month: posts, SEO work, review responses and a report you can read in two minutes.")]
    return '<ol class="process">' + "".join(f'<li><span class="p-num">0{i+1}</span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(steps)) + "</ol>"

def plan_cards():
    cards = ""
    for p in PLANS:
        pop = ' popular' if p.get("popular") else ""
        badge = '<span class="plan-badge">Most popular</span>' if p.get("popular") else ""
        inc = "".join(f"<li>{i}</li>" for i in p["includes"])
        cards += f'''<article class="plan{pop}">{badge}<h3>{p["name"]}</h3><p class="plan-tag">{p["tagline"]}</p>
  <p class="plan-price"><b>{pricing.money(p["price"])}</b><span>/month</span></p><p class="plan-who">{p["who"]}</p>
  <ul class="plan-list">{inc}</ul>
  <a class="btn{' btn-dark' if not p.get('popular') else ''}" href="{{R}}contact/?plan={p["id"]}">Start with {p["name"]}</a></article>'''
    return f'<div class="plans">{cards}</div>'

def website_cards():
    cards = ""
    for w in WEBSITES:
        pop = ' popular' if w.get("popular") else ""
        price = f'<b>{pricing.money(w["price"])}</b><span>one-time</span>' if w["price"] else '<b>Custom</b><span>quoted</span>'
        inc = "".join(f"<li>{i}</li>" for i in w["includes"])
        cards += f'''<article class="plan{pop}"><h3>{w["name"]}</h3><p class="plan-tag">{w["pages"]}</p><p class="plan-price">{price}</p><p class="plan-who">{w["lead"]}</p><ul class="plan-list">{inc}</ul><a class="btn btn-dark" href="{{R}}contact/?plan=website">Get a quote</a></article>'''
    return f'<div class="plans plans-3">{cards}</div>'

def alacarte_table():
    rows = "".join(f'<tr><th>{n}</th><td>{d}</td><td class="num">{pricing.money(p)}<span>/mo</span></td></tr>' for n, p, d in ALACARTE)
    return f'<table class="price-table"><thead><tr><th>Service</th><th>What\'s included</th><th class="num">Monthly</th></tr></thead><tbody>{rows}</tbody></table>'

from pricing import PLANS, WEBSITES, ALACARTE

# ---------------------------------------------------------------- home
page("", "Websites, SEO, social media & reputation for local businesses", "CityPulse Digital is a Phoenix digital marketing agency: website design, local SEO, social media management, reputation management and AI search visibility for hotels, restaurants, medical practices, dealerships and local businesses nationwide.", f'''
<section class="hero"><div class="wrap hero-grid">
  <div class="hero-copy">
    <p class="eyebrow">Phoenix, Arizona · Clients nationwide</p>
    <h1>Be found.<br>Be chosen.<br><em>Be talked about.</em></h1>
    <p class="lede">Websites, search, social media and reviews — handled by one team, reported on one page. CityPulse Digital is the marketing department small businesses never had.</p>
    <div class="btn-row"><a class="btn" href="{{R}}free-audit/">Get a free digital audit</a><a class="btn btn-ghost" href="{{R}}pricing/">See plans from [[PLAN:pulse]]/mo</a></div>
    <ul class="hero-points"><li>No long contracts</li><li>You own everything</li><li>Reports you can read in 2 minutes</li></ul>
  </div>
  {score_card()}
</div></section>

{platform_strip()}

<section class="section"><div class="wrap">
  {head("Everything your customers see before they call.", "Six services that work better together. Start with one, or hand us the whole thing.", "What we do")}
  {service_cards()}
</div></section>

<section class="section alt ai-sec"><div class="wrap">
  {head("How AI is changing the way customers choose.", "Discovery is shifting from ten blue links to one recommended answer. The businesses that get recommended share three things — and we build all three.", "The shift")}
  <div class="three ai-three">
    <div><span class="big-num">60%</span><h3>of searches now end without a click</h3><p>Google answers on the results page — with your profile, your reviews and your hours. If they're wrong or thin, you lose the customer before your site loads.</p></div>
    <div><span class="big-num">AI</span><h3>is where a growing share of local questions go</h3><p>“Best dentist near me that takes new patients.” ChatGPT, Gemini and Perplexity answer with three names and a reason. We make sure yours is one of them.</p></div>
    <div><span class="big-num">3</span><h3>things the recommended businesses share</h3><p>Consistent facts everywhere, structured data on the site, and content that answers plainly. That's the core of every CityPulse plan.</p></div>
  </div>
  {btns(("AI search visibility", "services/ai-search/", "btn-dark"), ("Read the guide", "resources/show-up-in-ai-search/", "btn-ghost"))}
</div></section>

<section class="section dark proof"><div class="wrap">
  <div class="proof-grid">
    <div><p class="eyebrow">Why it matters</p><h2>Your next customer is already looking.</h2>
      <p class="lede">They search, they read the reviews, they glance at your feed, they tap your site. Every one of those is a moment you either win or lose — and most businesses lose a few without ever knowing.</p></div>
    {counters([("1,000+", "direct hotel bookings from one website in 12 months"), ("350+", "websites designed by our team"), ("$50M+", "in direct bookings driven for clients"), ("1 day", "to answer every review, every platform")])}
  </div>
</div></section>

<section class="section"><div class="wrap">
  {head("Four steps. No mystery.", "You'll always know what we're doing, why, and what it cost.", "How we work")}
  {process_steps()}
  {btns(("See how we work", "how-we-work/", "btn-dark"))}
</div></section>

<section class="section alt"><div class="wrap">
  {head("Built for businesses people visit.", "Hotels, restaurants, practices, dealerships and home services — where local search and reviews decide who gets the call.", "Industries")}
  <div class="ind-grid">{"".join(f'<a class="ind-card" href="{{R}}industries/#{i["slug"]}"><h3>{i["name"]}</h3><p>{i["h"]}</p><span class="svc-more">See how {icon("arrow","")}</span></a>' for i in INDUSTRIES)}</div>
</div></section>

<section class="section"><div class="wrap">
  {head("Customer stories.", "What happened when businesses handed us the work.", "Results")}
  {story_grid()}
  {btns(("All customer stories", "customer-stories/", "btn-dark"), ("Testimonials & work", "work/", "btn-ghost"))}
</div></section>

<section class="section alt" id="plans"><div class="wrap">
  {head("Simple plans. Serious work.", "Month to month after an initial three months. Upgrade any time. <a class='text-link' href='{{R}}pricing/'>Full pricing</a>", "Pricing")}
  {plan_cards()}
  <p class="fine center">Need just one thing? Social media from $399/mo, local SEO from $499/mo, reputation from $199/mo. <a class="text-link" href="{{R}}pricing/#alacarte">See à la carte</a></p>
</div></section>

{kiosk_band()}

<section class="section"><div class="wrap">
  {head("Learn with us.", "Plain-English guides from the team — the same advice we give clients.", "Resources")}
  {guide_grid(3)}
  {btns(("All guides", "resources/", "btn-dark"))}
</div></section>

<section class="section alt"><div class="wrap faq-wrap">
  <div>{head("Common questions.", "", "Questions")}<p class="fine"><a class="text-link" href="{{R}}faqs/">All questions</a></p></div>
  <div class="faq">{faq_html([(q, a) for q, a in FAQS[:4]])}</div>
</div></section>

{cta_band()}
''', extra_js=("home.js",))

# ---------------------------------------------------------------- services
page("services/", "Services", "Website design, local SEO, social media management, reputation management, local listings and AI search visibility — from CityPulse Digital in Phoenix.", f'''
{page_hero([("Services", "services/")], "One team for everything online.", "Each service stands on its own. Together they compound: a fast site ranks better, good reviews lift the map pack, social proof feeds the search results — and AI engines notice all of it.", btns(("Get a free audit", "free-audit/"), ("See pricing", "pricing/", "btn-ghost")), eyebrow="Services")}
<section class="section"><div class="wrap">{service_cards()}</div></section>
<section class="section alt"><div class="wrap">
  {head("Why one team beats five vendors.", "", "Our approach")}
  <div class="three">
    <div><h3>One plan, one report</h3><p>Your website, search, social and reviews are planned together each month and reported on one page. No finger-pointing between agencies.</p></div>
    <div><h3>Everything stays yours</h3><p>Accounts, content, designs and data are in your name from day one. Leave any time after the initial term and take it all with you.</p></div>
    <div><h3>Local businesses are the whole job</h3><p>We don't do enterprise retainers. Hotels, restaurants, practices, dealerships and trades — where being found locally decides the month.</p></div>
  </div>
</div></section>
{cta_band()}
''')

SVC_SUBNAV = [(x["short"], f"services/{x['slug']}/") for x in SERVICES]
for s_ in SERVICES:
    F = FEATURES[s_["slug"]]
    others = [o for o in SERVICES if o["slug"] != s_["slug"]][:3]
    page(f"services/{s_['slug']}/", s_["name"], s_["one"], f'''
{page_hero([("Services", "services/"), (s_["name"], f"services/{s_['slug']}/")], s_["h"], s_["lede"], btns(("Get a free audit", "free-audit/"), ("Talk to us", "contact/", "btn-ghost")), aside=f'<div class="hero-ico">{icon(s_["icon"], "")}</div>', eyebrow=s_["name"])}
{subnav(SVC_SUBNAV, f"services/{s_['slug']}/")}
<section class="section intro-sec"><div class="wrap two-col">
  <div><p class="eyebrow">Overview</p><h2>{s_["one"].split(" — ")[0] if " — " not in s_["one"] else s_["one"].split(" — ")[0]}</h2><p class="lede" style="margin-top:14px">{F["intro"]}</p></div>
  <aside class="callout"><b>{s_["proof"]}</b><p>Included in <a class="text-link" href="{{R}}pricing/">Pulse Pro</a>, or available on its own.</p>{btns(("See pricing", "pricing/", "btn-small btn-dark"))}</aside>
</div></section>
<div class="features">{feature_sections(F["sections"], s_["icon"])}</div>
<section class="section alt"><div class="wrap two-col">
  <div>{head("What you get every month.", "", "Deliverables")}{check_list(F["monthly"])}</div>
  <div>{head("What to expect, and when.", "", "Timeline")}{expect_timeline(F["expect"])}</div>
</div></section>
<section class="section dark"><div class="wrap">{head("Why CityPulse Digital.", "Your reliable client team: collaborative, plain-spoken, nimble and local-first.", "Why us")}{value_cards()}</div></section>
<section class="section"><div class="wrap faq-wrap">
  <div>{head(f"FAQs on {s_['short'].lower()}.", "", "Ask our experts")}<p class="fine"><a class="text-link" href="{{R}}contact/">Ask a question</a></p></div>
  <div class="faq">{faq_html(F["faqs"])}</div>
</div></section>
<section class="section alt"><div class="wrap">{head("Works well with", "", "")}{service_cards(others, compact=True)}</div></section>
{cta_band(h=f"Want {s_['short'].lower()} handled?", p="Start with a free audit — we'll tell you where you stand and what we'd do first.")}
''', active="services")

# ---------------------------------------------------------------- industries
IND_H2 = {"hotels": "Compete with the OTAs where they can't follow.", "restaurants": "Be the answer to \u201cwhere should we eat?\u201d", "medical": "Show up, look credible, make booking easy.", "automotive": "Two journeys, one brand, both found.", "home-services": "First and credible, every time they search."}
IND_SUBNAV = [(i["name"], f"industries/{i['slug']}/") for i in INDUSTRIES]
page("industries/", "Industries", "Digital marketing for hotels, restaurants, medical and dental practices, car dealerships and home services — built around how local customers choose.", f'''
{page_hero([("Industries", "industries/")], "Marketing built around how your customers choose.", "Different businesses win in different places. A hotel lives on direct bookings and reviews; a dentist on trust and convenience; a contractor on being first in the search. We plan around that.", btns(("Get a free audit", "free-audit/")), eyebrow="Who we work with")}
<section class="section"><div class="wrap">
  <div class="ind-grid big">{"".join(f'<a class="ind-card" href="{{R}}industries/{i["slug"]}/"><h3>{i["name"]}</h3><p>{i["lede"]}</p><span class="svc-more">See how {icon("arrow","")}</span></a>' for i in INDUSTRIES)}</div>
</div></section>
{kiosk_band()}
{cta_band()}
''')
for i in INDUSTRIES:
    D = INDUSTRY_DETAIL[i["slug"]]
    svcs = [SERVICE_BY[x] for x in D["services"]]
    st = STORY_BY.get(D["story"]) if D.get("story") else None
    story_html = f'<section class="section alt"><div class="wrap">{head("Customer story.", "", "Results")}{story_grid([st["slug"]])}</div></section>' if st else f'<section class="section alt"><div class="wrap">{head("What clients say.", "", "Results")}{testimonials(3)}</div></section>'
    segs = "".join(f"<span>{x}</span>" for x in D["segments"])
    page(f"industries/{i['slug']}/", D["title"], f"{D['title']}: {D['tagline']} Websites, local SEO, reviews, listings and social media from CityPulse Digital.", f'''
{page_hero([("Industries", "industries/"), (i["name"], f"industries/{i['slug']}/")], i["h"], D["tagline"], btns(("Get a free audit", "free-audit/"), ("Talk to us", "contact/", "btn-ghost")), eyebrow=D["title"], aside=f'<div class="segments"><b>Who this is for</b>{segs}</div>')}
{subnav(IND_SUBNAV, f"industries/{i['slug']}/")}
<section class="section"><div class="wrap two-col">
  <div><p class="eyebrow">A better digital presence for {i["name"].lower()}</p><h2>{IND_H2[i["slug"]]}</h2><p class="lede" style="margin-top:14px">{D["intro"]}</p></div>
  <div>{counters(D["tiles"], dark=False)}</div>
</div></section>
<section class="section alt"><div class="wrap">
  {head("How we approach it.", "Five moves, in the order they pay off.", "Our approach")}
  <ol class="approach">{"".join(f'<li><span class="p-num">0{n+1}</span><h3>{t}</h3><p>{d}</p></li>' for n, (t, d) in enumerate(D["approach"]))}</ol>
</div></section>
<section class="section"><div class="wrap">{head(f"Services for {i['name'].lower()}.", "", "What we do")}{service_cards(svcs)}</div></section>
{story_html}
<section class="section"><div class="wrap faq-wrap">
  <div>{head("Ask our experts.", "The questions " + i["name"].lower() + " ask us most.", "FAQ")}</div>
  <div class="faq">{faq_html(D["faqs"])}</div>
</div></section>
{kiosk_band() if i["slug"] in ("hotels", "medical", "automotive", "restaurants") else ""}
{cta_band(h=f"Let's find out where your {i['name'].split(' &')[0].lower()} stands.", p="A free audit of your site, search, reviews and social — with the three fixes that matter most.")}
''', active="industries")

# ---------------------------------------------------------------- customer stories
page("customer-stories/", "Customer stories", "Results from CityPulse Digital clients: direct bookings, reviews, social media and brand work for hotels, restaurants and e-commerce.", f'''
{page_hero([("Customer stories", "customer-stories/")], "What happened when they handed us the work.", "Real engagements, described plainly. Where a client prefers not to be named, we describe the business and keep the numbers to what they've confirmed.", btns(("Start your story", "contact/")), eyebrow="Customer stories")}
<section class="section"><div class="wrap">{story_grid()}</div></section>
<section class="section alt"><div class="wrap">{head("In their words.", "", "Testimonials")}{testimonials(5, "quotes-5")}</div></section>
{cta_band(h="Want results like these?", p="Tell us about your business. We'll audit where you stand and show you the plan.")}
''')
for st in STORIES:
    art = f'style="--c:{st["color"]};background-image:linear-gradient(180deg,rgba(15,28,43,.05) 30%,rgba(15,28,43,.85)),url({{R}}assets/{st["photo"]})"' if st.get("photo") else f'style="--c:{st["color"]}"'
    who, where, q = st["quote"]
    page(f"customer-stories/{st['slug']}/", f"{st['name']} — {st['headline']}", st["summary"], f'''
{page_hero([("Customer stories", "customer-stories/"), (st["name"], f"customer-stories/{st['slug']}/")], st["headline"], st["summary"], btns(("Get a free audit", "free-audit/"), ("All stories", "customer-stories/", "btn-ghost")), eyebrow=f"{st['industry']} · {st['where']}", aside=f'<div class="case-art story-art" {art}><span class="case-pill">{st["industry"]}</span><b>{st["name"]}</b><span>{st["where"]}</span></div>')}
<section class="section"><div class="wrap">{counters(st["results"], dark=False)}</div></section>
<section class="section alt"><div class="wrap two-col">
  <div><p class="eyebrow">The challenge</p><h2>Where they started.</h2><p class="lede" style="margin-top:14px">{st["challenge"]}</p></div>
  <div><p class="eyebrow">The work</p><h2>What we did.</h2>{check_list(st["work"])}</div>
</div></section>
<section class="section"><div class="wrap narrow"><figure class="quote big"><blockquote>“{q}”</blockquote><figcaption><b>{who}</b><span>{where}</span></figcaption></figure>{f'<p class="fine center" style="margin-top:22px">{st["extra"]}</p>' if st["extra"] else ""}</div></section>
<section class="section alt"><div class="wrap">{head("More stories.", "", "")}{story_grid([x["slug"] for x in STORIES if x["slug"] != st["slug"]])}</div></section>
{cta_band(h="Want results like these?", p="Tell us about your business. We'll audit where you stand and show you the plan.")}
''', active="customer-stories")

# ---------------------------------------------------------------- resources
page("resources/", "Guides & resources", "Plain-English guides on local SEO, Google Business Profile, reviews, website speed, social media and AI search from CityPulse Digital.", f'''
{page_hero([("Resources", "resources/")], "Learn with us.", "The advice we give clients, written down. Use it yourself, or hand it to us.", btns(("Get a free audit", "free-audit/")), eyebrow="Guides & resources")}
<section class="section"><div class="wrap">{guide_grid()}</div></section>
<section class="section alt"><div class="wrap faq-wrap"><div>{head("Common questions.", "", "FAQ")}</div><div class="faq">{faq_html(FAQS[:5])}</div></div></section>
{cta_band()}
''')
for g in GUIDES:
    page(f"resources/{g['slug']}/", g["title"], g["lede"], article_page([("Resources", "resources/"), (g["cat"], "resources/"), (g["title"], f"resources/{g['slug']}/")], g["title"], g["lede"], g["sections"], meta=f"{g['cat']} · {g['read']} read", cta=g["cta"], eyebrow=g["cat"]) + f'''
<section class="section alt"><div class="wrap">{head("More guides.", "", "")}{guide_grid(cls="three-up")}</div></section>
{cta_band()}''', active="resources")

# ---------------------------------------------------------------- pricing
page("pricing/", "Pricing", f"CityPulse Digital plans: Pulse {pricing.money(PLANS[0]['price'])}/mo, Pulse Pro {pricing.money(PLANS[1]['price'])}/mo, Pulse Max {pricing.money(PLANS[2]['price'])}/mo, websites from $1,499, and à la carte social media, SEO and reputation management.", f'''
{page_hero([("Pricing", "pricing/")], "Clear prices. No surprises.", "Every plan is month to month after an initial three months. Ad spend, if any, is billed to your own ad account. Everything we build stays yours.", btns(("Get a free audit first", "free-audit/"), ("Ask a question", "contact/", "btn-ghost")), eyebrow="Pricing")}
<section class="section" id="plans"><div class="wrap">{head("Growth plans.", "Pick the plan that matches where you are. Upgrade any time.", "Monthly")}{plan_cards()}
  <p class="fine center">All plans include onboarding, a monthly report, and access to the team by email and phone. Pulse Max covers up to 3 locations; add more at $450 per location per month.</p></div></section>
<section class="section alt" id="websites"><div class="wrap">{head("Websites.", "One-time projects, built on WordPress so you can edit them yourself. Add the care plan for [[CARE]]/mo and never think about updates again.", "Design & build")}{website_cards()}</div></section>
<section class="section" id="alacarte"><div class="wrap two-col wide">
  <div>{head("À la carte.", "One service, done well, month to month.", "Stand-alone")}{alacarte_table()}</div>
  <aside class="callout"><b>Not sure what you need?</b><p>Request the free audit. We'll show you where you stand and recommend the smallest plan that will actually move the needle — sometimes that's one service.</p>{btns(("Get my free audit", "free-audit/", "btn-small"))}</aside>
</div></section>
<section class="section alt"><div class="wrap faq-wrap">
  <div>{head("Pricing questions.", "", "FAQ")}</div>
  <div class="faq">{faq_html([FAQS[0], FAQS[4], FAQS[2], FAQS[7], ("Is there a setup fee?", "No setup fee on monthly plans. Website projects take a 50% deposit to start, with the balance due before launch."), ("What about ad spend?", "Paid campaigns run from your own Google or Meta ad account, so you pay the platform directly and keep the account history. Our management fee is included in Pulse Max or quoted separately.")])}</div>
</div></section>
{cta_band()}
''')

# ---------------------------------------------------------------- work
page("work/", "Our work", "Results from CityPulse Digital and its predecessor, Landmark Digital Solutions: hotel websites that drive direct bookings, restaurant sites, brand refreshes and social media.", f'''
{page_hero([("Work", "work/")], "Work that paid for itself.", "A selection of projects and results. Our team built and marketed websites for years as Landmark Digital Solutions before becoming CityPulse Digital — same people, bigger toolkit.", btns(("Start a project", "contact/")), eyebrow="Our work")}
<section class="section"><div class="wrap">
  <article class="case"><div class="case-art lexen" aria-hidden="true"><span class="case-pill">Hospitality</span><b>Hotel Lexen</b><span>North Hollywood, CA</span></div>
    <div class="case-body"><p class="eyebrow">Case study</p><h2>1,000+ direct bookings in year one.</h2>
      <p>Hotel Lexen needed a site that could compete with the booking engines for its own guests. We designed a fast, booking-first website with real photography, a neighborhood guide and a direct-rate promise, then kept its Google profile and reviews current.</p>
      {stats([("1,000+", "direct bookings in 12 months"), ("1.1s", "mobile load time"), ("4.8★", "Google rating maintained")])}
      <p class="fine">Hotel Lexen is also the first live venue for our sister company, CityPulse Kiosks.</p></div></article>
</div></section>
<section class="section alt"><div class="wrap">
  {head("More projects.", "", "Selected work")}
  <div class="work-grid">
    <article class="work-card" style="--c:#2E4439"><span class="case-pill">Restaurant</span><h3>Restaurant website + social</h3><p>A menu-first site with online ordering and a monthly social calendar that put the kitchen on camera.</p></article>
    <article class="work-card" style="--c:#5a2c82"><span class="case-pill">E-commerce</span><h3>Brand reinvention</h3><p>New identity, new store, two years of measurable sales growth attributed to the rebrand.</p></article>
    <article class="work-card" style="--c:#1b6ca8"><span class="case-pill">Professional services</span><h3>Website UX/UI redesign</h3><p>Clearer services, faster pages and a contact flow that gets filled in.</p></article>
    <article class="work-card" style="--c:#a2740a"><span class="case-pill">Local business</span><h3>Logo and brand kit</h3><p>A mark that works on a storefront, a social avatar and a business card.</p></article>
    <article class="work-card" style="--c:#0E6B63"><span class="case-pill">Luxury retail</span><h3>Watch dealer website</h3><p>An inventory-driven site for a luxury watch group, built to feel like the showroom.</p></article>
    <article class="work-card" style="--c:#7a3b1f"><span class="case-pill">Artist</span><h3>Artist portfolio</h3><p>A gallery site that lets the work breathe and the collector get in touch.</p></article>
  </div>
</div></section>
<section class="section"><div class="wrap">{head("In their words.", "", "Testimonials")}{testimonials(5, "quotes-5")}</div></section>
{cta_band(h="Want results like these?", p="Tell us about your business. We'll audit where you stand and show you the plan.")}
''')

# ---------------------------------------------------------------- about / how we work / faqs
page("about/", "About", "CityPulse Digital is a Phoenix, Arizona digital marketing agency serving hotels, restaurants, practices, dealerships and local businesses across the US. Formerly Landmark Digital Solutions.", f'''
{page_hero([("About", "about/")], "A Phoenix team with a national reach.", "We started as Landmark Digital Solutions, building websites and running marketing for hotels, restaurants and local businesses. In 2026 we became CityPulse Digital — alongside our sister company CityPulse Kiosks — with one idea: a business should be easy to find and easy to choose, online and in person.", btns(("Work with us", "contact/")), eyebrow="About CityPulse Digital")}
{platform_strip()}
<section class="section"><div class="wrap">{head("What it's like to work with us.", "", "Our values")}{value_cards()}</div></section>
<section class="section alt"><div class="wrap three">
  <div><h3>Plain English</h3><p>No jargon in our reports, no vanity metrics in our calls. We talk about calls, bookings, reviews and revenue.</p></div>
  <div><h3>Your name on everything</h3><p>Domains, sites, profiles and ad accounts belong to you. We're the team working inside them, not the landlord.</p></div>
  <div><h3>Small business is the whole business</h3><p>Independent hotels, restaurants, practices and trades. The work that decides whether this month is a good one.</p></div>
</div></section>
<section class="section"><div class="wrap">
  {head("From Landmark Digital to CityPulse Digital.", "", "Our story")}
  <ol class="timeline wide">
    <li><b>2017</b><span>Landmark Digital Solutions starts building websites and running marketing for hotels, restaurants and local businesses.</span></li>
    <li><b>2019–2023</b><span>350+ websites, $50M+ in direct bookings driven for clients, and the Hotel Lexen site that proved the booking-first approach.</span></li>
    <li><b>2026</b><span>CityPulse Kiosks launches concierge kiosks in hotel lobbies. Landmark Digital becomes CityPulse Digital, so the same clients are served online and in the room.</span></li>
    <li><b>Today</b><span>A Phoenix team serving clients nationwide, with AI search visibility added to the toolkit.</span></li>
  </ol>
</div></section>
<section class="section alt"><div class="wrap two-col">
  <div>{head("Two companies, one pulse.", "", "The CityPulse family")}<p>CityPulse Kiosks puts touch-screen concierge kiosks in hotel lobbies, waiting rooms and dealerships, and sells the ad space on them to local businesses. CityPulse Digital takes care of those same businesses online. Clients of one get introductions, bundles and a team that already knows them.</p>{btns(("Visit CityPulse Kiosks", KIOSKS_URL, "btn-ghost"))}</div>
  <aside class="callout"><b>Phoenix, Arizona</b><p>{ADDR1}<br>{ADDR2}</p><p><a class="text-link" href="tel:{TEL}">{PHONE}</a><br><a class="text-link" href="mailto:{EMAIL}">{EMAIL}</a></p></aside>
</div></section>
{cta_band()}
''', active="company")

page("how-we-work/", "How we work", "From a free audit to a one-page plan, a 30-day build and monthly growth — how a CityPulse Digital engagement runs.", f'''
{page_hero([("Company", "about/"), ("How we work", "how-we-work/")], "Audit. Plan. Build. Grow.", "Every engagement runs the same way, whether you need one service or all of them. Here's what happens, and when.", btns(("Start with the audit", "free-audit/")), eyebrow="How we work")}
<section class="section"><div class="wrap">{process_steps()}</div></section>
<section class="section alt"><div class="wrap">
  {head("The first 90 days.", "", "Timeline")}
  <ol class="timeline">
    <li><b>Days 1–2</b><span>Free audit delivered: website, search, reviews, social, with the three fixes that matter most.</span></li>
    <li><b>Week 1</b><span>Kickoff call. One-page plan agreed. Access set up through platform manager features, never shared passwords.</span></li>
    <li><b>Weeks 2–4</b><span>Build: Google Business Profile completed, listings synced, review requests live, first content calendar approved, website work started.</span></li>
    <li><b>Month 2</b><span>Everything running. First monthly report. Early wins usually show in profile views, calls and reviews.</span></li>
    <li><b>Month 3</b><span>Strategy review. Rankings and social reach trending. Decide what to double down on.</span></li>
  </ol>
</div></section>
<section class="section"><div class="wrap faq-wrap"><div>{head("What you get every month.", "", "Deliverables")}</div>
  <div>{check_list(["A one-page report: what we did, what moved, what's next", "Content calendar approved before anything is posted", "Every review answered within one business day", "SEO work log and ranking snapshot", "A real person on email and phone, in Phoenix"])}</div></div></section>
{cta_band()}
''', active="company")

page("faqs/", "Common questions", "Answers about contracts, pricing, reporting, ownership and how CityPulse Digital works with clients.", f'''
{page_hero([("Company", "about/"), ("Common questions", "faqs/")], "A little clarity before you start.", "The questions we hear most, answered the way we'd answer them on a call.", eyebrow="Questions")}
<section class="section"><div class="wrap narrow"><div class="faq">{faq_html(FAQS + [f for s in SERVICES for f in s["faqs"][:1]])}</div></div></section>
{cta_band(h="Still have a question?", p="Ask it. We answer every message within one business day.", primary=("Contact us", "contact/"), secondary=("Get a free audit", "free-audit/"))}
''', active="company")

# ---------------------------------------------------------------- free audit / contact / support
page("free-audit/", "Free digital audit", "Request a free digital marketing audit from CityPulse Digital: website, Google Business Profile, reviews, social media and AI search visibility, with the three fixes that matter most.", f'''
{page_hero([("Free audit", "free-audit/")], "See exactly where you stand.", "In two business days you'll get a written audit of your website, Google profile, reviews, social media and AI search visibility — and the three things we'd fix first. Free, and yours to keep.", eyebrow="Free digital audit", aside='<ul class="audit-list"><li>Website speed, mobile and SEO basics</li><li>Google Business Profile and listings accuracy</li><li>Review score, volume and response rate</li><li>Social presence and consistency</li><li>How ChatGPT and Gemini describe you</li><li>Your three highest-impact fixes</li></ul>')}
{form_section("audit", "Request your audit.", "Takes two minutes. No sales call required to get the results.", ["Tell us about your business", "We review everything a customer would see", "Your audit lands in your inbox in 2 business days"], audit_form())}
{cta_band(h="Rather just talk?", p="Call or email and we'll walk through it together.", primary=("Contact us", "contact/"), secondary=("See pricing", "pricing/"))}
''')

page("contact/", "Contact", "Contact CityPulse Digital in Phoenix, Arizona — websites, SEO, social media and reputation management for local businesses nationwide.", f'''
{page_hero([("Contact", "contact/")], "Let's talk about your business.", "Tell us what you're trying to do and we'll come back within one business day with honest next steps.", eyebrow="Contact", aside=f'<div class="contact-card"><a href="tel:{TEL}">{icon("phone","")}<span>{PHONE}</span></a><a href="mailto:{EMAIL}">{icon("mail","")}<span>{EMAIL}</span></a><p>{icon("pin","")}<span>{ADDR1}<br>{ADDR2}</span></p><p class="fine">Mon–Fri, 8am–6pm Arizona time</p></div>')}
{form_section("message", "Send a message.", "Or skip the form and call — we like talking to owners.", ["Tell us about your goals", "We reply within one business day", "If it's a fit, you get a one-page plan"], contact_form())}
''', active="company")

page("support/", "Client support", "Support for current CityPulse Digital clients: website changes, social media, reviews and listings, reports and billing.", f'''
{page_hero([("Company", "about/"), ("Client support", "support/")], "What can we help with?", "For current clients. Website changes, social posts, review or listing issues, reports and billing — send it here and it goes straight to your account team.", eyebrow="Support", aside=f'<div class="contact-card"><a href="mailto:{SUPPORT}">{icon("mail","")}<span>{SUPPORT}</span></a><a href="tel:{TEL}">{icon("phone","")}<span>{PHONE}</span></a><p class="fine">Urgent (site down, wrong information live): call us.</p></div>')}
{form_section("request", "Send a request.", "Include links and we'll email you for screenshots if we need them.", ["Describe the request", "We confirm and give you a time", "You get a note when it's done"], support_form())}
''', active="company")

# ---------------------------------------------------------------- legal
def legal_page(path, title, items, intro):
    toc = "".join(f'<li><a href="#s{i+1}">{h}</a></li>' for i, (h, _) in enumerate(items))
    body = "".join(f'<h2 id="s{i+1}">{h}</h2>{b}' for i, (h, b) in enumerate(items))
    return f'''<section class="page-hero"><div class="wrap narrow">{crumbs([(title, path)])}<h1>{title}</h1><p class="updated">Effective {legal.EFFECTIVE} · {legal.LEGAL}</p><p class="lede">{intro}</p></div></section>
<section class="section"><div class="wrap article"><aside class="toc"><b>On this page</b><ol>{toc}</ol></aside><div class="prose legal">{body}</div></div></section>'''

page("terms/", "Terms & Conditions", "Terms and conditions for citypulsedigital.com and City Pulse Digital LLC services.",
     legal_page("terms/", "Terms &amp; Conditions", legal.TERMS, "The rules for using this site and buying our services, in plain language."))
page("privacy/", "Privacy Policy", "How City Pulse Digital LLC collects, uses and protects information.",
     legal_page("privacy/", "Privacy Policy", legal.PRIVACY, "What we collect, why, and what we don't do with it."))

# ---------------------------------------------------------------- 404
page("404/", "Page not found", "That page doesn't exist.", f'''
<section class="page-hero dark"><div class="wrap narrow"><p class="eyebrow">404</p><h1>That page moved on.</h1><p class="lede">Try one of these instead.</p>{btns(("Home", ""), ("Services", "services/", "btn-ghost"), ("Free audit", "free-audit/", "btn-ghost"))}</div></section>''')
os.replace(os.path.join(OUT, "404", "index.html"), os.path.join(OUT, "404.html")); os.rmdir(os.path.join(OUT, "404"))

print(f"Built {len(PAGES)} pages")
