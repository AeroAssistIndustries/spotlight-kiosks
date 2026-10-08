/* CityPulse Kiosks — mobile concierge page (opened from the kiosk's QR code).
   On WordPress, a kiosk link (?k=) loads that kiosk's guide and ads from the back end.
   Otherwise a venue link (?v=) shows the example guide. Nothing personal is sent or stored. */
(function () {
  "use strict";
  const app = document.getElementById("cc-app");
  if (!app) return;
  const params = new URLSearchParams(location.search);
  const kiosk = params.get("k") || "";
  const venueKey = params.get("v") || "";
  const item = params.get("i") || "";
  const ajax = window.CITYPULSE_CONFIG && CITYPULSE_CONFIG.forms && CITYPULSE_CONFIG.forms.ajaxUrl;
  const device = matchMedia("(max-width: 720px)").matches ? "phone" : "desktop";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const VENUES = {
    hotel: {
      name: "The Arden Hotel", welcome: "Your stay, planned in one place.",
      guides: [
        ["Dining", "Restaurant on the lobby level for breakfast, lunch and dinner.", "Lobby level · 6:30 AM to 10 PM"],
        ["Amenities", "Pool, fitness room, business center and valet parking.", "Ask at the front desk"],
        ["Local guide", "Galleries, trails and shops within a short walk.", "Central Ave · 10 min walk"],
        ["Events", "Live music tonight and this week's guided tours.", "Check the lobby board"]
      ]
    },
    medical: {
      name: "Camelback Family Health", welcome: "Your visit, made easier.",
      guides: [
        ["Check-in", "Confirm your details before you are called.", "Front desk · 2 minutes"],
        ["Pharmacy", "Prescriptions can be picked up on the way out.", "Ground floor · open until 7 PM"],
        ["Coffee", "A café with light meals, a short walk from the clinic.", "Suite 120 · 7 AM to 3 PM"],
        ["Parking", "Lot B is free for patients. Validate your ticket at the desk.", "Exit by Lab, follow signs"]
      ]
    },
    auto: {
      name: "Valley Motors Service Lounge", welcome: "Your visit, while we service your car.",
      guides: [
        ["Service status", "Follow your vehicle from check-in to ready for pickup.", "Ticket at the service desk"],
        ["Lounge dining", "Coffee and snacks, with free Wi-Fi in the lounge.", "Lounge · open all day"],
        ["Shuttle", "Shuttle to nearby shops and back, about every 20 minutes.", "Pickup outside the showroom"],
        ["Things to do", "Quick local errands and a short walk to the park.", "Ask the service desk"]
      ]
    }
  };
  const EXAMPLE_SPONSOR = { advertiser: "Example business", headline: "Local businesses on the CityPulse kiosk offer visitors something to try." };

  function track(fields) {
    if (!ajax) return;
    const body = new URLSearchParams(Object.assign({ action: "citypulse_visit", device }, fields, item ? { item } : {}));
    fetch(ajax, { method: "POST", body, credentials: "same-origin", keepalive: true }).catch(() => {});
  }

  function show(v, sponsor) {
    const cards = v.guides.map(([t, d, f]) => `
      <article class="cc-card"><h2>${esc(t)}</h2><p>${esc(d)}</p><small>${esc(f)}</small></article>`).join("");
    const ad = sponsor ? `<article class="cc-card cc-sponsor"><small>Sponsored · ${esc(sponsor.advertiser)}</small><h2>${esc(sponsor.headline)}</h2></article>` : "";
    app.innerHTML = `
      <p class="cc-kicker">CityPulse concierge</p>
      <h1 class="cc-h">${esc(v.name)}</h1>
      <p class="cc-lede">${esc(v.welcome)}</p>
      <div class="cc-list">${cards}${ad}</div>
      <section class="cc-tip"><h2>Keep this guide</h2>
        <p><b>iPhone:</b> tap Share, then Add to Home Screen.</p>
        <p><b>Android:</b> open the browser menu, then Add to Home screen.</p></section>`;
  }

  function notFound() {
    app.innerHTML = `<h1 class="cc-h">Your CityPulse guide</h1>
      <p class="cc-lede">Scan the code on a CityPulse kiosk to open its guide here.</p>
      <p><a class="btn" href="../">See CityPulse Kiosks</a></p>`;
  }

  function fromVenue() {
    const v = VENUES[venueKey];
    if (!v) return notFound();
    track({ venue: venueKey });
    show(v, EXAMPLE_SPONSOR);
  }

  /* Live venue guide (for example ?v=lexen with assets/lexen-data.js): every place, directions and hotel info. */
  const LV = window.CP_VENUE;
  if (LV && venueKey === LV.id) {
    document.body.classList.add("cg-body");
    const miles = ll => {
      if (!ll) return null;
      const R = 3958.8, r = d => d * Math.PI / 180, a = LV.ll;
      const x = Math.sin(r(ll[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(ll[0])) * Math.sin(r(ll[1] - a[1]) / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(x));
    };
    const far = it => { const m = miles(it.ll); if (m == null) return ""; return m <= 1.2 ? `${Math.max(1, Math.round(m * 24))} min walk` : `${m < 10 ? m.toFixed(1) : Math.round(m)} mi`; };
    const maps = it => "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(LV.address) + "&destination=" + encodeURIComponent(it.n + ", " + it.addr) + "&travelmode=" + ((miles(it.ll) || 9) <= 1.2 ? "walking" : "driving");
    const card = id => {
      const it = LV.items[id]; if (!it) return "";
      const d = far(it);
      return `<details class="cg-item" id="${esc(id)}"><summary><span><b>${esc(it.n)}</b><small>${esc(it.k)}${it.price ? " · " + esc(it.price) : ""}</small></span>${d ? `<em>${esc(d)}</em>` : it.hotel ? "<em>Hotel</em>" : ""}</summary>
        <div class="cg-body-in"><p>${esc(it.d)}</p>${it.addr ? `<p class="cg-addr">${esc(it.addr)}</p>` : ""}
        ${(it.f || []).length ? `<dl>${it.f.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>` : ""}
        <div class="cg-acts">${it.ll ? `<a class="cg-btn" href="${maps(it)}" target="_blank" rel="noopener">Directions</a>` : ""}${it.hotel ? `<a class="cg-btn ghost" href="tel:${esc(LV.tel)}">Call the front desk</a>` : ""}</div></div></details>`;
    };
    const order = ["hotel", "eat", "coffee", "todo", "getting", "essentials"];
    app.innerHTML = `
      <header class="cg-head"><img src="${esc(window.CP_LIVE ? window.CP_LIVE.img(LV.logo, "../assets/") : "../assets/" + LV.logo)}" alt="${esc(LV.name)}"><p>${esc(LV.address)}</p>
        <div class="cg-quick"><a class="cg-btn" href="tel:${esc(LV.tel)}">Call ${esc(LV.phone)}</a><a class="cg-btn ghost" href="mailto:${esc(LV.email)}">Email</a></div></header>
      <nav class="cg-nav" aria-label="Sections">${order.filter(k => LV.categories[k]).map(k => `<a href="#cat-${k}">${esc(LV.categories[k].label)}</a>`).join("")}</nav>
      ${order.filter(k => LV.categories[k]).map(k => { const c = LV.categories[k]; return `<section class="cg-sec" id="cat-${k}"><h2>${esc(c.label)}</h2><p class="cg-intro">${esc(c.intro)}</p>${c.items.map(card).join("")}</section>`; }).join("")}
      <section class="cg-sec"><h2>Keep this guide</h2><p class="cg-intro"><b>iPhone:</b> tap Share, then Add to Home Screen. <b>Android:</b> open the browser menu, then Add to Home screen.</p></section>
      <p class="cg-foot">Guide by CityPulse Kiosks. Hours change; check directions for today's hours.</p>`;
    const open = decodeURIComponent((location.hash || "").slice(1));
    const el = open && document.getElementById(open);
    if (el && el.tagName === "DETAILS") { el.open = true; setTimeout(() => el.scrollIntoView({ block: "start" }), 50); }
    track({ venue: LV.id });
    return;
  }

  if (kiosk && ajax) {
    const u = new URL(ajax);
    u.searchParams.set("action", "citypulse_guide");
    u.searchParams.set("k", kiosk);
    fetch(u.href, { credentials: "same-origin" })
      .then(r => r.json())
      .then(j => {
        if (!j || !j.success) return fromVenue();
        track({ kiosk });
        show({ name: j.data.name, welcome: "Local guide for this location.", guides: j.data.guides.map(g => [g.title, g.detail, g.hours]) }, j.data.sponsor);
      })
      .catch(fromVenue);
  } else {
    fromVenue();
  }
})();
