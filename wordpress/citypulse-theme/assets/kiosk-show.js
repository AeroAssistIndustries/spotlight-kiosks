/* CityPulse kiosk player.
   - On the WordPress site ([citypulse_kiosk_player]): pulls the pictures and videos chosen for this kiosk,
     refreshes every 10 minutes, and checks in every 5 minutes with the device token.
   - On any page without a site address (e.g. the GitHub demo): plays files from a USB stick.
   Setup (kiosk slug and device token) is saved on the device. Nothing is sent anywhere except the site. */
(function () {
  "use strict";
  const app = document.getElementById("show-app");
  if (!app) return;
  const AJAX = app.dataset.ajax || "";
  const GITHUB = app.dataset.github || ""; // public content folder on GitHub (demo mode)
  const MEDIA = /\.(jpe?g|png|webp|gif|mp4|webm|json)$/i;
  const KEY = "cp-kiosk-setup";
  const SECONDS = 8;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let items = [], idx = 0, timer = null, refresh = null, checkin = null, urls = [], shown = "";

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const store = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };

  function frame(inner) {
    app.innerHTML = `<div class="kshow-wrap"><div class="kshow-start">${inner}</div></div>`;
  }

  function setupForm(msg) {
    frame(`<h1>CityPulse</h1><p>${esc(msg || "Enter this kiosk's name and device token (from WordPress). The kiosk remembers them.")}</p>
      <form id="ks-form" class="kshow-form" autocomplete="off">
        <input name="kiosk" placeholder="kiosk name, e.g. hotel-lobby" required>
        <input name="token" placeholder="device token" required>
        <button class="btn" type="submit">Save and start</button>
      </form>
      ${AJAX ? "" : `<p><label id="usb-open">Use files from a USB stick</label></p>`}`);
    document.getElementById("ks-form").addEventListener("submit", e => {
      e.preventDefault();
      const f = e.target;
      store({ kiosk: f.kiosk.value.trim(), token: f.token.value.trim() });
      start();
    });
    const u = document.getElementById("usb-open");
    if (u) u.addEventListener("click", usbPicker);
  }

  function usbPicker() {
    frame(`<h1>CityPulse</h1><p>Plug in a USB stick with pictures or videos, then choose the files.</p>
      <label>Choose files<input type="file" id="show-files" accept="image/*,video/mp4,video/webm" multiple></label>`);
    document.getElementById("show-files").addEventListener("change", e => {
      const files = Array.from(e.target.files).filter(f => /^(image|video)\//.test(f.type))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      if (!files.length) { usbPicker(); return; }
      urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
      play(files.map(f => { const u = URL.createObjectURL(f); urls.push(u); return { type: f.type.indexOf("video/") === 0 ? "video" : "image", url: u }; }));
    });
  }

  function play(list) {
    const key = JSON.stringify(list.map(i => i.url || i.data));
    if (key === shown && items.length) return; // same content: keep playing without restarting
    shown = key; items = list; idx = 0;
    if (!items.length) {
      const gh = GITHUB && !AJAX;
      frame(`<h1>CityPulse</h1><p>${gh ? "No content yet. Upload pictures or videos to the content folder on GitHub (see the README in that folder)." : "No content yet. It will appear here when it is added in WordPress."}</p>
        ${gh ? '<p><a class="btn" href="https://github.com/AeroAssistIndustries/spotlight-kiosks/tree/main/content" target="_blank" rel="noopener">Open the content folder</a></p>' : ""}`);
      return;
    }
    app.innerHTML = `
      <div class="kshow-wrap">
        <div class="kshow-stage" id="kshow-stage"></div>
        <button class="kshow-tap prev" id="kp" aria-label="Previous"></button>
        <button class="kshow-tap next" id="kn" aria-label="Next"></button>
        <div class="kshow-dots" id="kdots"></div>
        <div class="kshow-bar"><button id="kfull" type="button">Full screen</button>${AJAX ? "" : '<button id="kchange" type="button">Use USB</button>'}</div>
      </div>`;
    const stage = document.getElementById("kshow-stage");
    items.forEach((it, i) => {
      if (it.type === "interactive") { stage.appendChild(interactiveEl(it.data)); return; }
      const el = document.createElement(it.type === "video" ? "video" : "img");
      el.src = it.url; el.dataset.i = i; el.alt = "";
      if (it.type === "video") { el.muted = true; el.playsInline = true; el.preload = "auto"; el.addEventListener("ended", next); }
      stage.appendChild(el);
    });
    document.getElementById("kdots").innerHTML = items.map(() => "<span></span>").join("");
    document.getElementById("kp").addEventListener("click", () => go(idx - 1));
    document.getElementById("kn").addEventListener("click", next);
    document.getElementById("kfull").addEventListener("click", () => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); });
    const kc = document.getElementById("kchange");
    if (kc) kc.addEventListener("click", usbPicker);
    show();
  }

  /** Touch screen: a title, tappable cards, and details. Returns to the next slide after 60 seconds without a touch. */
  function interactiveEl(data) {
    const d = document.createElement("div");
    d.className = "kshow-interactive";
    const cards = Array.isArray(data.cards) ? data.cards.slice(0, 8) : [];
    d.innerHTML = `<div class="ki-inner"><h2>${esc(data.title || "")}</h2><p>${esc(data.intro || "")}</p>
      <div class="ki-grid">${cards.map((c, i) => `<button class="ki-card" type="button" data-i="${i}"><strong>${esc(c.title || "")}</strong><span>${esc(c.short || "Tap to learn more")}</span></button>`).join("")}</div>
      <div class="ki-detail" hidden></div></div>`;
    d.addEventListener("click", e => {
      const det = d.querySelector(".ki-detail");
      if (e.target.closest(".ki-back")) { det.hidden = true; touched(); return; }
      const b = e.target.closest(".ki-card");
      if (!b) return;
      const c = cards[+b.dataset.i] || {};
      det.hidden = false;
      det.innerHTML = `<h3>${esc(c.title || "")}</h3><p>${esc(c.detail || "")}</p><button class="ki-back" type="button">Back</button>`;
      touched();
    });
    return d;
  }

  function touched() {
    if (items[idx] && items[idx].type === "interactive") { clearTimeout(timer); timer = setTimeout(next, 60 * 1000); }
  }

  function next() { go(idx + 1); }
  function go(i) { idx = (i + items.length) % items.length; show(); }

  function show() {
    const els = Array.from(document.querySelectorAll("#kshow-stage > *"));
    els.forEach((el, i) => {
      el.classList.toggle("on", i === idx);
      if (el.tagName === "VIDEO") { if (i === idx) { el.currentTime = 0; el.play().catch(() => {}); } else el.pause(); }
    });
    document.querySelectorAll("#kdots span").forEach((s, i) => s.classList.toggle("on", i === idx));
    const cur = items[idx] || {};
    document.querySelectorAll(".kshow-tap").forEach(t => { t.style.display = cur.type === "interactive" ? "none" : ""; });
    clearTimeout(timer);
    if (cur.type === "image") timer = setTimeout(next, SECONDS * 1000);
    if (cur.type === "interactive") touched();
  }

  function post(fields) {
    return fetch(AJAX, { method: "POST", credentials: "same-origin", body: new URLSearchParams(fields) }).then(r => r.json());
  }

  function fetchContent(setup) {
    post({ action: "citypulse_media", kiosk: setup.kiosk, token: setup.token })
      .then(res => {
        if (!res.success) { setupForm("This kiosk name or token was not accepted. Check them in WordPress."); return; }
        if (!res.data.items.length) { play([]); setTimeout(() => fetchContent(setup), 120000); return; }
        play(res.data.items);
      })
      .catch(() => { frame(`<h1>CityPulse</h1><p>Waiting for the connection. Trying again shortly.</p>`); setTimeout(() => fetchContent(setup), 60000); });
  }

  function fetchGitHub() {
    fetch(GITHUB, { headers: { Accept: "application/vnd.github+json" } })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(list => {
        const files = (Array.isArray(list) ? list : []).filter(f => f.type === "file" && MEDIA.test(f.name))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        return Promise.all(files.map(f => {
          if (/\.json$/i.test(f.name)) {
            return fetch(f.download_url).then(r => r.json()).then(d => (d && d.type === "interactive") ? { type: "interactive", data: d } : null).catch(() => null);
          }
          return Promise.resolve({ type: /\.(mp4|webm)$/i.test(f.name) ? "video" : "image", url: f.download_url });
        }));
      })
      .then(list => play(list.filter(Boolean)))
      .catch(() => { frame(`<h1>CityPulse</h1><p>Waiting for the connection. Trying again shortly.</p><p><label id="usb-open">Use files from a USB stick</label></p>`); const u = document.getElementById("usb-open"); if (u) u.addEventListener("click", usbPicker); });
  }

  function heartbeat(setup) {
    post({ action: "citypulse_heartbeat", kiosk: setup.kiosk, token: setup.token, version: "kiosk-player-1" }).catch(() => {});
  }

  function start() {
    if (GITHUB && !AJAX) { fetchGitHub(); refresh = setInterval(fetchGitHub, 10 * 60 * 1000); return; }
    if (!AJAX) { usbPicker(); return; } // no site address: USB only
    const setup = load();
    if (!setup || !setup.kiosk || !setup.token) { setupForm(); return; }
    clearInterval(refresh); clearInterval(checkin);
    fetchContent(setup);
    heartbeat(setup);
    refresh = setInterval(() => fetchContent(setup), 10 * 60 * 1000);
    checkin = setInterval(() => heartbeat(setup), 5 * 60 * 1000);
    try { if (navigator.wakeLock) navigator.wakeLock.request("screen").catch(() => {}); } catch (e) { /* not supported */ }
  }

  start();
})();
