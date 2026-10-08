/* Spotlight Kiosks — site behavior */
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
    });
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

  /* ---------- US markets map ---------- */
  $$("[data-usmap]").forEach(m => {
    const tip = $(".map-tip", m);
    const home = (document.querySelector('.brand') || {}).getAttribute ? document.querySelector('.brand').getAttribute("href") : "./";
    let hideT;
    function show(pin) {
      clearTimeout(hideT);
      $$(".pin.on", m).forEach(p => p.classList.remove("on")); pin.classList.add("on");
      const list = pin.dataset.markets.split("|");
      $("b", tip).textContent = pin.dataset.name;
      $(".tip-links", tip).innerHTML = list.map(mk => `<a href="${home}?market=${encodeURIComponent(mk)}#get-started">${list.length > 1 ? mk + " — " : ""}Advertise here${list.length > 1 ? "" : " — $399/yr"}</a>`).join("");
      const r = pin.getBoundingClientRect(), b = m.getBoundingClientRect();
      tip.hidden = false;
      tip.style.left = Math.max(8, Math.min(b.width - tip.offsetWidth - 8, r.left - b.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
      tip.style.top = (r.top - b.top - tip.offsetHeight - 10) + "px";
      $$(".st", m).forEach(st => st.classList.toggle("on", st.dataset.state === pin.dataset.state));
    }
    function hide() { hideT = setTimeout(() => { tip.hidden = true; $$(".pin.on", m).forEach(p => p.classList.remove("on")); $$(".st.on", m).forEach(s => s.classList.remove("on")); }, 400); }
    $$(".pin", m).forEach(pin => {
      pin.addEventListener("mouseenter", () => show(pin)); pin.addEventListener("mouseleave", hide);
      pin.addEventListener("focus", () => show(pin)); pin.addEventListener("blur", hide);
      pin.addEventListener("click", e => { e.stopPropagation(); show(pin); });
      pin.addEventListener("keydown", e => { if (e.key === "Enter") { show(pin); const a = $(".tip-links a", tip); if (a) a.focus(); } });
    });
    tip.addEventListener("mouseenter", () => clearTimeout(hideT)); tip.addEventListener("mouseleave", hide);
    // clicking a state filters the city list on the same page
    const root = document.querySelector("[data-filter-root]");
    $$(".st", m).forEach(st => st.addEventListener("click", () => {
      const pin = $(`.pin[data-state="${CSS.escape(st.dataset.state)}"]`, m); if (pin) show(pin);
      if (root && root.querySelector("[data-filter-select]")) {
        const opt = [...root.querySelector("[data-filter-select]").options].find(o => o.text === st.dataset.state);
        if (opt) root.dispatchEvent(new CustomEvent("spotlight:filter", { detail: opt.value }));
      }
    }));
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
    root.addEventListener("spotlight:filter", e => { active = e.detail; if (sel) sel.value = e.detail; if (search) search.value = ""; apply(); });
    if (search) search.addEventListener("input", apply);
    $$("[data-clear]", root).forEach(b => b.addEventListener("click", () => { active = "all"; if (search) search.value = ""; if (sel) sel.value = "all"; chips.forEach(x => x.setAttribute("aria-pressed", String(x.dataset.filter === "all"))); apply(); }));
    const pre = params.get("filter"); if (pre) { const c = chips.find(x => x.dataset.filter === pre); if (c) { active = pre; chips.forEach(x => x.setAttribute("aria-pressed", String(x === c))); } }
    apply();
  });

  /* ---------- inquiry forms → email draft ---------- */
  $$(".draft-form").forEach(form => {
    const review = document.getElementById(form.dataset.review);
    const err = $(".form-error", form);
    const handoff = store.get("spotlight-handoff");
    if (handoff && form.dataset.handoff !== undefined) {
      Object.entries(handoff).forEach(([k, v]) => { const f = form.elements[k]; if (f && !f.value) f.value = v; });
      store.del("spotlight-handoff");
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
    form.addEventListener("submit", e => {
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
      const lines = [];
      $$("input,select,textarea", form).forEach(el => {
        if (!el.name || el.type === "checkbox" || el.type === "radio" && !el.checked) return;
        const v = el.value.trim(); if (!v) return;
        const L = labelFor(el).replace(/[?:]$/, "");
        lines.push(el.tagName === "TEXTAREA" ? `\n${L}:\n${v}` : `${L}: ${v}`);
      });
      const nameField = form.elements[form.dataset.subjectField || "Business"] || form.elements["Venue name"] || form.elements["Venue / business"];
      const subject = form.dataset.subject + (nameField && nameField.value.trim() ? ` — ${nameField.value.trim()}` : "");
      const body = `Hello Spotlight team,\n\n${lines.join("\n")}\n\nThank you.`;
      review.dataset.subject = subject; review.dataset.body = body;
      $("pre", review).textContent = `To: ${form.dataset.to}\nSubject: ${subject}\n\n${body}`;
      form.hidden = true; review.hidden = false; review.scrollIntoView({ behavior: "smooth", block: "start" });
      $("h3", review).focus();
    });
    if (review) {
      $$("[data-draft]", review).forEach(b => b.addEventListener("click", async () => {
        const a = b.dataset.draft, s = review.dataset.subject, body = review.dataset.body;
        if (a === "open") location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(body)}`;
        if (a === "copy") { const ok = await copy(`Subject: ${s}\n\n${body}`); const m = $(".copied", review); m.textContent = ok ? "Copied to your clipboard." : "Couldn't copy. Select the text above instead."; }
        if (a === "download") download("spotlight-inquiry.txt", `To: ${form.dataset.to}\nSubject: ${s}\n\n${body}`);
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
    const briefText = () => "SPOTLIGHT CAMPAIGN BRIEF\n\n" + fields().map(([k, v]) => `${k}: ${v}`).join("\n");
    $("[data-plan=download]").addEventListener("click", () => download("spotlight-campaign-brief.txt", briefText()));
    $("[data-plan=inquiry]").addEventListener("click", () => {
      const f = Object.fromEntries(fields());
      store.set("spotlight-handoff", { "Business": f["Business"] || "", "Category": f["Business category"] || "", "Target city / state": f["Target city / state"] || "", "Goal": f["Campaign goal"] || "", "Notes": briefText() });
      location.href = planner.dataset.next;
    });
    show(0);
  }

  /* ---------- creative studio ---------- */
  const studio = $("#studio");
  if (studio) {
    const COLORS = { forest: ["#1F4433", false], sunset: ["linear-gradient(135deg,#c2502f,#f2a65b)", false], cobalt: ["linear-gradient(135deg,#1c3f8a,#3f7ad8)", false], lamp: ["#FFCE22", true] };
    const SVGBG = { forest: "#1F4433", sunset: "#D9703F", cobalt: "#2557B0", lamp: "#FFCE22" };
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
      pv.innerHTML = fmt === "tile"
        ? `<div class="mini studio-kiosk" data-finish="black"><div class="mini-head"><div class="mini-screen"><b>Welcome</b><small>to your venue</small><div class="mini-tiles"><span style="--g:linear-gradient(135deg,#7a3b1f,#c9773a)">Dining</span><span style="--g:linear-gradient(135deg,#2a2f5c,#8a64b0)">Events</span></div>${ad}</div></div><div class="mini-pole"></div><div class="mini-base"></div></div>`
        : `<div class="studio-wide">${ad}</div>`;
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
<text x="${W - 90}" y="${H - 60}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${fg}" fill-opacity=".7">Spotlight Kiosks creative concept</text>
</svg>`;
      download("spotlight-creative-concept.svg", svg, "image/svg+xml");
    });
    const startIdea = params.get("idea");
    if (startIdea && IDEAS[startIdea]) load(startIdea); else draw();
  }

  /* ---------- pricing calculator ---------- */
  const calc = $("#calc");
  if (calc) {
    const r = $("#n-range"), num = $("#n-num"), pre = $$("[data-preset-n]", calc), tiers = $$("#tiers li");
    const money = n => "$" + Math.round(n).toLocaleString("en-US");
    const annual = n => n <= 1 ? 399 : n <= 3 ? 1099 : n <= 5 ? 1200 : 1200 + 300 * (n - 5);
    const label = n => n <= 1 ? "Single location" : n <= 3 ? `3-location package${n === 2 ? " (covers up to 3)" : ""}` : n <= 5 ? `5-location package${n === 4 ? " (covers up to 5)" : ""}` : `5-location package + ${n - 5} extra location${n - 5 > 1 ? "s" : ""} × $300`;
    let N = 5;
    function sync(src) {
      const raw = parseInt(src === num ? num.value : r.value, 10);
      if (isNaN(raw)) return;
      N = Math.max(1, Math.min(100, raw));
      if (src !== num) num.value = N;
      r.value = Math.min(50, N);
      const A = annual(N), M = 60 * N;
      $("#c-total").innerHTML = `${money(A)}<small>/ year</small>`;
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
      const opt = N <= 1 ? "1 location — $399/yr" : N <= 3 ? "3 locations — $1,099/yr" : N <= 5 ? "5 locations — $1,200/yr" : "More than 5 locations — $1,200 + $300 per extra location/yr";
      store.set("spotlight-handoff", { "Pricing": opt, "Notes": `Estimate for ${N} location${N > 1 ? "s" : ""}: ${label(N)} = ${money(annual(N))}/year (or ${money(60 * N)}/month). Please confirm available venues and a quote.` });
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
    download("spotlight-media-overview.txt", `SPOTLIGHT KIOSKS — MEDIA OVERVIEW\n\n${rows.join("\n")}\nsales@spotlightkiosks.com · 602-887-4058\n`);
  });

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
