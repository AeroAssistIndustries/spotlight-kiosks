/* CityPulse kiosk slideshow. Plays pictures and videos from a USB stick (or any files the kiosk can open).
   Nothing is uploaded: the files stay on the device. Taps on the left or right edge move back and forward. */
(function () {
  "use strict";
  const app = document.getElementById("show-app");
  if (!app) return;
  const SECONDS = 8;
  let items = [], idx = 0, timer = null, urls = [];

  function start() {
    app.innerHTML = `
      <div class="kshow-wrap">
        <div class="kshow-start">
          <h1>CityPulse</h1>
          <p>Plug in a USB stick with pictures or videos, then choose the files to show on this screen.</p>
          <label>Choose files<input type="file" id="show-files" accept="image/*,video/mp4,video/webm" multiple></label>
        </div>
      </div>`;
    document.getElementById("show-files").addEventListener("change", e => load(Array.from(e.target.files)));
  }

  function load(files) {
    urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
    items = files.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map(f => { const u = URL.createObjectURL(f); urls.push(u); return { type: f.type.startsWith("video/") ? "video" : "image", src: u }; });
    if (!items.length) { start(); alert("No pictures or videos found on that stick."); return; }
    idx = 0; render();
  }

  function render() {
    clearTimeout(timer);
    app.innerHTML = `
      <div class="kshow-wrap">
        <div class="kshow-stage" id="kshow-stage"></div>
        <button class="kshow-tap prev" id="kp" aria-label="Previous"></button>
        <button class="kshow-tap next" id="kn" aria-label="Next"></button>
        <div class="kshow-dots" id="kdots"></div>
        <div class="kshow-bar"><button id="kfull" type="button">Full screen</button><button id="kchange" type="button">Change files</button></div>
      </div>`;
    const stage = document.getElementById("kshow-stage");
    items.forEach((it, i) => {
      const el = document.createElement(it.type === "video" ? "video" : "img");
      el.src = it.src; el.dataset.i = i;
      if (it.type === "video") { el.muted = true; el.playsInline = true; el.preload = "auto"; el.addEventListener("ended", next); }
      stage.appendChild(el);
    });
    document.getElementById("kdots").innerHTML = items.map(() => "<span></span>").join("");
    document.getElementById("kp").addEventListener("click", () => go(idx - 1));
    document.getElementById("kn").addEventListener("click", next);
    document.getElementById("kfull").addEventListener("click", () => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); });
    document.getElementById("kchange").addEventListener("click", () => { clearTimeout(timer); start(); });
    show();
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
    clearTimeout(timer);
    if (items[idx].type === "image") timer = setTimeout(next, SECONDS * 1000);
  }

  start();
})();
