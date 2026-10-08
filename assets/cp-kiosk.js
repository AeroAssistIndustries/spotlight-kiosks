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
  const IDLE_MS = 60000, AD_MS = 8000;

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
    mega: '<path d="M3 10v4h3l7 4V6L6 10H3zM16 9a4 4 0 0 1 0 6"/>'
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
      const day = new Date().toLocaleDateString("en-CA");
      const all = JSON.parse(localStorage.getItem(SKEY) || "{}");
      const d = all[day] || (all[day] = {});
      const g = d[group] || (d[group] = {});
      g[key] = (g[key] || 0) + 1;
      const days = Object.keys(all).sort(); while (days.length > 60) delete all[days.shift()];
      localStorage.setItem(SKEY, JSON.stringify(all));
    } catch (e) { /* storage blocked: skip */ }
  }

  /* ---------- state ---------- */
  const S = { mode: "attract", stack: [], panel: false, large: false, contrast: false, still: false, reach: false, ad: 0, idle: null, answer: null };

  /* ---------- frame ---------- */
  root.innerHTML = `
    <div class="cpk-bg" aria-hidden="true">${V.photos.map((p, i) => `<span style="background-image:url('${A + p}');animation-delay:${i * 9}s"></span>`).join("")}</div>
    <div class="cpk-shade" aria-hidden="true"></div>
    <header class="cpk-top">
      <img class="cpk-logo" src="${A + V.logo}" alt="${esc(V.name)}">
      <div class="cpk-meta"><span class="cpk-wx" id="cpk-wx" hidden></span><span class="cpk-clock" id="cpk-clock"></span></div>
    </header>
    <main class="cpk-view" id="cpk-view" tabindex="-1"></main>
    <section class="cpk-ads" id="cpk-ads" aria-roledescription="carousel" aria-label="Featured"></section>
    <nav class="cpk-dock" id="cpk-dock" aria-label="Kiosk navigation"></nav>
    <div class="cpk-sheet" id="cpk-sheet" hidden></div>`;
  const view = root.querySelector("#cpk-view"), dock = root.querySelector("#cpk-dock"), ads = root.querySelector("#cpk-ads"), sheet = root.querySelector("#cpk-sheet");

  /* ---------- clock and weather ---------- */
  function tick() {
    const d = new Date();
    root.querySelector("#cpk-clock").innerHTML = `<b>${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</b><small>${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</small>`;
  }
  tick(); setInterval(tick, 15000);
  /* US National Weather Service (free, public). Hidden if it cannot be reached. */
  function weather() {
    const box = root.querySelector("#cpk-wx"), KEY = "cpk-wx";
    const show = w => { if (!w) return; box.hidden = false; box.innerHTML = `${svg("sun")}<b>${esc(w.t)}°</b><small>${esc(w.s)}</small>`; };
    try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && Date.now() - c.at < 30 * 60000) { show(c); return; } if (c) show(c); } catch (e) { /* ignore */ }
    fetch(`https://api.weather.gov/points/${V.ll[0].toFixed(4)},${V.ll[1].toFixed(4)}`)
      .then(r => r.json()).then(p => fetch(p.properties.forecastHourly)).then(r => r.json())
      .then(f => {
        const p = f.properties.periods[0];
        const w = { t: p.temperature, s: p.shortForecast.split(" then ")[0].slice(0, 22), at: Date.now() };
        try { localStorage.setItem(KEY, JSON.stringify(w)); } catch (e) { /* ignore */ }
        show(w);
      }).catch(() => {});
  }
  weather(); setInterval(weather, 30 * 60000);

  /* ---------- ads ---------- */
  function adSlides() {
    const list = (V.sponsors || []).map(s => ({ type: "sp", s }));
    if (list.length < 2) list.push({ type: "open" });
    if (list.length < 3) list.push({ type: "pkg" });
    return list;
  }
  const SLIDES = adSlides();
  function adHTML(sl, i) {
    if (sl.type === "sp") {
      const s = sl.s;
      return `<button class="cpk-ad cpk-ad-sp" data-act="ad" data-i="${i}"${s.image ? ` style="--img:url('${A + s.image}')"` : ""}>
        <span class="cpk-ad-tag">Featured</span><span class="cpk-ad-t">${esc(s.title)}</span><span class="cpk-ad-s">${esc(s.text || "")}</span>
        ${s.cta ? `<span class="cpk-ad-cta">${esc(s.cta)}${svg("chev")}</span>` : ""}</button>`;
    }
    if (sl.type === "open") {
      return `<button class="cpk-ad cpk-ad-open" data-act="ad" data-i="${i}">
        <span class="cpk-ad-tag">Advertise here</span><span class="cpk-ad-t">Your business, in front of every guest</span>
        <span class="cpk-ad-s">Reach visitors at ${esc(V.name)} while they plan their day.</span>
        <span class="cpk-ad-cta">From $399 a year${svg("chev")}</span></button>`;
    }
    return `<button class="cpk-ad cpk-ad-pkg" data-act="ad" data-i="${i}">
      <span class="cpk-ad-tag">Local advertising</span><span class="cpk-ad-t">Be the place guests choose</span>
      <span class="cpk-ad-pk"><span><b>$399</b><small>1 location / yr</small></span><span><b>$1,099</b><small>3 locations / yr</small></span><span><b>$1,200</b><small>5 locations / yr</small></span></span></button>`;
  }
  ads.innerHTML = `<div class="cpk-ad-track" id="cpk-ad-track">${SLIDES.map(adHTML).join("")}</div>
    <div class="cpk-ad-dots">${SLIDES.map((_, i) => `<button data-act="addot" data-i="${i}" aria-label="Show ad ${i + 1}"><i></i></button>`).join("")}</div>`;
  function showAd(i) {
    S.ad = (i + SLIDES.length) % SLIDES.length;
    root.querySelector("#cpk-ad-track").style.transform = `translateX(-${S.ad * 100}%)`;
    ads.querySelectorAll(".cpk-ad").forEach((el, j) => { el.tabIndex = j === S.ad ? 0 : -1; el.setAttribute("aria-hidden", String(j !== S.ad)); });
    ads.querySelectorAll(".cpk-ad-dots button").forEach((d, j) => d.setAttribute("aria-current", String(j === S.ad)));
    bump("adShown", String(S.ad));
  }
  showAd(0);
  setInterval(() => { if (!S.still && !document.hidden && !ads.contains(document.activeElement)) showAd(S.ad + 1); }, AD_MS);

  /* ---------- views ---------- */
  const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
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
  function vAsk() {
    const a = S.answer;
    const chips = V.faq.slice(0, 12).map((f, i) => `<button class="cpk-q" data-act="q" data-i="${i}">${esc(f.q)}</button>`).join("");
    let ans = "";
    if (a) {
      ans = a.f ? `<div class="cpk-answer" role="status"><p class="cpk-kicker">Concierge</p><p class="cpk-ans-q">“${esc(a.q)}”</p><p class="cpk-ans-a">${esc(a.f.a)}</p>
        ${a.f.items.length ? `<div class="cpk-list compact">${a.f.items.map(rowHTML).join("")}</div>` : ""}</div>`
        : `<div class="cpk-answer" role="status"><p class="cpk-kicker">Concierge</p><p class="cpk-ans-q">“${esc(a.q)}”</p><p class="cpk-ans-a">I don't have an answer for that yet. The front desk is open 24 hours and happy to help, or call ${esc(V.phone)}.</p>
        <div class="cpk-list compact">${rowHTML("lx-desk")}</div></div>`;
    }
    return `<section class="cpk-ask">
      <h1 class="cpk-h2">Ask the concierge</h1>
      <form class="cpk-askform" data-form="ask" autocomplete="off">
        ${svg("search")}<input id="cpk-q" type="text" enterkeyhint="search" placeholder="Type a question" aria-label="Your question" maxlength="120">
        <button type="submit" class="cpk-askgo">Ask</button>
      </form>
      ${ans}
      <p class="cpk-kicker">Popular questions</p>
      <div class="cpk-qs">${chips}</div></section>`;
  }
  function vTake() {
    return `<section class="cpk-takeview">
      <h1 class="cpk-h2">Take this guide with you</h1>
      <p class="cpk-desc">Point your phone camera at the code and tap the link. The guide opens in your browser with every place, directions and hotel information. Nothing to download, and no sign-up.</p>
      <div class="cpk-qrbig">${qr(GUIDE, "QR code: open this guide on your phone")}</div>
      <ol class="cpk-steps"><li><b>1</b>Open your camera</li><li><b>2</b>Point it at the code</li><li><b>3</b>Tap the link</li></ol></section>`;
  }
  function vAd(i) {
    const sl = SLIDES[i];
    if (sl && sl.type === "sp") {
      const s = sl.s;
      return `<section class="cpk-item"><p class="cpk-kicker">Featured</p><h1 class="cpk-h2">${esc(s.title)}</h1><p class="cpk-desc">${esc(s.text || "")}</p>
        ${s.url ? `<div class="cpk-qrcard"><div class="cpk-qr">${qr(s.url, "QR code: open on your phone")}</div><div><b>${esc(s.cta || "Open on your phone")}</b><small>Point your phone camera at the code.</small></div></div>` : ""}</section>`;
    }
    return `<section class="cpk-item"><p class="cpk-kicker">Advertise on this screen</p>
      <h1 class="cpk-h2">Put your business in front of every guest</h1>
      <p class="cpk-desc">Your ad runs in this space on the ${esc(V.name)} kiosk, every day, for a full year. We design it for you.</p>
      <div class="cpk-pkgs"><div><small>1 location</small><b>$399</b><span>per year · or $60 a month</span></div><div><small>3 locations</small><b>$1,099</b><span>per year · or $180 a month</span></div><div class="best"><small>5 locations · best value</small><b>$1,200</b><span>per year · or $300 a month</span></div></div>
      <div class="cpk-qrcard"><div class="cpk-qr">${qr(PRICING, "QR code: CityPulse advertising packages")}</div><div><b>See packages on your phone</b><small>Point your phone camera at the code to see packages and get started.</small></div></div></section>`;
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
      else if (top.v === "ad") html = vAd(top.i);
    }
    view.innerHTML = html;
    view.className = "cpk-view" + (dir ? " in-" + dir : "");
    view.scrollTop = 0;
    dock.innerHTML = dockHTML();
    sheet.hidden = !S.panel || S.mode === "attract";
    sheet.innerHTML = sheet.hidden ? "" : sheetHTML();
    if (S.mode !== "attract") armIdle();
  }

  /* ---------- navigation ---------- */
  function go(entry) { S.stack.push(entry); render("fwd"); }
  function start() { S.mode = "session"; S.stack = [{ v: "home" }]; bump("sessions", "count"); render("fwd"); }
  function reset() {
    S.mode = "attract"; S.stack = []; S.panel = false; S.answer = null;
    S.large = S.contrast = S.reach = false;
    if (window.speechSynthesis) speechSynthesis.cancel();
    render();
  }
  function armIdle() { clearTimeout(S.idle); S.idle = setTimeout(reset, IDLE_MS); }
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
      if (act === "ad") { start(); bump("adTaps", b.dataset.i); go({ v: "ad", i: +b.dataset.i }); }
      else if (act === "addot") showAd(+b.dataset.i);
      else start();
      return;
    }
    armIdle();
    switch (act) {
      case "home": S.stack = [{ v: "home" }]; S.panel = false; render("back"); break;
      case "back": if (S.stack.length > 1) S.stack.pop(); render("back"); break;
      case "cat": bump("categories", b.dataset.id); go({ v: "cat", id: b.dataset.id }); break;
      case "item": bump("places", b.dataset.id); go({ v: "item", id: b.dataset.id }); break;
      case "ask": S.answer = null; go({ v: "ask" }); setTimeout(() => { const i = root.querySelector("#cpk-q"); if (i) i.focus({ preventScroll: true }); }, 50); break;
      case "q": { const f = V.faq[+b.dataset.i]; S.answer = { q: f.q, f }; bump("questions", f.q); render(); break; }
      case "take": bump("takeHome", "open"); go({ v: "take" }); break;
      case "ad": bump("adTaps", b.dataset.i); go({ v: "ad", i: +b.dataset.i }); break;
      case "addot": showAd(+b.dataset.i); break;
      case "panel": S.panel = !S.panel; render(); break;
      case "large": S.large = !S.large; render(); break;
      case "contrast": S.contrast = !S.contrast; render(); break;
      case "reach": S.reach = !S.reach; render(); break;
      case "still": S.still = !S.still; render(); break;
      case "speak": speak(); break;
    }
  });
  root.addEventListener("submit", e => {
    const f = e.target.closest("[data-form=ask]");
    if (!f) return;
    e.preventDefault();
    const q = (root.querySelector("#cpk-q").value || "").trim();
    if (!q) return;
    const best = answer(q);
    S.answer = { q, f: best };
    bump("questions", best ? best.q : "No answer: " + q.slice(0, 60));
    render();
  });
  ["pointerdown", "keydown", "scroll"].forEach(ev => root.addEventListener(ev, () => { if (S.mode !== "attract") armIdle(); }, { passive: true, capture: true }));

  /* Swipe the ad strip. */
  (function () {
    let x0 = null;
    ads.addEventListener("pointerdown", e => { x0 = e.clientX; });
    ads.addEventListener("pointerup", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) showAd(S.ad + (dx < 0 ? 1 : -1)); });
  })();

  /* Keep the screen awake where supported. */
  try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* not supported */ }
  document.addEventListener("visibilitychange", () => { try { if (!document.hidden && navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* ignore */ } });

  /* Work offline after the first load (service worker in the kiosk folder). */
  if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("sw.js").catch(() => {});

  window.CPK = { reset, answer };
  render();
})();
