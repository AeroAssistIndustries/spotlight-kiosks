/* CityPulse Digital — home hero "signal field": a live network of search, review, social and map
   signals flowing toward the business, plus live notifications and a typing search demo. */
(function () {
  "use strict";
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- canvas network ---------- */
  const cv = document.createElement("canvas");
  cv.className = "hero-fx";
  hero.insertBefore(cv, hero.firstChild);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, nodes = [], packets = [], mouse = { x: -1e4, y: -1e4 }, running = true, t0 = performance.now();
  const COLORS = ["46,242,226", "124,108,255", "255,79,216"];

  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(45, (W * H) / 16000)));
    nodes = [];
    for (let i = 0; i < n; i++) nodes.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: 1 + Math.random() * 1.8, c: COLORS[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0], ph: Math.random() * Math.PI * 2
    });
  }
  function hub() { return { x: W * (W > 980 ? .72 : .5), y: H * (W > 980 ? .45 : .35) }; }
  function spawnPacket() {
    const a = nodes[(Math.random() * nodes.length) | 0], h = hub();
    packets.push({ x: a.x, y: a.y, sx: a.x, sy: a.y, tx: h.x + (Math.random() - .5) * 120, ty: h.y + (Math.random() - .5) * 120, p: 0, sp: .004 + Math.random() * .006, c: a.c });
  }
  function frame(now) {
    if (!running) return;
    const dt = Math.min(40, now - (frame.last || now)); frame.last = now;
    ctx.clearRect(0, 0, W, H);
    const h = hub(), T = (now - t0) / 1000;
    // orbit rings around the hub
    for (let k = 0; k < 3; k++) {
      const r = 90 + k * 70 + Math.sin(T * .6 + k) * 6;
      ctx.beginPath(); ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${COLORS[k]},${.10 - k * .02})`; ctx.lineWidth = 1; ctx.setLineDash([4, 10]); ctx.lineDashOffset = -T * 20 * (k % 2 ? -1 : 1); ctx.stroke(); ctx.setLineDash([]);
    }
    // nodes
    for (const n of nodes) {
      n.x += n.vx * dt * .06; n.y += n.vy * dt * .06;
      const dx = n.x - mouse.x, dy = n.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 160 * 160) { const f = (1 - Math.sqrt(d2) / 160) * .9; n.x += dx / Math.sqrt(d2 + 1) * f; n.y += dy / Math.sqrt(d2 + 1) * f; }
      if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20; if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
    }
    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 150 * 150) { ctx.strokeStyle = `rgba(${a.c},${(1 - Math.sqrt(d) / 150) * .22})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
    }
    for (const n of nodes) {
      const tw = .55 + .45 * Math.sin(T * 2 + n.ph);
      ctx.fillStyle = `rgba(${n.c},${.35 + tw * .5})`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      if (n.r > 2.2) { ctx.fillStyle = `rgba(${n.c},${.08 * tw})`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2); ctx.fill(); }
    }
    // packets travelling to the hub
    if (Math.random() < .05 && packets.length < 18) spawnPacket();
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i]; p.p += p.sp * dt * .06;
      const e = p.p < .5 ? 2 * p.p * p.p : -1 + (4 - 2 * p.p) * p.p; // easeInOutQuad
      const cx = (p.sx + p.tx) / 2 + (p.sy - p.ty) * .25, cy = (p.sy + p.ty) / 2 + (p.tx - p.sx) * .25; // curved path
      const x = (1 - e) * (1 - e) * p.sx + 2 * (1 - e) * e * cx + e * e * p.tx, y = (1 - e) * (1 - e) * p.sy + 2 * (1 - e) * e * cy + e * e * p.ty;
      ctx.strokeStyle = `rgba(${p.c},.18)`; ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.quadraticCurveTo(cx, cy, p.tx, p.ty); ctx.stroke();
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10); g.addColorStop(0, `rgba(${p.c},.95)`); g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
      if (p.p >= 1) { packets.splice(i, 1); pulse(h); }
    }
    // hub glow
    const g2 = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 220); g2.addColorStop(0, "rgba(46,242,226,.10)"); g2.addColorStop(.5, "rgba(124,108,255,.05)"); g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(h.x, h.y, 220, 0, Math.PI * 2); ctx.fill();
    for (let i = pulses.length - 1; i >= 0; i--) { const q = pulses[i]; q.r += dt * .12; q.a -= dt * .0012; if (q.a <= 0) { pulses.splice(i, 1); continue; } ctx.strokeStyle = `rgba(46,242,226,${q.a})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.stroke(); }
    requestAnimationFrame(frame);
  }
  const pulses = [];
  function pulse(h) { if (pulses.length < 6) pulses.push({ x: h.x, y: h.y, r: 4, a: .5 }); }

  if (!reduce) {
    resize(); addEventListener("resize", resize, { passive: true });
    hero.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { const on = es[0].isIntersecting; if (on && !running) { running = true; frame.last = 0; requestAnimationFrame(frame); } if (!on) running = false; }, { threshold: 0 }).observe(hero);
    requestAnimationFrame(frame);
  } else { resize(); frame.last = performance.now(); running = false; /* draw one still frame */ (function still(){ running = true; frame(performance.now()); running = false; })(); }

  /* ---------- live notifications over the visual ---------- */
  const hud = hero.querySelector(".hud");
  if (hud) {
    const FEEDS = {
      hotel: [["★", "star", "New 5-star review", "Google · 2 min ago"], ["✓", "ok", "Booked direct — $412", "Website · just now"], ["#1", "", "Ranked #1 on Maps", "“hotel near me” · Phoenix"], ["AI", "", "Recommended by ChatGPT", "“hotel near the convention center”"], ["▶", "", "Reel hit 48,000 views", "Instagram · today"], ["↗", "", "OTA commissions −18%", "This quarter"]],
      restaurant: [["★", "star", "New 5-star review", "Yelp · 4 min ago"], ["✓", "ok", "Table for 6 reserved", "Google · just now"], ["#1", "", "Top of the map pack", "“italian restaurant near me”"], ["AI", "", "Recommended by Gemini", "“date night spot open late”"], ["▶", "", "Special of the day: 12k views", "Instagram · today"], ["↗", "", "Weekend covers +22%", "This month"]],
      dental: [["★", "star", "4.9 ★ · 318 reviews", "All platforms in sync"], ["✓", "ok", "New patient booked", "Website · just now"], ["#1", "", "#1 for “dentist near me”", "Google Maps"], ["AI", "", "Cited by ChatGPT", "“dentist open Saturday”"], ["↗", "", "Calls from search +31%", "This month"], ["✓", "ok", "Insurance Q&A answered", "Google profile · today"]],
      auto: [["★", "star", "New 5-star review", "DealerRater · 9 min ago"], ["✓", "ok", "Service appointment booked", "Website · just now"], ["#1", "", "Top 3 for “oil change near me”", "Google Maps"], ["AI", "", "Recommended by Perplexity", "“best place for brakes”"], ["▶", "", "Walkaround video: 31k views", "TikTok · today"], ["↗", "", "Service leads +27%", "This quarter"]],
      home: [["★", "star", "New 5-star review", "Google · 1 min ago"], ["✓", "ok", "Estimate request received", "Website · just now"], ["#1", "", "#1 for “plumber near me”", "Google Maps"], ["AI", "", "Recommended by ChatGPT", "“emergency plumber tonight”"], ["↗", "", "Calls from search +40%", "This month"], ["✓", "ok", "Listing synced on 42 sites", "Today"]]
    };
    let feed = FEEDS.hotel;
    const QS = {
      hotel: [["best hotel near me", "Your hotel · #1"], ["hotel near convention center", "Your hotel · recommended"], ["boutique hotel phoenix", "Your hotel · 4.9★"]],
      restaurant: [["italian restaurant near me", "Your restaurant · #1"], ["date night open late", "Your restaurant · recommended"], ["best brunch phoenix", "Your restaurant · 4.8★"]],
      dental: [["dentist open saturday", "Your practice · top 3"], ["dentist near me new patients", "Your practice · #1"], ["emergency dentist phoenix", "Your practice · recommended"]],
      auto: [["oil change near me", "Your dealership · #1"], ["best place for brakes", "Your service center · cited by AI"], ["used suv phoenix", "Your dealership · recommended"]],
      home: [["plumber near me now", "Your company · #1"], ["emergency plumber tonight", "Your company · recommended"], ["water heater replacement cost", "Your company · cited by AI"]]
    };
    hero.querySelectorAll(".hero-ind button").forEach(b => b.addEventListener("click", () => {
      hero.querySelectorAll(".hero-ind button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      feed = FEEDS[b.dataset.ind] || FEEDS.hotel; k = 0;
      hero.querySelectorAll(".hero-photo").forEach(f => { const on = f.dataset.ind === b.dataset.ind; const im = f.querySelector("img[data-src]"); if (on && im) { im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute("data-src"); } f.classList.toggle("is-on", on); });
      slots.forEach((s, i) => setTimeout(() => show(s), i * 180));
      if (window.__cpSetQueries) window.__cpSetQueries(QS[b.dataset.ind] || QS.hotel);
    }));
    const _unused = [
      ["★", "star", "New 5-star review", "Google · 2 min ago"],
      ["✓", "ok", "Booked direct — $412", "Website · just now"],
      ["#1", "", "Ranked #1 on Maps", "“hotel near me” · Phoenix"],
      ["AI", "", "Recommended by ChatGPT", "“best dentist open Saturday”"],
      ["▶", "", "Reel hit 48,000 views", "Instagram · today"],
      ["✓", "ok", "Review answered in 1 hr", "Yelp · by your account team"],
      ["↗", "", "Calls from search +31%", "This month"],
      ["★", "star", "4.9 rating · 212 reviews", "All platforms in sync"]
    ];
    const slots = [...hud.querySelectorAll(".hud-chip")];
    let k = 0;
    function show(slot) {
      const f = feed[k++ % feed.length];
      slot.classList.remove("on");
      setTimeout(() => { slot.innerHTML = `<i class="${f[1]}">${f[0]}</i><span>${f[2]}<small>${f[3]}</small></span>`; slot.classList.add("on"); }, reduce ? 0 : 450);
    }
    slots.forEach((s, i) => setTimeout(() => show(s), 900 + i * 700));
    if (!reduce) setInterval(() => show(slots[(Math.random() * slots.length) | 0]), 3200);
  }

  /* ---------- typing search demo ---------- */
  const srch = hero.querySelector(".hero-search");
  if (srch) {
    const q = srch.querySelector(".q"), ans = srch.querySelector(".ans b");
    let qs = [["best hotel near me", "Your hotel · #1"], ["dentist open saturday", "Your practice · top 3"], ["italian restaurant phoenix", "Your restaurant · 4.9★"], ["plumber near me now", "Your company · recommended"], ["oil change deals", "Your dealership · cited by AI"]];
    window.__cpSetQueries = list => { qs = list; qi = 0; };
    if (reduce) { q.textContent = qs[0][0]; ans.textContent = qs[0][1]; srch.classList.add("found"); return; }
    var qi = 0;
    function type() {
      const [text, a] = qs[qi++ % qs.length]; let i = 0; srch.classList.remove("found"); q.textContent = "";
      (function step() { if (i <= text.length) { q.textContent = text.slice(0, i++); setTimeout(step, 45 + Math.random() * 60); } else { ans.textContent = a; setTimeout(() => srch.classList.add("found"), 350); setTimeout(erase, 3200); } })();
    }
    function erase() { let s = q.textContent; (function step() { if (s.length) { s = s.slice(0, -1); q.textContent = s; setTimeout(step, 22); } else setTimeout(type, 400); })(); }
    setTimeout(type, 1200);
  }
})();
