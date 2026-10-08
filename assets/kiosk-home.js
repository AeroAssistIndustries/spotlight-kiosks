/* CityPulse kiosk home screen: a touch website for the venue.
   Content comes from content/kiosk-site.json in the public GitHub content folder (edit it on GitHub).
   If it cannot be loaded, a built-in sample is shown. Returns to Home after 2 minutes without a touch. */
(function () {
  "use strict";
  const app = document.getElementById("kh-app");
  if (!app) return;
  const SRC = app.dataset.src || "";
  const IDLE = 2 * 60 * 1000;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let data = null, view = { name: "home" }, idleTimer = null;

  const SAMPLE = {
    venue: "Demo Hotel Lobby", welcome: "Welcome. Explore what is nearby.",
    sections: [{ id: "dining", title: "Dining", intro: "Sample content.", cards: [{ title: "Lobby cafe", short: "Open 6:30am to 9pm", detail: "Sample detail." }] }],
    ads: [{ advertiser: "Sample Coffee Co.", headline: "Free pastry with any drink" }]
  };

  function header() {
    return `<header class="kh-top"><div class="kh-brand"><span class="kh-logo">CP</span><div><strong>${esc(data.venue)}</strong><small>CityPulse guide</small></div></div>
      <div class="kh-clock" id="kh-clock"></div></header>`;
  }

  function ticker() {
    const ads = (data.ads || []).map(a => `<span class="kh-ad"><b>${esc(a.advertiser)}</b> ${esc(a.headline)}</span>`).join("");
    return `<div class="kh-ticker" aria-label="Sponsored offers"><div class="kh-track">${ads}${ads}</div></div>`;
  }

  function render() {
    let body = "";
    if (view.name === "home") {
      body = `<section class="kh-hero"><h1>Welcome</h1><p>${esc(data.welcome)}</p></section>
        <nav class="kh-tiles">${data.sections.map(s => `<button class="kh-tile" data-go="${esc(s.id)}"><strong>${esc(s.title)}</strong><span>${esc(s.intro)}</span></button>`).join("")}</nav>`;
    } else {
      const s = data.sections.find(x => x.id === view.name) || data.sections[0];
      body = `<section class="kh-page"><button class="kh-back" data-go="home" type="button">← Home</button>
        <h1>${esc(s.title)}</h1><p class="kh-intro">${esc(s.intro)}</p>
        <div class="kh-cards">${(s.cards || []).map((c, i) => `<button class="kh-card" data-sec="${esc(s.id)}" data-i="${i}" type="button"><strong>${esc(c.title)}</strong><span>${esc(c.short || "Tap to learn more")}</span></button>`).join("")}</div>
        <div class="kh-detail" id="kh-detail" hidden></div></section>`;
    }
    app.innerHTML = `<div class="kh-wrap">${header()}<main class="kh-main">${body}</main>${ticker()}</div>`;
    clock();
  }

  function clock() {
    const el = document.getElementById("kh-clock");
    if (el) el.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function touch() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { view = { name: "home" }; render(); }, IDLE);
  }

  app.addEventListener("click", e => {
    touch();
    const go = e.target.closest("[data-go]");
    if (go) { view = { name: go.dataset.go }; render(); window.scrollTo(0, 0); return; }
    const card = e.target.closest(".kh-card");
    if (card) {
      const s = data.sections.find(x => x.id === card.dataset.sec);
      const c = (s && s.cards[+card.dataset.i]) || {};
      const d = document.getElementById("kh-detail");
      d.hidden = false;
      d.innerHTML = `<h2>${esc(c.title)}</h2><p>${esc(c.detail || "")}</p><button class="kh-close" type="button">Close</button>`;
      d.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (e.target.closest(".kh-close")) { const d = document.getElementById("kh-detail"); if (d) d.hidden = true; }
  });
  document.addEventListener("pointerdown", touch);
  setInterval(clock, 15000);

  function start(json) {
    data = json && Array.isArray(json.sections) ? json : SAMPLE;
    render(); touch();
  }
  if (SRC) fetch(SRC, { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(start).catch(() => start(SAMPLE));
  else start(SAMPLE);
})();
