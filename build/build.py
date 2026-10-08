"""Build every page of the CityPulse Kiosks site. Run: python3 build/build.py"""
from lib import *
from urllib.parse import quote_plus

# ================================================================ HOME
home = f'''
<section class="hero2">
  <div class="wrap hero2-grid">
    <div class="hero2-copy">
      <h1>Turn wait time into opportunity.</h1>
      <p class="lede">Useful visitor information and local business advertising, together on one touch screen — in the lobbies, lounges and waiting rooms where people pause.</p>
      {btns(("Get started — $399/yr","#get-started"),("Host a kiosk for free","hosts/","btn-ghost"))}
      <ul class="hero2-points"><li><b>From $399</b><span>a year, or $60 a month</span></li><li><b>Every tap</b><span>counted and reported</span></li><li><b>$0</b><span>for qualified host venues</span></li></ul>
    </div>
    <div class="slider" data-slider aria-roledescription="carousel" aria-label="CityPulse Kiosks highlights">
      <div class="slides">
        <figure class="slide slide-photo" aria-roledescription="slide" aria-label="1 of 3">
          <img src="{{R}}assets/kiosk-lobby.jpg" alt="Silver CityPulse kiosk in a marble hotel lobby" width="1536" height="1024" fetchpriority="high" style="object-position:72% 50%">
          <figcaption><b>The Guest Directory</b><span>Dining, amenities and local guides for hotel guests.</span></figcaption>
        </figure>
        <div class="slide slide-cycle" aria-roledescription="slide" aria-label="2 of 3" hidden>
          <div class="slide-cycle-in"><p class="slide-kicker">New to kiosk advertising?</p><h2>Here's how it pays off.</h2>{cycle("small")}</div>
        </div>
        <div class="slide slide-ad" aria-roledescription="slide" aria-label="3 of 3" hidden>
          <div class="slide-ad-in">{mini("your venue", ("Dining","Amenities","Local guide","Events"), "black")}
            <div><p class="slide-kicker">Your business here</p><h2>On every screen, all year.</h2>
              <ul class="slide-pkgs"><li><span>1 location</span><b>$399/yr</b></li><li><span>3 locations</span><b>$1,099/yr</b></li><li class="best"><span>5 locations</span><b>$1,200/yr</b></li></ul>
              <p class="slide-note">Or $60 a month per location.</p><a class="btn btn-dark btn-small" href="{{R}}pricing/">See packages</a></div></div>
        </div>
      </div>
      <div class="slider-ctrl">
        <button class="sl-prev" type="button" aria-label="Previous slide">{icon("arrowl","")}</button>
        <div class="sl-dots" role="tablist" aria-label="Choose a slide"><button role="tab" aria-selected="true" aria-label="Hotel lobby kiosk"></button><button role="tab" aria-selected="false" aria-label="How it pays off"></button><button role="tab" aria-selected="false" aria-label="Advertising packages"></button></div>
        <button class="sl-next" type="button" aria-label="Next slide">{icon("arrow","")}</button>
      </div>
    </div>
  </div>
</section>

<section class="section journey-sec" aria-labelledby="jy-title"><div class="wrap">
  <div class="section-head"><h2 id="jy-title">How it works, start to finish.</h2><p>New to kiosk advertising? People in a lobby or waiting room have a few minutes and a question — where to eat, what to do. Our kiosk answers it, and your ad is on every screen while they look.</p></div>
  {journey()}
  <div class="roi">
    <div><b>$1.09</b><span>a day for one location ($399 a year)</span></div>
    <div><b>~2 days</b><span>from upload to live, typically</span></div>
    <div><b>1</b><span>new regular customer can pay for the whole year</span></div>
  </div>
  <p class="fine" style="margin-top:12px">Figures in the animation are examples.</p>
</div></section>

{checkout_section()}





{demo_block()}

<section class="section markets" aria-labelledby="mk-title"><div class="wrap">
  {head("Hosts in all 50 states.", f"Kiosks in hotel lobbies, medical offices, dealership lounges and restaurants in {N_MARKETS} cities, from Anchorage to Miami. Tap a pin to advertise there.", "mk-title")}
  {us_map()}
  <p style="margin-top:18px"><a class="text-link" href="{{R}}locations/">See every market</a></p>
</div></section>

<section class="section"><div class="wrap">
  {head("Two ways in. One local connection.", "Start with the opportunity that fits your business or venue.")}
  <div class="paths">
    <article class="path" id="advertise">
      <div class="path-main"><p class="who">For local businesses</p><h3>Be part of their next decision.</h3>
        <p class="desc">Introduce your business while visitors explore where to go, what to try and what to do next.</p>
        <div class="btn-row">{btns(("Plan a campaign","campaign-planner/"))[21:-6]}<a class="text-link" href="{{R}}advertise/">View advertising options</a></div></div>
      <div class="path-panel"><h4>Start with a clear brief</h4><dl class="brief">
        <div><dt>Place</dt><dd>Your market and a relevant venue setting</dd></div>
        <div><dt>Purpose</dt><dd>The business goal and the visitor's next step</dd></div>
        <div><dt>Message</dt><dd>One offer, a clear identity and useful creative</dd></div>
        <div><dt>Review</dt><dd>Availability, pricing, timing and reporting</dd></div></dl>
        <p class="fine">Use the planner to organize an inquiry. Campaign details are confirmed with CityPulse.</p></div>
    </article>
    <article class="path" id="host">
      <div class="path-main"><p class="who">For host venues</p><h3>Add something useful. Keep it simple.</h3>
        <p class="desc">A managed digital amenity for qualified venues, with information planned around your space and visitors.</p>
        <div class="btn-row">{btns(("Request a kiosk","hosts/#inquiry"))[21:-6]}<a class="text-link" href="{{R}}hosts/">Review the host offering</a></div></div>
      <div class="path-panel"><h4>The managed host offering</h4><dl class="brief">
        <div><dt>Equipment</dt><dd>Kiosk hardware and software</dd></div>
        <div><dt>Setup</dt><dd>Coordinated installation and venue content</dd></div>
        <div><dt>Care</dt><dd>Content updates and routine maintenance</dd></div>
        <div><dt>Fit</dt><dd>Accessible space, power, connectivity and a signed agreement</dd></div></dl>
        <p class="fine">No-cost hosting depends on qualification, availability and a signed Host Agreement.</p></div>
    </article>
  </div>
</div></section>

<section class="section" style="background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
  {head("Real places. Relevant possibilities.", "Explore the visitor moment in each kind of venue, then dig into the details.")}
  {venue_tabs()}
</div></section>



<section class="section dark"><div class="wrap">
  {head("Give your next idea some room to grow.", "Explore a local campaign, preview a message and bring a clear starting point to the conversation.")}
  <div class="tools">
    <a class="tool" href="{{R}}campaign-planner/">{icon("pin")}<h3>Build the brief.</h3><p>Connect your business goal to a market, venue setting and useful next step.</p><span class="go">Open the campaign planner</span></a>
    <a class="tool lamp" href="{{R}}creative-studio/">{icon("spark")}<h3>Try the message.</h3><p>Write a headline and action, and see it in the kiosk's ad space.</p><span class="go">Try the creative studio</span></a>
    <a class="tool" href="{{R}}campaign-ideas/">{icon("people")}<h3>Find a starting point.</h3><p>Browse local campaign playbooks built around real visitor moments.</p><span class="go">Explore campaign ideas</span></a>
  </div>
</div></section>



<section class="section" style="background:#fff;border-top:1px solid var(--line)"><div class="wrap faq-grid">
  <div><h2>A little clarity before you start.</h2><a class="text-link" href="{{R}}faqs/">All common questions</a></div>
  <div class="faq-list">{faq_html([FAQS[0],FAQS[1],FAQS[2],FAQS[5],FAQS[6]])}</div>
</div></section>



{cta_band()}
'''
page("", "Turn wait time into opportunity", "Touch-screen kiosks that give visitors useful venue information and put local businesses in front of them. Free for qualified venues. Local ads from $399 a year or $60 a month.", home, active="", kiosk=True, extra_js=("checkout.js",))

# ================================================================ THE KIOSK
kiosk_page = page_hero([("The kiosk","kiosk/")], "One screen. A world of possibility.",
  "A digital concierge, information hub and local advertising platform in one professionally managed touch-screen kiosk.",
  btns(("Try the kiosk","#demo"),("Explore hosting","hosts/","btn-ghost")),
  aside=f'<div class="hero-photo"><img src="{{R}}assets/kiosk-lobby-sm.jpg" alt="Silver CityPulse kiosk in a marble hotel lobby" width="900" height="600"></div>') + f'''
{section(head("Useful information. A local next step.", "A digital concierge and local discovery hub, together on one approachable touch screen.") + '''<div class="cards">
  <div class="card"><h3>Know the venue.</h3><p>Amenities, directions and helpful answers in one place.</p></div>
  <div class="card"><h3>Discover the neighborhood.</h3><p>Dining, services and experiences with a local connection.</p></div>
  <div class="card"><h3>Find a useful next step.</h3><p>A relevant message and a QR code to take it home.</p></div></div>''')}
{demo_block("See it for yourself.", "demo-title-k")}
<section class="section" style="background:var(--stone)" id="hardware"><div class="wrap">
  {head("Two finishes. One welcome screen.", "Every kiosk runs the same software. The finish is chosen to suit the room.")}
  <div class="hw-grid">
    <figure class="hw"><img src="{{R}}assets/kiosk-lobby-sm.jpg" alt="Silver kiosk in a bright marble hotel lobby near the reception desk" width="900" height="600" loading="lazy">
      <figcaption><h3>Guest Directory</h3><p>Brushed silver enclosure with an integrated card slot. Suits hotel lobbies, medical offices and service lounges.</p>
      <ul class="pills"><li>Portrait touch display</li><li>Dining, amenities, local guide and events</li><li>Ad space on every screen</li></ul></figcaption></figure>
    <figure class="hw hw-alt">{mini("your venue", ("Dining","Amenities","Local guide","Events"), "black")}
      <figcaption><h3>Lobby Concierge</h3><p>Matte black column and base. Made for dealership lounges, restaurants and darker, wood-toned interiors.</p>
      <ul class="pills"><li>Portrait touch display</li><li>Service status, offers and local guide</li><li>Ad space on every screen</li></ul></figcaption></figure>
  </div>
</div></section>
{section(head("A managed amenity. We handle the details.") + '''<div class="cards">
  <div class="card"><h3>Hardware & software</h3><p>The kiosk and its software are part of the managed host offering.</p></div>
  <div class="card"><h3>Installation & content</h3><p>We coordinate setup and relevant venue information with your team.</p></div>
  <div class="card"><h3>Maintenance & support</h3><p>Content updates and routine service are handled by CityPulse.</p></div></div>''')}
{cta_band()}'''
page("kiosk/", "The kiosk", "A digital concierge, information hub and local advertising platform in one managed touch-screen kiosk. Try the interactive demo.", kiosk_page, kiosk=True)
page("operations/", "Team library (demo)", "Demo of the CityPulse team library. Enter the access code to preview file names.", '<section class="section"><div class="wrap"><div class="ops-app" id="ops-app"><p>Loading…</p><noscript><p>Turn on JavaScript to open this page.</p></noscript></div></div></section>', extra_js=("operations.js",))
page("host/", "Host dashboard (demo)", "Demo of the host dashboard: kiosk status and visit counts. Sample data only.", '<section class="section"><div class="wrap"><div class="ops-app" id="host-app"><p>Loading…</p><noscript><p>Turn on JavaScript to open this page.</p></noscript></div></div></section>', extra_js=("host.js",))
page("kiosk-test/", "Kiosk test", "Test page for a CityPulse kiosk: connection check and a test check-in to the website.", '<section class="section"><div class="wrap"><div class="ktest" id="ktest-app"><p>Loading…</p><noscript><p>Turn on JavaScript to run this test.</p></noscript></div></div></section>', extra_js=("kiosk-test.js",))
page("kiosk-show/", "Kiosk slideshow", "Full-screen slideshow for a CityPulse kiosk. Plays pictures and videos from a USB stick.", '<section class="section"><div class="show-app" id="show-app" data-github="https://api.github.com/repos/AeroAssistIndustries/spotlight-kiosks/contents/content?ref=main"><noscript><p>Turn on JavaScript to run the slideshow.</p></noscript></div></section>', extra_js=("kiosk-show.js",))
page("kiosk-app/", "Kiosk screen", "The CityPulse concierge kiosk screen, for a live kiosk.", '<link rel="stylesheet" href="{R}assets/cp-kiosk.css?v=8"><div class="cpk" id="cpk" data-root="{R}" lang="en"></div><button class="kapp-fs" id="kapp-fs" type="button" aria-label="Full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button><div class="kapp-modal" id="kapp-modal" hidden role="dialog" aria-modal="true" aria-labelledby="kapp-modal-t"><div class="kapp-box"><form id="kapp-form" autocomplete="off"><h2 id="kapp-modal-t">Staff menu</h2><p>Enter the staff password.</p><input type="password" id="kapp-pass" aria-label="Staff password" required><p class="kapp-msg" id="kapp-msg" role="status"></p><div class="kapp-row"><button type="button" class="kapp-btn-ghost" data-close>Cancel</button><button type="submit" class="kapp-btn">Continue</button></div></form><div id="kapp-stats" hidden></div></div></div>', extra_js=("vendor/qrcode-generator.js", "lexen-data.js?v=8", "cp-kiosk.js?v=8", "kiosk-app.js?v=8"))
# The live kiosk gets its own locked-down page: no website header, footer or links, and a browser rule that only allows
# this site's own files plus the weather service. Written over the website version of /kiosk-app/.
KIOSK_BODY = '<div class="cpk" id="cpk" data-root="{R}" lang="en"></div><button class="kapp-fs" id="kapp-fs" type="button" aria-label="Full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button><div class="kapp-modal" id="kapp-modal" hidden role="dialog" aria-modal="true" aria-labelledby="kapp-modal-t"><div class="kapp-box"><form id="kapp-form" autocomplete="off"><h2 id="kapp-modal-t">Staff menu</h2><p>Enter the staff password.</p><input type="password" id="kapp-pass" aria-label="Staff password" required><p class="kapp-msg" id="kapp-msg" role="status"></p><div class="kapp-row"><button type="button" class="kapp-btn-ghost" data-close>Cancel</button><button type="submit" class="kapp-btn">Continue</button></div></form><div id="kapp-stats" hidden></div></div></div>'
KIOSK_DOC = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.weather.gov https://*.workers.dev; font-src 'self'; media-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#0B1622">
<title>Lexen North Hollywood · Concierge</title>
<link rel="icon" href="../assets/favicon.png" type="image/png">
<link rel="stylesheet" href="../assets/styles.css?v=20261008b">
<link rel="stylesheet" href="../assets/cp-kiosk.css?v=8">
</head>
<body class="kiosk-body">
{KIOSK_BODY.replace("{R}", "../")}
<script src="../assets/vendor/qrcode-generator.js"></script>
<script src="../assets/lexen-data.js?v=8"></script>
<script src="../assets/cp-kiosk.js?v=8"></script>
<script src="../assets/kiosk-app.js?v=8"></script>
</body>
</html>
'''
with open(os.path.join(OUT, "kiosk-app", "index.html"), "w") as _f:
    _f.write(KIOSK_DOC)
page("concierge/", "Your concierge", "Your CityPulse guide, opened from the kiosk's QR code: dining, amenities, local guide and events.", '<section class="section"><div class="wrap"><div class="cc-app" id="cc-app"><p>Loading your guide…</p><noscript><p>Turn on JavaScript to view this guide.</p></noscript></div></div></section>', extra_js=("lexen-data.js?v=1", "concierge.js?v=8"))

# ================================================================ ADVERTISE
def pkg_link(v): return "{R}advertise/?Pricing=" + v.replace(" ", "+").replace("$", "%24").replace(",", "%2C").replace("—", "%E2%80%94").replace("/", "%2F") + "#inquiry"
INCL = "<ul><li>Ad artwork and digital copy</li><li>Your logo and business details</li><li>12 months in the kiosk ad space</li></ul>"
price_cards = f'''<div class="price-cards three">
  <div class="price-card"><span class="label">Single location</span><h3>One kiosk. A full year on screen.</h3>
    <p class="price"><span>$399</span>/ year</p><p>Or $60 a month.</p>{INCL}
    <a class="btn btn-dark" href="{pkg_link(PRICING[1])}">Choose 1 location</a></div>
  <div class="price-card"><span class="label">3 locations</span><h3>Three kiosks near your customers.</h3>
    <p class="price"><span>$1,099</span>/ year</p><p>About $366 per location — save $98. Or $180 a month.</p>{INCL}
    <a class="btn btn-dark" href="{pkg_link(PRICING[2])}">Choose 3 locations</a></div>
  <div class="price-card lamp"><span class="label">5 locations · Best value</span><h3>Five kiosks, one simple price.</h3>
    <p class="price"><span>$1,200</span>/ year</p><p>Just $240 per location — save $795. Or $300 a month.</p>{INCL}
    <a class="btn" href="{pkg_link(PRICING[3])}">Choose 5 locations</a></div>
</div>
<div class="pkg-notes">
  <p><b>More than 5 locations?</b> Each location after 5 is $300 a year.</p>
  <p><b>Prefer monthly?</b> $60 per location, per month.</p>
  <p><b>Need 2 or 4?</b> The 3- and 5-location packages cover them, with a spare location included.</p>
</div>
<p class="fine" style="margin-top:14px">A location is one CityPulse kiosk venue. Available venues and final terms are confirmed in your quote. <a class="text-link" href="{{R}}pricing/#calculator">Build an estimate</a></p>'''

adv = page_hero([("Advertise","advertise/")], "Your next customer could be right nearby.",
  "Reach people while they wait, browse, plan and decide. Put a relevant local message in a space they already spend time.",
  btns(("Plan a campaign","campaign-planner/"),("Discuss an opportunity","#inquiry","btn-ghost")),
  aside=f'<div class="moment" style="background:var(--stone)">{mini("The Arden Hotel", ("Dining","Amenities","Local guide","Events"), "silver")}<dl><dt>Where your ad runs</dt><dd>The bottom of every kiosk screen</dd><dt>Who sees it</dt><dd>Guests, patients and customers who stop to tap</dd></dl></div>') + f'''
<nav class="jump" aria-label="Advertising tools"><div class="wrap jump-grid">
  <a href="{{R}}pricing/"><span class="ico">{icon("mega","")}</span><span><b>Choose a package</b><span>$399 a year for one location, or $60 a month.</span></span></a>
  <a href="{{R}}campaign-planner/"><span class="ico">{icon("pin","")}</span><span><b>Build a campaign brief</b><span>Four short steps to a brief you can share.</span></span></a>
  <a href="{{R}}creative-studio/"><span class="ico">{icon("spark","")}</span><span><b>Preview your creative</b><span>See your message in the kiosk ad space.</span></span></a>
</div></nav>
{section(head("Choose the right way to be seen.", "Placement and campaign availability are confirmed for your chosen market.") + f'''<div class="placements">
  <div class="placement">{mini("your venue",("Dining","Events"),"black")}<h3>Kiosk ad space</h3><p>The bottom quarter of the screen: a rotating slider every visitor sees while they browse.</p><a class="text-link" href="{{R}}advertise/?Placement=Kiosk+ad+space+%28lower+screen%29#inquiry">Plan this placement</a></div>
  <div class="placement">{placement_mini("ph-banner")}<h3>Featured banner</h3><p>A prominent visual message to introduce your business or offer.</p><a class="text-link" href="{{R}}advertise/?Placement=Featured+banner#inquiry">Plan this placement</a></div>
  <div class="placement">{placement_mini("ph-qr")}<h3>QR offer tile</h3><p>A local promotion with a QR link to information or your next step.</p><a class="text-link" href="{{R}}advertise/?Placement=QR+offer+tile#inquiry">Plan this placement</a></div>
</div><p style="margin-top:22px"><a class="text-link" href="{{R}}audience/">Explore who you can reach</a> &nbsp; <a class="text-link" href="{{R}}locations/">Find your target market</a></p>''')}
<section class="section" style="background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
  {head("Pick a package. Grow your reach.", "Annual packages for one, three or five locations — or pay monthly.")}
  {price_cards}
</div></section>
{section(head("A campaign that fits. Start with a place.", "Tell us your location, audience and goal. The team helps scope placements, creative, timing and reporting.") + '''<div class="cards">
  <div class="card"><h3>The setting</h3><p>Discuss the market, venue context, proposed placement and the local audience moment.</p></div>
  <div class="card"><h3>The scope</h3><p>Review the campaign term, creative needs, format and how updates work.</p></div>
  <div class="card"><h3>The review</h3><p>Agree on availability, final pricing, creative requirements and reporting. Ask about impressions, screen interactions and QR activity.</p></div></div>''')}
<section class="section" style="padding-top:0"><div class="wrap">
  {head("Put the next step on their radar.", "Example concepts for planning and creative inspiration.")}
  <div class="concepts">{concept_card(IDEAS[0])}{concept_card(IDEAS[7])}</div>
  <p style="margin-top:18px"><a class="text-link" href="{{R}}campaign-ideas/">Explore all eight playbooks</a> &nbsp; <a class="text-link" href="{{R}}media-kit/">Review the media overview</a></p>
</div></section>
{form_section("inquiry", "Plan your next placement.", "Start with your business, market and goal. The team confirms the right placement and campaign terms.", ["Tell us your market and goal", "Confirm placements and pricing", "Plan creative, timing and reporting"], advertiser_form(), dark=True)}'''
page("advertise/", "Advertise with CityPulse", "Put your local business on screen in hotel lobbies, medical offices, dealership lounges and restaurants. From $399 a year or $60 a month.", adv)

# ================================================================ PRICING
pricing = page_hero([("Advertise","advertise/"),("Pricing & calculator","pricing/")], "Simple packages. Room to grow.",
  "$399 a year for one location, $1,099 for three, $1,200 for five — or $60 a month per location. Hosting a kiosk costs qualified venues nothing.",
  btns(("Estimate your price","#calculator"),("Talk to us about a package","advertise/#inquiry","btn-ghost"))) + f'''
{section(head("Pick a package. Grow your reach.", "Every package includes ad artwork, digital copy and 12 months in the kiosk ad space.") + price_cards)}
<section class="section" id="calculator" style="background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
  {head("Your price. At the scale you choose.", "Pick how many locations you want. We'll match you to the best package and show the monthly option too.")}
  <div class="calc" id="calc" data-next="{{R}}advertise/#inquiry">
    <div class="calc-in"><h3>How many locations?</h3>
      <div class="presets" role="group" aria-label="Presets"><button type="button" data-preset-n="1">1 location</button><button type="button" data-preset-n="3">3 locations</button><button type="button" data-preset-n="5">5 locations</button><button type="button" data-preset-n="10">10 locations</button></div>
      <div class="range-row"><label for="n-range">Locations <input id="n-num" type="number" min="1" max="100" value="5" aria-label="Number of locations" class="num-in"></label><input id="n-range" type="range" min="1" max="50" value="5"><small>1 to 50 on the slider · type up to 100</small></div>
      <ul class="tier-list" id="tiers">
        <li data-tier="1"><span>1 location</span><b>$399/yr</b></li>
        <li data-tier="3"><span>2–3 locations</span><b>$1,099/yr</b></li>
        <li data-tier="5"><span>4–5 locations</span><b>$1,200/yr</b></li>
        <li data-tier="6"><span>Each location after 5</span><b>+$300/yr</b></li>
        <li data-tier="m"><span>Monthly, any number</span><b>$60/location/mo</b></li>
      </ul>
    </div>
    <div class="calc-out" aria-live="polite"><span>Your annual price</span><p class="big" id="c-total">$1,200<small>/ year</small></p><p id="c-eq" style="color:var(--muted-dark)">5-location package</p>
      <dl><div><dt>Per location</dt><dd id="c-per">$240</dd></div><div><dt>Or pay monthly</dt><dd id="c-month">$300/mo</dd></div><div style="grid-column:1/-1"><dt>Annual saves you</dt><dd id="c-save">$2,400 vs. monthly</dd></div></dl>
      <button class="btn" type="button" data-calc="carry">Use this in an inquiry</button>
      <p class="fine" style="margin-top:14px">An estimate doesn't reserve kiosks or purchase advertising. Available venues are confirmed in your quote.</p></div>
  </div>
  <p style="margin-top:22px"><a class="text-link" href="{{R}}locations/">Explore market planning</a></p>
</div></section>
<section class="section"><div class="wrap"><div class="teaser" style="background:var(--forest);color:var(--paper);border-color:var(--forest)">
  <div><span style="color:var(--lamp);font-weight:600">For qualified host venues</span><h2 style="font-size:clamp(30px,3.6vw,44px);margin-top:6px">A useful amenity. At no kiosk cost.</h2><p style="color:var(--muted-dark);margin-top:10px">Equipment, installation, service and maintenance at no cost, subject to a site review and a signed Host Agreement. Your venue supplies suitable space, power and available connectivity.</p></div>
  <p class="price"><span>$0</span></p><a class="btn" href="{{R}}hosts/">Explore the host offering</a></div></div></section>
<section class="section" style="padding-top:0"><div class="wrap faq-grid"><div><h2>A little pricing clarity.</h2><a class="text-link" href="{{R}}faqs/">All common questions</a></div>
  <div class="faq-list">{faq_html([FAQS[7], ("What counts as a location?", "One location is one CityPulse kiosk venue — for example, a hotel lobby or a medical office waiting room. Your quote lists the exact venues your ad runs in.", "advertisers"), ("What if I want 2 or 4 locations?", "Two locations are covered by the 3-location package ($1,099), and four by the 5-location package ($1,200), so you get a spare location included at no extra cost.", "advertisers"), FAQS[8], FAQS[9], FAQS[3]])}</div></div></section>
{cta_band("Bring your next local idea.", "Choose a starting point, plan the scale and discuss a campaign that fits.")}'''
page("pricing/", "Pricing & calculator", "Kiosk advertising packages: $399 a year for one location, $1,099 for three, $1,200 for five, or $60 a month per location. Free hosting for qualified venues.", pricing)

# ================================================================ CAMPAIGN PLANNER
def choice(name, value, sub, need=False):
    n = f' data-need="Choose an option to continue."' if need else ""
    return f'<label class="choice"><input type="radio" name="{name}" value="{value}"{n}><b>{value}</b><span>{sub}</span></label>'

planner = page_hero([("Advertise","advertise/"),("Campaign planner","campaign-planner/")], "Your next campaign. One clear brief.",
  "Organize your idea into a practical starting point for the CityPulse team. Plan the goal, the setting, the message and the next step.") + f'''
<section class="section"><div class="wrap planner">
  <ol class="planner-steps"><li class="on"><span>1</span>Your goal</li><li><span>2</span>The setting</li><li><span>3</span>The message</li><li><span>4</span>Your brief</li></ol>
  <div>
  <form id="planner" data-next="{{R}}advertise/#inquiry" novalidate>
    <section class="pstep"><h2>What should the message do?</h2><p>Choose the main action you want to encourage.</p>
      <div class="choice-grid">{choice("Campaign goal","Local awareness","Introduce your business",True)}{choice("Campaign goal","Visits / local discovery","Give people a reason to explore")}{choice("Campaign goal","Offer / QR engagement","Connect an offer to its details")}{choice("Campaign goal","Calls / inquiries","Start a useful conversation")}</div>
      <div class="grid2">{field("Business name","Business").replace('name="Business"','name="Business" data-need="Add your business name to continue."')}{field("Business category","Business category","select",options=CATEGORIES)}</div>
      <p class="form-error" role="alert" hidden></p></section>
    <section class="pstep" hidden><h2>Where could your message fit?</h2><p>A relevant setting gives the message a purpose.</p>
      <div class="choice-grid">{choice("Venue setting","Hotels & hospitality","Guests planning what comes next",True)}{choice("Venue setting","Medical offices","Visitors looking for practical information")}{choice("Venue setting","Car dealerships","Sales and service lounge visitors")}{choice("Venue setting","Restaurants & venues","Guests exploring menus and events")}{choice("Venue setting","Help me choose","Discuss the right setting for my goal")}</div>
      <div class="grid2">{field("Target city / state","Target city / state",ph="e.g. Phoenix, AZ")}{field("Preferred format","Placement","select",options=PLACEMENTS,value="Help me choose")}</div>
      <p class="fine" style="margin-top:10px">The team reviews actual venue and format availability.</p>
      <p class="form-error" role="alert" hidden></p></section>
    <section class="pstep" hidden><h2>Give them a useful next step.</h2><p>Share the offer, the timing and what you already have.</p>
      <div class="grid2">{field("The message or offer","Message / offer","textarea",full=True,ph="What should someone remember or explore?")}{field("Preferred timing","Preferred timing",ph="e.g. summer launch, next month")}{field("Planning budget","Planning budget",opt=True,ph="e.g. $500 total, or please advise")}{field("Creative readiness","Creative readiness","select",options=["I need help with the direction","I have a logo and offer","I have existing artwork","I'm working with an agency"])}{field("Destination URL","Destination URL","url",opt=True,ph="https://")}</div>
      <p class="fine" style="margin-top:10px">Your budget is a preference for discussion. The planner doesn't calculate prices or forecast results.</p>
      <p class="form-error" role="alert" hidden></p></section>
    <section class="pstep" hidden><h2>Your campaign brief.</h2><p>Review it, download a copy, or carry it into an advertiser inquiry.</p>
      <dl class="brief-out" id="brief-out"></dl>
      <div class="btn-row"><button class="btn" type="button" data-plan="inquiry">Continue to inquiry</button><button class="btn btn-ghost" type="button" data-plan="download">Download brief</button><a class="text-link" style="align-self:center" href="{{R}}creative-studio/">Explore a creative concept</a></div></section>
  </form>
  <div class="planner-nav"><button class="btn btn-ghost btn-small" type="button" data-plan="back">Back</button><span class="fine" data-plan="label">Step 1 of 4</span><button class="btn btn-small" type="button" data-plan="next">Next</button></div>
  <p class="fine" style="margin-top:14px">Your answers stay in this page. A brief doesn't reserve placements or purchase advertising.</p>
  </div>
</div></section>'''
page("campaign-planner/", "Campaign planner", "Build a local kiosk campaign brief in four steps: goal, setting, message and next step.", planner)

# ================================================================ CREATIVE STUDIO
studio_presets = "".join(f'<button type="button" class="chip" data-preset="{i}" aria-pressed="{str(n==0).lower()}">{l}</button>' for n, (i, l) in enumerate([("dinner-nearby","Dining & drinks"),("weekend-experience","Local experiences"),("service-reminder","Automotive & services"),("local-event","Events & community")]))
studio = page_hero([("Advertise","advertise/"),("Creative studio","creative-studio/")], "A clear message. A useful next step.",
  "Try a campaign concept in your browser. Write a message, see it in the kiosk's ad space, and download a draft to share with your designer or the CityPulse team.") + f'''
<section class="section"><div class="wrap studio">
  <form class="studio-form" id="studio" novalidate>
    <div><span class="fine" style="font-weight:600">Start from an example</span><div class="presets" style="margin:8px 0 0">{studio_presets}</div></div>
    <label class="field">Business name<input name="brand" value="Willow Kitchen" maxlength="40"></label>
    <label class="field"><span>Headline <span class="count" id="hl-count">29 of 65 characters</span></span><input name="headline" value="A good evening starts nearby." maxlength="90"></label>
    <label class="field">Call to action<input name="action" value="Explore the menu" maxlength="30"></label>
    <label class="field"><span>Destination URL <span class="opt">(optional)</span></span><input name="url" type="url" placeholder="https://yourbusiness.com/offer"><small>Add a destination to test the link from the preview.</small></label>
    <label class="field">Format<select name="format"><option value="tile">Kiosk ad space · bottom of screen</option><option value="banner">Featured banner · landscape</option><option value="panel">Rotating panel · landscape</option></select></label>
    <fieldset style="border:0;padding:0;margin:0"><legend class="field" style="margin-bottom:8px">Color</legend><div class="swatches">
      <label><input type="radio" name="color" value="forest" checked><i style="--sw:#1F4433"></i>Forest</label>
      <label><input type="radio" name="color" value="sunset"><i style="--sw:linear-gradient(135deg,#c2502f,#f2a65b)"></i>Sunset</label>
      <label><input type="radio" name="color" value="cobalt"><i style="--sw:linear-gradient(135deg,#1c3f8a,#3f7ad8)"></i>Cobalt</label>
      <label><input type="radio" name="color" value="lamp"><i style="--sw:#22C7B6"></i>Pulse teal</label></div></fieldset>
    <div class="btn-row" style="margin-top:4px"><button class="btn" type="button" data-studio="download">Download SVG concept</button><a class="btn btn-ghost" href="{{R}}campaign-planner/">Build the brief</a></div>
    <p class="fine">Final artwork dimensions and accepted formats are confirmed for your placement. Your changes stay in this page.</p>
  </form>
  <div class="studio-preview" aria-live="polite"><div class="lbl"><span>Live preview</span><span id="fmt-label">Kiosk ad space · bottom of screen</span></div><div id="studio-preview" style="width:100%;display:flex;justify-content:center"></div><a class="text-link" id="studio-link" href="#" target="_blank" rel="noopener" hidden>Test your destination link</a><p class="fine">One business identity. One main message. One clear next step.</p></div>
</div></section>
<section class="section" style="background:#fff;border-top:1px solid var(--line)"><div class="wrap">
  {head("Make the message easy to understand.", "Three checks before artwork is final.")}
  <div class="cards"><div class="card"><h3>Lead with one idea.</h3><p>A short headline gives the visitor a clear starting point. Let the destination page carry the detail.</p></div>
  <div class="card"><h3>Use a clear hierarchy.</h3><p>Keep the headline prominent, the business recognizable and the action easy to find.</p></div>
  <div class="card"><h3>Check the destination.</h3><p>Use a current, mobile-friendly page that matches the offer and gives people a useful next step.</p></div></div>
  <p style="margin-top:22px"><a class="text-link" href="{{R}}resources/screen-creative/">Read the creative guide</a></p>
</div></section>'''
page("creative-studio/", "Creative studio", "Write a kiosk ad, preview it in the screen's ad space and download an SVG concept.", studio)

# ================================================================ CAMPAIGN IDEAS
ideas = page_hero([("Advertise","advertise/"),("Campaign ideas","campaign-ideas/")], "Make the next local connection.",
  "A few useful starting points for your business. Explore the visitor moment, the message and the next step.") + f'''
<section class="section"><div class="wrap" data-filter-root>
  <div class="filters">{chips([("all","All ideas"),("dining","Dining"),("experiences","Experiences"),("automotive","Automotive"),("retail","Retail"),("events","Events"),("services","Services")])}{search_box("Try menu, event, family or service","Search campaign ideas")}</div>
  <p class="result-count" data-count data-one="campaign idea" data-many="campaign ideas"></p>
  <div class="concepts">{"".join(concept_card(i, full=True) for i in IDEAS)}</div>
  {empty_state("Clear your filters or start a brief around your own business.", f' <a class="btn btn-small" href="{{R}}campaign-planner/">Build your own brief</a>')}
  <p class="fine" style="margin-top:20px">All examples use made-up businesses. Placement and campaign terms are confirmed separately.</p>
</div></section>
{cta_band("Have your own idea?", "Turn it into a brief in a few minutes, or talk it through with the team.")}'''
page("campaign-ideas/", "Campaign ideas", "Eight local kiosk campaign playbooks — dining, experiences, automotive, retail, events and services — to adapt for your business.", ideas)

# ================================================================ AUDIENCE
aud_cards = "".join(f'<div class="card"><span class="kind">{v["name"]}</span><h3>{v["moment"]}</h3><p>{", ".join(v["bullets"][:2])}.</p><a class="text-link" href="{{R}}venues/{v["slug"]}/">Explore this setting</a></div>' for v in VENUES)
audience = page_hero([("Advertise","advertise/"),("Who you can reach","audience/")], "Meet people in a useful moment.",
  "Start with what people are doing, the place they're in and the information they'll find relevant.") + f'''
{section(head("The setting shapes the message.", "A guest planning dinner has a different next step from a customer waiting for a service appointment. Plan your message around that setting: a useful offer, a clear call to action and a market that makes sense for your business.") + f'<div class="cards">{aud_cards}</div>')}
<section class="section dark"><div class="wrap">
  {head("Three questions to start with.", "Your answers help the team scope placement, creative and the available reporting.")}
  <ol class="step-list"><li><h3>Where do you fit?</h3><p>Choose the city and venue setting that are relevant to your business and offer.</p></li><li><h3>What should they do?</h3><p>Define a simple next step: explore, call, visit or follow a QR link.</p></li><li><h3>What can be measured?</h3><p>Confirm the display, interaction or QR measurements available for the campaign.</p></li></ol>
  <p class="fine" style="margin-top:22px">Audience and availability are confirmed campaign by campaign. Display impressions reflect screen activity; unique viewers and sales need separate verification.</p>
</div></section>
{cta_band("Make your message relevant.", "Share your business, target market and the next step you want people to take.")}'''
page("audience/", "Who you can reach", "Hotel guests, patients, diners and service customers — reach people in a useful moment with a relevant local message.", audience)

# ================================================================ LOCATIONS
loc_groups = ""
for state, (ab, cities) in MARKETS.items():
    lis = "".join(f'<li data-item data-cat="{ab}"><span>{e(market_label(c, ab))}</span><a href="{{R}}?market={quote_plus(market_label(c, ab))}#get-started">Advertise here</a></li>' for c, _, _ in cities)
    loc_groups += f'<div class="loc-group" data-group><h3>{state}</h3><ul class="loc-list">{lis}</ul></div>'
state_opts = '<option value="all">All states</option>' + "".join(f'<option value="{ab}">{st}</option>' for st, (ab, _) in MARKETS.items())
locations = page_hero([("Advertise","advertise/"),("Locations","locations/")], "Hosts in all 50 states.",
  f"CityPulse kiosks stand in hotel lobbies, medical offices, dealership lounges and restaurants in {N_MARKETS} cities across the country. Pick your city and get on a kiosk today.",
  btns(("Get started — $399/yr","#get-started-link"),("Host a kiosk","hosts/","btn-ghost")).replace('href="#get-started-link"','href="{R}#get-started"')) + f'''
<section class="section markets"><div class="wrap">{us_map()}</div></section>
<section class="section" style="padding-top:0"><div class="wrap" data-filter-root>
  <div class="filters"><label class="field" style="min-width:220px"><span class="sr">State</span><select data-filter-select>{state_opts}</select></label>{search_box("Try Phoenix, Texas or NY","Find a city")}</div>
  <p class="result-count" data-count data-one="city" data-many="cities"></p>
  {loc_groups}
  {empty_state("Don't see your city? We may still have a kiosk near you.", f' <a class="btn btn-small" href="{{R}}#get-started">Tell us your city</a>')}
  <p class="fine">Exact venues are confirmed with you before your ad goes live.</p>
</div></section>
{cta_band("Ready when you are.", "One location is $399 a year. Pick your city and check out in about five minutes.")}'''
page("locations/", "Locations", f"CityPulse kiosk hosts in {N_MARKETS} cities across all 50 states. Find your city and advertise from $399 a year.", locations)

# ================================================================ AGENCIES
agencies = page_hero([("Advertise","advertise/"),("For agencies","agencies/")], "Give your local brief another useful setting.",
  "Talk to us about CityPulse venue opportunities for clients, local business groups and multi-location brands.",
  btns(("Discuss your client brief", f"mailto:{EMAIL}?subject=Agency%20opportunity"),("View the media overview","media-kit/","btn-ghost"))) + f'''
{section(head("Bring the strategy. Let's discuss the fit.", "A local screen campaign should connect to the rest of your client's plan.") + '''<div class="cards two"><div class="card"><p style="color:var(--ink);font-size:18px">Share the target market, venue setting, creative direction and the action you want to encourage. CityPulse reviews the opportunity and helps clarify available placements and terms.</p></div><div class="card"><p style="color:var(--ink);font-size:18px">Agency arrangements, multi-venue availability, category considerations, creative coordination and reporting are agreed for each opportunity.</p><a class="text-link" href="{R}campaign-planner/">Build a client campaign brief</a></div></div>''')}
<section class="section dark"><div class="wrap">{head("A better brief makes the next step easier.")}
  <div class="cards"><div class="card"><h3>The market and setting.</h3><p>Share cities, venue contexts, the client's service area and any locations that matter to the plan.</p></div>
  <div class="card"><h3>The message and action.</h3><p>Bring the core offer, brand assets, landing page, desired timing and the creative approval contact.</p></div>
  <div class="card"><h3>The reporting question.</h3><p>Identify the delivery and business outcomes the client wants to understand, and confirm what can be reported.</p></div></div></div></section>
{cta_band("One client. Several possibilities.", "Start with a venue context, a seasonal message or a local launch. We'll review the proposed campaign with you.")}'''
page("agencies/", "For agencies & partners", "CityPulse kiosk advertising for agencies, local business groups and multi-location brands.", agencies)

# ================================================================ HOSTS
hosts = page_hero([("For venues","venues/"),("Host a kiosk","hosts/")], "Upgrade your space. Keep it simple.",
  "A premium digital amenity at no cost for qualified venues. Help visitors find useful information while your team focuses on service.",
  btns(("Request a kiosk","#inquiry"),("Prepare your venue","resources/host-preparation/","btn-ghost")),
  aside=f'<div class="hero-photo"><img src="{{R}}assets/kiosk-lobby-sm.jpg" alt="Silver CityPulse kiosk in a hotel lobby" width="900" height="600"></div>') + f'''
<section class="section"><div class="wrap">
  {head("We bring the kiosk. You bring the space.")}
  <div class="path"><div class="path-main"><h3>Included in the host offering</h3>{check_list(["Kiosk hardware and software","Coordinated installation and setup","Your venue information and content updates","Routine maintenance and ongoing support"])}</div>
  <div class="path-panel"><h4>What makes a good host location?</h4><p style="color:var(--muted-dark)">A visible, accessible area where visitors naturally spend time. A standard power outlet and a conversation about internet connectivity help us assess the right setup.</p>
    <h4 style="margin-top:26px">Participation and next steps</h4><p style="color:var(--muted-dark)">Every request is reviewed for suitability and availability. Participation requires a signed Host Agreement. Installation timing and terms are confirmed with your team.</p></div></div>
</div></section>
<section class="section" style="padding-top:0"><div class="wrap">
  {head("Good fits for a CityPulse kiosk.")}
  <div class="cards">{"".join(f'<a class="card" href="{{R}}venues/{v["slug"]}/"><span class="kind">{v["name"]}</span><h3>{v["h"]}</h3><p>{v["moment"]}.</p></a>' for v in VENUES[:3])}</div>
  <p style="margin-top:22px"><a class="text-link" href="{{R}}venues/">See all venue types</a> &nbsp; <a class="text-link" href="{{R}}resources/host-preparation/">Use the host preparation guide</a></p>
</div></section>
{form_section("inquiry", "Let's find the right fit.", "Share a few details about your venue. The team reviews your space, connectivity and next steps.", ["Share your venue details", "Review the space and availability", "Confirm a Host Agreement and setup"], host_form(), dark=True)}'''
page("hosts/", "Host a kiosk", "A managed touch-screen kiosk for your lobby or waiting area — hardware, setup, content and maintenance at no cost for qualified venues.", hosts)

# ================================================================ VENUES
venues = page_hero([("For venues","venues/")], "Useful in your space. Relevant to your visitors.",
  "One kiosk platform, with content planned around your venue and the people who use it.",
  btns(("Request a kiosk","hosts/#inquiry"),("Read the host FAQs","faqs/?filter=hosts","btn-ghost"))) + f'''
{section(head("Real places. Relevant possibilities.", "Explore the visitor moment in each venue type, then review the use case in more detail.") + venue_tabs())}
{cta_band()}'''
page("venues/", "Venues", "CityPulse kiosks for hotels, medical offices, car dealerships and restaurants.", venues)

for v in VENUES:
    aside = (f'<div class="hero-photo"><img src="{{R}}assets/{v["photo"]}" alt="{v["photo_alt"]}" width="900" height="600"></div>' if v.get("photo")
             else f'<div class="moment" style="background:var(--stone)">{mini(v["venue"], v["tiles"], v["finish"])}<dl><dt>The visitor moment</dt><dd>{v["moment"]}</dd><dt>On screen</dt><dd>{v["mh"]}</dd></dl></div>')
    note = f'<div class="callout" style="margin-top:32px"><b>Keep healthcare content informational.</b><p>{v["note"].split(". ",1)[1]}</p></div>' if v.get("note") else ""
    demo_venue = {"hotels": "the hotel lobby", "medical": "the medical office", "automotive": "the dealership lounge"}.get(v["slug"])
    right = (f'<div class="moment">{mini(v["venue"], v["tiles"], v["finish"])}<dl><dt>The visitor moment</dt><dd>{v["moment"]}</dd><dt>On screen</dt><dd>{v["mh"]}</dd><dt>Ad space</dt><dd>Local businesses relevant to your visitors</dd></dl></div>' if v.get("photo")
             else f'<div class="path-panel" style="border-radius:22px"><h4>On every screen</h4><dl class="brief"><div><dt>Top half</dt><dd>Your venue information, chosen with your team</dd></div><div><dt>Bottom half</dt><dd>Ad space for local businesses relevant to your visitors</dd></div><div><dt>Take-home</dt><dd>QR codes and send-to-phone links for the next step</dd></div><div><dt>Upkeep</dt><dd>Content updates and maintenance handled by CityPulse</dd></div></dl>' + (f'<p style="margin-top:18px"><a class="text-link" href="{{R}}kiosk/#demo">Try {demo_venue} in the kiosk demo</a></p>' if demo_venue else "") + '</div>')
    others = "".join(f'<a class="chip" href="{{R}}venues/{o["slug"]}/"{" aria-current=\"page\"" if o is v else ""}>{o["name"]}</a>' for o in VENUES)
    body = page_hero([("For venues","venues/"),(v["name"], f'venues/{v["slug"]}/')], v["h"], v["lede"], btns(("Start a venue inquiry","hosts/#inquiry"),("Try the kiosk demo","kiosk/#demo","btn-ghost")), aside=aside) + f'''
<section class="section"><div class="wrap"><div class="tab-panel">
  <div><h3>Keep the information close at hand.</h3>{check_list(v["bullets"])}{note}</div>
  {right}
</div><p class="fine" style="margin-top:16px">Use-case illustration. Final content and hardware setup are agreed with each venue.</p></div></section>
<section class="section dark"><div class="wrap">{head("Plan it around your space.")}
  <ol class="step-list"><li><h3>Review the setting.</h3><p>Discuss an accessible position, visitor flow, power and connectivity with your team.</p></li><li><h3>Choose the information.</h3><p>Agree on useful venue content and relevant local information for your visitors.</p></li><li><h3>Confirm participation.</h3><p>Review availability, the Host Agreement, installation planning and the support process.</p></li></ol></div></section>
<section class="section"><div class="wrap"><h2 style="font-size:28px;margin-bottom:16px">Other venue types</h2><div class="presets">{others}</div></div></section>
{cta_band("Could CityPulse fit your venue?", "Tell us about your space and we'll talk through the right setup.")}'''
    page(f'venues/{v["slug"]}/', v["name"], v["lede"], body, active="venues")

# ================================================================ RESOURCES
res_cards = "".join(f'<a class="card" data-item data-cat="{c}" href="{{R}}{h}"><span class="kind">{k}</span><h3>{t}</h3><p>{d}</p><span class="meta">{m}</span></a>' for c, k, t, d, m, h in RESOURCES)
resources = page_hero([("Resources","resources/")], "Good ideas. Useful next steps.",
  "Practical guides, campaign inspiration and interactive tools for your venue or local advertising plan.") + f'''
<section class="section"><div class="wrap" data-filter-root>
  <div class="filters">{chips([("all","All resources"),("advertisers","For advertisers"),("creative","Creative"),("hosts","For hosts")])}{search_box("Try creative, campaign or host","Find a guide or tool")}</div>
  <p class="result-count" data-count data-one="resource" data-many="resources"></p>
  <div class="cards">{res_cards}</div>
  {empty_state("Clear the search to browse all guides and tools.")}
</div></section>'''
page("resources/", "Guides & resources", "Guides, tools and inspiration for CityPulse advertisers and host venues.", resources)

page("resources/first-local-campaign/", "Plan your first local kiosk campaign", "Turn a business goal into a useful venue, message and next step.", article(
  [("Resources","resources/"),("First campaign guide","resources/first-local-campaign/")], "Plan your first local kiosk campaign",
  "A useful campaign starts with a clear business question. Work from the action you want to encourage, then choose the setting and message that fit it.", [
  ("Choose one useful goal", "<p>Start with what you want someone to do: recognize your business, explore a menu, learn about a service, request information or plan a visit. A single goal makes the headline, destination and reporting conversation easier to define.</p><p>For a restaurant, “help nearby visitors choose dinner” is a practical starting point. It points toward hospitality settings, an inviting menu message and a mobile page with current hours and directions.</p>"),
  ("Match the idea to the setting", "<p>Think about the visitor's situation. A hotel guest planning an evening, a customer waiting for a vehicle service and a visitor in a medical office have different needs. The setting should give your message a reason to appear.</p><p>Share the target city, service area and venue context with the team, and review the actual proposed location before treating it as available.</p>"),
  ("Write an offer people can understand", "<p>Use one main thought and one next step. An offer can be an introduction, an experience, a useful service or a promotion. It doesn't have to be a discount.</p><p>If the message includes a price, promotion or time limit, make sure the details can be explained accurately. Prepare a destination page that delivers what the creative promises: the right menu, booking information, event details or contact route.</p>"),
  ("Prepare the campaign brief", "<p>Bring your business identity, goal, target market, venue setting, offer, timing and creative readiness. A budget preference helps frame the conversation, but doesn't set a package price or a delivery forecast.</p><p>Decide who approves creative and who can answer business questions. Include the current destination URL and any restrictions that matter to your business or the venue.</p>"),
  ("Review the proposal and the reporting", "<p>Before a campaign is confirmed, review the placement, format, creative requirements, term, price, update process and reporting. Ask what each metric counts and how often you'll receive it.</p><p>Delivery, recorded interaction and business outcomes answer different questions. A display impression isn't a verified unique customer or a sale.</p>"),
  ], after="""<div class="callout"><b>Your first brief can be simple.</b><p>“We're a restaurant in Phoenix. We want nearby visitors to explore our dinner menu. We'd like to discuss a suitable hospitality venue, an inviting menu message and a campaign around our seasonal menu launch.” That's enough to start. The planner turns it into a brief you can share.</p></div>""",
  meta="6 min read", cta=("Put the idea to work.", "Build your brief in four short steps.", "Build your campaign brief", "campaign-planner/")), active="resources")

page("resources/screen-creative/", "Create a screen message people can read", "A practical guide to kiosk ad creative: hierarchy, contrast, one offer and a clear destination.", article(
  [("Resources","resources/"),("Creative guide","resources/screen-creative/")], "Create a screen message people can read",
  "A venue screen message has a practical job: introduce a business or idea, make it easy to understand, and offer a useful next step.", [
  ("Make one idea the starting point", "<p>Choose the thought you want someone to remember. “Dinner nearby,” “a local experience” or “a service worth knowing about” gives the creative a clear purpose. A list of everything your business does is hard to turn into a quick screen message.</p><p>Write the headline first, then decide what supporting information makes it useful. Keep the full menu, service list or event program on the destination page.</p>"),
  ("Give the eye a clear route", "<p>Arrange the message so a visitor can quickly identify the business, understand the headline and find the action. Use size and spacing to give the main idea more emphasis than supporting detail.</p><p>Business name, headline and action are three different jobs. Give each room to work — the creative studio keeps them as separate fields for that reason.</p>"),
  ("Review the message in its setting", "<p>Look at the creative at a realistic size. Consider the screen orientation, the light in the room and how far away the visitor stands. A design that's clear on a desktop monitor may need changes on a kiosk.</p><p>Use strong text contrast and readable type. Keep important information away from the edges. Final pixel dimensions and file formats come from your confirmed placement.</p>"),
  ("Choose a destination that finishes the thought", "<p>A menu message should reach the menu. An event message should reach event information. The landing page should work well on a phone and give the visitor the next useful piece of information.</p><p>Where a QR destination is supported, test the code from the actual artwork. Confirm the target URL and any tracking approach.</p>"),
  ("Review the offer before artwork is final", "<p>Check the business identity, spelling, contact details, dates, price claims and offer conditions. Make sure the message suits the host setting. Agree on who approves the creative and how later changes are requested.</p>"),
  ], after="""<div class="callout"><b>A simple review question.</b><p>Show someone the design briefly and ask which business it is, what it offers and what to do next. If any answer is unclear, revisit the hierarchy or remove competing information.</p></div>""",
  meta="5 min read", cta=("Put the idea to work.", "Write a headline and see it in the kiosk's ad space.", "Try the creative studio", "creative-studio/")), active="resources")

checklist = '''<div class="checklist" id="checklist"><h2>Your preparation checklist</h2><p class="fine" style="margin-bottom:8px">Keep the useful details together. This checklist helps you prepare; it doesn't approve a venue.</p>
''' + "".join(f'<label><input type="checkbox"> {x}</label>' for x in ["Venue name, address and type", "Decision maker and how to reach them", "A possible visible, accessible placement", "Power location and a connectivity contact", "Useful venue information and a content contact", "Questions about the agreement and support"]) + '<p class="progress" role="status"></p></div>'
page("resources/host-preparation/", "Get your venue ready for a CityPulse conversation", "What to prepare before a kiosk hosting conversation: space, power, connectivity, content and the agreement.", article(
  [("Resources","resources/"),("Host preparation","resources/host-preparation/")], "Get your venue ready for a CityPulse conversation",
  "A useful kiosk setup begins with the venue. Prepare the details that help the team review your space, your visitors' needs and the right next step.", [
  ("Gather the venue details", "<p>Start with the venue name, type, street address, city and the person who can discuss participation. If someone else makes the final decision, include their name and how to reach them.</p><p>Describe where visitors normally pause and what they usually ask about. A hotel lobby, medical waiting area, dealership lounge and restaurant entrance each have a different visitor flow.</p>"),
  ("Identify a visible, accessible position", "<p>Look for a spot people can notice and approach comfortably. Keep entrances, walkways, seating and staff work areas in mind. The final position is reviewed with the CityPulse team.</p><p>Photos, measurements and installation details can be shared with the team later in the process.</p>"),
  ("Review power and connectivity", "<p>A standard power outlet is part of the conversation. Know where it is in relation to the proposed position. Share whether internet is available and who can answer network questions.</p><p>Hardware configuration, connection method, installation timing and any site-specific work are confirmed during review.</p>"),
  ("Choose information visitors can use", "<p>Prepare accurate venue details: amenities, service information, menus, directions, common questions or local experiences. Name the person responsible for confirming content and keeping it current.</p><p>For medical settings, keep it to general visitor information and practice-approved educational content. Never include patient records or personal health information.</p>"),
  ("Confirm the agreement and support process", "<p>Qualified venues can discuss the managed, no-cost host offering. Suitability, availability and responsibilities are reviewed before a Host Agreement is signed.</p><p>Agree on installation planning, the support contact, routine maintenance and how content updates work.</p>"),
  ], after=checklist, meta="5 min read", cta=("Put the idea to work.", "Tell us about your venue.", "Start a venue inquiry", "hosts/#inquiry")), active="venues")

# ================================================================ HOW IT WORKS
hiw = page_hero([("Resources","resources/"),("How it works","how-it-works/")], "A clearer path from idea to next step.",
  "A managed conversation for your campaign or venue. Confirm the right fit, then the details that make it work.") + f'''
{section(head("From a local idea to a clear proposal.", "For advertisers") + '''<ol class="step-list five">
  <li><h3>Define the goal</h3><p>Decide what people should discover or do after seeing your message.</p></li>
  <li><h3>Discuss the setting</h3><p>Share the market and venue context you want the team to review.</p></li>
  <li><h3>Confirm the proposal</h3><p>Review placements, term, pricing, creative requirements and reporting.</p></li>
  <li><h3>Prepare the creative</h3><p>Agree on the message, destination, artwork, review and updates.</p></li>
  <li><h3>Review delivery</h3><p>Use the measurements in your agreement and plan the next step.</p></li></ol>''' + btns(("Build your campaign brief","campaign-planner/")))}
<section class="section dark"><div class="wrap">{head("From a useful space to a managed amenity.", "For host venues")}
  <ol class="step-list five"><li><h3>Share your venue</h3><p>Tell the team about your venue type, location and decision maker.</p></li>
  <li><h3>Review placement</h3><p>Discuss visible, accessible space, standard power, connectivity and visitor flow.</p></li>
  <li><h3>Agree on participation</h3><p>Confirm suitability, availability, the Host Agreement and installation planning.</p></li>
  <li><h3>Plan useful content</h3><p>Choose venue information, FAQs, local discovery and relevant content.</p></li>
  <li><h3>Coordinate ongoing care</h3><p>Agree on support contacts, routine maintenance and content updates.</p></li></ol>
  {btns(("Start a host conversation","hosts/#inquiry"))}</div></section>
{cta_band("Let's make the next step useful.", "Start with your campaign goal or tell us about your venue.")}'''
page("how-it-works/", "How CityPulse works", "The steps for CityPulse advertisers and host venues, from a first brief to confirmed terms.", hiw, active="resources")

# ================================================================ MEDIA KIT
media = page_hero([("Resources","resources/"),("Media overview","media-kit/")], "The idea. The setting. The next step.",
  "A practical overview for advertisers, agency teams and prospective host venues.",
  '<div class="btn-row"><button class="btn" type="button" data-download-overview>Download overview</button>' + btns(("Build a campaign brief","campaign-planner/","btn-ghost"))[21:]) + f'''
<section class="section"><div class="wrap"><dl class="overview" id="overview">
  <div><dt>The concept</dt><dd>Managed interactive venue kiosks that combine visitor information, local discovery and advertising.</dd></div>
  <div><dt>Venues</dt><dd>Hotels, medical offices, car dealerships, restaurants and other places where people spend time.</dd></div>
  <div><dt>Host offering</dt><dd>Kiosk equipment, software, coordinated setup, content updates and routine maintenance for qualified hosts, subject to review and a Host Agreement.</dd></div>
  <div><dt>Advertiser formats</dt><dd>The kiosk ad space along the bottom of the screen, featured banners, rotating panels and QR offer tiles. Available formats are confirmed for each venue.</dd></div>
  <div><dt>Pricing</dt><dd>$399 a year for one location, $1,099 for three locations, $1,200 for five, and $300 a year for each location after five. Monthly: $60 per location. Venue availability and final terms are confirmed in your quote.</dd></div>
  <div><dt>Reporting</dt><dd>Display impressions, screen interactions and QR activity where supported. Definitions and reporting terms are agreed for each campaign.</dd></div>
</dl>
<div class="cards four" style="margin-top:40px"><a class="card" href="{{R}}campaign-ideas/"><h3>Campaign ideas</h3><p>Eight playbooks to adapt.</p></a><a class="card" href="{{R}}creative-studio/"><h3>Preview your message</h3><p>See it in the ad space.</p></a><a class="card" href="{{R}}measurement/"><h3>Understand reporting</h3><p>What each number means.</p></a><a class="card" href="{{R}}contact/"><h3>Talk with CityPulse</h3><p>{PHONE}</p></a></div>
</div></section>'''
page("media-kit/", "Media overview", "CityPulse Kiosks at a glance: the concept, venues, host offering, ad formats, pricing and reporting.", media, active="resources")

# ================================================================ MEASUREMENT
meas = page_hero([("Resources","resources/"),("Measurement guide","measurement/")], "Know what the numbers mean.",
  "A useful report starts with clear definitions. Discuss the available measurements and reporting method before your campaign is confirmed.", btns(("Plan your campaign","campaign-planner/"))) + f'''
{section(head("Five different signals.") + '''<ol class="metric-list">
  <li><div><h3>Ad plays</h3><p>How often creative was displayed.</p></div><p>Delivery logs show whether a message ran. A play alone doesn't establish who saw it.</p></li>
  <li><div><h3>Display impressions</h3><p>A reported or estimated opportunity for the message to be seen.</p></div><p>Ask how impressions are defined, estimated and separated from plays or unique people.</p></li>
  <li><div><h3>Screen interactions</h3><p>Recorded taps or other actions on interactive content.</p></div><p>Ask which actions are counted and whether repeat activity is included.</p></li>
  <li><div><h3>QR visits</h3><p>Scans or visits linked to a supported QR destination.</p></div><p>Agree on the link, the tracking approach and what's counted. Test the mobile destination.</p></li>
  <li><div><h3>Business outcomes</h3><p>Inquiries, bookings, redemptions or purchases your business observes.</p></div><p>Connect the campaign to your own records carefully. Attribution needs a defined method.</p></li></ol>''')}
<section class="section" style="background:#fff;border-top:1px solid var(--line)"><div class="wrap faq-grid">
  <div><h2>Agree on the report before the campaign.</h2></div>
  <div class="prose">{check_list(["Which metrics are available for this placement?","What does each metric count, and how is it calculated?","Which dates, locations and creative does the report cover?","How often will reporting be provided?","How will we track a useful next step on our own destination page?"])}
  <div class="callout"><b>A practical example: one offer, one destination.</b><p>A restaurant promotes a menu page from a hotel kiosk. Delivery data shows when the ad appeared. Interaction or QR data shows recorded next steps. The restaurant's own bookings or redemptions help assess outcomes. Each tells a different part of the story.</p></div></div>
</div></section>'''
page("measurement/", "Campaign measurement", "Ad plays, impressions, interactions, QR visits and business outcomes — what each kiosk campaign number means.", meas, active="resources")

# ================================================================ FAQS
faqs = page_hero([("Resources","resources/"),("Common questions","faqs/")], "A little clarity goes a long way.",
  "The host model, advertising options and next steps for your venue or business.") + f'''
<section class="section"><div class="wrap narrow" data-filter-root>
  <div class="filters">{chips([("all","All questions"),("hosts","For hosts"),("advertisers","For advertisers")])}{search_box("Try pricing, installation or content","Search questions")}</div>
  <p class="result-count" data-count data-one="question" data-many="questions"></p>
  <div class="faq-list">{faq_html(FAQS, tags=True)}</div>
  {empty_state("Try another search, or contact the team.", f' <a class="btn btn-small" href="{{R}}contact/">Contact CityPulse</a>')}
</div></section>
{cta_band()}'''
page("faqs/", "Common questions", "Answers about hosting a CityPulse kiosk, advertising costs, ad updates and campaign measurement.", faqs, active="resources")

# ================================================================ ABOUT
about = page_hero([("About us","about/")], "Good places. Useful connections.",
  "We're building a simpler way for people to discover what's around them — and for local businesses to be part of that moment.",
  btns(("How CityPulse works","how-it-works/"),("Our story","#story","btn-ghost")),
  aside=f'<div class="hero-photo"><img src="{{R}}assets/kiosk-lobby-sm.jpg" alt="Silver CityPulse kiosk in a hotel lobby" width="900" height="600"></div>') + f'''
<section class="section"><div class="wrap faq-grid"><div><h2>Good places deserve to be found.</h2></div>
  <div class="prose"><p style="font-size:20px;color:var(--ink)">A few minutes in a lobby or waiting area can become a useful connection.</p><p>Visitors might be choosing lunch, looking for directions, exploring a service or learning what a venue offers. CityPulse brings those possibilities together on a professionally managed touch screen.</p><p>Our purpose is practical: useful information for visitors, a modern amenity for venues and relevant visibility for the surrounding business community.</p></div></div></section>
<section class="section dark"><div class="wrap">{head("Designed to work for everyone involved.", "The venue, the visitor and the local business each have a place in the CityPulse model.")}
  <div class="cards"><div class="card"><h3>The visitor finds something useful.</h3><p>Venue information, local services and experiences from one approachable screen.</p><a class="text-link" href="{{R}}kiosk/">Explore the kiosk</a></div>
  <div class="card"><h3>The venue adds an amenity.</h3><p>Qualified hosts add a managed kiosk, with setup, content and routine maintenance included.</p><a class="text-link" href="{{R}}hosts/">See the host offering</a></div>
  <div class="card"><h3>The business is part of the moment.</h3><p>A relevant message in front of people deciding what to do, where to go or what to choose next.</p><a class="text-link" href="{{R}}advertise/">Explore advertising</a></div></div></div></section>
<section class="section" id="story"><div class="wrap faq-grid"><div><h2>A focused start. A wider possibility.</h2><p class="lede" style="margin-top:16px">The idea began with hotel lobbies. CityPulse now looks well beyond hospitality.</p></div>
  <ol class="timeline"><li><b>2022–2023</b><h3>The Trident concept</h3><p>Early planning focused on hotel and motel lobbies: a digital concierge for guests, supported by local business advertising.</p></li>
  <li><b>2025</b><h3>Spotlight Kiosks</h3><p>A new brand, website and host and advertiser offering, built around the same core opportunity.</p></li>
  <li><b>2026</b><h3>CityPulse Kiosks</h3><p>A new name for a national network — and a broader venue vision: hotels, medical offices, car dealerships, restaurants and other places where people spend time.</p></li></ol></div></section>
<section class="section" style="background:#fff;border-top:1px solid var(--line)"><div class="wrap">{head("Simple. Relevant. Thoughtfully managed.")}
  <div class="cards"><div class="card"><h3>Useful comes first.</h3><p>Venue information gives visitors a reason to explore. Local promotions should add to that experience.</p></div>
  <div class="card"><h3>Keep it relevant.</h3><p>Content starts with the place, its visitors and the businesses that can help them take a useful next step.</p></div>
  <div class="card"><h3>Make it manageable.</h3><p>Hardware, setup, content updates and routine support belong in one coordinated host offering.</p></div></div></div></section>
{cta_band("A useful connection starts here.", "Tell us about your venue or the people you want to reach.")}'''
page("about/", "About us", "CityPulse Kiosks connects visitors, venues and local businesses through managed touch-screen kiosks.", about)

# ================================================================ CONTACT
contact = page_hero([("Contact","contact/")], "Let's start a conversation.",
  "Have a venue, campaign or service question? Find the right starting point below.") + f'''
<section class="section"><div class="wrap"><div class="contact-cards">
  <div class="card"><span class="kind">New opportunities</span><h3>Sales & partnerships</h3><p>Host opportunities, advertising placements and market availability.</p><a class="text-link" href="mailto:{EMAIL}">{EMAIL}</a></div>
  <div class="card"><span class="kind">Existing kiosks</span><h3>Service & support</h3><p>Equipment, content changes or an existing campaign.</p><a class="text-link" href="{{R}}support/">Get support</a></div>
  <div class="card"><span class="kind">Call CityPulse</span><h3><a href="tel:{TEL}" style="text-decoration:none">{PHONE}</a></h3><p>Office<br>4750 S 44th Pl, Suite E20<br>Phoenix, AZ 85040</p><p style="margin-top:8px"><a class="text-link" href="https://maps.google.com/?q=4750+S+44th+Pl+Suite+E20+Phoenix+AZ+85040" target="_blank" rel="noopener">Get directions</a></p></div>
</div>
</div></section>
{form_section("message", "Send us a message.", "Questions about advertising, hosting a kiosk or an existing campaign — we'll get back to you within one business day.", ["Tell us what you need", "We reply by email or phone", "We set up the next step"], draft_form("contact-form", EMAIL, "Website message", [("Your message", [field("Your name", "Contact name", required=True), field("Email", "Email", "email", required=True), field("Phone", "Phone", "tel", opt=True), field("Business or venue", "Business", opt=True), field("What's this about?", "Topic", "select", options=["Advertising on a kiosk", "Hosting a kiosk", "Support for an existing kiosk or ad", "Partnerships", "Something else"], full=True), field("Message", "Message", "textarea", full=True, required=True)])], "It's okay for CityPulse to contact me about this message.", "Send message"), dark=True)}
<section class="section"><div class="wrap">
<h2 style="font-size:28px;margin:0 0 16px">Prefer a structured inquiry?</h2>
<div class="cards"><a class="card" href="{{R}}hosts/#inquiry"><h3>Request a kiosk</h3><p>Tell us about your venue.</p></a><a class="card" href="{{R}}advertise/#inquiry"><h3>Plan an advertising campaign</h3><p>Share your market and goal.</p></a><a class="card" href="{{R}}support/#request"><h3>Prepare a support request</h3><p>For existing kiosks and campaigns.</p></a></div>
</div></section>'''
page("contact/", "Contact CityPulse", f"Contact CityPulse Kiosks sales and support. {EMAIL} · {PHONE}.", contact)

# ================================================================ SUPPORT
support = page_hero([("Resources","resources/"),("Help & support","support/")], "Keep the experience working for you.",
  "For existing kiosks, venue information, creative changes and campaign questions, start here.") + f'''
{section(head("What can we help you with?", f'Email <a class="text-link" href="mailto:{SUPPORT}">{SUPPORT}</a> or use the request builder below.') + '''<div class="cards">
  <div class="card"><h3>Kiosk equipment</h3><p>Include the venue, city and what the screen or equipment is doing.</p></div>
  <div class="card"><h3>Venue content</h3><p>Tell us which information needs attention and send the corrected wording.</p></div>
  <div class="card"><h3>Advertising campaigns</h3><p>Include your business or campaign reference and the change or question you have.</p></div></div>''' + f'<p style="margin-top:22px">Exploring a new venue or campaign? <a class="text-link" href="{{R}}contact/">Contact sales</a> &nbsp; <a class="text-link" href="{{R}}faqs/">Browse common questions</a></p>')}
{form_section("request", "Tell us what you need.", "Include your venue or business name and a clear description so your request reaches the right person.", ["Choose the request type", "Add the location and useful details", "Review and send from your email"], support_form(), dark=True)}'''
page("support/", "Help & support", "Support for existing CityPulse kiosks, venue content and advertising campaigns.", support, active="resources")

# ================================================================ WELCOME (after checkout)
welcome = f'''<section class="page-hero"><div class="wrap narrow">
  <h1>You're in. Welcome to CityPulse.</h1>
  <p class="lede" style="margin-top:20px">Thanks for your order. A receipt is on its way to your email.</p>
  <p class="co-order" id="welcome-order" hidden></p>
</div></section>
<section class="section"><div class="wrap narrow">
  <h2 style="font-size:32px;margin-bottom:24px">What happens next</h2>
  <ol class="step-list" style="grid-template-columns:1fr">
    <li><h3>We review your ad</h3><p>Our team checks your logo or artwork. If you asked us to design it, we'll send a proof to approve.</p></li>
    <li><h3>We match your kiosk</h3><p>We confirm a venue in the city you picked and email you the details.</p></li>
    <li><h3>You go live</h3><p>Once you approve, your ad joins the rotation at the bottom of the kiosk screen.</p></li>
    <li><h3>You see the results</h3><p>Your report shows how often your ad was shown, tapped and scanned.</p></li>
  </ol>
  <div class="callout"><b>Need to change something?</b><p>Reply to your receipt or email <a href="mailto:{EMAIL}">{EMAIL}</a>. You can also call <a href="tel:{TEL}">{PHONE}</a>.</p></div>
  {btns(("Back to the home page",""),("Try the kiosk demo","kiosk/#demo","btn-ghost"))}
</div></section>'''
page("welcome/", "Welcome", "Thanks for your CityPulse Kiosks order.", welcome, extra_js=("checkout.js",))

# ================================================================ LEGAL
from legal import TERMS, PRIVACY, EFFECTIVE
def legal_page(path, title, lede, sections):
    toc = "".join(f'<li><a href="#l{i+1}">{h}</a></li>' for i, (h, _) in enumerate(sections))
    body = "".join(f'<h2 id="l{i+1}">{i+1}. {h}</h2>{b}' for i, (h, b) in enumerate(sections))
    return page_hero([(title, path)], title, lede) .replace("</p></div></div>", f'</p><p class="updated">Effective {EFFECTIVE}</p></div></div>', 1) + f'''
<section class="section"><div class="wrap legal"><aside class="toc"><b>Contents</b><ol>{toc}</ol></aside><div class="prose">{body}</div></div></section>'''
page("terms/", "Terms & Conditions", "The terms that apply to your use of the CityPulse Kiosks website and kiosks.", legal_page("terms/", "Terms & Conditions", "The rules for using our website, our kiosks and the tools on this site.", TERMS))
page("privacy/", "Privacy Policy", "How CityPulse Kiosks collects, uses and protects information on its website and kiosks.", legal_page("privacy/", "Privacy Policy", "What information we collect on our website and kiosks, how we use it and the choices you have.", PRIVACY))

# ================================================================ 404
nf = f'''<section class="page-hero"><div class="wrap"><h1>This page took a different turn.</h1><p class="lede" style="margin-top:20px">The page you're looking for isn't here. Try one of these instead.</p>{btns(("Go to the home page",""),("Try the kiosk","kiosk/#demo","btn-ghost"),("Contact CityPulse","contact/","btn-ghost"))}</div></section>'''
page("404/", "Page not found", "Page not found.", nf)
import shutil
src = os.path.join(OUT, "404", "index.html")
with open(src) as f: html404 = f.read()
# 404.html is served from any depth, so use absolute links to the project site
html404 = html404.replace('="../', '="/spotlight-kiosks/')
with open(os.path.join(OUT, "404.html"), "w") as f: f.write(html404)
shutil.rmtree(os.path.join(OUT, "404"))
PAGES.remove("404/")
if __name__ != "__main__": pass

print(f"Built {len(PAGES)} pages")

# Venue data as JSON for the AI concierge relay (cloudflare/concierge-worker.js reads it). Needs Node.
import subprocess as _sp
try:
    _src = os.path.join(OUT, "assets", "lexen-data.js")
    _js = _sp.run(["node", "-e", "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.CP_VENUE))", _src],
                  capture_output=True, text=True, check=True).stdout
    with open(os.path.join(OUT, "assets", "lexen-data.json"), "w") as _f:
        _f.write(_js)
except Exception as _ex:
    print("lexen-data.json not updated:", _ex)
