/* CityPulse Digital — site behavior: menus, forms, scroll reveals, sticky phone bar */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  /* ---------- footer year ---------- */
  const y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- forms: send through the configured provider, fall back to an email draft ---------- */
  $$(".draft-form").forEach(form => {
    const review = document.getElementById(form.dataset.review);
    const done = document.getElementById(form.id + "-done");
    const err = $(".form-error", form);
    params.forEach((v, k) => {
      const f = form.elements[k]; if (!f) return;
      if (f.tagName === "SELECT") { const o = [...f.options].find(o => o.value === v || o.text === v); if (o) f.value = o.value; }
      else if (!f.value) f.value = v;
    });
    // ?plan=pulse-pro preselects the interest on the contact form
    const plan = params.get("plan"), interest = form.elements["Interest"];
    if (plan && interest) {
      const map = { pulse: "Everything — a growth plan", "pulse-pro": "Everything — a growth plan", "pulse-max": "Everything — a growth plan", website: "Website design" };
      const o = [...interest.options].find(o => o.text === map[plan]); if (o) interest.value = o.value;
      const msg = form.elements["Message"]; if (msg && !msg.value && plan !== "website") msg.value = `I'm interested in the ${plan.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())} plan.\n\n`;
    }
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
      const nameField = form.elements[form.dataset.subjectField || "Business"];
      const subject = form.dataset.subject + (nameField && nameField.value.trim() ? ` — ${nameField.value.trim()}` : "");
      const body = `Hello CityPulse Digital team,\n\n${lines.join("\n")}\n\nThank you.`;
      const btn = $("button[type=submit]", form), api = window.CityPulse;
      let sent = false;
      if (api && api.formsReady()) {
        btn.disabled = true; const t = btn.textContent; btn.textContent = "Sending…";
        sent = await api.send(Object.assign({ _subject: subject }, fields));
        btn.disabled = false; btn.textContent = t;
      }
      form.hidden = true;
      if (sent && done) {
        done.hidden = false; done.scrollIntoView({ behavior: "smooth", block: "start" }); $("h3", done).focus();
        return;
      }
      review.dataset.subject = subject; review.dataset.body = body;
      $("pre", review).textContent = `To: ${form.dataset.to}\nSubject: ${subject}\n\n${body}`;
      review.hidden = false; review.scrollIntoView({ behavior: "smooth", block: "start" }); $("h3", review).focus();
    });
    if (review) {
      $$("[data-draft]", review).forEach(b => b.addEventListener("click", async () => {
        const a = b.dataset.draft, s = review.dataset.subject, body = review.dataset.body;
        if (a === "open") location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(body)}`;
        if (a === "copy") { const ok = await copy(`Subject: ${s}\n\n${body}`); const m = $(".copied", review); m.textContent = ok ? "Copied to your clipboard." : "Couldn't copy. Select the text above instead."; }
        if (a === "edit") { review.hidden = true; form.hidden = false; form.querySelector("input,select,textarea").focus(); }
      }));
    }
  });

  /* ---------- scroll reveals (only things below the first screen) ---------- */
  if (!reduceMotion) {
    const sel = ".svc-card,.process li,.ind-card,.quote,.plan,.work-card,.stats div,.three>div,.timeline li";
    let els = $$("main " + sel).filter(el => el.getBoundingClientRect().top > innerHeight * 0.9);
    els.forEach((el, i) => { el.classList.add("rv"); el.style.setProperty("--rv-d", `${(i % 4) * 0.08}s`); });
    let ticking = false;
    const check = () => {
      ticking = false;
      els = els.filter(el => { if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add("in"); return false; } return true; });
      if (!els.length) removeEventListener("scroll", onScroll);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
    setTimeout(check, 300);
  }

  /* ---------- sticky phone bar: show once the visitor has scrolled past the first screen ---------- */
  const bar = $("#m-cta");
  if (bar && !/free-audit|contact|support/.test(location.pathname)) {
    const on = () => bar.classList.toggle("on", scrollY > innerHeight * 0.8);
    addEventListener("scroll", on, { passive: true }); on();
  } else if (bar) bar.remove();
})();

/* ---------- announcement bar rotation + animated counters ---------- */
(function () {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bar = document.querySelector("[data-ann]");
  if (bar) {
    const items = [...bar.querySelectorAll(".ann")]; let i = 0, t;
    const show = n => { i = (n + items.length) % items.length; items.forEach((a, j) => a.classList.toggle("on", j === i)); };
    const tick = () => { clearTimeout(t); if (!reduce) t = setTimeout(() => { show(i + 1); tick(); }, 6000); };
    bar.querySelector("[data-ann-prev]").addEventListener("click", () => { show(i - 1); tick(); });
    bar.querySelector("[data-ann-next]").addEventListener("click", () => { show(i + 1); tick(); });
    bar.addEventListener("mouseenter", () => clearTimeout(t)); bar.addEventListener("mouseleave", tick);
    tick();
  }
  const counters = [...document.querySelectorAll("[data-counter]")];
  if (counters.length) {
    const run = el => {
      const raw = el.dataset.counter, m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
      if (!m || reduce) return;
      const pre = m[1], num = parseFloat(m[2].replace(/,/g, "")), post = m[3], dec = (m[2].split(".")[1] || "").length;
      const t0 = performance.now(), ms = 1400;
      (function f(now) {
        const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3), v = num * e;
        el.textContent = pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + post;
        if (p < 1) requestAnimationFrame(f); else el.textContent = raw;
      })(t0);
    };
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { io.unobserve(x.target); run(x.target); } }), { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }
})();

/* ---------- parallax photo bands + hover tilt ---------- */
(function () {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bands = [...document.querySelectorAll("[data-parallax] .pb-media .ph")];
  if (bands.length && !reduce) {
    let ticking = false;
    const update = () => {
      ticking = false;
      bands.forEach(el => {
        const r = el.parentElement.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
        el.style.transform = `translateY(${(p * -40).toFixed(1)}px)`;
      });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".svc-card,.plan,.story-card,.guide-card,.ind-card,.work-card").forEach(card => {
      card.classList.add("tilt");
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.classList.add("on");
        card.style.transform = `translateY(-4px) perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });
      card.addEventListener("mouseleave", () => { card.classList.remove("on"); card.style.transform = ""; });
    });
  }
})();
