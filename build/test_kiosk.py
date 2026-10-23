# "Test the kiosk" — live demo of the real kiosk software + every size we install, drawn to scale.
from lib import *

TK_KIOSK_REMOTE = "https://kiosk.citypulsekiosks.com/kiosk-app/?demo=1"

def tk_page():
    tries = [
        ("Ask the concierge", "Tap the gold tile and ask “What time is check-out?” or “Where can I get coffee?”"),
        ("Plan an evening", "Tap “Dinner & a show” and get a whole plan in one tap."),
        ("Explore the neighborhood", "Open the map and see what’s a short walk away."),
        ("Find the ad space", "The card along the bottom is where local businesses appear — on every screen."),
    ]
    tries_html = "".join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in tries)
    return f'''
<section class="tk-hero" aria-labelledby="tk-title"><div class="wrap tk-hero-grid">
  <div class="tk-copy">
    {crumbs([("The kiosk", "kiosk/"), ("Test the kiosk", "test-the-kiosk/")])}
    <p class="eyebrow">Live demo</p>
    <h1 id="tk-title">Test the kiosk.</h1>
    <p class="lede">This is the real CityPulse software — the same screen guests use in the lobby at Hotel Lexen. Tap it, ask it a question, wander around. The ads are placeholders, so nothing you tap goes anywhere.</p>
    <ol class="tk-try">{tries_html}</ol>
    <div class="tk-controls" role="group" aria-label="Demo controls">
      <label class="tk-switch"><input type="checkbox" id="tk-adspace"><i aria-hidden="true"></i>Show the ad space</label>
      <div class="tk-finish" role="radiogroup" aria-label="Kiosk finish">
        <button type="button" role="radio" aria-checked="true" data-finish="black"><i style="--sw:#1c1e20"></i>Matte black</button>
        <button type="button" role="radio" aria-checked="false" data-finish="silver"><i style="--sw:linear-gradient(135deg,#f1f2f3,#b5b8bc)"></i>Brushed silver</button>
      </div>
    </div>
    <div class="btn-row"><a class="btn" id="tk-full" href="{{R}}kiosk-app/?demo=1" target="_blank" rel="noopener">Open full screen</a><button class="btn btn-ghost tk-ghost" type="button" id="tk-restart">Restart demo</button></div>
  </div>
  <div class="tk-stage">
    <div class="tk-device" id="tk-device" data-finish="black">
      <div class="tk-head"><div class="tk-screen" id="tk-screen" data-local="{{R}}kiosk-app/?demo=1" data-remote="{TK_KIOSK_REMOTE}">
        <img class="tk-poster" src="{{R}}assets/kiosk-screen.jpg" alt="" width="720" height="1280">
        <button class="tk-start" type="button" id="tk-start"><span>Tap to start</span><small>Loads the live kiosk</small></button>
        <div class="tk-admark" aria-hidden="true"><span>Your ad here · on every screen</span></div>
      </div></div>
      <div class="tk-neck"></div><div class="tk-foot"></div>
    </div>
    <p class="tk-hint">Real touch screen: 1080 × 1920, portrait.</p>
  </div>
</div></section>

<section class="section tk-sizes" id="sizes" aria-labelledby="tk-sizes-title"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Every size</p><h2 id="tk-sizes-title">One screen. Five sizes.</h2><p>Pick a size to see it to scale next to a 5′9″ person — on a counter, on the wall or standing on its own. The software and the ad space stay the same at every size.</p></div>
  <div class="tk-bar">
    <div class="tk-sizepick" role="radiogroup" aria-label="Kiosk size" id="tk-sizepick"></div>
    <div class="tk-scene" role="radiogroup" aria-label="Room">
      <button type="button" role="radio" aria-checked="true" data-scene="hotel">Hotel lobby</button>
      <button type="button" role="radio" aria-checked="false" data-scene="medical">Medical office</button>
      <button type="button" role="radio" aria-checked="false" data-scene="auto">Dealership</button>
    </div>
  </div>
  <div class="tk-room" id="tk-room" data-scene="hotel">
    <div class="tk-ruler" aria-hidden="true"></div>
    <div class="tk-lineup" id="tk-lineup" aria-hidden="true"></div>
    <div class="tk-floor" aria-hidden="true"></div>
  </div>
  <div class="tk-spec" id="tk-spec" aria-live="polite"></div>
  <p class="fine tk-note">Sizes shown are representative configurations, drawn to scale. The exact model, dimensions and mounting are confirmed for each venue during review.</p>
</div></section>

{cta_band("Like what you tapped?", "Put your business in the ad space, or put a kiosk in your lobby.")}'''
