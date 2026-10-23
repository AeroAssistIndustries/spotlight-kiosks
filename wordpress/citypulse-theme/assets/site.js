/* CityPulse Kiosks — site behavior */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const params = new URLSearchParams(location.search);
  function download(name, text, type) {
    const blob = new Blob([text], { type: type || "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (x) { ok = false; } t.remove(); return ok;
    }
  }

  /* ---------- navigation ---------- */
  const toggle = $(".nav-toggle"), nav = $("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open)); nav.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      document.documentElement.classList.toggle("nav-open", open);
    });
    const shut = () => { if (toggle.getAttribute("aria-expanded") !== "true") return; toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); document.body.style.overflow = ""; document.documentElement.classList.remove("nav-open"); };
    nav.addEventListener("click", ev => { if (ev.target.closest("a")) shut(); });
    document.addEventListener("keydown", ev => { if (ev.key === "Escape") shut(); });
    window.matchMedia("(min-width: 981px)").addEventListener("change", m => { if (m.matches) shut(); });
  }
  const items = $$(".nav-item");
  const closeAll = except => items.forEach(i => { if (i !== except) { i.classList.remove("open"); $(".nav-btn", i).setAttribute("aria-expanded", "false"); } });
  const fine = window.matchMedia("(hover: hover) and (min-width: 981px)");
  items.forEach(item => {
    const btn = $(".nav-btn", item); let t;
    btn.addEventListener("click", () => { const open = !item.classList.contains("open"); closeAll(item); item.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); });
    item.addEventListener("mouseenter", () => { if (!fine.matches) return; clearTimeout(t); closeAll(item); item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); });
    item.addEventListener("mouseleave", () => { if (!fine.matches) return; t = setTimeout(() => { item.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }, 120); });
    item.addEventListener("keydown", e => { if (e.key === "Escape") { item.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); } });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".nav-item")) closeAll(); });

  /* ---------- home slider ---------- */
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-slider]").forEach(sl => {
    const slides = $$(".slide", sl), dots = $$(".sl-dots button", sl);
    let i = 0, paused = false, x0 = null;
    slides.forEach(s => s.removeAttribute("hidden"));
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, j) => { s.classList.toggle("on", j === i); s.setAttribute("aria-hidden", String(j !== i)); $$("a,button", s).forEach(el => { el.tabIndex = j === i ? 0 : -1; }); });
      dots.forEach((d, j) => { d.setAttribute("aria-selected", String(j === i)); d.tabIndex = j === i ? 0 : -1; });
    }
    $(".sl-prev", sl).addEventListener("click", () => show(i - 1));
    $(".sl-next", sl).addEventListener("click", () => show(i + 1));
    dots.forEach((d, j) => d.addEventListener("click", () => show(j)));
    sl.addEventListener("mouseenter", () => { paused = true; }); sl.addEventListener("mouseleave", () => { paused = false; });
    sl.addEventListener("focusin", () => { paused = true; }); sl.addEventListener("focusout", () => { paused = false; });
    sl.addEventListener("pointerdown", e => { x0 = e.clientX; });
    sl.addEventListener("pointerup", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); });
    sl.addEventListener("keydown", e => { if (e.key === "ArrowRight") show(i + 1); if (e.key === "ArrowLeft") show(i - 1); });
    show(0); sl.classList.add("ready");
    if (!reduceMotion) setInterval(() => { if (!paused && !document.hidden) show(i + 1); }, 6500);
  });

  /* ---------- ad cycle highlight ---------- */
  $$("[data-cycle]").forEach(c => {
    const nodes = $$(".cy-node", c); let k = 0, vis = true;
    if (reduceMotion) return;
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(c);
    setInterval(() => { if (!vis || document.hidden) return; nodes.forEach((n, j) => n.classList.toggle("on", j === k)); k = (k + 1) % nodes.length; }, 1500);
  });

  /* ---------- US markets map ----------
     State labels, tap a state to zoom in and list its cities, search for a city, and live kiosks from Sales Studio
     (by city, venue type and cross streets only, never the host's name). */
  $$("[data-usmap]").forEach(m => {
    const svg = $("svg", m), tip = $(".map-tip", m), NS = "http://www.w3.org/2000/svg";
    if (!svg) return;
    const home = (document.querySelector(".brand") || {}).getAttribute ? document.querySelector(".brand").getAttribute("href") : "./";
    const price = () => (window.CP_PRICE ? CP_PRICE.money(CP_PRICE.now.y1) : "$798") + "/yr";
    const ABBR = { Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC", Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY" };
    const NAME = Object.fromEntries(Object.entries(ABBR).map(([k, v]) => [v, k]));
    const NUDGE = { FL: [14, 8], LA: [-10, -4], MI: [14, 22], ID: [-4, 22], KY: [6, 3], CA: [-10, 6], MN: [-6, 8], OK: [12, 0], VA: [8, 4], TX: [4, 8], NY: [6, 4], WV: [-3, 3], MS: [0, 0], AK: [0, 0], HI: [10, 6], NC: [8, 2], TN: [0, 0], ME: [0, 4] };
    const SIDE = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"];
    const states = $$(".st", svg), pins = $$(".pin", svg), FULL = [0, 0, 975, 610];
    const VENUE = { Hotel: "Hotel lobby", "Medical office": "Medical office", Dealership: "Dealership lounge", Restaurant: "Restaurant" };
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); if (parent) parent.appendChild(e); return e; };

    /* state labels (small north-east states sit out in the ocean with a short line) */
    const labels = el("g", { class: "st-labels", "aria-hidden": "true" });
    svg.insertBefore(labels, $(".pins", svg) || null);
    const side = [];
    states.forEach(st => {
      const ab = ABBR[st.dataset.state]; if (!ab) return;
      const b = st.getBBox(); let x = b.x + b.width / 2, y = b.y + b.height / 2;
      if (SIDE.includes(ab)) { side.push({ ab, x, y }); return; }
      const n = NUDGE[ab]; if (n) { x += n[0]; y += n[1]; }
      for (let i = 0; i < 4 && pins.some(p => Math.hypot(p.cx.baseVal.value - x, p.cy.baseVal.value - y) < 11); i++) y += 9; /* keep the label clear of a pin */
      const t = el("text", { x, y, class: "st-lab", "text-anchor": "middle", "dominant-baseline": "central" }, labels); t.textContent = ab;
    });
    side.sort((a, b) => a.y - b.y).forEach((s, i) => {
      const ly = 150 + i * 19, lx = 948;
      el("line", { x1: s.x, y1: s.y, x2: lx - 12, y2: ly, class: "st-lead" }, labels);
      const t = el("text", { x: lx, y: ly, class: "st-lab side", "text-anchor": "middle", "dominant-baseline": "central" }, labels); t.textContent = s.ab;
    });

    /* panel, search and legend */
    const bar = document.createElement("div"); bar.className = "mk-bar";
    const allCities = pins.flatMap(p => p.dataset.markets.split("|")).sort();
    bar.innerHTML = `<form class="mk-find" role="search"><label class="sr" for="mk-q">Find your city</label><input id="mk-q" list="mk-cities" type="search" placeholder="Find your city or state" autocomplete="off"><datalist id="mk-cities">${allCities.map(c => `<option value="${esc(c)}">`).join("")}${Object.keys(ABBR).map(s => `<option value="${esc(s)}">`).join("")}</datalist><button class="btn btn-small" type="submit">Find</button></form><div class="mk-legend"><span><i class="lg-mk"></i>Open for ads</span><span><i class="lg-live"></i>Live kiosk</span><span><i class="lg-soon"></i>Coming soon</span></div>`;
    m.parentNode.insertBefore(bar, m);
    const panel = document.createElement("div"); panel.className = "mk-panel"; panel.hidden = true; panel.setAttribute("aria-live", "polite");
    m.parentNode.insertBefore(panel, m.nextSibling);
    const zoomOut = document.createElement("button"); zoomOut.type = "button"; zoomOut.className = "mk-out"; zoomOut.hidden = true; zoomOut.textContent = "← All states"; m.appendChild(zoomOut);

    /* live and coming-soon kiosks from Sales Studio */
    const R = Math.PI / 180, sy0 = Math.sin(29.5 * R), nn = (sy0 + Math.sin(45.5 * R)) / 2, cc = 1 + sy0 * (2 * nn - sy0), r0 = Math.sqrt(cc) / nn;
    const raw = (x, y) => { const r = Math.sqrt(cc - 2 * nn * Math.sin(y)) / nn; return [r * Math.sin(x * nn), r0 - r * Math.cos(x * nn)]; };
    const C0 = raw(-0.6 * R, 38.7 * R), K = 1300;
    const proj = (lng, lat) => { const q = raw((lng + 96) * R, lat * R); return [487.5 - K * C0[0] + K * q[0], 305 + K * C0[1] - K * q[1]]; };
    let kiosks = [];
    const kLayer = el("g", { class: "kiosks" }, svg);
    const CFG = window.CITYPULSE_CONFIG || {}, API = String((CFG.payments && CFG.payments.api) || "https://sales.citypulsekiosks.com").replace(/\/+$/, "");
    fetch(API + "/api/web/locations", { mode: "cors", credentials: "omit" }).then(r => r.ok ? r.json() : null).then(j => {
      if (!j || !Array.isArray(j.locations)) return;
      kiosks = j.locations.filter(k => k.state && NAME[k.state]).map(k => Object.assign({}, k, { stateName: NAME[k.state] }));
      kiosks.forEach(k => {
        if (k.lat == null || k.lng == null || k.state === "AK" || k.state === "HI") return;
        const [x, y] = proj(k.lng, k.lat);
        k.x = x; k.y = y;
        k.dot = el("circle", { cx: x, cy: y, r: 6, class: "kiosk " + k.status, tabindex: "0", role: "button", "aria-label": kioskText(k) }, kLayer);
        k.dot.addEventListener("mouseenter", () => showKiosk(k)); k.dot.addEventListener("focus", () => showKiosk(k));
        k.dot.addEventListener("mouseleave", hide); k.dot.addEventListener("blur", hide);
        k.dot.addEventListener("click", e => { e.stopPropagation(); showKiosk(k); });
      });
      if (cur) showState(cur, true);
    }).catch(() => {});
    function kioskText(k) { return `${k.status === "live" ? "Live kiosk" : "Coming soon"}: ${VENUE[k.venue] || k.venue || "Kiosk"}${k.cross ? ", " + k.cross : ""}, ${k.city}, ${k.state}`; }
    function marketFor(k) { /* the market a kiosk belongs to: its own city if listed, else the nearest pin in its state */
      const key = (k.city + ", " + k.state).toLowerCase();
      const exact = pins.find(p => p.dataset.markets.toLowerCase().split("|").includes(key));
      if (exact) return exact.dataset.markets.split("|").find(mk => mk.toLowerCase() === key);
      const inState = pins.filter(p => p.dataset.state === k.stateName);
      if (!inState.length) return `${k.city}, ${k.state}`;
      if (k.x == null) return inState[0].dataset.markets.split("|")[0];
      let best = inState[0], bd = 1e9;
      inState.forEach(p => { const d = Math.hypot(p.cx.baseVal.value - k.x, p.cy.baseVal.value - k.y); if (d < bd) { bd = d; best = p; } });
      return best.dataset.markets.split("|")[0];
    }

    /* tooltip */
    let hideT;
    function place(target) {
      const r = target.getBoundingClientRect(), b = m.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = Math.max(8, Math.min(b.width - tip.offsetWidth - 8, r.left - b.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
      tip.style.top = Math.max(4, r.top - b.top - tip.offsetHeight - 10) + "px";
    }
    function show(pin) {
      clearTimeout(hideT);
      $$(".pin.on, .kiosk.on", svg).forEach(p => p.classList.remove("on")); pin.classList.add("on");
      const list = pin.dataset.markets.split("|"), here = kiosks.filter(k => list.includes(marketFor(k)));
      $("b", tip).textContent = pin.dataset.name;
      $(".tip-links", tip).innerHTML = (here.length ? `<span class="tip-k">${here.filter(k => k.status === "live").length ? here.filter(k => k.status === "live").length + " live kiosk" + (here.filter(k => k.status === "live").length > 1 ? "s" : "") : "Kiosks coming soon"}</span>` : "") + list.map(mk => `<a href="${home}?market=${encodeURIComponent(mk)}#get-started">${list.length > 1 ? esc(mk) + " — " : ""}Advertise here${list.length > 1 ? "" : " — " + price()}</a>`).join("");
      place(pin);
    }
    function showKiosk(k) {
      clearTimeout(hideT);
      $$(".pin.on, .kiosk.on", svg).forEach(p => p.classList.remove("on")); k.dot.classList.add("on");
      $("b", tip).textContent = `${k.city}, ${k.state}`;
      const mk = marketFor(k);
      $(".tip-links", tip).innerHTML = `<span class="tip-k">${k.status === "live" ? "Live kiosk" : "Coming soon"} · ${esc(VENUE[k.venue] || k.venue || "Kiosk")}</span>${k.cross ? `<span class="tip-x">${esc(k.cross)}</span>` : ""}<a href="${home}?market=${encodeURIComponent(mk)}#get-started">Advertise here — ${price()}</a>`;
      place(k.dot);
    }
    function hide() { hideT = setTimeout(() => { tip.hidden = true; $$(".pin.on, .kiosk.on", svg).forEach(p => p.classList.remove("on")); }, 400); }
    pins.forEach(pin => {
      pin.addEventListener("mouseenter", () => show(pin)); pin.addEventListener("mouseleave", hide);
      pin.addEventListener("focus", () => show(pin)); pin.addEventListener("blur", hide);
      pin.addEventListener("click", e => { e.stopPropagation(); show(pin); if (!cur) showState(pin.dataset.state); });
      pin.addEventListener("keydown", e => { if (e.key === "Enter") { show(pin); const a = $(".tip-links a", tip); if (a) a.focus(); } });
    });
    tip.addEventListener("mouseenter", () => clearTimeout(hideT)); tip.addEventListener("mouseleave", hide);

    /* zoom into a state */
    let cur = "", vb = FULL.slice(), anim = 0;
    const zoomK = () => 975 / vb[2];
    function setVB(v) { vb = v; svg.setAttribute("viewBox", v.map(n => n.toFixed(1)).join(" ")); const k = zoomK(), sc = (svg.clientWidth || 975) / 975; svg.style.setProperty("--z", Math.max(.2, k * sc)); pins.forEach(p => p.setAttribute("r", (p.classList.contains("multi") ? 6.5 : 5) / Math.sqrt(k))); kiosks.forEach(q => q.dot && q.dot.setAttribute("r", 6 / Math.sqrt(k))); window.CP_MAPZ = k; }
    function animateTo(to) {
      cancelAnimationFrame(anim);
      const from = vb.slice(), t0 = performance.now(), D = reduceMotion ? 1 : 520;
      const step = now => { const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 3); setVB(from.map((f, i) => f + (to[i] - f) * e)); if (t < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
    }
    function fitBox(b) {
      const pad = Math.max(b.width, b.height) * 0.18 + 12, w = b.width + pad * 2, h = b.height + pad * 2, ar = 975 / 610;
      let W = Math.max(w, h * ar), H = W / ar; if (W < 120) { W = 120; H = W / ar; }
      return [b.x + b.width / 2 - W / 2, b.y + b.height / 2 - H / 2, W, H];
    }
    function showState(name, quiet) {
      const st = states.find(s => s.dataset.state === name); if (!st) return;
      cur = name;
      states.forEach(s => s.classList.toggle("on", s === st)); svg.classList.add("zoomed");
      if (!quiet) animateTo(fitBox(st.getBBox()));
      $$(".city-lab", svg).forEach(t => t.remove());
      const mine = pins.filter(p => p.dataset.state === name), ks = kiosks.filter(k => k.stateName === name);
      mine.forEach(p => { const t = el("text", { x: p.cx.baseVal.value, y: p.cy.baseVal.value, class: "city-lab", "text-anchor": "start", "dominant-baseline": "central" }, $(".pins", svg) || svg); t.textContent = p.dataset.name; });
      zoomOut.hidden = false;
      const rows = mine.flatMap(p => p.dataset.markets.split("|")).map(mk => {
        const kk = ks.filter(k => marketFor(k) === mk);
        return `<li><div><b>${esc(mk)}</b>${kk.length ? kk.map(k => `<span class="mk-k ${k.status}">${k.status === "live" ? "Live" : "Coming soon"} · ${esc(VENUE[k.venue] || k.venue || "Kiosk")}${k.cross ? " · " + esc(k.cross) : ""}${k.city && (k.city + ", " + k.state) !== mk ? " · " + esc(k.city) : ""}</span>`).join("") : `<span class="mk-k">Open for ads</span>`}</div><a class="btn btn-small" href="${home}?market=${encodeURIComponent(mk)}#get-started">Advertise here</a></li>`;
      }).join("") + ks.filter(k => !mine.some(p => p.dataset.markets.split("|").includes(marketFor(k)))).map(k => `<li><div><b>${esc(k.city + ", " + k.state)}</b><span class="mk-k ${k.status}">${k.status === "live" ? "Live" : "Coming soon"} · ${esc(VENUE[k.venue] || k.venue || "Kiosk")}${k.cross ? " · " + esc(k.cross) : ""}</span></div><a class="btn btn-small" href="${home}?market=${encodeURIComponent(k.city + ", " + k.state)}#get-started">Advertise here</a></li>`).join("");
      const live = ks.filter(k => k.status === "live").length, soon = ks.length - live;
      panel.innerHTML = `<div class="mk-ph"><div><p class="eyebrow">${esc(ABBR[name] || "")}</p><h3>${esc(name)}</h3><p class="mk-sum">${mine.length ? `${allIn(name)} ${allIn(name) === 1 ? "market" : "markets"}` : "No markets listed yet"}${live ? ` · ${live} live kiosk${live > 1 ? "s" : ""}` : ""}${soon ? ` · ${soon} coming soon` : ""}</p></div><button type="button" class="text-link mk-close">All states</button></div>${rows ? `<ul class="mk-list">${rows}</ul>` : `<p class="mk-none">We’re adding venues here. <a href="${home}?market=other#get-started">Request ${esc(name)}</a> and we’ll place your ad as soon as a kiosk opens.</p>`}<p class="mk-note">Venue names are shared with advertisers after checkout. Cross streets show the general area.</p>`;
      panel.hidden = false;
      $(".mk-close", panel).addEventListener("click", reset);
      /* the Locations page also filters its city list */
      const root = document.querySelector("[data-filter-root]");
      if (root && root.querySelector("[data-filter-select]")) { const opt = [...root.querySelector("[data-filter-select]").options].find(o => o.text === name); if (opt) root.dispatchEvent(new CustomEvent("citypulse:filter", { detail: opt.value })); }
    }
    const allIn = name => pins.filter(p => p.dataset.state === name).reduce((n, p) => n + p.dataset.markets.split("|").length, 0);
    function reset() { cur = ""; states.forEach(s => s.classList.remove("on")); svg.classList.remove("zoomed"); $$(".city-lab", svg).forEach(t => t.remove()); panel.hidden = true; zoomOut.hidden = true; tip.hidden = true; animateTo(FULL); }
    zoomOut.addEventListener("click", reset);
    setVB(FULL); window.addEventListener("resize", () => setVB(vb));
    m.addEventListener("keydown", e => { if (e.key === "Escape" && cur) reset(); });
    states.forEach(st => {
      st.addEventListener("click", () => { if (cur === st.dataset.state) return; showState(st.dataset.state); });
      st.addEventListener("mouseenter", () => { if (cur) return; const n = allIn(st.dataset.state), k = kiosks.filter(q => q.stateName === st.dataset.state && q.status === "live").length; st.setAttribute("aria-label", `${st.dataset.state}: ${n} market${n === 1 ? "" : "s"}${k ? ", " + k + " live kiosk" + (k > 1 ? "s" : "") : ""}`); });
    });
    $(".mk-find", bar).addEventListener("submit", e => {
      e.preventDefault();
      const q = $("#mk-q", bar).value.trim().toLowerCase(); if (!q) return;
      const stName = Object.keys(ABBR).find(s => s.toLowerCase() === q || ABBR[s].toLowerCase() === q);
      if (stName) { showState(stName); m.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); return; }
      const pin = pins.find(p => p.dataset.markets.toLowerCase().split("|").some(mk => mk === q || mk.split(",")[0] === q)) || pins.find(p => p.dataset.markets.toLowerCase().includes(q));
      const k = kiosks.find(x => x.city.toLowerCase() === q || (x.city + ", " + x.state).toLowerCase() === q);
      const target = pin || (k && pins.find(p => p.dataset.state === k.stateName));
      if (!target) { $("#mk-q", bar).setCustomValidity("We don’t list that city yet. Pick a state, or choose “Other” at checkout."); $("#mk-q", bar).reportValidity(); setTimeout(() => $("#mk-q", bar).setCustomValidity(""), 2500); return; }
      showState(target.dataset.state); m.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      setTimeout(() => show(target), reduceMotion ? 0 : 560);
    });
  });

  /* ---------- customer journey ---------- */
  $$("[data-journey]").forEach(j => {
    const stages = $$(".js", j), rail = $$(".jr", j), DUR = 3400;
    let i = 0, t = null, paused = false, vis = true;
    function countUp(stage) {
      $$("[data-count-to]", stage).forEach(el => {
        const to = +el.dataset.countTo, t0 = performance.now();
        const step = now => { const k = Math.min(1, (now - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(step); };
        if (reduceMotion) el.textContent = to.toLocaleString(); else requestAnimationFrame(step);
      });
    }
    function show(n) {
      i = (n + stages.length) % stages.length;
      stages.forEach((s, k) => { s.classList.remove("on"); s.setAttribute("aria-hidden", String(k !== i)); });
      void j.offsetWidth;
      stages[i].classList.add("on");
      rail.forEach((r, k) => { r.classList.toggle("on", k === i); r.classList.toggle("done", k < i); $("button", r).setAttribute("aria-current", k === i ? "step" : "false"); });
      countUp(stages[i]);
      j.classList.remove("run"); void j.offsetWidth;
      if (!reduceMotion && !paused) { j.style.setProperty("--jdur", DUR + "ms"); j.classList.add("run"); }
      const act = rail[i]; if (act && act.parentElement.scrollWidth > act.parentElement.clientWidth) act.parentElement.scrollTo({ left: act.offsetLeft - 16, behavior: "smooth" });
    }
    function tick() { clearTimeout(t); if (reduceMotion) return; t = setTimeout(() => { if (!paused && vis && !document.hidden) show(i + 1); tick(); }, DUR); }
    let touched = false;
    rail.forEach((r, k) => $("button", r).addEventListener("click", () => { touched = true; show(k); tick(); }));
    j.addEventListener("mouseenter", () => { paused = true; j.classList.remove("run"); });
    j.addEventListener("mouseleave", () => { paused = false; show(i); tick(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { const was = vis; vis = es[0].isIntersecting; if (vis && !was && !touched) { show(0); tick(); } }, { threshold: .35 }).observe(j);
    show(0); tick();
  });

  /* ---------- tabs ---------- */
  $$("[data-tabs]").forEach(root => {
    const tabs = $$("[role=tab]", root);
    const select = tab => {
      tabs.forEach(t => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; const p = document.getElementById(t.getAttribute("aria-controls")); if (p) p.hidden = !on; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); select(n);
      });
    });
  });

  /* ---------- filters + search ---------- */
  $$("[data-filter-root]").forEach(root => {
    const chips = $$("[data-filter]", root), search = $("[data-search]", root);
    const list = $$("[data-item]", root), groups = $$("[data-group]", root);
    const count = $("[data-count]", root), empty = $("[data-empty]", root);
    let active = "all";
    function apply() {
      const q = (search ? search.value : "").trim().toLowerCase(); let n = 0;
      list.forEach(el => {
        const cats = (el.dataset.cat || "").split(" ");
        const ok = (active === "all" || cats.includes(active)) && (!q || el.textContent.toLowerCase().includes(q));
        el.hidden = !ok; if (ok) n++;
      });
      groups.forEach(g => { g.hidden = !$$("[data-item]", g).some(el => !el.hidden); });
      if (count) count.textContent = `${n} ${n === 1 ? count.dataset.one : count.dataset.many}`;
      if (empty) empty.hidden = n > 0;
    }
    chips.forEach(c => c.addEventListener("click", () => { active = c.dataset.filter; chips.forEach(x => x.setAttribute("aria-pressed", String(x === c))); apply(); }));
    const sel = $("[data-filter-select]", root);
    if (sel) sel.addEventListener("change", () => { active = sel.value; apply(); });
    root.addEventListener("citypulse:filter", e => { active = e.detail; if (sel) sel.value = e.detail; if (search) search.value = ""; apply(); });
    if (search) search.addEventListener("input", apply);
    $$("[data-clear]", root).forEach(b => b.addEventListener("click", () => { active = "all"; if (search) search.value = ""; if (sel) sel.value = "all"; chips.forEach(x => x.setAttribute("aria-pressed", String(x.dataset.filter === "all"))); apply(); }));
    const pre = params.get("filter"); if (pre) { const c = chips.find(x => x.dataset.filter === pre); if (c) { active = pre; chips.forEach(x => x.setAttribute("aria-pressed", String(x === c))); } }
    apply();
  });

  /* ---------- inquiry forms → email draft ---------- */
  $$(".draft-form").forEach(form => {
    const review = document.getElementById(form.dataset.review);
    const err = $(".form-error", form);
    const handoff = store.get("citypulse-handoff");
    if (handoff && form.dataset.handoff !== undefined) {
      Object.entries(handoff).forEach(([k, v]) => { const f = form.elements[k]; if (f && !f.value) f.value = v; });
      store.del("citypulse-handoff");
    }
    params.forEach((v, k) => {
      const f = form.elements[k]; if (!f) return;
      if (f.tagName === "SELECT") { const o = [...f.options].find(o => o.value === v || o.text === v); if (o) f.value = o.value; }
      else if (!f.value) f.value = v;
    });
    function labelFor(el) {
      if (el.dataset.label) return el.dataset.label;
      const l = el.closest("label"); if (!l) return el.name;
      const c = l.cloneNode(true); $$("input,select,textarea,small,.opt", c).forEach(x => x.remove()); return c.textContent.trim();
    }
    form.addEventListener("submit", async e => {
      e.preventDefault();
      let bad = null;
      $$("[aria-invalid]", form).forEach(x => x.removeAttribute("aria-invalid"));
      $$("[required]", form).forEach(el => {
        const ok = el.type === "checkbox" ? el.checked : el.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) : el.value.trim() !== "";
        if (!ok) { el.setAttribute("aria-invalid", "true"); if (!bad) bad = el; }
      });
      if (bad) {
        err.textContent = bad.type === "checkbox" ? "Tick the confirmation box to continue." : `Add ${labelFor(bad).toLowerCase()} to continue.`;
        err.hidden = false; bad.focus(); return;
      }
      err.hidden = true;
      const lines = [], fields = {};
      $$("input,select,textarea", form).forEach(el => {
        if (!el.name || el.type === "checkbox" || el.type === "radio" && !el.checked) return;
        const v = el.value.trim(); if (!v) return;
        if (el.name === "_gotcha") { fields._gotcha = v; return; }
        const L = labelFor(el).replace(/[?:]$/, "");
        lines.push(el.tagName === "TEXTAREA" ? `\n${L}:\n${v}` : `${L}: ${v}`);
        if (el.type === "email") fields.email = v; else fields[L] = v;
      });
      const nameField = form.elements[form.dataset.subjectField || "Business"] || form.elements["Venue name"] || form.elements["Venue / business"];
      const subject = form.dataset.subject + (nameField && nameField.value.trim() ? ` — ${nameField.value.trim()}` : "");
      const body = `Hello CityPulse team,\n\n${lines.join("\n")}\n\nThank you.`;
      review.dataset.subject = subject; review.dataset.body = body;
      $("pre", review).textContent = `To: ${form.dataset.to}\nSubject: ${subject}\n\n${body}`;
      const btn = $("button[type=submit]", form), api = window.CityPulse;
      let sent = false;
      if (api && api.formsReady()) {
        btn.disabled = true; const t = btn.textContent; btn.textContent = "Sending…";
        sent = await api.send(Object.assign({ _subject: subject }, fields));
        btn.disabled = false; btn.textContent = t;
      }
      review.classList.toggle("sent", sent);
      $("h3", review).textContent = sent ? "Thanks — your message is on its way." : "Your email is ready.";
      $(".review-lede", review).textContent = sent
        ? `We'll reply to ${fields.email || "you"} within one business day. Need us sooner? Call 602-975-5513.`
        : (api && api.formsReady() ? "We couldn't send it automatically just now. Open it in your email app and press send — or copy it." : "Check the details, then open it in your email app and press send. You can also copy or save it.");
      form.hidden = true; review.hidden = false; review.scrollIntoView({ behavior: "smooth", block: "start" });
      $("h3", review).focus();
    });
    if (review) {
      $$("[data-draft]", review).forEach(b => b.addEventListener("click", async () => {
        const a = b.dataset.draft, s = review.dataset.subject, body = review.dataset.body;
        if (a === "open") location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(body)}`;
        if (a === "copy") { const ok = await copy(`Subject: ${s}\n\n${body}`); const m = $(".copied", review); m.textContent = ok ? "Copied to your clipboard." : "Couldn't copy. Select the text above instead."; }
        if (a === "download") download("citypulse-inquiry.txt", `To: ${form.dataset.to}\nSubject: ${s}\n\n${body}`);
        if (a === "edit") { review.hidden = true; form.hidden = false; form.querySelector("input,select,textarea").focus(); }
      }));
    }
  });

  /* ---------- campaign ideas data (planner + studio presets) ---------- */
  const IDEAS = {
    "dinner-nearby": { brand: "Willow Kitchen", headline: "A good evening starts nearby.", action: "Explore the menu", color: "forest", goal: "Visits / local discovery", category: "Dining & entertainment", setting: "Hotels & hospitality", message: "Introduce a welcoming dinner option with a useful menu link." },
    "weekend-experience": { brand: "Mesa Trail Tours", headline: "A little adventure. Close by.", action: "View the experience", color: "sunset", goal: "Visits / local discovery", category: "Travel & local experiences", setting: "Hotels & hospitality", message: "Give visitors a starting point for an experience they can plan from the lobby." },
    "service-reminder": { brand: "Northside Auto Care", headline: "Your next service, made simple.", action: "See service options", color: "cobalt", goal: "Calls / inquiries", category: "Automotive services", setting: "Car dealerships", message: "Explain one service and give customers a clear way to learn more." },
    "new-opening": { brand: "Juniper Market", headline: "Meet your new local favorite.", action: "Plan a visit", color: "forest", goal: "Local awareness", category: "Retail & lifestyle", setting: "Hotels & hospitality", message: "Help people discover a new shop and what makes a visit worthwhile." },
    "local-event": { brand: "Riverwalk Sessions", headline: "Your Friday plans, found.", action: "See event details", color: "sunset", goal: "Visits / local discovery", category: "Events & community", setting: "Restaurants & venues", message: "Introduce a local event with a clear date and a useful details page." },
    "local-service": { brand: "Oakwell Dental", headline: "A local team to know.", action: "Meet the practice", color: "cobalt", goal: "Calls / inquiries", category: "Medical & wellness", setting: "Medical offices", message: "Introduce a practice with straightforward information and a clear next step." },
    "family-day": { brand: "Little Canyon Discovery", headline: "Big ideas for a family day.", action: "Explore a day out", color: "sunset", goal: "Visits / local discovery", category: "Travel & local experiences", setting: "Hotels & hospitality", message: "Make a nearby family activity easy to discover and understand." },
    "takeaway-next": { brand: "Corner Cup & Co.", headline: "Something good for the way home.", action: "View the menu", color: "lamp", goal: "Offer / QR engagement", category: "Dining & entertainment", setting: "Car dealerships", message: "Introduce a nearby cafe or takeaway option for a visitor planning the next stop." }
  };

  /* ---------- campaign planner ---------- */
  const planner = $("#planner");
  if (planner) {
    const steps = $$(".pstep", planner), marks = $$(".planner-steps li");
    const back = $("[data-plan=back]"), next = $("[data-plan=next]"), label = $("[data-plan=label]");
    let cur = 0;
    const idea = IDEAS[params.get("idea")];
    if (idea) {
      const set = (n, v) => { const f = planner.elements[n]; if (!f) return; if (f instanceof RadioNodeList) { [...f].forEach(r => { r.checked = r.value === v; }); } else f.value = v; };
      set("Campaign goal", idea.goal); set("Business category", idea.category); set("Venue setting", idea.setting); set("Message / offer", idea.message);
    }
    const fields = () => {
      const out = [];
      $$("input,select,textarea", planner).forEach(el => {
        if (!el.name || (el.type === "radio" && !el.checked)) return;
        const v = el.value.trim(); if (v) out.push([el.dataset.label || el.name, v]);
      });
      return out;
    };
    function show(i) {
      if (i > cur) {
        const req = $$("[data-need]", steps[cur]).find(el => el.type === "radio" ? !$$(`[name="${el.name}"]`, planner).some(r => r.checked) : !el.value.trim());
        if (req) { const e = $(".form-error", steps[cur]); e.textContent = req.dataset.need; e.hidden = false; req.focus(); return; }
        const e = $(".form-error", steps[cur]); if (e) e.hidden = true;
      }
      cur = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, j) => { s.hidden = j !== cur; });
      marks.forEach((m, j) => { m.classList.toggle("on", j === cur); m.classList.toggle("done", j < cur); });
      back.disabled = cur === 0; next.hidden = cur === steps.length - 1;
      label.textContent = `Step ${cur + 1} of ${steps.length}`;
      if (cur === steps.length - 1) {
        $("#brief-out").innerHTML = fields().map(([k, v]) => `<div><dt>${k.replace(/[<>&]/g, "")}</dt><dd>${v.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c])}</dd></div>`).join("");
      }
      const h = $("h2", steps[cur]); if (h && i !== 0) { h.tabIndex = -1; h.focus(); }
    }
    back.addEventListener("click", () => show(cur - 1));
    next.addEventListener("click", () => show(cur + 1));
    const briefText = () => "CITYPULSE CAMPAIGN BRIEF\n\n" + fields().map(([k, v]) => `${k}: ${v}`).join("\n");
    $("[data-plan=download]").addEventListener("click", () => download("citypulse-campaign-brief.txt", briefText()));
    $("[data-plan=inquiry]").addEventListener("click", () => {
      const f = Object.fromEntries(fields());
      store.set("citypulse-handoff", { "Business": f["Business"] || "", "Category": f["Business category"] || "", "Target city / state": f["Target city / state"] || "", "Goal": f["Campaign goal"] || "", "Notes": briefText() });
      location.href = planner.dataset.next;
    });
    show(0);
  }

  /* ---------- phones: a sticky "Get started" bar once the hero is out of view ---------- */
  const mcta = $("#m-cta");
  if (mcta) {
    const blockers = $$("#get-started, .cta-band, .site-footer, .checkout");
    let seen = new Set();
    const sync = () => mcta.classList.toggle("on", window.scrollY > 520 && seen.size === 0);
    if ("IntersectionObserver" in window && blockers.length) {
      const io = new IntersectionObserver(es => { es.forEach(en => en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)); sync(); }, { rootMargin: "0px 0px -10% 0px" });
      blockers.forEach(b => io.observe(b));
    }
    window.addEventListener("scroll", sync, { passive: true }); sync();
  }

  /* ---------- Lexen-style mini screens: show the real time ---------- */
  const lxTick = () => {
    const d = new Date(), h = d.getHours(), hh = h % 12 || 12, mm = String(d.getMinutes()).padStart(2, "0");
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const day = d.toLocaleDateString("en-US", { weekday: "long" }), date = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    $$(".lx-clock").forEach(c => {
      const t = $(".lx-time", c), dt = $(".lx-date", c), g = $("s", c);
      if (t) t.innerHTML = `${hh}:${mm}<sup>${h < 12 ? "AM" : "PM"}</sup>`;
      if (dt) dt.innerHTML = `${day}<br>${date}`;
      if (g) g.textContent = greet;
    });
  };
  lxTick(); setInterval(lxTick, 30000);

  /* ---------- creative studio ---------- */
  const studio = $("#studio");
  if (studio) {
    const COLORS = { forest: ["#1F4433", false], sunset: ["linear-gradient(135deg,#c2502f,#f2a65b)", false], cobalt: ["linear-gradient(135deg,#1c3f8a,#3f7ad8)", false], lamp: ["#22C7B6", true] };
    const SVGBG = { forest: "#1F4433", sunset: "#D9703F", cobalt: "#2557B0", lamp: "#22C7B6" };
    const f = studio.elements, pv = $("#studio-preview");
    const presets = $$("[data-preset]");
    function load(id) {
      const d = IDEAS[id]; if (!d) return;
      f.brand.value = d.brand; f.headline.value = d.headline; f.action.value = d.action;
      const r = [...f.color].find(x => x.value === d.color); if (r) r.checked = true;
      presets.forEach(p => p.setAttribute("aria-pressed", String(p.dataset.preset === id)));
      draw();
    }
    const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    function draw() {
      const col = f.color.value, [bg, light] = COLORS[col], fmt = f.format.value;
      const n = f.headline.value.length, cnt = $("#hl-count"); cnt.textContent = `${n} of 65 characters`; cnt.classList.toggle("over", n > 65);
      const ad = `<div class="studio-ad${light ? " light" : ""}" style="--sbg:${bg}"><span class="sa-brand">${esc(f.brand.value || "Your business")}</span><span class="sa-head">${esc(f.headline.value || "Your headline")}</span><span class="sa-cta">${esc(f.action.value || "Learn more")}${f.url.value ? " ↗" : ""}</span></div>`;
      const fmtName = { tile: "Kiosk ad space · bottom of screen", banner: "Featured banner · landscape", panel: "Rotating panel · landscape" }[fmt];
      $("#fmt-label").textContent = fmtName;
      if (fmt === "tile" && $("#studio-lx")) {
        const k = $("#studio-lx").content.firstElementChild.cloneNode(true);
        $(".lx-slot", k).outerHTML = ad.replace("</div>", '<span class="sa-tag">Your ad</span></div>');
        pv.replaceChildren(k); lxTick();
      } else pv.innerHTML = `<div class="studio-wide">${ad}</div>`;
      const link = $("#studio-link");
      if (/^https?:\/\//i.test(f.url.value.trim())) { link.href = f.url.value.trim(); link.hidden = false; } else link.hidden = true;
    }
    studio.addEventListener("input", draw); studio.addEventListener("change", draw);
    presets.forEach(p => p.addEventListener("click", () => load(p.dataset.preset)));
    $("[data-studio=download]").addEventListener("click", () => {
      const col = f.color.value, light = COLORS[col][1], fg = light ? "#1B1F1D" : "#FFFFFF";
      const tall = f.format.value === "tile", W = tall ? 1080 : 1920, H = tall ? 480 : 1080;
      const words = (f.headline.value || "Your headline").split(/\s+/), lines = []; let line = "";
      const max = tall ? 26 : 24;
      words.forEach(w => { if ((line + " " + w).trim().length > max) { lines.push(line.trim()); line = w; } else line += " " + w; }); lines.push(line.trim());
      const fs = tall ? 72 : 112;
      const x = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${SVGBG[col]}"/>
<circle cx="${W - 60}" cy="60" r="${tall ? 160 : 300}" fill="none" stroke="${fg}" stroke-opacity=".14" stroke-width="${tall ? 80 : 100}"/>
<text x="90" y="${tall ? 100 : 140}" font-family="Helvetica, Arial, sans-serif" font-size="48" font-weight="600" fill="${fg}">${x(f.brand.value || "Your business")}</text>
${lines.map((l, i) => `<text x="90" y="${(tall ? 200 : 380) + i * fs * 1.08}" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" font-weight="800" fill="${fg}">${x(l)}</text>`).join("\n")}
<text x="90" y="${H - (tall ? 60 : 110)}" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="600" fill="${fg}" text-decoration="underline">${x(f.action.value || "Learn more")}</text>
<text x="${W - 90}" y="${H - 60}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${fg}" fill-opacity=".7">CityPulse Kiosks creative concept</text>
</svg>`;
      download("citypulse-creative-concept.svg", svg, "image/svg+xml");
    });
    const startIdea = params.get("idea");
    if (startIdea && IDEAS[startIdea]) load(startIdea); else draw();
  }

  /* ---------- pricing calculator ---------- */
  const calc = $("#calc");
  if (calc) {
    const r = $("#n-range"), num = $("#n-num"), pre = $$("[data-preset-n]", calc), tiers = $$("#tiers li");
    const PR = window.CP_PRICE || { sale: false, now: { y1: 798, y3: 2198, y5: 2400, extra: 600, mo: 120 }, reg: { y1: 798, y3: 2198, y5: 2400, extra: 600, mo: 120 }, money: function (n) { return "$" + Math.round(n).toLocaleString("en-US"); } }, P = PR.now, G = PR.reg;
    const money = n => "$" + Math.round(n).toLocaleString("en-US");
    const tier = (p, n) => n <= 1 ? p.y1 : n <= 3 ? p.y3 : n <= 5 ? p.y5 : p.y5 + p.extra * (n - 5);
    const annual = n => tier(P, n);
    const label = n => n <= 1 ? "Single location" : n <= 3 ? `3-location package${n === 2 ? " (covers up to 3)" : ""}` : n <= 5 ? `5-location package${n === 4 ? " (covers up to 5)" : ""}` : `5-location package + ${n - 5} extra location${n - 5 > 1 ? "s" : ""} × ${money(P.extra)}`;
    let N = 5;
    function sync(src) {
      const raw = parseInt(src === num ? num.value : r.value, 10);
      if (isNaN(raw)) return;
      N = Math.max(1, Math.min(100, raw));
      if (src !== num) num.value = N;
      r.value = Math.min(50, N);
      const A = annual(N), M = P.mo * N;
      $("#c-total").innerHTML = `${PR.sale ? `<s class="cp-was">${money(tier(G, N))}</s> ` : ""}${money(A)}<small>/ year</small>`;
      $("#c-eq").textContent = label(N);
      $("#c-per").textContent = money(A / N);
      $("#c-month").textContent = `${money(M)}/mo`;
      $("#c-save").textContent = `${money(M * 12 - A)} vs. monthly`;
      const t = N <= 1 ? "1" : N <= 3 ? "3" : N <= 5 ? "5" : "6";
      tiers.forEach(li => li.classList.toggle("on", li.dataset.tier === t));
      pre.forEach(p => p.setAttribute("aria-pressed", String(+p.dataset.presetN === N)));
    }
    r.addEventListener("input", () => sync(r));
    num.addEventListener("input", () => sync(num));
    num.addEventListener("blur", () => { num.value = N; });
    pre.forEach(p => p.addEventListener("click", () => { r.value = p.dataset.presetN; num.value = p.dataset.presetN; sync(num); }));
    $("[data-calc=carry]").addEventListener("click", () => {
      const opt = N <= 1 ? `1 location — ${money(P.y1)}/yr` : N <= 3 ? `3 locations — ${money(P.y3)}/yr` : N <= 5 ? `5 locations — ${money(P.y5)}/yr` : `More than 5 locations — ${money(P.y5)} + ${money(P.extra)} per extra location/yr`;
      store.set("citypulse-handoff", { "Pricing": opt, "Notes": `Estimate for ${N} location${N > 1 ? "s" : ""}: ${label(N)} = ${money(annual(N))}/year (or ${money(P.mo * N)}/month)${PR.sale ? ` at launch-sale prices (${PR.off}% off through ${PR.end})` : ""}. Please confirm available venues and a quote.` });
      location.href = calc.dataset.next;
    });
    sync(num);
  }

  /* ---------- host checklist ---------- */
  const cl = $("#checklist");
  if (cl) {
    const boxes = $$("input[type=checkbox]", cl), out = $(".progress", cl);
    const upd = () => { const n = boxes.filter(b => b.checked).length; out.textContent = n === boxes.length ? "All set. You're ready for a venue conversation." : `${n} of ${boxes.length} details ready`; };
    boxes.forEach(b => b.addEventListener("change", upd)); upd();
  }

  /* ---------- media overview download ---------- */
  const mo = $("[data-download-overview]");
  if (mo) mo.addEventListener("click", () => {
    const rows = $$("#overview div").map(d => `${$("dt", d).textContent}\n${$("dd", d).textContent.trim()}\n`);
    download("citypulse-media-overview.txt", `CITYPULSE KIOSKS — MEDIA OVERVIEW\n\n${rows.join("\n")}\nsales@citypulsekiosks.com · 602-975-5513\n`);
  });

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- motion: the live city hero, scroll-in reveals, pulsing map pins ---------- */
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.replace(/site\.js(\?.*)?$/, "") : null;

  // Home hero: load the 3D city only on the home page (three.js stays off every other page).
  var hero = document.querySelector(".hero2");
  if (hero && base && "IntersectionObserver" in window) {
    var conn = navigator.connection || {};
    if (!conn.saveData) import(base + "city-pulse.js?v=20261012").catch(function () {});
  }

  if (reduce || !("IntersectionObserver" in window)) return;

  // Reveal sections as they scroll in. Only things below the first screen start hidden.
  var sel = [".section-head", ".demo-head", ".tools > *", ".concepts > *", ".price-cards > *", ".step-list > *",
    ".jump-grid > *", ".usmap", ".faq-list", ".co-grid", ".paths > *", ".tabs", ".cta-inner", ".hero-photo",
    ".metric-list > li", ".loc-list > *", ".card-grid > *", ".pkg-notes > *", ".journey"].join(",");
  var fold = innerHeight * 0.92, items = [];
  document.querySelectorAll("main " + sel).forEach(function (el) {
    if (el.closest(".hero2") || el.getBoundingClientRect().top < fold) return;
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.classList.add("rv"); el.style.setProperty("--rv-d", Math.min(sib, 5) * 70 + "ms"); items.push(el);
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting) return; var el = e.target; el.classList.add("in"); io.unobserve(el);
      setTimeout(function () { el.classList.remove("rv", "in"); el.style.removeProperty("--rv-d"); }, 1300); });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach(function (el) { io.observe(el); });

  // US map: host pins send out pulses, a few at a time, while the map is on screen.
  var map = document.querySelector(".usmap svg");
  if (map) {
    var pins = map.querySelectorAll(".pin"), timer = 0, NS = "http://www.w3.org/2000/svg";
    var ping = function () {
      if (!pins.length) return;
      var p = pins[Math.floor(Math.random() * pins.length)], c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", p.getAttribute("cx")); c.setAttribute("cy", p.getAttribute("cy"));
      c.setAttribute("r", (p.classList.contains("multi") ? 9 : 7) / Math.sqrt(window.CP_MAPZ || 1)); c.setAttribute("class", "pin-ping");
      p.parentNode.insertBefore(c, p);
      setTimeout(function () { c.remove(); }, 2200);
    };
    new IntersectionObserver(function (es) {
      clearInterval(timer);
      if (es[0].isIntersecting) timer = setInterval(function () { ping(); if (Math.random() < 0.5) ping(); }, 520);
    }).observe(map);
  }
})();

/* ---------- How it works: the film (plays by itself, loops, pauses off-screen) ---------- */
(function () {
  var f = document.querySelector("[data-film]"); if (!f) return;
  var stage = f.querySelector(".film-stage"), canvas = f.querySelector(".film-canvas");
  var steps = [].slice.call(f.querySelectorAll(".film-steps li")), segs = [].slice.call(f.querySelectorAll(".film-seg i"));
  var ad = f.querySelector(".f-ad"), hl = f.querySelector(".f-ad-hl"), typ = f.querySelector(".f-type");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DUR = [4200, 3800, 4600, 3900, 4800, 5600, 5200];
  // where the ad sits in each scene (stage pixels in the 3840-wide world): x, y, scale, visible
  var AD = { 1: [402, 404, .6, 0], 2: [402, 404, .6, 0], 3: [402, 404, .6, 1], 4: [402, 404, .6, 0], 5: [1310, 140, 1, 1], 6: [2321, 313, .608, 1], 7: [2321, 313, .608, 1] };

  function fit() {
    var w = stage.clientWidth, narrow = w < 560, vw = narrow ? 620 : 960, s = w / vw;
    stage.style.aspectRatio = "auto"; stage.style.height = Math.round(540 * s) + "px";
    canvas.style.transform = "scale(" + s + ")" + (narrow ? " translateX(-170px)" : "");
  }
  fit();
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(stage); else addEventListener("resize", fit);

  function placeAd(n) { var a = AD[n]; ad.style.transform = "translate(" + a[0] + "px," + a[1] + "px) scale(" + a[2] + ")"; ad.style.opacity = a[3]; }
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function type(el, text, start, speed) { el.textContent = ""; for (var i = 0; i <= text.length; i++) (function (k) { later(function () { el.textContent = text.slice(0, k); }, start + k * speed); })(i); }
  function count(el, to, start, ms) { el.textContent = "0"; var t0; later(function () { t0 = performance.now(); (function tick(now) { var p = Math.min(1, ((now || performance.now()) - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US"); if (p < 1 && running) requestAnimationFrame(tick); else if (p >= 1) el.textContent = to.toLocaleString("en-US"); })(t0); }, start); }

  function mark(n) {
    steps.forEach(function (li, i) { li.classList.toggle("on", i === n - 1); li.classList.toggle("done", i < n - 1); li.classList.remove("run"); li.style.setProperty("--dur", DUR[i] + "ms"); });
    segs.forEach(function (s, i) { s.classList.toggle("done", i < n - 1); s.classList.remove("on"); s.style.setProperty("--dur", DUR[i] + "ms"); });
    void f.offsetWidth; // restart the progress bars
    if (!reduce) { steps[n - 1].classList.add("run"); if (segs[n - 1]) segs[n - 1].classList.add("on"); }
  }

  var scene = 0, running = false;
  function go(n) {
    clear(); scene = n;
    if (n === 1) { f.classList.add("reset"); hl.textContent = ""; placeAd(1); void f.offsetWidth; f.classList.remove("reset"); }
    f.dataset.scene = n; mark(n); placeAd(n);
    if (n === 1) type(typ, typ.dataset.type, 500, 85);
    if (n === 3) type(hl, hl.dataset.hl, 2300, 55);
    if (n === 7) f.querySelectorAll(".f-kpis b").forEach(function (b, i) { count(b, +b.dataset.to, 500 + i * 180, 1700); });
    later(function () { go(n % 7 + 1); }, DUR[n - 1]);
  }
  function play() { if (running) return; running = true; go(scene || 1); }
  function pause() { running = false; clear(); }

  if (reduce || !("IntersectionObserver" in window)) {
    // still frame: the ad live on the kiosk, every chapter listed
    hl.textContent = hl.dataset.hl; typ.textContent = typ.dataset.type; placeAd(6); mark(6);
    f.querySelectorAll(".f-kpis b").forEach(function (b) { b.textContent = (+b.dataset.to).toLocaleString("en-US"); });
    return;
  }
  hl.textContent = hl.dataset.hl; placeAd(6); mark(6);
  var visible = false;
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible && !document.hidden ? play() : pause(); }, { threshold: 0.35 }).observe(stage);
  document.addEventListener("visibilitychange", function () { document.hidden || !visible ? pause() : play(); });
})();
