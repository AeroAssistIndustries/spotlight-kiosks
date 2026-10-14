/* CityPulse Digital — interactive labs: live site-speed test (PageSpeed Insights), voice search demo,
   scroll-driven customer journey, animated monthly report. All client-side; no data is stored. */
(function () {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. live speed test ---------- */
  document.querySelectorAll("[data-speed]").forEach(box => {
    const form = box.querySelector("form"), input = form.querySelector("input"), out = box.querySelector(".sp-out"), btn = form.querySelector("button");
    const steps = ["Contacting Google's PageSpeed engine…", "Loading your site on a simulated phone…", "Measuring how fast it becomes usable…", "Scoring accessibility and SEO basics…", "Almost there — a slow site can take up to a minute…"];
    form.addEventListener("submit", async e => {
      e.preventDefault();
      let url = input.value.trim(); if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      try { new URL(url); } catch { out.innerHTML = '<p class="sp-err">That doesn\'t look like a web address. Try something like <b>yourbusiness.com</b>.</p>'; return; }
      box.classList.add("busy"); btn.disabled = true; let si = 0;
      out.innerHTML = `<div class="sp-wait"><span class="sp-spin"></span><p>${steps[0]}</p></div>`;
      const tick = setInterval(() => { si = Math.min(steps.length - 1, si + 1); const p = out.querySelector(".sp-wait p"); if (p) p.textContent = steps[si]; }, 7000);
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 75000);
      try {
        const api = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&category=seo&category=accessibility&url=" + encodeURIComponent(url);
        const r = await fetch(api, { signal: ctrl.signal }); const j = await r.json();
        if (!r.ok || !j.lighthouseResult) throw new Error((j.error && j.error.message) || "no result");
        const L = j.lighthouseResult, cat = L.categories, au = L.audits;
        const sc = k => Math.round((cat[k] && cat[k].score || 0) * 100);
        const perf = sc("performance"), seo = sc("seo"), a11y = sc("accessibility");
        const lcp = au["largest-contentful-paint"], cls = au["cumulative-layout-shift"], tbt = au["total-blocking-time"], shot = au["final-screenshot"] && au["final-screenshot"].details && au["final-screenshot"].details.data;
        const grade = perf >= 90 ? ["Fast", "good"] : perf >= 50 ? ["Needs work", "mid"] : ["Slow", "bad"];
        const verdict = perf >= 90 ? "Your site loads fast on a phone. Nice. Speed isn't your problem — let's check search, reviews and AI visibility next." : perf >= 50 ? "Visitors wait a bit. Every extra second on a phone costs calls — this is usually a one-week fix." : "This is costing you customers right now. Half of mobile visitors leave if a page takes more than three seconds.";
        out.innerHTML = `<div class="sp-res">
          <div class="sp-main"><div class="sp-ring ${grade[1]}" style="--v:${perf}"><b>${perf}</b><span>mobile<br>performance</span></div>
            <div><span class="sp-grade ${grade[1]}">${grade[0]}</span><h3>${new URL(url).hostname}</h3><p>${verdict}</p></div></div>
          <div class="sp-metrics"><div><span>Largest content shows in</span><b>${lcp ? lcp.displayValue : "—"}</b></div><div><span>Layout shift</span><b>${cls ? cls.displayValue : "—"}</b></div><div><span>Blocked by scripts</span><b>${tbt ? tbt.displayValue : "—"}</b></div><div><span>SEO basics</span><b>${seo}/100</b></div><div><span>Accessibility</span><b>${a11y}/100</b></div></div>
          ${shot ? `<figure class="sp-shot"><img src="${shot}" alt="How your site looks on a phone when it finishes loading"><figcaption>Your site on a phone, as Google saw it just now</figcaption></figure>` : ""}
          <p class="fine">Measured live by Google PageSpeed Insights on a simulated mid-range phone. Nothing is stored. <a class="text-link" href="${box.dataset.root || "./"}free-audit/#audit">Get the full audit →</a></p></div>`;
        if (!reduce) { const ring = out.querySelector(".sp-ring"); let v = 0; (function up() { v = Math.min(perf, v + 2); ring.style.setProperty("--v", v); if (v < perf) requestAnimationFrame(up); })(); }
      } catch (err) {
        const quota = /quota|rate|429/i.test(String(err && err.message));
        out.innerHTML = `<p class="sp-err">${err.name === "AbortError" ? "That took too long — the site may be very slow or blocking the test." : quota ? "Google's free tester is busy right now. Try again in a minute, or" : "We couldn't test that address. Check the spelling, or"} <a class="text-link" href="${box.dataset.root || "./"}free-audit/#audit">request the full audit</a> and we'll run it for you.</p>`;
      } finally { clearInterval(tick); clearTimeout(to); box.classList.remove("busy"); btn.disabled = false; }
    });
  });

  /* ---------- 2. voice search demo ---------- */
  document.querySelectorAll("[data-voice]").forEach(v => {
    const btn = v.querySelector("button"), lbl = btn.querySelector("span") || btn, q = v.querySelector(".vs-q"), res = v.querySelector(".vs-res");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const answers = [[/hotel|stay|room|night/i, "Your hotel", "4.9 ★ · free parking · 0.4 mi from you"], [/restaurant|eat|dinner|lunch|pizza|taco|sushi|italian|brunch|food/i, "Your restaurant", "4.8 ★ · open till 10pm · reserve a table"], [/dentist|doctor|clinic|dental|teeth|urgent/i, "Your practice", "4.9 ★ · new patients · open Saturday"], [/car|oil|tire|brake|dealer|mechanic/i, "Your service center", "4.8 ★ · same-day appointments"], [/plumb|electric|roof|hvac|ac |air|contractor|handyman|clean/i, "Your company", "4.9 ★ · licensed · on the way in 40 min"]];
    function answer(text) {
      q.textContent = "“" + text + "”";
      const m = answers.find(a => a[0].test(text)) || [null, "Your business", "4.9 ★ · recommended · open now"];
      res.innerHTML = `<p class="vs-lead">Here's the best option near you:</p><div class="vs-card"><i></i><div><b>${m[1]}</b><span>${m[2]}</span></div><em>Recommended</em></div><p class="fine">That's the moment we build for — being the one answer, not one of ten links.</p>`;
      res.classList.add("on");
    }
    if (!SR) { btn.addEventListener("click", () => { const demo = ["best hotel near me with free parking", "italian restaurant open now", "dentist that takes new patients"][Math.floor(Math.random() * 3)]; lbl.textContent = "Voice isn't available here — here's a sample"; answer(demo); }); return; }
    btn.addEventListener("click", () => {
      const rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 1;
      v.classList.add("listening"); lbl.textContent = "Listening… ask for a place near you"; q.textContent = ""; res.classList.remove("on");
      rec.onresult = e => { const t = [...e.results].map(r => r[0].transcript).join(" "); q.textContent = "“" + t + "”"; if (e.results[e.results.length - 1].isFinal) answer(t); };
      rec.onerror = () => { v.classList.remove("listening"); lbl.textContent = "Try a voice search"; q.textContent = "Couldn't hear that — tap and try again (allow the microphone if asked)."; };
      rec.onend = () => { v.classList.remove("listening"); lbl.textContent = "Try another voice search"; };
      try { rec.start(); } catch { rec.onerror(); }
    });
  });

  /* ---------- 3. scroll-driven customer journey ---------- */
  document.querySelectorAll("[data-journey]").forEach(j => {
    const steps = [...j.querySelectorAll(".jn-step")], screens = [...j.querySelectorAll(".jn-screen")];
    const set = i => { steps.forEach((s, k) => s.classList.toggle("on", k === i)); screens.forEach((s, k) => s.classList.toggle("on", k === i)); j.style.setProperty("--jp", (i / (steps.length - 1)).toFixed(2)); };
    set(0);
    if (!("IntersectionObserver" in window)) { steps.forEach(s => s.classList.add("on")); return; }
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) set(steps.indexOf(e.target)); }); }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    steps.forEach(s => io.observe(s));
  });

  /* ---------- 4. animated monthly report ---------- */
  document.querySelectorAll("[data-report]").forEach(rep => {
    const lines = [...rep.querySelectorAll("[data-spark]")];
    lines.forEach(el => {
      const pts = el.dataset.spark.split(",").map(Number), w = 160, h = 44, mx = Math.max(...pts), mn = Math.min(...pts);
      const d = pts.map((p, i) => `${(i / (pts.length - 1) * w).toFixed(1)},${(h - 4 - (p - mn) / (mx - mn || 1) * (h - 8)).toFixed(1)}`).join(" ");
      el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="sg${lines.indexOf(el)}" x1="0" x2="1"><stop offset="0" stop-color="#17D9C8"/><stop offset="1" stop-color="#6C5CFF"/></linearGradient></defs><polyline points="${d}" fill="none" stroke="url(#sg${lines.indexOf(el)})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/><circle r="3.5" fill="#6C5CFF" cx="${w}" cy="${d.split(" ").pop().split(",")[1]}"/></svg>`;
    });
    const nums = [...rep.querySelectorAll("[data-n]")];
    function go() {
      rep.classList.add("go");
      nums.forEach(n => { const to = +n.dataset.n, pre = n.dataset.pre || "", suf = n.dataset.suf || "", t0 = performance.now();
        if (reduce) { n.textContent = pre + to.toLocaleString() + suf; return; }
        (function f(now) { const p = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - p, 3); n.textContent = pre + Math.round(to * e).toLocaleString() + suf; if (p < 1) requestAnimationFrame(f); })(t0); });
    }
    if (!("IntersectionObserver" in window) || reduce) { go(); return; }
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { threshold: .35 }); io.observe(rep);
  });
})();
