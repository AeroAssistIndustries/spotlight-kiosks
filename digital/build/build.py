"""Every page of the CityPulse Digital site. Run: python3 build/build.py"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from lib import _variants
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

def ticker():
    items = [("<b>60%</b> of local searches end without a click", ), ("AI assistants now answer <b>1 in 5</b> “near me” questions", ), ("<b>93%</b> of customers read reviews before choosing", ), ("Sites loading in <b>&lt;2s</b> convert twice as often", ), ("<b>4.8★</b> average rating across CityPulse clients", ), ("Every review answered within <b>24 hours</b>", ), ("<b>1,000+</b> direct bookings from one hotel site", ), ("Phoenix-based · <b>clients nationwide</b>", )]
    row = "".join(f"<span>{t[0]}</span>" for t in items)
    return f'<div class="ticker" aria-hidden="true"><div class="ticker-track">{row}{row}</div></div>'

def wordmark():
    w = ["Be found", "Be chosen", "Be talked about", "Websites", "Local SEO", "Social", "Reviews", "AI search"]
    row = "".join(f"<span>{x}</span>" for x in w)
    return f'<div class="wordmark" aria-hidden="true"><div class="wordmark-track">{row}{row}</div></div>'

def before_after():
    ph = _variants("story-restaurant.jpg"); img = f'<img src="{{R}}assets/photos/{ph[2][0]}" alt="" loading="lazy">' if ph else "<i></i>"
    ph2 = _variants("ind-restaurants.jpg"); img2 = f'<img src="{{R}}assets/photos/{ph2[2][0]}" alt="" loading="lazy">' if ph2 else "<i></i>"
    return f'''<section class="section alt" id="before-after"><div class="wrap ba">
  <div class="ba-copy"><p class="eyebrow">Before / after</p><h2>Same business. <span class="hl">Different first impression.</span></h2><p class="lede">This is what a customer sees in the two seconds before they decide. Drag the handle — the left side is what most local businesses look like today; the right is after 30 days with CityPulse.</p>
    <ul class="ba-list"><li><b>01</b><span>Complete profile: categories, services, hours, menu, booking link — everything Google can show.</span></li><li><b>02</b><span>Real photos, refreshed monthly, and a weekly post so the profile never looks abandoned.</span></li><li><b>03</b><span>Review flow that keeps the stars fresh and every review answered within a business day.</span></li></ul>
    {btns(("Get your free audit", "free-audit/"), ("Local listings service", "services/local-listings/", "btn-ghost"))}</div>
  <div class="ba-stage" data-ba aria-label="Before and after comparison of a Google Business Profile">
    <div class="ba-pane before"><span class="ba-tag">Before</span><div class="listing"><div class="l-top"><span class="l-logo">?</span><div><b>Bella Vita Trattoria</b><span class="l-stars">3.9 ★ · 41 reviews · last reply: never</span></div></div><div class="l-row"><span>Restaurant</span><span>Hours unknown</span></div><div class="l-photos"><i></i><i></i><i></i><i></i></div><p class="l-miss">✕ No menu · no booking link · 2 photos from 2019</p></div></div>
    <div class="ba-pane after"><span class="ba-tag">After · 30 days</span><div class="listing"><div class="l-top"><span class="l-logo">BV</span><div><b>Bella Vita Trattoria</b><span class="l-stars">4.8 ★ · 212 reviews · replies within hours</span></div></div><div class="l-row"><span>Italian restaurant</span><span>Open · closes 10pm</span><span>Reserve a table</span><span>Menu</span></div><div class="l-photos">{img}{img2}<i></i><i></i></div><p class="l-ok">✓ 48 photos · weekly posts · Q&amp;A answered · #2 in the map pack</p></div></div>
    <div class="ba-handle" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0" aria-label="Drag to compare"></div>
  </div>
</div></section>'''

def reviews_live():
    return f'''<section class="section rep-sec"><div class="wrap rep">
  <div class="phone" aria-hidden="true"><div class="phone-screen"><div class="ps-head"><i>★</i>Reviews · all platforms</div><div class="ps-feed" data-chat>
    <div class="msg in"><span class="who">Google · Maria K.</span><span class="stars">★★★★★</span><br>Stayed two nights for a wedding. Front desk went above and beyond — thank you Daniel!</div>
    <div class="msg out"><span class="who">Your reply · 38 min</span>Thank you, Maria! Daniel will be thrilled. Congratulations to the couple — come see us for the anniversary. 🥂</div>
    <div class="msg in"><span class="who">Yelp · Tom R.</span><span class="stars">★★☆☆☆</span><br>Room was fine but the AC was loud and nobody answered the desk phone at 11pm.</div>
    <div class="msg out"><span class="who">Your reply · 52 min</span>Tom, that’s not the stay we want for anyone. I’ve passed the AC issue to maintenance today and we’re fixing night coverage. Please email me directly — I’d like to make it right.</div>
    <div class="msg in"><span class="who">Tripadvisor · Priya S.</span><span class="stars">★★★★★</span><br>Found you on ChatGPT of all places. Great location, spotless room.</div>
  </div></div></div>
  <div><p class="eyebrow">Reputation, live</p><h2>Reviews that <span class="hl">write back.</span></h2><p class="lede">Every review, on every platform, answered in your voice within a business day — the good ones thanked, the hard ones handled before they spread. Automated requests after each visit keep the stars fresh.</p>
    <div class="rep-stat"><div><b>&lt; 24h</b><span>reply time, every platform</span></div><div><b>+0.6★</b><span>average rating lift in 6 months</span></div><div><b>3×</b><span>more reviews per month</span></div></div>
    {btns(("Reputation management", "services/reputation/", "btn-dark"), ("How to get more reviews", "resources/get-more-google-reviews/", "btn-ghost"))}</div>
</div></section>'''

def feed_live():
    posts = [("story-restaurant.jpg", "Tonight’s special: house-made tagliatelle 🍝", "1,284"), ("svc-social-media.jpg", "Behind the pass with Chef Ana", "2,410"), ("ind-hotels.jpg", "Sunset from the rooftop — book direct & save", "988"), ("customer-phone.jpg", "Weekend brunch is back ☀️", "1,732"), ("ind-medical.jpg", "Now accepting new patients — Saturdays too", "640")]
    out = ""
    for f, cap, likes in posts:
        v = _variants(f); src = f'{{R}}assets/photos/{v[2][0]}' if v else ""
        out += f'<div class="post"><div class="p-top"><i></i>yourbusiness</div><img src="{src}" alt="" loading="lazy"><div class="p-foot"><span>{cap}</span><b>♥ {likes}</b></div></div>'
    return f'''<section class="section alt feed-sec"><div class="wrap rep">
  <div><p class="eyebrow">Social, done for you</p><h2>Your feed, <span class="hl">handled.</span></h2><p class="lede">Planned a month ahead, shot and designed for you, posted on schedule, replied to the same day. Instagram, Facebook, TikTok and Google posts — one calendar, one approval, zero “what do we post today?”</p>
    <div class="rep-stat"><div><b>16+</b><span>designed posts a month</span></div><div><b>4</b><span>platforms kept in sync</span></div><div><b>Same day</b><span>comments &amp; DMs answered</span></div></div>
    {btns(("Social media management", "services/social-media/", "btn-dark"), ("Restaurant content calendar", "resources/restaurant-social-media-calendar/", "btn-ghost"))}</div>
  <div class="phone feed-phone" aria-hidden="true"><div class="phone-screen"><div class="ps-head"><i>▶</i>yourbusiness · 12.4k followers</div><div class="feed-scroll">{out}{out}</div></div></div>
</div></section>'''

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
        cards += f'''<article class="plan{pop}"><h3>{w["name"]}</h3><p class="plan-tag">{w["pages"]}</p><p class="plan-price">{price}</p><p class="plan-who">{w["lead"]}</p><ul class="plan-list">{inc}</ul><a class="btn{' btn-dark' if not w.get('popular') else ''}" href="{{R}}contact/?plan=website">Get a quote</a></article>'''
    return f'<div class="plans plans-3">{cards}</div>'

def alacarte_table():
    rows = "".join(f'<tr><th>{n}</th><td>{d}</td><td class="num">{pricing.money(p)}<span>/mo</span></td></tr>' for n, p, d in ALACARTE)
    return f'<table class="price-table"><thead><tr><th>Service</th><th>What\'s included</th><th class="num">Monthly</th></tr></thead><tbody>{rows}</tbody></table>'

from pricing import PLANS, WEBSITES, ALACARTE

# ---------------------------------------------------------------- home
page("", "Websites, SEO, social media & reputation for local businesses", "CityPulse Digital is a Phoenix digital marketing agency: website design, local SEO, social media management, reputation management and AI search visibility for hotels, restaurants, medical practices, dealerships and local businesses nationwide.", f'''
<section class="hero"><div class="wrap hero-grid">
  <div class="hero-copy">
    <div class="hero-search" aria-hidden="true"><span class="live">Live</span>{icon("search","")}<span class="q"></span><span class="ans">{icon("check","")}<b></b></span></div>
    <p class="eyebrow">Phoenix, Arizona · Clients nationwide</p>
    <h1 class="reveal-words">{words("Be found.<br>Be chosen.<br><em>Be talked about.</em>")}</h1>
    <p class="lede">Websites, search, social media and reviews — handled by one team, reported on one page. CityPulse Digital is the marketing department small businesses never had.</p>
    <div class="btn-row"><a class="btn" href="{{R}}free-audit/">Get a free digital audit</a><a class="btn btn-ghost" href="{{R}}pricing/">See plans from [[PLAN:pulse]]/mo</a></div>
    <ul class="hero-points"><li>No long contracts</li><li>You own everything</li><li>Reports you can read in 2 minutes</li></ul>
    <div class="hero-ind" role="group" aria-label="See it for your industry"><span>I run a</span>{"".join(f'<button type="button" data-ind="{k}" aria-pressed="{"true" if i==0 else "false"}">{v}</button>' for i,(k,v) in enumerate([("hotel","Hotel"),("restaurant","Restaurant"),("dental","Dental practice"),("auto","Dealership"),("home","Home services")]))}</div>
  </div>
  <div class="hero-visual">{photo("hero-owner.jpg", "hero-photo", sizes="(max-width: 980px) 100vw, 45vw", eager=True).replace("</figure>", '<span class="scan"></span></figure>')}{score_card()}<div class="hud" aria-hidden="true"><div class="hud-chip c1"></div><div class="hud-chip c2"></div><div class="hud-chip c3"></div><div class="hud-chip c4"></div></div></div>
  <div class="signals" aria-hidden="true">{"".join(f'<i style="--x:{x}%;--y:{y}%;--d:{d}s;--s:{sz}"></i>' for x, y, d, sz in [(8,18,7,1),(22,72,9,.6),(35,30,11,.8),(48,80,8,.5),(60,14,10,.9),(72,60,12,.7),(85,26,9,1.1),(92,70,7,.6),(15,50,13,.5),(55,48,6,.4),(78,88,10,.8),(40,8,12,.6)])}</div>
</div></section>
{ticker()}
{platform_strip()}
{wordmark()}

<section class="section"><div class="wrap">
  {head("Everything your customers see before they call.", "Six services that work better together. Start with one, or hand us the whole thing.", "What we do")}
  {service_cards()}
</div></section>

{before_after()}

<section class="section alt ai-sec"><div class="wrap">
  {head("How AI is changing the way customers choose.", "Discovery is shifting from ten blue links to one recommended answer. The businesses that get recommended share three things — and we build all three.", "The shift")}
  {AI_ART}
  <div class="three ai-three">
    <div><span class="big-num">60%</span><h3>of searches now end without a click</h3><p>Google answers on the results page — with your profile, your reviews and your hours. If they're wrong or thin, you lose the customer before your site loads.</p></div>
    <div><span class="big-num">AI</span><h3>is where a growing share of local questions go</h3><p>“Best dentist near me that takes new patients.” ChatGPT, Gemini and Perplexity answer with three names and a reason. We make sure yours is one of them.</p></div>
    <div><span class="big-num">3</span><h3>things the recommended businesses share</h3><p>Consistent facts everywhere, structured data on the site, and content that answers plainly. That's the core of every CityPulse plan.</p></div>
  </div>
  {btns(("AI search visibility", "services/ai-search/", "btn-dark"), ("Read the guide", "resources/show-up-in-ai-search/", "btn-ghost"))}
</div></section>

<section class="section dark proof"><div class="wrap">
  <div class="proof-grid">
    <div>{photo("customer-phone.jpg", "proof-photo", sizes="(max-width: 980px) 100vw, 40vw")}<p class="eyebrow">Why it matters</p><h2>Your next customer is already looking.</h2>
      <p class="lede">They search, they read the reviews, they glance at your feed, they tap your site. Every one of those is a moment you either win or lose — and most businesses lose a few without ever knowing.</p></div>
    {counters([("1,000+", "direct hotel bookings from one website in 12 months"), ("350+", "websites designed by our team"), ("$50M+", "in direct bookings driven for clients"), ("1 day", "to answer every review, every platform")])}
  </div>
</div></section>

{reviews_live()}
{feed_live()}

<section class="section"><div class="wrap">
  {head("Four steps. No mystery.", "You'll always know what we're doing, why, and what it cost.", "How we work")}
  {process_steps()}
  {btns(("See how we work", "how-we-work/", "btn-dark"))}
</div></section>

{photo_band("team-work.jpg", "People, not a platform", "A Phoenix team that answers the phone.", "Every account has a real person behind it — someone who knows your business, reads your reviews and picks up when you call. Software does the heavy lifting; people make the decisions.", btns(("Meet the team", "about/", "btn-ghost")))}

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
''', extra_js=("home.js", "hero-fx.js"))

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
{page_hero([("Services", "services/"), (s_["name"], f"services/{s_['slug']}/")], s_["h"], s_["lede"], btns(("Get a free audit", "free-audit/"), ("Talk to us", "contact/", "btn-ghost")), aside=photo(f"svc-{s_['slug']}.jpg", "hero-photo-sm", sizes="(max-width: 980px) 100vw, 40vw", eager=True), eyebrow=s_["name"])}
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
{page_hero([("Industries", "industries/"), (i["name"], f"industries/{i['slug']}/")], i["h"], D["tagline"], btns(("Get a free audit", "free-audit/"), ("Talk to us", "contact/", "btn-ghost")), eyebrow=D["title"], aside=f'<div class="segments"><b>Who this is for</b>{segs}</div>').replace('class="page-hero dark"', f'class="page-hero dark photo"{photo_bg(f"ind-{i['slug']}.jpg")}', 1)}
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
    sp = st.get("photo") or (f"photos/{_variants(f'story-{st['slug']}.jpg')[0][0]}" if _variants(f"story-{st['slug']}.jpg") else None)
    art = f'style="--c:{st["color"]};background-image:linear-gradient(180deg,rgba(15,28,43,.05) 30%,rgba(15,28,43,.85)),url({{R}}assets/{sp})"' if sp else f'style="--c:{st["color"]}"'
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
<section class="section" id="compare"><div class="wrap">{head("Compare the plans.", "Every plan includes onboarding, a monthly report and a team on the phone.", "Side by side")}{plan_matrix()}</div></section>
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
<section class="section"><div class="wrap two-col founder">
  <div>{photo("about-sarvesh.jpg", "founder-photo", sizes="(max-width: 980px) 100vw, 35vw")}</div>
  <div><p class="eyebrow">Founder</p><h2>Built by someone who runs businesses too.</h2><p class="lede" style="margin-top:14px">Sarvesh Joshi founded CityPulse Digital after years of building websites and running marketing for hotels, restaurants and local businesses as Landmark Digital Solutions — and after owning and operating businesses himself. He also co-founded CityPulse Kiosks and leads AeroAssist Industries, a Phoenix drone-technology company. The common thread: practical systems that get customers in the door.</p>{btns(("Talk to Sarvesh", "contact/", "btn-dark"))}</div>
</div></section>
{photo_band("about-office.jpg", "Phoenix, Arizona", "Small team. Big toolkit.", "We're based at 4750 S 44th Place in Phoenix, in the same building as CityPulse Kiosks, and work with clients across the US by video, email and one shared monthly plan.")}
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
{scorecard()}
{form_section("audit", "Request your audit.", "Takes two minutes. No sales call required to get the results.", ["Tell us about your business", "We review everything a customer would see", "Your audit lands in your inbox in 2 business days"], audit_form()).replace('<div class="talk">', photo("audit-call.jpg", "form-photo", sizes="(max-width: 980px) 100vw, 35vw") + '<div class="talk">', 1)}
{cta_band(h="Rather just talk?", p="Call or email and we'll walk through it together.", primary=("Contact us", "contact/"), secondary=("See pricing", "pricing/"))}
''', extra_js=("scorecard.js",))

page("contact/", "Contact", "Contact CityPulse Digital in Phoenix, Arizona — websites, SEO, social media and reputation management for local businesses nationwide.", f'''
{page_hero([("Contact", "contact/")], "Let's talk about your business.", "Tell us what you're trying to do and we'll come back within one business day with honest next steps.", eyebrow="Contact", aside=f'<div class="contact-card"><a href="tel:{TEL}">{icon("phone","")}<span>{PHONE}</span></a><a href="mailto:{EMAIL}">{icon("mail","")}<span>{EMAIL}</span></a><p>{icon("pin","")}<span>{ADDR1}<br>{ADDR2}</span></p><p class="fine">Mon–Fri, 8am–6pm Arizona time</p></div>')}
{form_section("message", "Send a message.", "Or skip the form and call — we like talking to owners.", ["Tell us about your goals", "We reply within one business day", "If it's a fit, you get a one-page plan"], contact_form()).replace('<div class="talk">', photo("audit-call.jpg", "form-photo", sizes="(max-width: 980px) 100vw, 35vw") + '<div class="talk">', 1)}
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

# sitemap + robots for the static build
urls = "".join(f"<url><loc>https://{DOMAIN}/{p}</loc></url>" for p in PAGES if p != "404/")
open(os.path.join(OUT, "sitemap.xml"), "w").write(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>')
open(os.path.join(OUT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: https://{DOMAIN}/sitemap.xml\n")
print(f"Built {len(PAGES)} pages")
