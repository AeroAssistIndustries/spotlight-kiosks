/* CityPulse concierge kiosk (live venue screen).
   Content comes from window.CP_VENUE (for example assets/lexen-data.js).
   Works offline once loaded. Nothing personal is collected. Tap counts stay on this device for staff. */
(function () {
  "use strict";
  const V = window.CP_VENUE;
  const root = document.getElementById("cpk");
  if (!V || !root) return;

  const BASE = root.dataset.root || "../";
  const A = BASE + "assets/";
  const GUIDE = new URL(BASE + "concierge/?v=" + encodeURIComponent(V.id), location.href).href;
  const PRICING = new URL(BASE + "pricing/", location.href).href;
  /* Live AI concierge relay (cloudflare/concierge-worker.js). Empty: built-in answers only. */
  const AI = ((V.ai && V.ai.endpoint) || "").replace(/\/$/, "");
  const IDLE_MS = 60000, AD_MS = 8000;
  const TZ = V.tz || "America/Los_Angeles"; /* the venue's local time, whatever the kiosk's own clock is set to */
  const hourNow = () => +new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(new Date());
  const dayKey = d => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d || new Date());

  /* ---------- icons ---------- */
  const P = {
    fork: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11"/>',
    bell: '<path d="M4 18h16M6 18a6 6 0 0 1 12 0M12 8V6M10 6h4"/><path d="M3 21h18"/>',
    coffee: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3c-.5 1 .5 2 0 3M12 3c-.5 1 .5 2 0 3"/>',
    spark: '<path d="M12 3c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7z"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    car: '<path d="M4 16v-4l2-5h12l2 5v4H4z"/><circle cx="8" cy="16.5" r="1.8"/><circle cx="16" cy="16.5" r="1.8"/><path d="M4 12h16"/>',
    home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 9.5h8M8 12.5h5"/>',
    access: '<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8l7 1.5L19 8M12 9.5V14l-3 6M12 14l3 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2-6 3 3v3M9 11l2-3 3 1 2 3M12 8l-1 4 3 3"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    text: '<path d="M3 19l5-13 5 13M4.8 14.5h6.4M15 19l3-8 3 8M15.9 16.6h4.2"/>',
    contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/>',
    speak: '<path d="M3 10v4h3l7 4V6L6 10H3zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>',
    down: '<path d="M12 4v15M6 13l6 6 6-6"/>',
    mega: '<path d="M3 10v4h3l7 4V6L6 10H3zM16 9a4 4 0 0 1 0 6"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18z"/>',
    partly: '<circle cx="8" cy="8" r="3"/><path d="M8 2.5v1M2.5 8h1M4.1 4.1l.7.7M12 4.1l-.7.7"/><path d="M9 19h8.5a3.5 3.5 0 0 0 .3-7 4.8 4.8 0 0 0-9.2 1.2A2.9 2.9 0 0 0 9 19z"/>',
    rain: '<path d="M7 15h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 6.5 4.25 4.25 0 0 0 7 15z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>',
    storm: '<path d="M7 15h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 6.5 4.25 4.25 0 0 0 7 15z"/><path d="M12.5 15l-2 3.5h3l-2 3.5"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'
  };
  const svg = (k, cls) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ""}>${P[k] || ""}</svg>`;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------- distance and links ---------- */
  function miles(ll) {
    if (!ll || !V.ll) return null;
    const R = 3958.8, r = d => d * Math.PI / 180;
    const dLat = r(ll[0] - V.ll[0]), dLng = r(ll[1] - V.ll[1]);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(V.ll[0])) * Math.cos(r(ll[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function howFar(it) {
    const m = miles(it.ll);
    if (m == null) return null;
    if (m <= 1.2) return { walk: true, label: `${Math.max(1, Math.round(m * 24))} min walk`, short: `${m < 0.1 ? "0.1" : m.toFixed(1)} mi` };
    return { walk: false, label: `${m < 10 ? m.toFixed(1) : Math.round(m)} mi`, short: "Drive or Metro" };
  }
  function mapsUrl(it) {
    const f = howFar(it);
    /* No origin: the phone starts from where the guest is standing (the hotel). Keeps the QR code simple to scan. */
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(it.n + " " + it.addr.replace(/, CA \d{5}$/, ", CA")) +
      (f && f.walk ? "&travelmode=walking" : "");
  }
  const guideUrl = id => GUIDE + (id ? "#" + encodeURIComponent(id) : "");

  /* Real QR code (qrcode-generator, MIT). */
  function qr(text, label) {
    if (typeof qrcode !== "function") return "";
    const q = qrcode(0, "M"); q.addData(text); q.make();
    const N = q.getModuleCount(); let r = "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (q.isDark(y, x)) r += `M${x} ${y}h1v1h-1z`;
    return `<svg viewBox="-2 -2 ${N + 4} ${N + 4}" role="img" aria-label="${esc(label || "QR code")}" data-qr="${esc(text)}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${N + 4}" height="${N + 4}" fill="#fff"/><path fill="#0F1C2B" d="${r}"/></svg>`;
  }

  /* ---------- tap counts (this device only, for staff) ---------- */
  const SKEY = "cpk-stats";
  function bump(group, key) {
    try {
      const day = dayKey();
      const all = JSON.parse(localStorage.getItem(SKEY) || "{}");
      const d = all[day] || (all[day] = {});
      const g = d[group] || (d[group] = {});
      g[key] = (g[key] || 0) + 1;
      const days = Object.keys(all).sort(); while (days.length > 60) delete all[days.shift()];
      localStorage.setItem(SKEY, JSON.stringify(all));
    } catch (e) { /* storage blocked: skip */ }
  }

  /* ---------- state ---------- */
  const S = { mode: "attract", stack: [], panel: false, large: false, contrast: false, still: false, reach: false, ad: 0, idle: null, chat: [], busy: false };

  /* ---------- frame ---------- */
  root.innerHTML = `
    <div class="cpk-bg" aria-hidden="true">${V.photos.map((p, i) => `<span style="background-image:url('${A + p}');animation-delay:${i * 9}s"></span>`).join("")}</div>
    <div class="cpk-shade" aria-hidden="true"></div>
    <header class="cpk-top">
      <div class="cpk-top-l" id="cpk-top-l"></div>
      <img class="cpk-logo" src="${A + V.logo}" alt="${esc(V.name)}">
      <div class="cpk-meta"><span class="cpk-wx" id="cpk-wx" hidden></span><span class="cpk-clock" id="cpk-clock"></span></div>
    </header>
    <main class="cpk-view" id="cpk-view" tabindex="-1"></main>
    <section class="cpk-ads" id="cpk-ads" aria-roledescription="carousel" aria-label="Featured"></section>
    <nav class="cpk-dock" id="cpk-dock" aria-label="Kiosk navigation"></nav>
    <div class="cpk-sheet" id="cpk-sheet" hidden></div>
    <div class="cpk-warn" id="cpk-warn" hidden role="alertdialog" aria-modal="true" aria-labelledby="cpk-warn-t" aria-describedby="cpk-warn-d">
      <div class="cpk-warn-box"><span class="cpk-warn-ring"><b id="cpk-cd">12</b></span>
        <h2 id="cpk-warn-t">Are you still there?</h2>
        <p id="cpk-warn-d">This screen will go back to the welcome screen for the next guest.</p>
        <div class="cpk-warn-acts"><button class="cpk-btn-gold" data-act="stay">I'm still here</button><button class="cpk-btn-ghost" data-act="endnow">Start over</button></div>
      </div></div>`;
  const topL = root.querySelector("#cpk-top-l"), warnBox = root.querySelector("#cpk-warn");
  const view = root.querySelector("#cpk-view"), dock = root.querySelector("#cpk-dock"), ads = root.querySelector("#cpk-ads"), sheet = root.querySelector("#cpk-sheet");

  /* ---------- clock and weather ---------- */
  function tick() {
    const d = new Date();
    root.querySelector("#cpk-clock").innerHTML = `<b>${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ })}</b><small>${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TZ })}</small>`;
  }
  tick(); setInterval(tick, 15000);
  /* Weather: US National Weather Service (free, public, no key). Now in the top bar, 7 days on the home screen.
     The last forecast is kept on the kiosk, so it still shows if the internet drops. */
  function wxIcon(t, night) {
    t = (t || "").toLowerCase();
    if (/thunder|storm/.test(t)) return "storm";
    if (/rain|shower|drizzle/.test(t)) return "rain";
    if (/fog|haze|smoke|dust/.test(t)) return "fog";
    if (/wind|breez/.test(t)) return "wind";
    if (/partly|mostly sunny|mostly clear|few clouds/.test(t)) return night ? "moon" : "partly";
    if (/cloud|overcast/.test(t)) return "cloud";
    return night ? "moon" : "sun";
  }
  const WKEY = "cpk-wx2";
  S.wx = null;
  try { S.wx = JSON.parse(localStorage.getItem(WKEY) || "null"); } catch (e) { /* ignore */ }
  function showNow() {
    const box = root.querySelector("#cpk-wx"), w = S.wx && S.wx.now;
    if (!w) return;
    box.hidden = false;
    box.innerHTML = `${svg(wxIcon(w.s, !w.day))}<b>${esc(w.t)}°</b><small>${esc(w.s)}</small>`;
  }
  function weekHTML() {
    const days = S.wx && S.wx.days;
    if (!days || !days.length) return "";
    return `<section class="cpk-week" aria-label="7-day forecast for North Hollywood">${days.slice(0, 7).map((d, i) => `
      <div class="cpk-day${i === 0 ? " today" : ""}"><b>${esc(i === 0 ? "Today" : d.d)}</b>${svg(wxIcon(d.s, false))}
        <span class="cpk-hi">${d.hi != null ? esc(d.hi) + "°" : "–"}</span><span class="cpk-lo">${d.lo != null ? esc(d.lo) + "°" : ""}</span>
        <small>${esc(d.s)}</small></div>`).join("")}</section>`;
  }
  function weather() {
    showNow();
    if (S.wx && Date.now() - S.wx.at < 30 * 60000) return;
    fetch(`https://api.weather.gov/points/${V.ll[0].toFixed(4)},${V.ll[1].toFixed(4)}`)
      .then(r => r.json())
      .then(p => Promise.all([fetch(p.properties.forecastHourly).then(r => r.json()), fetch(p.properties.forecast).then(r => r.json())]))
      .then(([h, f]) => {
        const p0 = h.properties.periods[0];
        const short = t => t.split(" then ")[0].replace(/^Slight Chance /, "Chance ").slice(0, 20);
        const byDay = {};
        f.properties.periods.forEach(p => {
          const k = dayKey(new Date(p.startTime));
          const d = byDay[k] || (byDay[k] = { k, d: new Date(p.startTime).toLocaleDateString("en-US", { weekday: "short", timeZone: TZ }), hi: null, lo: null, s: "" });
          if (p.isDaytime) { d.hi = p.temperature; d.s = short(p.shortForecast); }
          else { d.lo = p.temperature; if (!d.s) d.s = short(p.shortForecast); }
        });
        const today = dayKey();
        const days = Object.values(byDay).filter(d => d.k >= today).sort((a, b) => a.k < b.k ? -1 : 1).slice(0, 7);
        S.wx = { at: Date.now(), now: { t: p0.temperature, s: short(p0.shortForecast), day: p0.isDaytime }, days };
        try { localStorage.setItem(WKEY, JSON.stringify(S.wx)); } catch (e) { /* ignore */ }
        showNow();
        const wk = root.querySelector("#cpk-weekslot"); if (wk) wk.innerHTML = weekHTML();
      }).catch(() => {});
  }
  weather(); setInterval(weather, 30 * 60000);

  /* ---------- ads ----------
     Featured local businesses rotate on their own for equal exposure. Nothing here can be tapped:
     each ad shows the business name, logo, website and a QR code that opens the site on the guest's phone. */
  const SPONS = (V.sponsors || []).filter(x => x && x.name);
  const SLIDES = SPONS.length ? SPONS : [{ name: "Your business here", kind: "Advertise on this screen", tagline: "Reach every guest at " + V.name + ". From $399 a year.", website: "citypulsekiosks.com", url: PRICING, house: true }];
  const initials = n => n.replace(/^The /, "").split(/[\s.&]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  function adHTML(sp, i) {
    const it = sp.item && V.items[sp.item], f = it ? howFar(it) : null;
    return `<div class="cpk-ad" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${SLIDES.length}: ${esc(sp.name)}">
      <div class="cpk-ad-logo${sp.logo ? " img" : ""}">${sp.logo ? `<img src="${A + esc(sp.logo)}" alt="">` : `<span>${esc(initials(sp.name))}</span>`}</div>
      <div class="cpk-ad-body">
        <span class="cpk-ad-tag">${sp.house ? "Advertise here" : "Featured nearby"}</span>
        <span class="cpk-ad-t">${esc(sp.name)}</span>
        <span class="cpk-ad-s">${esc(sp.kind)}${f ? " · " + esc(f.label) : ""}</span>
        ${sp.tagline ? `<span class="cpk-ad-x">${esc(sp.tagline)}</span>` : ""}
        <span class="cpk-ad-web">${esc(sp.website)}</span>
      </div>
      <div class="cpk-ad-qr">${qr(sp.url, "QR code: open " + sp.name + " on your phone")}<small>Scan to visit</small></div>
    </div>`;
  }
  ads.setAttribute("aria-label", "Featured nearby businesses");
  ads.innerHTML = `<div class="cpk-ad-track" id="cpk-ad-track" aria-live="off">${SLIDES.map(adHTML).join("")}</div>
    <div class="cpk-ad-dots" aria-hidden="true">${SLIDES.map(() => "<i></i>").join("")}</div>
    <div class="cpk-ad-bar" aria-hidden="true"><i id="cpk-ad-bar"></i></div>`;
  function showAd(i) {
    S.ad = (i + SLIDES.length) % SLIDES.length;
    root.querySelector("#cpk-ad-track").style.transform = `translateX(-${S.ad * 100}%)`;
    ads.querySelectorAll(".cpk-ad").forEach((el, j) => el.setAttribute("aria-hidden", String(j !== S.ad)));
    ads.querySelectorAll(".cpk-ad-dots i").forEach((d, j) => d.classList.toggle("on", j === S.ad));
    const bar = root.querySelector("#cpk-ad-bar");
    if (bar) { bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; void bar.offsetWidth; bar.style.transition = `transform ${AD_MS}ms linear`; bar.style.transform = S.still ? "scaleX(0)" : "scaleX(1)"; }
    bump("adShown", SLIDES[S.ad].name);
  }
  showAd(0);
  /* Rotates on its own, including on the welcome screen. "Stop moving images" in Accessibility pauses it (required for moving content). */
  setInterval(() => { if (!S.still && !document.hidden && SLIDES.length > 1) showAd(S.ad + 1); }, AD_MS);

  /* ---------- views ---------- */
  const greet = () => { const h = hourNow(); return h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
  const item = id => V.items[id];
  const ICON = {};
  Object.values(V.categories).forEach(c => c.items.forEach(i => { if (!ICON[i]) ICON[i] = c.icon; }));
  const iconOf = id => ICON[id] || "pin";

  function vAttract() {
    return `<button class="cpk-attract" data-act="start">
      <span class="cpk-a-kicker">Welcome to</span>
      <span class="cpk-a-name">${esc(V.name)}</span>
      <span class="cpk-a-sub">Your guide to the hotel and North Hollywood</span>
      <span class="cpk-a-touch"><span class="cpk-ring"></span>Touch anywhere to begin</span></button>`;
  }
  function tileHTML(t) {
    return `<button class="cpk-tile${t.photo ? " photo" : ""}" data-act="cat" data-id="${t.id}"${t.photo ? ` style="--img:url('${A + t.photo}')"` : ""}>
      <span class="cpk-tile-ico">${svg(t.icon)}</span>
      <span class="cpk-tile-txt"><b>${esc(t.label)}</b><small>${esc(t.sub)}</small></span>
      <span class="cpk-tile-go">${svg("chev")}</span></button>`;
  }
  function vHome() {
    return `<section class="cpk-home">
      <h1 class="cpk-h1">${greet()}.</h1>
      <p class="cpk-lede">How can we help you today?</p>
      <button class="cpk-askbar" data-act="ask">${svg("search")}<span>Ask the concierge</span><em>Wi-Fi, check-out, food, Universal…</em></button>
      <div id="cpk-weekslot">${weekHTML()}</div>
      <div class="cpk-tiles">${V.tiles.map(tileHTML).join("")}</div>
      <button class="cpk-take" data-act="take">
        <span class="cpk-take-qr">${qr(GUIDE, "QR code: open this guide on your phone")}</span>
        <span class="cpk-take-txt"><b>Take this guide with you</b><small>Scan with your phone camera. Directions, places and hotel info, with nothing to install.</small></span>
      </button></section>`;
  }
  function rowHTML(id) {
    const it = item(id), f = howFar(it);
    return `<button class="cpk-row" data-act="item" data-id="${id}">
      <span class="cpk-row-ico">${svg(it.hotel ? "bell" : iconOf(id))}</span>
      <span class="cpk-row-txt"><b>${esc(it.n)}</b><small>${esc(it.k)}${it.price ? " · " + esc(it.price) : ""}</small></span>
      ${f ? `<span class="cpk-chip">${svg(f.walk ? "walk" : "pin")}${esc(f.label)}</span>` : it.hotel ? `<span class="cpk-chip gold">At the hotel</span>` : ""}
      <span class="cpk-row-go">${svg("chev")}</span></button>`;
  }
  function vCat(id) {
    const c = V.categories[id];
    return `<section class="cpk-cat">
      <div class="cpk-cat-head"><span class="cpk-cat-ico">${svg(c.icon)}</span><div><h1 class="cpk-h2">${esc(c.label)}</h1><p class="cpk-intro">${esc(c.intro)}</p></div></div>
      <div class="cpk-list">${c.items.map(rowHTML).join("")}</div></section>`;
  }
  function vItem(id) {
    const it = item(id), f = howFar(it);
    const link = it.ll ? mapsUrl(it) : guideUrl(id);
    const facts = [];
    if (f) facts.push(f.walk ? ["Walking time", f.label.replace(" walk", "")] : ["Distance", f.label], f.walk ? ["Distance", f.short] : ["Getting there", f.short]);
    (it.f || []).forEach(x => facts.push(x));
    return `<section class="cpk-item">
      <p class="cpk-kicker">${esc(it.hotel ? "At the hotel" : it.k)}</p>
      <h1 class="cpk-h2">${esc(it.n)}</h1>
      ${it.addr ? `<p class="cpk-addr">${svg("pin")}${esc(it.addr)}</p>` : ""}
      <p class="cpk-desc">${esc(it.d)}</p>
      ${facts.length ? `<div class="cpk-facts">${facts.slice(0, 4).map(([a, b]) => `<div><small>${esc(a)}</small><b>${esc(b)}</b></div>`).join("")}</div>` : ""}
      ${it.o ? `<div class="cpk-offer">${svg("star")}<div><b>Kiosk offer</b><span>${esc(it.o)}</span></div></div>` : ""}
      <div class="cpk-qrcard">
        <div class="cpk-qr">${qr(link, it.ll ? "QR code: directions on your phone" : "QR code: open on your phone")}</div>
        <div><b>${it.ll ? "Directions on your phone" : "Save this on your phone"}</b>
          <small>${it.ll ? "Point your phone camera at the code. Google Maps opens with the route, today's hours and phone number." : "Point your phone camera at the code to keep this information with you."}</small></div>
      </div></section>`;
  }
  /* Built-in concierge: matches a question to the closest answer. */
  function answer(qs) {
    const t = " " + qs.toLowerCase().replace(/[^a-z0-9\-\s]/g, " ").replace(/\s+/g, " ") + " ";
    let best = null, score = 0;
    V.faq.forEach(f => {
      let s = 0;
      f.keys.forEach(k => { if (t.includes(" " + k + " ") || (k.length > 4 && t.includes(k))) s += k.length > 5 ? 3 : 2; });
      if (s > score) { score = s; best = f; }
    });
    return best;
  }
  /* Ask the concierge: a conversation. Live AI answers stream in when the relay is set up and reachable;
     otherwise (or if it fails) the built-in answers reply instantly. */
  const visible = raw => raw.replace(/\[\[[^\]]*\]\]/g, "").replace(/\[\[?[^\]]*$/, "").replace(/\s+$/, "");
  function bubbleHTML(m, i) {
    if (m.role === "user") return `<div class="cpk-msg me"><p>${esc(m.text)}</p></div>`;
    const ids = (m.ids || []).filter(id => V.items[id]);
    return `<div class="cpk-msg ai${m.pending ? " typing" : ""}" id="cpk-msg-${i}"${m.pending ? ' aria-busy="true"' : ""}>
      <span class="cpk-msg-who">${svg("chat")}Concierge${m.quick ? " · quick answer" : ""}</span>
      <p class="cpk-msg-t">${m.text ? esc(m.text) + (m.pending ? '<span class="cpk-caret"></span>' : "") : '<span class="cpk-dots" aria-label="Thinking"><i></i><i></i><i></i></span>'}</p>
      ${ids.length && !m.pending ? `<div class="cpk-list compact">${ids.map(rowHTML).join("")}</div>` : ""}</div>`;
  }
  function vAsk() {
    const chat = S.chat;
    const chips = V.faq.slice(0, 12).map((f, i) => `<button class="cpk-q" data-act="q" data-i="${i}">${esc(f.q)}</button>`).join("");
    return `<section class="cpk-ask">
      <h1 class="cpk-h2">Ask the concierge</h1>
      <p class="cpk-ask-sub">${AI ? `<span class="cpk-live"><i></i>Live</span>Ask anything about the hotel or North Hollywood, in any language.` : "Answers about the hotel and North Hollywood."}</p>
      ${chat.length ? `<div class="cpk-chat" id="cpk-chat">${chat.map(bubbleHTML).join("")}</div>` : ""}
      <form class="cpk-askform" data-form="ask" autocomplete="off">
        ${svg("search")}<input id="cpk-q" type="text" enterkeyhint="send" placeholder="${chat.length ? "Ask a follow-up question" : "Type a question"}" aria-label="Your question" maxlength="300" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        <button type="submit" class="cpk-askgo">Ask</button>
      </form>
      ${chat.length ? `<button class="cpk-newchat" data-act="newchat">${svg("x")}<span>Start a new question</span></button>`
        : `<p class="cpk-kicker">Popular questions</p><div class="cpk-qs">${chips}</div>`}
      ${AI ? `<p class="cpk-ai-note">Answers come from an AI assistant and can be wrong. The front desk is open 24 hours at ${esc(V.phone)}.</p>` : ""}</section>`;
  }
  function onAskView() { const t = S.stack[S.stack.length - 1]; return S.mode === "session" && t && t.v === "ask"; }
  function chatEnd() { if (onAskView()) { const c = root.querySelector("#cpk-chat"); if (c) view.scrollTop = c.offsetTop + c.offsetHeight - view.clientHeight * 0.55; } }
  function updateMsg(m) {
    if (!onAskView()) return;
    const i = S.chat.indexOf(m), el = root.querySelector("#cpk-msg-" + i);
    if (!el) return;
    el.outerHTML = bubbleHTML(m, i).replace('class="cpk-msg ai', 'class="cpk-msg still ai'); /* no fade on each new word */
    if (!m.pending) { const nc = root.querySelector(".cpk-newchat"); if (!nc) render(); }
    chatEnd(); scrollHint();
  }
  function quick(m, q) {
    const f = answer(q);
    m.text = f ? f.a : `I don't have an answer for that yet. The front desk is open 24 hours and happy to help, or call ${V.phone}.`;
    m.ids = f ? f.items.slice(0, 3) : ["lx-desk"];
    m.quick = !!AI; m.pending = false; S.busy = false;
    bump("questions", f ? f.q : "No answer: " + q.slice(0, 60));
    updateMsg(m);
  }
  async function live(m, q) {
    const ctl = new AbortController();
    let got = false, raw = "";
    const wait = setTimeout(() => { if (!got) ctl.abort(); }, 10000);
    const hist = S.chat.filter(x => x !== m && x.text).slice(-8).map(x => ({ role: x.role, content: x.text }));
    const res = await fetch(AI + "/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venue: V.id, messages: hist }), signal: ctl.signal });
    if (!res.ok || !res.body) throw new Error("status " + res.status);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = "", done = false;
    while (!done) {
      const r = await reader.read();
      if (r.done) break;
      buf += dec.decode(r.value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const ev = buf.slice(0, i).trim(); buf = buf.slice(i + 2);
        if (!ev.startsWith("data:")) continue;
        const d = ev.slice(5).trim();
        if (d === "[DONE]") { done = true; break; }
        let o; try { o = JSON.parse(d); } catch (e) { continue; }
        if (o.e) throw new Error(o.e);
        if (o.t) { got = true; raw += o.t; m.text = visible(raw); updateMsg(m); armIdle(); }
      }
    }
    clearTimeout(wait);
    if (!visible(raw).trim()) throw new Error("empty");
    m.ids = [...new Set([...raw.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map(x => x[1]).filter(id => V.items[id]))].slice(0, 3);
    m.text = visible(raw).trim(); m.pending = false; S.busy = false;
    bump("questions", "AI: " + q.slice(0, 60));
    updateMsg(m);
  }
  function ask(q) {
    q = String(q || "").replace(/\s+/g, " ").trim().slice(0, 300);
    if (!q || S.busy) return;
    S.busy = true;
    S.chat.push({ role: "user", text: q });
    const m = { role: "assistant", text: "", ids: [], pending: true };
    S.chat.push(m);
    if (S.chat.length > 16) S.chat.splice(0, S.chat.length - 16);
    render(); chatEnd();
    if (AI && navigator.onLine !== false) live(m, q).catch(() => quick(m, q));
    else setTimeout(() => quick(m, q), 350);
  }
  function vTake() {
    return `<section class="cpk-takeview">
      <h1 class="cpk-h2">Take this guide with you</h1>
      <p class="cpk-desc">Point your phone camera at the code and tap the link. The guide opens in your browser with every place, directions and hotel information. Nothing to download, and no sign-up.</p>
      <div class="cpk-qrbig">${qr(GUIDE, "QR code: open this guide on your phone")}</div>
      <ol class="cpk-steps"><li><b>1</b>Open your camera</li><li><b>2</b>Point it at the code</li><li><b>3</b>Tap the link</li></ol></section>`;
  }
  function dockHTML() {
    if (S.mode === "attract") return "";
    return `<button data-act="home">${svg("home")}<span>Home</span></button>
      <button data-act="back">${svg("back")}<span>Back</span></button>
      <button data-act="ask" class="cpk-dock-ask">${svg("chat")}<span>Ask</span></button>
      <button data-act="panel" aria-expanded="${S.panel}" aria-controls="cpk-sheet">${svg("access")}<span>Accessibility</span></button>`;
  }
  function sheetHTML() {
    const t = (act, ico, lbl, on) => `<button data-act="${act}" aria-pressed="${!!on}">${svg(ico)}<span>${lbl}</span><i>${on ? "On" : "Off"}</i></button>`;
    return `<div class="cpk-sheet-in" role="group" aria-label="Accessibility options">
      <div class="cpk-sheet-head"><b>Accessibility</b><button data-act="panel" aria-label="Close">${svg("x")}</button></div>
      ${t("large", "text", "Larger text", S.large)}${t("contrast", "contrast", "High contrast", S.contrast)}
      ${t("reach", "down", "Lower the screen", S.reach)}${t("still", "pause", "Stop moving images", S.still)}
      <button data-act="speak">${svg("speak")}<span>Read this screen aloud</span><i>Play</i></button></div>`;
  }

  function render(dir) {
    root.classList.toggle("is-attract", S.mode === "attract");
    root.classList.toggle("is-large", S.large);
    root.classList.toggle("is-contrast", S.contrast);
    root.classList.toggle("is-reach", S.reach);
    root.classList.toggle("is-still", S.still);
    let html = "";
    if (S.mode === "attract") html = vAttract();
    else {
      const top = S.stack[S.stack.length - 1];
      if (top.v === "home") html = vHome();
      else if (top.v === "cat") html = vCat(top.id);
      else if (top.v === "item") html = vItem(top.id);
      else if (top.v === "ask") html = vAsk();
      else if (top.v === "take") html = vTake();
    }
    view.innerHTML = html;
    view.className = "cpk-view" + (dir ? " in-" + dir : "");
    const cur = S.stack[S.stack.length - 1];
    view.scrollTop = dir === "back" && cur && cur.sc ? cur.sc : 0;
    topL.innerHTML = topLeftHTML();
    scrollHint();
    dock.innerHTML = dockHTML();
    sheet.hidden = !S.panel || S.mode === "attract";
    sheet.innerHTML = sheet.hidden ? "" : sheetHTML();
    if (S.mode !== "attract") armIdle();
  }

  /* ---------- navigation ---------- */
  function go(entry) { const cur = S.stack[S.stack.length - 1]; if (cur) cur.sc = view.scrollTop; S.stack.push(entry); render("fwd"); }
  /* Where Back goes, shown in the top-left Back button. */
  function labelOf(e) {
    if (!e) return "";
    if (e.v === "home") return "Home";
    if (e.v === "cat") return V.categories[e.id].label;
    if (e.v === "item") return V.items[e.id].n;
    if (e.v === "ask") return "Ask the concierge";
    if (e.v === "take") return "Take this guide";
    return "Featured";
  }
  function topLeftHTML() {
    if (S.mode === "attract" || S.stack.length < 2) return "";
    return `<button class="cpk-topback" data-act="back" aria-label="Back to ${esc(labelOf(S.stack[S.stack.length - 2]))}">${svg("back")}<span><b>Back</b><small>${esc(labelOf(S.stack[S.stack.length - 2]))}</small></span></button>`;
  }
  /* Soft fade at the bottom when there is more to scroll. */
  function scrollHint() { const more = view.scrollHeight - view.clientHeight - view.scrollTop > 16; view.classList.toggle("has-more", more); }
  view.addEventListener("scroll", scrollHint, { passive: true });
  function start() { S.mode = "session"; S.stack = [{ v: "home" }]; bump("sessions", "count"); render("fwd"); }
  function reset() {
    clearTimeout(S.idle); hideWarn();
    S.mode = "attract"; S.stack = []; S.panel = false; S.chat = []; S.busy = false;
    S.large = S.contrast = S.reach = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    render();
  }
  /* Idle: warn 12 seconds before going back to the welcome screen. Longer when accessibility options are on. */
  const WARN_S = 12;
  const idleMs = () => (S.large || S.contrast || S.reach) ? IDLE_MS * 2 : IDLE_MS;
  function hideWarn() { clearInterval(S.cd); if (!warnBox.hidden) warnBox.hidden = true; }
  function armIdle() { clearTimeout(S.idle); hideWarn(); S.idle = setTimeout(warn, idleMs() - WARN_S * 1000); }
  function warn() {
    if (S.mode === "attract") return;
    let n = WARN_S; const cd = root.querySelector("#cpk-cd");
    cd.textContent = n; warnBox.hidden = false;
    const stay = warnBox.querySelector("[data-act=stay]"); if (stay) stay.focus({ preventScroll: true });
    S.cd = setInterval(() => { n--; cd.textContent = n; if (n <= 0) { hideWarn(); reset(); } }, 1000);
  }
  function speak() {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(view.innerText.replace(/\s+/g, " ").trim().slice(0, 1500));
    u.lang = "en-US"; u.rate = 0.95; speechSynthesis.speak(u);
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (S.mode === "attract") {
      start();
      return;
    }
    armIdle();
    switch (act) {
      case "home": S.stack = [{ v: "home" }]; S.panel = false; render("back"); break;
      case "back": if (S.stack.length > 1) S.stack.pop(); render("back"); break;
      case "cat": bump("categories", b.dataset.id); go({ v: "cat", id: b.dataset.id }); break;
      case "item": bump("places", b.dataset.id); go({ v: "item", id: b.dataset.id }); break;
      case "ask": if (!onAskView()) go({ v: "ask" }); setTimeout(() => { const i = root.querySelector("#cpk-q"); if (i) i.focus({ preventScroll: true }); }, 50); break;
      case "q": ask(V.faq[+b.dataset.i].q); break;
      case "newchat": if (!S.busy) { S.chat = []; render(); } break;
      case "take": bump("takeHome", "open"); go({ v: "take" }); break;
      case "panel": S.panel = !S.panel; render(); break;
      case "large": S.large = !S.large; render(); break;
      case "contrast": S.contrast = !S.contrast; render(); break;
      case "reach": S.reach = !S.reach; render(); break;
      case "still": S.still = !S.still; render(); break;
      case "speak": speak(); break;
      case "stay": hideWarn(); break;
      case "endnow": reset(); break;
    }
  });
  root.addEventListener("submit", e => {
    const f = e.target.closest("[data-form=ask]");
    if (!f) return;
    e.preventDefault();
    const inp = root.querySelector("#cpk-q");
    ask(inp ? inp.value : "");
  });
  ["pointerdown", "keydown", "scroll"].forEach(ev => root.addEventListener(ev, () => { if (S.mode !== "attract") armIdle(); }, { passive: true, capture: true }));

  /* Keep the screen awake where supported. */
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* not supported */ }
  document.addEventListener("visibilitychange", () => { try { if (!document.hidden && navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* ignore */ } });

  /* Work offline after the first load (service worker in the kiosk folder). */
  if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("sw.js").catch(() => {});

  /* ---------- lockdown ----------
     Nothing on the kiosk opens a web page, a new tab or a browser menu. QR codes open links on the guest's own phone only. */
  const stop = e => { e.preventDefault(); e.stopPropagation(); };
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("a[href]")) stop(e); if (e.ctrlKey || e.metaKey || e.shiftKey) stop(e); }, true);
  ["auxclick", "contextmenu", "dragstart", "drop", "gesturestart"].forEach(ev => document.addEventListener(ev, stop, true));
  document.addEventListener("selectstart", e => { if (!(e.target.closest && e.target.closest("input"))) e.preventDefault(); }, true);
  document.addEventListener("wheel", e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false, capture: true });
  document.addEventListener("keydown", e => {
    const k = (e.key || "").toLowerCase();
    if ((e.ctrlKey || e.metaKey || e.altKey) && k !== "control" && k !== "meta" && k !== "alt") stop(e);
    if (/^f([1-9]|1[0-2])$/.test(k)) stop(e);
  }, true);
  try { window.open = () => null; } catch (e) { /* ignore */ }

  window.CPK = { reset, answer };
  render();
})();
