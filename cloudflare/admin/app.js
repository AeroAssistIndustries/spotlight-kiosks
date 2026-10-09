/* CityPulse kiosk dashboard. Served by the worker at /admin. */
(() => {
  "use strict";
  const app = document.getElementById("app");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmt = n => Number(n || 0).toLocaleString("en-US");
  const clone = o => JSON.parse(JSON.stringify(o));

  const TABS = [["overview", "Overview"], ["ads", "Ads"], ["places", "Places"], ["answers", "Answers"], ["hotel", "Hotel"], ["notices", "Announcements"], ["kiosks", "Kiosks"], ["history", "History"]];
  const LOGO = cls => `<span class="logo${cls ? " " + cls : ""}"><img class="on-light" src="/admin/brand/logo.svg" alt="CityPulse Kiosks"><img class="on-dark" src="/admin/brand/logo-light.svg" alt="CityPulse Kiosks"></span>`;
  const ICONS = { fork: "Dining", bell: "Hotel", coffee: "Coffee", spark: "Things to do", bag: "Shopping", car: "Transport", pin: "Pin", star: "Star", walk: "Walking", sun: "Outdoors" };

  let D = null, saved = null, base = 0, meta = {};
  let tab = (location.hash.slice(1) || "overview");
  if (!TABS.some(t => t[0] === tab)) tab = "overview";
  let open = null, placeQuery = "";
  let range = 7, kioskFilter = "", stats = null, statsErr = "";
  let busy = false;
  let deals = {}; /* private advertiser deal details, saved separately from what kiosks show */

  /* ---------- server ---------- */
  async function api(path, opts) {
    opts = opts || {};
    const headers = { "X-CP": "1" };
    let body = opts.body;
    if (opts.json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(opts.json); }
    if (opts.type) headers["Content-Type"] = opts.type;
    const r = await fetch("/admin/api/" + path, { method: opts.method || (body ? "POST" : "GET"), headers, body, credentials: "same-origin", cache: "no-store" });
    let j = {}; try { j = await r.json(); } catch (e) { /* not JSON */ }
    if (r.status === 401 && path !== "login") { login("Your session ended. Please sign in again."); throw new Error("signed out"); }
    if (!r.ok) { const e = new Error(j.error || `Something went wrong (${r.status}).`); e.status = r.status; e.body = j; throw e; }
    return j;
  }
  const imgUrl = ref => !ref ? "" : ref.startsWith("media:") ? meta.media + ref.slice(6) : /^https:/.test(ref) ? ref : meta.assets + ref;

  /* ---------- toast ---------- */
  let toastT = null;
  function toast(text, err) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = text; t.className = "toast show" + (err ? " err" : "");
    clearTimeout(toastT); toastT = setTimeout(() => { t.className = "toast"; }, err ? 9000 : 4500);
  }

  /* ---------- sign in ---------- */
  function login(message, info) {
    D = null;
    app.innerHTML = `<div class="login"><form class="login-card" id="login" novalidate>
      ${LOGO()}
      <span class="eyebrow">Kiosk dashboard</span>
      <h1>Welcome back</h1><p>Sign in to manage your CityPulse kiosks: ads, places, answers and results.</p>
      <label class="f"><span>Staff password</span><input type="password" id="pw" autocomplete="current-password" required></label>
      <button class="btn primary" type="submit">Sign in</button>
      ${message ? `<div class="msg${info ? " info" : ""}" role="alert">${esc(message)}</div>` : ""}
      <p class="login-foot">CityPulse Kiosks · Staff only</p>
    </form></div>`;
    const pw = document.getElementById("pw");
    pw.focus();
    document.getElementById("login").addEventListener("submit", async e => {
      e.preventDefault();
      const b = e.target.querySelector("button"); b.disabled = true; b.textContent = "Signing in…";
      try { await api("login", { json: { password: pw.value } }); await load(); }
      catch (err) { login(err.message); }
    });
  }

  async function boot() {
    let s;
    try { s = await api("status"); } catch (e) { return login("The dashboard can't reach the server. Check your connection and reload."); }
    if (!s.setup.password) return login("The staff password has not been set yet. In Cloudflare, open the spotlight-kiosks worker, go to Settings, Variables and Secrets, and add a secret named ADMIN_PASSWORD.", true);
    if (!s.signedIn) return login();
    await load();
  }

  async function load() {
    app.innerHTML = `<div class="loading">Loading your kiosk content…</div>`;
    try {
      const c = await api("content");
      saved = c.data; D = clone(c.data); base = c.version; meta = { assets: c.assets, media: c.media, history: c.history, updated_at: c.updated_at };
      if (!D.notices) { D.notices = []; saved.notices = []; }
      try { deals = (await api("deals")).deals || {}; } catch (e) { deals = {}; }
    } catch (e) {
      if (e.message === "signed out") return;
      app.innerHTML = `<div class="login"><div class="login-card"><h1>Almost there</h1><div class="msg" role="alert">${esc(e.message)}</div></div></div>`;
      return;
    }
    frame(); render();
    loadStats();
  }

  /* ---------- frame ---------- */
  function frame() {
    app.innerHTML = `
      <header class="top"><div class="top-in">
        <div class="brand">${LOGO()}<span class="sep" aria-hidden="true"></span><div class="venue-name"><b>${esc(D.name)}</b><small>Kiosk dashboard</small></div></div>
        <div class="state" id="state" aria-live="polite"></div>
        <button class="btn ghost small" data-act="logout">Sign out</button>
      </div>
      <nav class="tabs" aria-label="Sections">${TABS.map(([k, l]) => `<button data-tab="${k}">${l}</button>`).join("")}</nav></header>
      <main id="view"></main>
      <footer class="foot"><img src="/admin/brand/favicon.svg" alt="" aria-hidden="true"><span>CityPulse Kiosks · Kiosk dashboard for ${esc(D.name)}</span></footer>
      <div class="publish-bar" id="pbar" role="region" aria-label="Unpublished changes">
        <span id="pbar-text">You have unpublished changes</span>
        <button class="btn ghost small" data-act="discard">Discard</button>
        <button class="btn primary" data-act="publish">Publish to kiosks</button>
      </div>`;
    const view = document.getElementById("view");
    view.addEventListener("input", onInput);
    view.addEventListener("change", onChange);
    app.addEventListener("click", onClick);
    markDirty();
  }

  function render() {
    const view = document.getElementById("view");
    if (!view) return;
    document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false"));
    const y = window.scrollY;
    document.body.classList.toggle("is-report", tab === "report");
    view.innerHTML = ({ overview: vOverview, ads: vAds, places: vPlaces, answers: vAnswers, hotel: vHotel, notices: vNotices, kiosks: vKiosks, history: vHistory, report: vReport })[tab]();
    window.scrollTo(0, y);
  }

  function isDirty() { return JSON.stringify(D) !== JSON.stringify(saved); }
  function changedAreas() {
    const a = [];
    const k = key => JSON.stringify(D[key]) !== JSON.stringify(saved[key]);
    if (k("sponsors")) a.push("ads");
    if (k("items") || k("categories")) a.push("places");
    if (k("faq")) a.push("answers");
    if (k("notices")) a.push("announcements");
    if (["name", "short", "address", "ll", "phone", "tel", "email", "logo", "photos", "tiles"].some(k)) a.push("hotel info");
    return a;
  }
  function markDirty() {
    const d = D && isDirty();
    const st = document.getElementById("state"), bar = document.getElementById("pbar");
    if (st) { st.className = "state" + (d ? " dirty" : ""); st.innerHTML = d ? `<i></i>Unpublished changes` : `<i></i>Published · version ${base}`; }
    if (bar) {
      bar.classList.toggle("show", !!d);
      const areas = d ? changedAreas() : [];
      document.getElementById("pbar-text").textContent = areas.length ? `Changes to ${areas.join(", ")}` : "You have unpublished changes";
    }
  }
  window.addEventListener("beforeunload", e => { if (D && isDirty()) { e.preventDefault(); e.returnValue = ""; } });
  window.addEventListener("hashchange", () => { const t = location.hash.slice(1); if (TABS.some(x => x[0] === t) && t !== tab) { tab = t; open = null; render(); if (tab === "overview" || tab === "kiosks") loadStats(); } });

  /* ---------- binding form fields to the draft ---------- */
  function getPath(o, path) { return path.split(".").reduce((a, k) => a == null ? a : a[k], o); }
  function setPath(o, path, v) {
    const ks = path.split(".");
    let cur = o;
    for (let i = 0; i < ks.length - 1; i++) {
      const k = ks[i];
      if (cur[k] == null || typeof cur[k] !== "object") cur[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[ks[ks.length - 1]] = v;
  }
  function readVal(el) {
    if (el.type === "checkbox") return el.dataset.invert ? !el.checked : el.checked;
    if (el.dataset.kind === "num") return el.value.trim() === "" ? "" : Number(el.value);
    if (el.dataset.kind === "list") return el.value.split(",").map(s => s.trim()).filter(Boolean);
    return el.value;
  }
  function onInput(e) {
    const el = e.target;
    if (el.id === "place-q") { placeQuery = el.value; filterPlaces(); return; }
    if (!el.dataset.bind) return;
    setPath(D, el.dataset.bind, readVal(el));
    const c = el.closest("label") && el.closest("label").querySelector("[data-count]");
    if (c && el.maxLength > 0) c.textContent = `${el.value.length} / ${el.maxLength}`;
    if (el.dataset.title) { const t = document.getElementById(el.dataset.title); if (t) t.textContent = el.value || "Untitled"; }
    const mn = el.dataset.bind.match(/^notices\.(\d+)\./);
    if (mn) { const pv = document.getElementById("notice-prev-" + mn[1]); if (pv) pv.innerHTML = noticePreview(D.notices[+mn[1]]); }
    const m = el.dataset.bind.match(/^sponsors\.(\d+)\./);
    if (m) { const pv = document.getElementById("ad-prev-" + m[1]); if (pv) pv.innerHTML = adPreview(D.sponsors[+m[1]]); }
    markDirty();
  }
  function onChange(e) {
    const el = e.target;
    if (el.dataset.bind && (el.type === "checkbox" || el.tagName === "SELECT" || el.type === "date")) { setPath(D, el.dataset.bind, readVal(el)); markDirty(); if (el.dataset.rerender || /^(sponsors|notices)\.\d+\.(active|start|end|item)$/.test(el.dataset.bind)) render(); }
    if (el.dataset.cat) { toggleCat(el.dataset.item, el.dataset.cat, el.checked); markDirty(); }
    if (el.id === "range-kiosk") { kioskFilter = el.value; loadStats(); }
    if (el.dataset.addchip) { const v = el.value; if (v) { const arr = getPath(D, el.dataset.addchip) || []; if (!arr.includes(v)) arr.push(v); setPath(D, el.dataset.addchip, arr); markDirty(); render(); } }
    if (el.type === "file" && el.files && el.files[0]) upload(el.files[0], el.dataset.upload, el.dataset.kind || "logo").finally(() => { el.value = ""; });
  }

  /* field helpers */
  function field(label, path, opts) {
    opts = opts || {};
    const v = getPath(D, path);
    const val = Array.isArray(v) && opts.kind === "list" ? v.join(", ") : (v == null ? "" : v);
    const id = "f-" + path.replace(/[^\w]/g, "-");
    const attrs = `id="${id}" data-bind="${esc(path)}"${opts.kind ? ` data-kind="${opts.kind}"` : ""}${opts.max ? ` maxlength="${opts.max}"` : ""}${opts.title ? ` data-title="${opts.title}"` : ""}${opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : ""}${opts.req ? " required" : ""}`;
    const count = opts.max && opts.count !== false ? `<em data-count>${String(val).length} / ${opts.max}</em>` : "";
    let ctl;
    if (opts.area) ctl = `<textarea ${attrs} rows="${opts.rows || 3}">${esc(val)}</textarea>`;
    else if (opts.options) ctl = `<select ${attrs}${opts.rerender ? " data-rerender=1" : ""}>${opts.options.map(([k, l]) => `<option value="${esc(k)}"${String(k) === String(val) ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
    else ctl = `<input type="${opts.type || "text"}" ${attrs} value="${esc(val)}"${opts.type === "number" ? ' step="any"' : ""}${opts.mode ? ` inputmode="${opts.mode}"` : ""}>`;
    return `<label class="f${opts.full ? " full" : ""}" for="${id}"><span>${esc(label)}${count}</span>${ctl}${opts.help ? `<small>${opts.help}</small>` : ""}</label>`;
  }
  const armed = (act, label, extra) => `<button class="btn small danger" data-act="${act}" data-armed-label="Click again to confirm"${extra || ""}>${label}</button>`;

  /* ---------- dates ---------- */
  const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: (D && D.tz) || "America/Los_Angeles" }).format(new Date());
  const dayDiff = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
  const niceDay = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  function adStatus(s) {
    const t = today();
    if (s.active === false) return ["off", "Hidden"];
    if (s.start && t < s.start) return ["warn", "Starts " + niceDay(s.start)];
    if (s.end && t > s.end) return ["off", "Ended " + niceDay(s.end)];
    if (s.end) { const d = dayDiff(t, s.end); return d <= 7 ? ["warn", d === 0 ? "Ends today" : `Ends in ${d} day${d > 1 ? "s" : ""}`] : ["ok", "Running until " + niceDay(s.end)]; }
    return ["ok", "Running"];
  }
  const kioskOffline = k => Date.now() - Date.parse(k.last_seen) > 15 * 60000;

  /* ---------- overview ---------- */
  async function loadStats() {
    statsErr = "";
    try { stats = await api(`stats?days=${range}${kioskFilter ? "&kiosk=" + encodeURIComponent(kioskFilter) : ""}`); }
    catch (e) { if (e.message === "signed out") return; statsErr = e.message; }
    if (tab === "overview" || tab === "kiosks" || tab === "report") render();
  }
  function sumType(type) { return (stats ? stats.byKey : []).filter(r => r.type === type).reduce((a, r) => a + r.n, 0); }
  function keysOf(type) { return (stats ? stats.byKey : []).filter(r => r.type === type); }
  function nameOf(id) { const it = D.items[id]; return it ? it.n : id; }
  function adRows() {
    const tally = type => { const o = {}; keysOf(type).forEach(r => { o[r.key] = (o[r.key] || 0) + r.n; }); return o; };
    const views = tally("adShown"), engaged = tally("adEngaged"), reach = tally("adReach"), scans = {};
    keysOf("qr").forEach(r => { if (r.key.startsWith("ad:")) scans[r.key.slice(3)] = (scans[r.key.slice(3)] || 0) + r.n; });
    const row = (id, name, active) => ({ id, name, active, views: views[id] || 0, engaged: engaged[id] || 0, reach: reach[id] || 0, scans: scans[id] || 0 });
    const rows = D.sponsors.map(s => { const r = row(s.id, s.name, s.active !== false); if (s.name !== s.id) { r.views += views[s.name] || 0; } return r; });
    const known = new Set(D.sponsors.flatMap(s => [s.id, s.name]));
    Object.keys(views).filter(k => !known.has(k)).forEach(k => rows.push(row(k, k + " (removed)", false)));
    return rows;
  }
  function topList(rows, label, nameFn) {
    const max = Math.max(1, ...rows.map(r => r.n));
    if (!rows.length) return `<div class="empty">No ${label} yet in this period.</div>`;
    return `<ul class="list">${rows.slice(0, 8).map(r => `<li><span>${esc(nameFn ? nameFn(r.key) : r.key)}</span><b>${fmt(r.n)}</b><div class="bar"><i style="width:${Math.round(r.n / max * 100)}%"></i></div></li>`).join("")}</ul>`;
  }
  function chart() {
    if (!stats) return "";
    const days = [];
    const end = new Date(stats.to + "T12:00:00Z");
    for (let i = stats.days - 1; i >= 0; i--) days.push(new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10));
    const get = (d, t) => stats.byDay.filter(r => r.day === d && r.type === t).reduce((a, r) => a + r.n, 0);
    const s = days.map(d => get(d, "sessions")), q = days.map(d => get(d, "qr"));
    const max = Math.max(4, ...s, ...q), W = 720, H = 150, n = days.length, bw = W / n;
    const lab = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const every = Math.ceil(n / 8);
    return `<svg class="chart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Guest sessions and QR scans per day">
      ${[0.5, 1].map(f => `<line x1="0" x2="${W}" y1="${H - H * f}" y2="${H - H * f}" stroke="currentColor" stroke-opacity=".08"/>`).join("")}
      ${days.map((d, i) => {
        const hs = s[i] / max * (H - 8), hq = q[i] / max * (H - 8), w = Math.max(2, bw * (n > 40 ? 0.42 : 0.34));
        return `<rect x="${i * bw + bw / 2 - w - 1}" y="${H - hs}" width="${w}" height="${hs}" rx="2" fill="var(--blue)"><title>${lab(d)}: ${s[i]} sessions</title></rect>
          <rect x="${i * bw + bw / 2 + 1}" y="${H - hq}" width="${w}" height="${hq}" rx="2" fill="var(--gold)"><title>${lab(d)}: ${q[i]} QR scans</title></rect>
          ${i % every === 0 ? `<text x="${i === 0 ? 0 : i * bw + bw / 2}" y="${H + 15}" text-anchor="${i === 0 ? "start" : "middle"}">${lab(d)}</text>` : ""}`;
      }).join("")}
    </svg>`;
  }
  function vOverview() {
    const kiosks = stats ? stats.kiosks : [];
    const seg = [[1, "Today"], [7, "7 days"], [30, "30 days"], [90, "90 days"]].map(([d, l]) => `<button data-act="range" data-days="${d}" aria-pressed="${range === d}">${l}</button>`).join("");
    const head = `<div class="head"><div><h1>Overview</h1><p>What guests do on your kiosks. Counts include every kiosk and update every minute. Nothing personal is collected.</p></div>
      <div class="seg" role="group" aria-label="Period">${seg}</div>
      ${kiosks.length > 1 ? `<select id="range-kiosk" aria-label="Kiosk" style="width:auto"><option value="">All kiosks</option>${kiosks.map(k => `<option value="${esc(k.kiosk)}"${k.kiosk === kioskFilter ? " selected" : ""}>${esc(k.kiosk)}</option>`).join("")}</select>` : ""}</div>`;
    if (statsErr) return head + `<div class="card"><div class="msg" role="alert">${esc(statsErr)}</div></div>`;
    if (!stats) return head + `<div class="card loading">Loading numbers…</div>`;
    const ads = adRows(), adViews = ads.reduce((a, r) => a + r.views, 0), adEngaged = ads.reduce((a, r) => a + r.engaged, 0), scans = sumType("qr");
    const placeScans = keysOf("qr").filter(r => r.key.startsWith("place:")).map(r => ({ key: r.key.slice(6), n: r.n }));
    const card = (label, n, sub) => `<div class="card stat"><span>${label}</span><b>${fmt(n)}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;
    const maxV = Math.max(1, ...ads.map(r => r.engaged));
    const alerts = [];
    (stats.kiosks || []).filter(kioskOffline).forEach(k => alerts.push(`<b>${esc(k.kiosk)}</b> hasn't checked in since ${esc(ago(k.last_seen))}. Check that the screen is on and connected to Wi-Fi.`));
    D.sponsors.forEach(s => { const [cls, label] = adStatus(s); if (cls === "warn" && /^Ends/.test(label)) alerts.push(`<b>${esc(s.name)}</b>: ad ${esc(label.toLowerCase())}. Time to talk renewal.`); });
    const rev = monthlyRevenue();
    return head + (alerts.length ? `<div class="alerts" role="status">${alerts.map(a => `<p>${a}</p>`).join("")}</div>` : "") + `
      ${rev.count ? `<div class="revenue"><div><span>Monthly ad revenue</span><b>$${fmt(rev.total)}</b><small>from ${rev.count} active advertiser${rev.count > 1 ? "s" : ""} · $${fmt(rev.total * 12)} a year</small></div>${rev.pending ? `<div><span>Pending deals</span><b>$${fmt(rev.pending)}</b><small>a month, not yet active</small></div>` : ""}</div>` : ""}
      <div class="grid g5">
        ${card("Guest sessions", sumType("sessions"), "Someone tapped Start")}
        ${card("Places viewed", sumType("places"))}
        ${card("Questions asked", sumType("questions"))}
        ${card("Ad views with a guest", adEngaged, `${fmt(adViews)} in total, including an empty lobby`)}
        ${card("QR scans", scans, "Phones that opened a link")}
      </div>
      <div class="card"><div class="card-head"><div><h2>Activity</h2></div><div class="legend"><span><i style="background:var(--blue)"></i>Guest sessions</span><span><i style="background:var(--gold)"></i>QR scans</span></div></div>${chart()}</div>
      <div class="card"><div class="card-head"><div><h2>Advertisers</h2><p>Proof of exposure for each business. <b>Total views</b> count every time the ad came on screen, even with nobody there. <b>With a guest</b> counts only times someone was using the kiosk while it showed. <b>Guests reached</b> counts each guest session once. <b>QR scans</b> are phones that opened the business's link.</p></div>
        <button class="btn small" data-act="csv">Download report (CSV)</button></div>
        ${ads.length ? `<div class="table-wrap"><table><thead><tr><th>Business</th><th class="num">Total views</th><th class="num">With a guest</th><th style="width:16%"></th><th class="num">Guests reached</th><th class="num">QR scans</th><th class="num">Scans per 100 guests</th><th></th></tr></thead><tbody>
          ${ads.map(r => `<tr><td><button class="link" data-act="report" data-id="${esc(r.id)}" title="Open the advertiser report">${esc(r.name)}</button>${r.active ? "" : ` <span class="pill off">Not showing</span>`}</td><td class="num muted">${fmt(r.views)}</td><td class="num"><b>${fmt(r.engaged)}</b></td><td><div class="bar"><i style="width:${Math.round(r.engaged / maxV * 100)}%"></i></div></td><td class="num">${fmt(r.reach)}</td><td class="num">${fmt(r.scans)}</td><td class="num">${r.reach ? (r.scans / r.reach * 100).toFixed(1) : "–"}</td><td class="num"><button class="btn small" data-act="report" data-id="${esc(r.id)}">Report</button></td></tr>`).join("")}
        </tbody></table></div>` : `<div class="empty">No ads yet. Add one in the Ads tab.</div>`}
      </div>
      <div class="card"><div class="card-head"><div><h2>Busiest times</h2><p>When guests start using the kiosk, by hour of the day (hotel time). Useful when pitching advertisers.</p></div></div>${hoursChart()}</div>
      <div class="grid g2">
        <div class="card"><h3>Most viewed places</h3>${topList(keysOf("places"), "place views", nameOf)}</div>
        <div class="card"><h3>Directions scanned</h3>${topList(placeScans, "scans", nameOf)}</div>
        <div class="card"><h3>Most opened sections</h3>${topList(keysOf("categories"), "section views", k => (D.categories[k] && D.categories[k].label) || k)}</div>
        <div class="card"><h3>Top questions</h3>${topList(keysOf("questions"), "questions")}<p class="muted" style="font-size:13px;margin-top:10px">Free-typed questions are counted without their text, so guests' words stay private.</p></div>
      </div>`;
  }
  function hoursChart() {
    const h = Array(24).fill(0);
    keysOf("hours").forEach(r => { const i = +r.key; if (i >= 0 && i < 24) h[i] += r.n; });
    const total = h.reduce((a, b) => a + b, 0);
    if (!total) return `<div class="empty">No guest sessions in this period yet.</div>`;
    const max = Math.max(...h), W = 720, H = 120, bw = W / 24;
    const lab = i => i === 0 ? "12a" : i < 12 ? i + "a" : i === 12 ? "12p" : (i - 12) + "p";
    const peak = h.indexOf(max);
    return `<p style="margin:-4px 0 10px;font-size:15px">Busiest hour: <b>${lab(peak)}–${lab((peak + 1) % 24)}</b></p>
      <svg class="chart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Guest sessions by hour of day">
      ${h.map((n, i) => { const hh = n / max * (H - 6); return `<rect x="${i * bw + 3}" y="${H - hh}" width="${bw - 6}" height="${Math.max(hh, n ? 2 : 0)}" rx="2" fill="${i === peak ? "var(--blue)" : "color-mix(in srgb, var(--blue) 45%, transparent)"}"><title>${lab(i)}: ${n} sessions</title></rect>${i % 3 === 0 ? `<text x="${i * bw + bw / 2}" y="${H + 15}" text-anchor="middle">${lab(i)}</text>` : ""}`; }).join("")}
      <line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="currentColor" stroke-opacity=".12"/></svg>`;
  }

  /* ---------- advertiser report (print or save as PDF) ---------- */
  let reportId = null;
  function vReport() {
    const s = D.sponsors.find(x => x.id === reportId);
    if (!stats) return `<div class="card loading">Loading numbers…</div>`;
    const r = adRows().find(x => x.id === reportId);
    if (!s || !r) return `<div class="card empty">This ad no longer exists.</div>`;
    const days = [], end = new Date(stats.to + "T12:00:00Z");
    for (let i = stats.days - 1; i >= 0; i--) days.push(new Date(end.getTime() - i * 86400000).toISOString().slice(0, 10));
    const per = (type, key) => d => (stats.adDays || []).filter(x => x.day === d && x.type === type && (x.key === key || (type === "adShown" && x.key === s.name))).reduce((a, x) => a + x.n, 0);
    const eng = days.map(per("adEngaged", s.id)), qrs = days.map(per("qr", "ad:" + s.id)), tot = days.map(per("adShown", s.id)), rch = days.map(per("adReach", s.id));
    const max = Math.max(4, ...eng), W = 720, H = 150, n = days.length, bw = W / n, every = Math.ceil(n / 8);
    const lab = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const kpi = (label, val, sub) => `<div class="kpi"><span>${label}</span><b>${val}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;
    const seg = [[7, "7 days"], [30, "30 days"], [90, "90 days"]].map(([d, l]) => `<button data-act="range" data-days="${d}" aria-pressed="${range === d}">${l}</button>`).join("");
    const kiosksN = (stats.kiosks || []).length;
    return `<div class="no-print report-bar"><button class="btn small" data-act="back-overview">← Back to overview</button><div class="seg" role="group" aria-label="Period">${seg}</div><button class="btn small" data-act="share" data-id="${esc(reportId)}">Copy live link</button><button class="btn primary small" data-act="print">Print or save as PDF</button></div>
    <article class="report">
      <header class="report-head">${LOGO("report-logo")}<div class="report-title"><span>Advertising report</span><b>${esc(niceDay(stats.from))} – ${esc(niceDay(stats.to))}</b></div></header>
      <div class="report-biz">${s.logo ? `<div class="logo-box"><img src="${esc(imgUrl(s.logo))}" alt="${esc(s.name)} logo"></div>` : ""}
        <div><h1>${esc(s.name)}</h1><p>${esc(s.kind || "")}${s.kind ? " · " : ""}Featured on the CityPulse concierge kiosk at ${esc(D.name)}, ${esc(D.address)}</p></div></div>
      <div class="kpis">
        ${kpi("Guests reached", fmt(r.reach), "Guest sessions that saw the ad")}
        ${kpi("Views with a guest", fmt(r.engaged), "Ad on screen while a guest used the kiosk")}
        ${kpi("Total views", fmt(r.views), `Every time the ad came on screen${kiosksN > 1 ? `, on ${kiosksN} kiosks` : ""}`)}
        ${kpi("QR scans", fmt(r.scans), r.reach ? `${(r.scans / r.reach * 100).toFixed(1)} per 100 guests reached` : "Phones that opened your link")}
      </div>
      <section><h2>Day by day</h2><div class="legend"><span><i style="background:var(--blue)"></i>Views with a guest</span><span><i style="background:var(--gold)"></i>QR scans</span></div>
      <svg class="chart" viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Views with a guest and QR scans per day">
        ${days.map((d, i) => { const w = Math.max(2, bw * 0.34), he = eng[i] / max * (H - 8), hq = qrs[i] / max * (H - 8);
          return `<rect x="${i * bw + bw / 2 - w - 1}" y="${H - he}" width="${w}" height="${he}" rx="2" fill="var(--blue)"><title>${lab(d)}: ${eng[i]} views with a guest</title></rect><rect x="${i * bw + bw / 2 + 1}" y="${H - hq}" width="${w}" height="${hq}" rx="2" fill="var(--gold)"><title>${lab(d)}: ${qrs[i]} QR scans</title></rect>${i % every === 0 ? `<text x="${i === 0 ? 0 : i * bw + bw / 2}" y="${H + 15}" text-anchor="${i === 0 ? "start" : "middle"}">${lab(d)}</text>` : ""}`; }).join("")}
        <line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="currentColor" stroke-opacity=".12"/></svg></section>
      <section><h2>Your ad</h2><div class="preview-wrap">${adPreview(s)}</div></section>
      ${n <= 31 ? `<section><h2>Daily figures</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th class="num">Guests reached</th><th class="num">Views with a guest</th><th class="num">Total views</th><th class="num">QR scans</th></tr></thead><tbody>
        ${days.map((d, i) => `<tr><td>${lab(d)}</td><td class="num">${fmt(rch[i])}</td><td class="num">${fmt(eng[i])}</td><td class="num">${fmt(tot[i])}</td><td class="num">${fmt(qrs[i])}</td></tr>`).join("")}</tbody></table></div></section>` : ""}
      <footer class="report-foot"><p><b>How we count.</b> Ads rotate every 8 seconds. A view with a guest is counted when the ad is on screen while someone is using the kiosk; each guest session counts once toward guests reached. QR scans are counted when a phone opens the ad's QR code. No personal information is collected.</p><p>Prepared by CityPulse Kiosks · citypulsekiosks.com</p></footer>
    </article>`;
  }

  /* ---------- how an ad looks on the kiosk ---------- */
  function qrSvg(text) {
    if (typeof qrcode !== "function" || !text) return "";
    const q = qrcode(0, "M"); q.addData(text); q.make();
    const N = q.getModuleCount(); let d = "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (q.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
    return `<svg viewBox="-3 -3 ${N + 6} ${N + 6}" shape-rendering="crispEdges" aria-hidden="true"><rect x="-3" y="-3" width="${N + 6}" height="${N + 6}" fill="#fff"/><path fill="#0F1C2B" d="${d}"/></svg>`;
  }
  function adPreview(s) {
    const it = s.item && D.items[s.item], walk = it ? far(it) : "";
    let url = ""; try { url = new URL(s.url).protocol === "https:" ? s.url : ""; } catch (e) { /* not a link yet */ }
    return `<div class="kad" aria-label="Preview of the ad on the kiosk">
      <div class="kad-logo">${s.logo ? `<img src="${esc(imgUrl(s.logo))}" alt="">` : `<span>${esc(initials(s.name || "?"))}</span>`}</div>
      <span class="kad-tag">Sponsored</span>
      <b class="kad-name">${esc(s.name || "Business name")}</b>
      <span class="kad-kind">${esc(s.kind || "")}${s.kind && walk ? " · " : ""}${esc(walk)}</span>
      ${s.tagline ? `<span class="kad-line">${esc(s.tagline)}</span>` : ""}
      <span class="kad-web">${esc(s.website || "")}</span>
      <div class="kad-qr">${url ? qrSvg(url) : `<span>QR code appears when the link is set</span>`}</div><small class="kad-scan">Scan to visit</small>
    </div>`;
  }

  function csv() {
    const rows = [["Business", "Total ad views", "Views with a guest using the kiosk", "Guests reached", "QR scans", "Scans per 100 guests reached", "From", "To"]].concat(adRows().map(r => [r.name, r.views, r.engaged, r.reach, r.scans, r.reach ? (r.scans / r.reach * 100).toFixed(1) : "", stats.from, stats.to]));
    const text = rows.map(r => r.map(c => /[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.download = `citypulse-ads-${stats.from}-to-${stats.to}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- ads ---------- */
  function vAds() {
    const placeOpts = [["", "None"]].concat(Object.entries(D.items).filter(([, it]) => !it.hotel).sort((a, b) => a[1].n.localeCompare(b[1].n)).map(([id, it]) => [id, it.n]));
    return `<div class="head"><div><h1>Ads</h1><p>Sponsored businesses in the kiosk's ad carousel. Each ad shows the logo, name, tagline, website and a QR code. Ads rotate every 8 seconds and can't be tapped.</p></div>
      <button class="btn primary" data-act="add-ad">Add an ad</button></div>
      <div class="note" style="margin-bottom:18px"><b>Before adding a business,</b> make sure it has agreed to advertise and that you may use its logo.</div>
      ${D.sponsors.map((s, i) => {
        const p = `sponsors.${i}`;
        return `<div class="card"><div class="ad">
          <div class="logo-col">
            <div class="logo-box">${s.logo ? `<img src="${esc(imgUrl(s.logo))}" alt="${esc(s.name)} logo">` : `<span>${esc(initials(s.name))}</span>`}</div>
            <label class="btn small">${s.logo ? "Replace logo" : "Upload logo"}<input type="file" class="sr" accept="image/png,image/jpeg,image/webp" data-upload="${p}.logo" data-kind="logo"></label>
            ${s.logo ? `<button class="btn small ghost" data-act="clear" data-path="${p}.logo">Remove logo</button>` : ""}
            <small class="muted" style="font-size:13px">PNG with a clear background works best.</small>
            <div class="preview-wrap small" id="ad-prev-${i}">${adPreview(s)}</div>
          </div>
          <div>
            <div class="ad-top"><h3 id="ad-t-${i}">${esc(s.name || "New ad")}</h3><span class="pill ${adStatus(s)[0]}"><i></i>${esc(adStatus(s)[1])}</span>
              <label class="switch"><input type="checkbox" data-bind="${p}.active" ${s.active !== false ? "checked" : ""} aria-label="Show on kiosks">Show on kiosks</label></div>
            <div class="fields">
              ${field("Business name", p + ".name", { max: 60, title: "ad-t-" + i, req: true })}
              ${field("What it is", p + ".kind", { max: 50, placeholder: "Restaurant and bar" })}
              ${field("Tagline", p + ".tagline", { max: 110, full: true, req: true })}
              ${field("Website shown", p + ".website", { max: 60, placeholder: "example.com" })}
              ${field("QR code opens", p + ".url", { type: "url", placeholder: "https://", help: "Must start with https://. Guests scan the code to open this page on their own phone." })}
              ${field("Linked place", p + ".item", { options: placeOpts, help: "Shows the walking time on the ad." })}
              <div class="dates">${field("Campaign starts", p + ".start", { type: "date", help: "Optional. Leave empty to start now." })}${field("Campaign ends", p + ".end", { type: "date", help: "Optional. The ad comes off the kiosks after this day." })}</div>
            </div>
            ${s.id ? dealHTML(s) : `<p class="muted" style="font-size:14px;margin-top:14px">Publish this ad once to add deal details and a report link.</p>`}
            <div class="item-actions">
              ${s.id ? `<button class="btn small" data-act="report" data-id="${esc(s.id)}">Advertiser report</button>` : ""}
              <span class="grow"></span>
              <button class="icon-btn" data-act="move" data-list="sponsors" data-i="${i}" data-d="-1" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button>
              <button class="icon-btn" data-act="move" data-list="sponsors" data-i="${i}" data-d="1" aria-label="Move down" ${i === D.sponsors.length - 1 ? "disabled" : ""}>↓</button>
              ${armed("del-ad", "Delete ad", ` data-i="${i}"`)}
            </div>
          </div></div></div>`;
      }).join("") || `<div class="card empty">No ads yet.</div>`}`;
  }
  /* ---------- deals (private: never sent to kiosks) ---------- */
  function monthlyRevenue() {
    let total = 0, count = 0, pending = 0;
    D.sponsors.forEach(s => { const d = deals[s.id]; if (!d || d.price == null) return; if (d.status === "Active") { total += +d.price; count++; } else if (d.status === "Pending") pending += +d.price; });
    return { total, count, pending };
  }
  function dealHTML(s) {
    const d = deals[s.id] || {}, id = esc(s.id), isOpen = open === "d:" + s.id;
    const f = (label, key, type, extra) => `<label class="f"><span>${label}</span><input type="${type || "text"}" data-deal="${id}" data-key="${key}" value="${esc(d[key] == null ? "" : d[key])}"${extra || ""}></label>`;
    const summary = [d.status || "", d.price != null ? `$${fmt(d.price)}/month` : "", d.contact || ""].filter(Boolean).join(" · ");
    return `<div class="deal${isOpen ? " open" : ""}">
      <button class="deal-head" data-act="open" data-key="d:${id}" aria-expanded="${isOpen}"><span>🔒 Deal details <em>private, never shown on kiosks</em></span><small>${esc(summary || "Add contact and price")}</small></button>
      ${isOpen ? `<div class="fields" style="margin-top:12px">
        ${f("Contact name", "contact", "text", ' maxlength="80"')}${f("Monthly price (USD)", "price", "number", ' min="0" step="1" inputmode="decimal"')}
        ${f("Email", "email", "email", ' maxlength="120"')}${f("Phone", "phone", "tel", ' maxlength="30"')}
        <label class="f"><span>Status</span><select data-deal="${id}" data-key="status">${["Active", "Pending", "Paused", "Ended"].map(o => `<option${(d.status || "Active") === o ? " selected" : ""}>${o}</option>`).join("")}</select></label>
        <label class="f full"><span>Notes</span><textarea data-deal="${id}" data-key="notes" maxlength="1000" rows="3" placeholder="Package, renewal date, who to talk to…">${esc(d.notes || "")}</textarea></label>
      </div>
      <div class="item-actions" style="border-top:0;padding-top:0"><span class="grow muted" style="font-size:13px">${d.updated_at ? "Saved " + esc(ago(d.updated_at)) : "Not saved yet"}</span>
        <button class="btn small" data-act="share" data-id="${id}">Copy report link</button><button class="btn small primary" data-act="save-deal" data-id="${id}">Save deal</button></div>` : ""}
    </div>`;
  }
  async function saveDeal(id) {
    const deal = {};
    document.querySelectorAll(`[data-deal="${CSS.escape(id)}"]`).forEach(el => { deal[el.dataset.key] = el.value; });
    try { const r = await api("deals", { method: "PUT", json: { sponsor: id, deal } }); deals[id] = r.deal; render(); toast("Deal saved."); }
    catch (e) { if (e.message !== "signed out") toast(e.message, true); }
  }
  async function shareLink(id) {
    try {
      const r = await api("share?sponsor=" + encodeURIComponent(id));
      let copied = false;
      try { await navigator.clipboard.writeText(r.url); copied = true; } catch (e) { /* clipboard blocked */ }
      showShare(r.url, copied);
    } catch (e) { if (e.message !== "signed out") toast(e.message, true); }
  }
  function showShare(link, copied) {
    let m = document.getElementById("share");
    if (!m) { m = document.createElement("div"); m.id = "share"; m.className = "share"; document.body.appendChild(m); }
    m.innerHTML = `<div class="share-box" role="dialog" aria-modal="true" aria-labelledby="share-t"><h3 id="share-t">Live report link</h3>
      <p>${copied ? "Copied. " : ""}Send this private link to the business. It shows their own up-to-date numbers, with no sign-in. Changing the staff password turns all report links off.</p>
      <input type="text" readonly value="${esc(link)}" id="share-url" aria-label="Report link">
      <div class="item-actions" style="border-top:0"><span class="grow"></span><button class="btn small" data-act="close-share">Close</button></div></div>`;
    m.hidden = false;
    const u = document.getElementById("share-url"); u.focus(); u.select();
  }

  /* ---------- announcements ---------- */
  function vNotices() {
    return `<div class="head"><div><h1>Announcements</h1><p>Short notices shown at the top of the kiosk's welcome and home screens, like "Pool closed today for maintenance" or "Happy hour 5 to 7 PM in the lobby". Up to two show at a time.</p></div>
      <button class="btn primary" data-act="add-notice">Add an announcement</button></div>
      ${D.notices.length ? D.notices.map((n, i) => {
        const p = `notices.${i}`, st = adStatus(n);
        return `<div class="card"><div class="ad-top"><h3>Announcement ${i + 1}</h3><span class="pill ${st[0]}"><i></i>${esc(st[1])}</span>
            <label class="switch"><input type="checkbox" data-bind="${p}.active" ${n.active !== false ? "checked" : ""} aria-label="Show on kiosks">Show on kiosks</label></div>
          <div class="fields">${field("Message", p + ".text", { max: 120, full: true, placeholder: "Pool closed today for maintenance" })}
            <div class="dates">${field("Show from", p + ".start", { type: "date", help: "Optional." })}${field("Show until", p + ".end", { type: "date", help: "Optional. It comes off the kiosks after this day." })}</div></div>
          <div class="notice-prev" id="notice-prev-${i}">${noticePreview(n)}</div>
          <div class="item-actions"><span class="grow"></span>
            <button class="icon-btn" data-act="move" data-list="notices" data-i="${i}" data-d="-1" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="icon-btn" data-act="move" data-list="notices" data-i="${i}" data-d="1" aria-label="Move down" ${i === D.notices.length - 1 ? "disabled" : ""}>↓</button>
            ${armed("del-notice", "Delete", ` data-i="${i}"`)}</div></div>`;
      }).join("") : `<div class="card empty">No announcements. Add one to show a message on the kiosks.</div>`}`;
  }
  const noticePreview = n => `<div class="knotice"><span aria-hidden="true">📣</span><b>${esc(n.text || "Your message")}</b></div>`;

  const initials = n => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  /* ---------- places ---------- */
  function far(it) {
    if (!it.ll || !D.ll || it.ll[0] === "" || it.ll[1] === "") return "";
    const R = 3958.8, r = d => d * Math.PI / 180;
    const x = Math.sin(r(it.ll[0] - D.ll[0]) / 2) ** 2 + Math.cos(r(D.ll[0])) * Math.cos(r(it.ll[0])) * Math.sin(r(it.ll[1] - D.ll[1]) / 2) ** 2;
    const m = 2 * R * Math.asin(Math.sqrt(x));
    if (!isFinite(m)) return "";
    return m <= 1.2 ? `${Math.max(1, Math.round(m * 24))} min walk` : `${m < 10 ? m.toFixed(1) : Math.round(m)} mi`;
  }
  function placeRow(id, catKey) {
    const it = D.items[id];
    if (!it) return "";
    const isOpen = open === "p:" + id;
    const p = `items.${id}`;
    const sub = [it.k, it.price, far(it)].filter(Boolean).join(" · ");
    return `<div class="item${isOpen ? " open" : ""}" data-search="${esc((it.n + " " + it.k + " " + (it.addr || "")).toLowerCase())}">
      <div class="item-head"><div class="t"><b id="pt-${esc(id)}-${esc(catKey)}">${esc(it.n)}</b><small>${esc(sub)}</small></div>
        <button class="btn small" data-act="open" data-key="p:${esc(id)}" aria-expanded="${isOpen}">${isOpen ? "Close" : "Edit"}</button></div>
      ${isOpen ? `<div class="item-body"><div class="fields">
        ${field("Name", p + ".n", { max: 80, req: true })}
        ${field(it.hotel ? "Short line" : "Type", p + ".k", { max: 80, placeholder: it.hotel ? "Open 24 hours" : "Diner" })}
        ${it.hotel ? "" : `
          ${field("Address", p + ".addr", { max: 160, full: true, placeholder: "Street, city, state ZIP" })}
          <div class="full maps-row"><label class="f" for="maps-${esc(id)}"><span>Google Maps link</span><input type="url" id="maps-${esc(id)}" placeholder="Paste the place's Share link from Google Maps"></label><button class="btn small" data-act="maps" data-id="${esc(id)}">Find location</button></div>
          ${field("Latitude", p + ".ll.0", { kind: "num", mode: "decimal", help: "Filled in from the link, or in Google Maps right-click the place and copy the numbers." })}
          ${field("Longitude", p + ".ll.1", { kind: "num", mode: "decimal" })}
          ${field("Price", p + ".price", { options: [["", "Not shown"], ["$", "$"], ["$$", "$$"], ["$$$", "$$$"], ["$$$$", "$$$$"]] })}`}
        ${field("Description", p + ".d", { max: 400, area: true, full: true, help: "Shown on the kiosk and used by the AI concierge. Don't include opening hours; they change." })}
      </div>
      <h3 style="margin-top:18px;font-size:15px">Details</h3><p class="muted" style="font-size:14px;margin:2px 0 10px">Short facts shown as a list, for example "Walk" and "4 minutes".</p>
      <div class="rows">${(it.f || []).map((r, j) => `<div class="row">
        <input type="text" data-bind="${p}.f.${j}.0" value="${esc(r[0])}" maxlength="30" aria-label="Detail name">
        <input type="text" data-bind="${p}.f.${j}.1" value="${esc(r[1])}" maxlength="80" aria-label="Detail">
        <button class="icon-btn" data-act="del-fact" data-id="${esc(id)}" data-j="${j}" aria-label="Remove detail">×</button></div>`).join("")}</div>
      ${(it.f || []).length < 8 ? `<button class="btn small" style="margin-top:10px" data-act="add-fact" data-id="${esc(id)}">Add a detail</button>` : ""}
      <h3 style="margin-top:18px;font-size:15px">Shown in</h3>
      <div class="checks">${Object.entries(D.categories).map(([k, c]) => `<label class="check"><input type="checkbox" data-item="${esc(id)}" data-cat="${esc(k)}" ${c.items.includes(id) ? "checked" : ""}>${esc(c.label)}</label>`).join("")}</div>
      <div class="item-actions"><span class="grow"></span>
        ${catKey !== "_none" ? `<button class="icon-btn" data-act="move-in-cat" data-id="${esc(id)}" data-cat="${esc(catKey)}" data-d="-1" aria-label="Move up">↑</button><button class="icon-btn" data-act="move-in-cat" data-id="${esc(id)}" data-cat="${esc(catKey)}" data-d="1" aria-label="Move down">↓</button>` : ""}
        ${armed("del-place", "Delete place", ` data-id="${esc(id)}"`)}</div>
      </div>` : ""}
    </div>`;
  }
  function vPlaces() {
    const used = new Set(Object.values(D.categories).flatMap(c => c.items));
    const orphans = Object.keys(D.items).filter(id => !used.has(id));
    return `<div class="head"><div><h1>Places</h1><p>Everything guests can browse on the kiosk, by section. The AI concierge only recommends places listed here.</p></div>
      <input type="search" id="place-q" placeholder="Search places" value="${esc(placeQuery)}" style="max-width:280px" aria-label="Search places"></div>
      ${Object.entries(D.categories).map(([k, c]) => `<div class="card" data-cat-card>
        <div class="section-title"><h3>${esc(c.label)}</h3><span>${c.items.length} ${c.items.length === 1 ? "place" : "places"}</span>
          <button class="btn small" data-act="add-place" data-cat="${esc(k)}">Add${k === "hotel" ? " a service" : " a place"}</button></div>
        ${c.items.map(id => placeRow(id, k)).join("") || `<div class="empty">Nothing in this section yet.</div>`}
      </div>`).join("")}
      ${orphans.length ? `<div class="card" data-cat-card><div class="section-title"><h3>Not shown in any section</h3><span>Guests can still be sent here by the AI and by answers.</span></div>${orphans.map(id => placeRow(id, "_none")).join("")}</div>` : ""}`;
  }
  function filterPlaces() {
    const q = placeQuery.trim().toLowerCase();
    document.querySelectorAll("[data-search]").forEach(el => { el.hidden = !!q && !el.dataset.search.includes(q); });
  }
  function toggleCat(id, cat, on) {
    const list = D.categories[cat].items;
    const i = list.indexOf(id);
    if (on && i < 0) list.push(id);
    if (!on && i >= 0) list.splice(i, 1);
  }
  function newId(name) {
    let b = String(name || "place").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "place";
    let id = b, n = 2;
    while (D.items[id]) id = `${b}-${n++}`;
    return id;
  }

  /* ---------- answers ---------- */
  function vAnswers() {
    const placeOpts = Object.entries(D.items).sort((a, b) => a[1].n.localeCompare(b[1].n));
    return `<div class="head"><div><h1>Answers</h1><p>Approved answers to common questions. The kiosk shows these instantly when a guest's question contains a keyword, and the AI concierge uses them as its facts.</p></div>
      <button class="btn primary" data-act="add-faq">Add an answer</button></div>
      <div class="card">${D.faq.map((f, i) => {
        const isOpen = open === "f:" + i, p = `faq.${i}`;
        return `<div class="item${isOpen ? " open" : ""}">
          <div class="item-head"><div class="t"><b id="fq-${i}">${esc(f.q || "New question")}</b><small>${esc((f.keys || []).join(", "))}</small></div>
            <button class="btn small" data-act="open" data-key="f:${i}" aria-expanded="${isOpen}">${isOpen ? "Close" : "Edit"}</button></div>
          ${isOpen ? `<div class="item-body"><div class="fields">
            ${field("Question", p + ".q", { max: 120, full: true, title: "fq-" + i })}
            ${field("Keywords", p + ".keys", { kind: "list", full: true, help: "Separate with commas. The answer shows when a guest's question contains any of these words or phrases." })}
            ${field("Answer", p + ".a", { max: 500, area: true, full: true, rows: 4 })}
          </div>
          <h3 style="margin-top:18px;font-size:15px">Related places</h3><p class="muted" style="font-size:14px;margin:2px 0 10px">Shown as cards under the answer; the kiosk shows the first 3.</p>
          <div class="chips">${(f.items || []).map((id, j) => `<span class="chip">${esc(nameOf(id))}<button data-act="del-chip" data-path="${p}.items" data-j="${j}" aria-label="Remove ${esc(nameOf(id))}">×</button></span>`).join("")}
            ${(f.items || []).length < 6 ? `<select data-addchip="${p}.items" style="width:auto;min-width:200px" aria-label="Add a related place"><option value="">Add a place…</option>${placeOpts.filter(([id]) => !(f.items || []).includes(id)).map(([id, it]) => `<option value="${esc(id)}">${esc(it.n)}</option>`).join("")}</select>` : ""}</div>
          <div class="item-actions"><span class="grow"></span>
            <button class="icon-btn" data-act="move" data-list="faq" data-i="${i}" data-d="-1" aria-label="Move up" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="icon-btn" data-act="move" data-list="faq" data-i="${i}" data-d="1" aria-label="Move down" ${i === D.faq.length - 1 ? "disabled" : ""}>↓</button>
            ${armed("del-faq", "Delete answer", ` data-i="${i}"`)}</div>
          </div>` : ""}</div>`;
      }).join("") || `<div class="empty">No answers yet.</div>`}</div>`;
  }

  /* ---------- hotel ---------- */
  function vHotel() {
    return `<div class="head"><div><h1>Hotel</h1><p>Your hotel's details, logo, background photos and home screen buttons. Hotel services such as Wi-Fi and parking are in Places, under Hotel services.</p></div></div>
      <div class="card"><h2>Details</h2><div class="fields" style="margin-top:16px">
        ${field("Hotel name", "name", { max: 80 })}
        ${field("Email", "email", { type: "email", max: 120 })}
        ${field("Address", "address", { max: 160, full: true })}
        ${field("Phone (as shown)", "phone", { type: "tel", max: 30, placeholder: "(818) 821-3680" })}
        ${field("Phone (for tap-to-call)", "tel", { type: "tel", max: 20, placeholder: "+18188213680", help: "Digits only, with the country code." })}
        ${field("Latitude", "ll.0", { kind: "num", mode: "decimal", help: "Used for walking times and the weather." })}
        ${field("Longitude", "ll.1", { kind: "num", mode: "decimal" })}
      </div></div>
      <div class="card"><div class="ad"><div class="logo-col">
          <div class="logo-box" style="background:#16202c">${D.logo ? `<img src="${esc(imgUrl(D.logo))}" alt="Hotel logo">` : ""}</div></div>
        <div><h2>Logo</h2><p class="muted" style="margin:4px 0 14px">Shown at the top of the kiosk on a dark background. Use a PNG with a clear background and light-colored artwork.</p>
          <label class="btn small">Replace logo<input type="file" class="sr" accept="image/png,image/webp" data-upload="logo" data-kind="logo"></label></div></div></div>
      <div class="card"><h2>Background photos</h2><p>They fade slowly behind the kiosk screens. Landscape photos at least 1920 pixels wide look best. Up to 8.</p>
        <div class="photos" style="margin-top:16px">${D.photos.map((ph, i) => `<div class="photo"><img src="${esc(imgUrl(ph))}" alt="Background photo ${i + 1}">
          <div class="acts"><button class="icon-btn" data-act="move" data-list="photos" data-i="${i}" data-d="-1" aria-label="Move earlier" ${i === 0 ? "disabled" : ""}>←</button>
          <button class="icon-btn" data-act="move" data-list="photos" data-i="${i}" data-d="1" aria-label="Move later" ${i === D.photos.length - 1 ? "disabled" : ""}>→</button>
          <button class="icon-btn" data-act="del-photo" data-i="${i}" aria-label="Remove photo" ${D.photos.length < 2 ? "disabled" : ""}>×</button></div></div>`).join("")}
          ${D.photos.length < 8 ? `<label class="photo add">Add a photo<input type="file" class="sr" accept="image/jpeg,image/png,image/webp" data-upload="photos.${D.photos.length}" data-kind="photo"></label>` : ""}</div></div>
      <div class="card"><h2>Home screen buttons</h2><p>The large buttons on the kiosk's home screen. Each opens a section from Places.</p>
        ${D.tiles.map((t, i) => `<div class="item"><div class="item-body" style="border-top:0"><div class="fields">
          ${field("Button name", `tiles.${i}.label`, { max: 30 })}
          ${field("Subtitle", `tiles.${i}.sub`, { max: 60 })}
          ${field("Opens section", `tiles.${i}.id`, { options: Object.entries(D.categories).map(([k, c]) => [k, c.label]) })}
          ${field("Icon", `tiles.${i}.icon`, { options: Object.entries(ICONS) })}
        </div></div></div>`).join("")}</div>
      <div class="card"><h2>Sections</h2><p>Names and introductions shown at the top of each section.</p>
        ${Object.keys(D.categories).map(k => `<div class="item"><div class="item-body" style="border-top:0"><div class="fields">
          ${field("Section name", `categories.${k}.label`, { max: 40 })}
          ${field("Icon", `categories.${k}.icon`, { options: Object.entries(ICONS) })}
          ${field("Introduction", `categories.${k}.intro`, { max: 200, full: true })}
        </div></div></div>`).join("")}</div>`;
  }

  /* ---------- kiosks ---------- */
  function ago(iso) {
    const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (s < 90) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} minutes ago`;
    if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
    return `${Math.round(s / 86400)} days ago`;
  }
  function device(ua) {
    ua = ua || "";
    const os = /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /CrOS/.test(ua) ? "ChromeOS" : /iPad|iPhone/.test(ua) ? "iPad" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "";
    const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
    return [br, os].filter(Boolean).join(" on ") || "Unknown";
  }
  function vKiosks() {
    const list = stats ? stats.kiosks : null;
    return `<div class="head"><div><h1>Kiosks</h1><p>Every screen running your kiosk. Kiosks check in every 2 minutes and pick up published changes the next time they're on the welcome screen. <b>Restart</b> reloads a kiosk remotely, when nobody is using it.</p></div>
      <button class="btn small" data-act="refresh">Update this list</button>${list && list.length ? `<button class="btn small" data-act="kiosk-reload" data-k="*">Restart all kiosks</button>` : ""}</div>
      <div class="card">${!list ? `<div class="loading">Loading…</div>` : list.length ? `<div class="table-wrap"><table><thead><tr><th>Kiosk</th><th>Status</th><th>Last check-in</th><th>Content</th><th>Screen</th><th>Device</th><th></th></tr></thead><tbody>
        ${list.map(k => { const off = kioskOffline(k), cur = k.version === base;
          return `<tr><td><b>${esc(k.kiosk)}</b></td><td>${!off ? `<span class="pill ok"><i></i>Online</span>` : `<span class="pill bad"><i></i>Offline</span>`}</td>
          <td>${esc(ago(k.last_seen))}</td><td>${cur ? `<span class="pill ok">Up to date</span>` : `<span class="pill">Version ${esc(k.version || "–")}, updating</span>`}</td>
          <td class="muted">${k.screen ? esc(k.screen.replace("x", " × ")) : "–"}${k.app ? `<br><small>Kiosk software ${esc(k.app)}</small>` : ""}</td><td class="muted">${esc(device(k.ua))}</td>
          <td class="num nowrap"><button class="btn small" data-act="kiosk-reload" data-k="${esc(k.kiosk)}" title="Reloads the kiosk page within about 2 minutes, when nobody is using it">Restart</button> ${armed("kiosk-remove", "Remove", ` data-k="${esc(k.kiosk)}" title="Removes it from this list. Its numbers stay in the totals."`)}</td></tr>`; }).join("")}
      </tbody></table></div>` : `<div class="empty">No kiosk has checked in yet.</div>`}</div>
      <div class="card"><h3>Naming a kiosk</h3><p>Each kiosk gets a code name the first time it starts. To give one a clear name, open the kiosk page once on that screen with <b>?kiosk=</b> and a name at the end of the address, for example <b>…/kiosk-app/?kiosk=lobby</b>. Use letters, numbers and dashes.</p></div>`;
  }

  /* ---------- history ---------- */
  function vHistory() {
    const h = meta.history || [];
    return `<div class="head"><div><h1>History</h1><p>Every published version. Restoring one publishes it again as a new version, so nothing is lost.</p></div></div>
      <div class="card">${h.length ? `<div class="table-wrap"><table><thead><tr><th>Version</th><th>Published</th><th>What changed</th><th></th></tr></thead><tbody>
        ${h.map(r => `<tr><td><b>${r.version}</b>${r.version === base ? ` <span class="pill ok">Live</span>` : ""}</td><td>${esc(new Date(r.saved_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }))}</td><td>${esc(r.note || "")}</td>
          <td class="num">${r.version === base ? "" : `<button class="btn small" data-act="restore" data-v="${r.version}" data-armed-label="Click again to restore">Restore</button>`}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="empty">No versions yet.</div>`}</div>`;
  }

  /* ---------- images ---------- */
  async function upload(file, path, kind) {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast("Use a PNG, JPG or WebP image.", true);
    if (file.size > 25 * 1024 * 1024) return toast("That image is too large.", true);
    toast("Uploading…");
    try {
      const blob = await shrink(file, kind === "photo" ? 2000 : 640, kind === "photo" ? "image/jpeg" : "image/png");
      const r = await api("media", { body: blob, type: blob.type });
      setPath(D, path, r.ref);
      markDirty(); render();
      toast("Image added. Publish to send it to the kiosks.");
    } catch (e) { if (e.message !== "signed out") toast(e.message, true); }
  }
  async function shrink(file, max, type) {
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { throw new Error("That image can't be opened. Try a PNG or JPG."); }
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const out = (t, q) => new Promise(res => c.toBlob(res, t, q));
    let b = await out(type, 0.85);
    if (b && b.size > 950 * 1024) b = await out("image/webp", 0.85);
    if (b && b.size > 950 * 1024) b = await out("image/jpeg", 0.75);
    if (!b || b.size > 1024 * 1024) throw new Error("That image is still larger than 1 MB after resizing. Try a smaller one.");
    return b;
  }

  /* ---------- actions ---------- */
  async function onClick(e) {
    const tb = e.target.closest("[data-tab]");
    if (tb) { tab = tb.dataset.tab; open = null; history.replaceState(null, "", "#" + tab); render(); if (tab === "overview" || tab === "kiosks") loadStats(); return; }
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    /* destructive buttons need a second click */
    if (b.dataset.armedLabel && !b.classList.contains("armed")) {
      document.querySelectorAll(".armed").forEach(x => { x.classList.remove("armed"); x.textContent = x.dataset.orig; });
      b.dataset.orig = b.textContent; b.classList.add("armed", "danger"); b.textContent = b.dataset.armedLabel;
      setTimeout(() => { if (b.isConnected && b.classList.contains("armed")) { b.classList.remove("armed"); b.textContent = b.dataset.orig; } }, 4000);
      return;
    }
    const d = b.dataset, i = +d.i;
    switch (d.act) {
      case "logout": if (isDirty() && !b.classList.contains("armed")) { b.dataset.armedLabel = "Unpublished changes will be lost. Click again"; b.click(); return; }
        try { await api("logout", { json: {} }); } catch (err) { /* ignore */ } D = null; login("You're signed out.", true); return;
      case "publish": return publish();
      case "discard": D = clone(saved); markDirty(); render(); toast("Changes discarded."); return;
      case "range": range = +d.days; stats = null; render(); return loadStats();
      case "refresh": stats = null; render(); return loadStats();
      case "csv": return csv();
      case "report": reportId = d.id; tab = "report"; history.replaceState(null, "", "#overview"); window.scrollTo(0, 0); if (!stats || stats.days < 7) { range = 30; stats = null; loadStats(); } render(); return;
      case "back-overview": tab = "overview"; render(); return;
      case "print": return window.print();
      case "save-deal": return saveDeal(d.id);
      case "share": return shareLink(d.id);
      case "close-share": { const m = document.getElementById("share"); if (m) m.hidden = true; return; }
      case "add-notice": D.notices.unshift({ text: "", active: true }); break;
      case "del-notice": D.notices.splice(i, 1); break;
      case "kiosk-reload": try { const r = await api("kiosk-action", { json: { kiosk: d.k, action: "reload" } }); toast(d.k === "*" ? `Restarting ${r.kiosks} kiosk${r.kiosks === 1 ? "" : "s"} within about 2 minutes, when nobody is using them.` : `${d.k} will restart within about 2 minutes, when nobody is using it.`); } catch (e) { if (e.message !== "signed out") toast(e.message, true); } return;
      case "kiosk-remove": try { await api("kiosk-action", { json: { kiosk: d.k, action: "remove" } }); toast(`${d.k} removed from the list.`); stats = null; render(); loadStats(); } catch (e) { if (e.message !== "signed out") toast(e.message, true); } return;
      case "maps": return findOnMaps(d.id);
      case "open": open = open === d.key ? null : d.key; render(); return;
      case "move": { const list = getPath(D, d.list), j = i + +d.d; if (j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; break; }
      case "clear": setPath(D, d.path, undefined); break;
      case "add-ad": D.sponsors.push({ id: "", name: "", kind: "", tagline: "", website: "", url: "https://", sponsored: true, active: true }); break;
      case "del-ad": D.sponsors.splice(i, 1); break;
      case "del-photo": D.photos.splice(i, 1); break;
      case "add-place": {
        const hotel = d.cat === "hotel";
        const id = newId(hotel ? "lx-service" : "new-place");
        D.items[id] = hotel ? { n: "New service", k: "", hotel: 1, d: "", f: [] } : { n: "New place", k: "", addr: "", ll: ["", ""], d: "", f: [] };
        D.categories[d.cat].items.unshift(id);
        open = "p:" + id; placeQuery = ""; break;
      }
      case "del-place": {
        const id = d.id;
        delete D.items[id];
        Object.values(D.categories).forEach(c => { c.items = c.items.filter(x => x !== id); });
        D.faq.forEach(f => { f.items = (f.items || []).filter(x => x !== id); });
        D.sponsors.forEach(s => { if (s.item === id) delete s.item; });
        open = null; break;
      }
      case "move-in-cat": { const list = D.categories[d.cat].items, a = list.indexOf(d.id), j = a + +d.d; if (a < 0 || j < 0 || j >= list.length) return; [list[a], list[j]] = [list[j], list[a]]; break; }
      case "add-fact": { const it = D.items[d.id]; (it.f = it.f || []).push(["", ""]); break; }
      case "del-fact": D.items[d.id].f.splice(+d.j, 1); break;
      case "add-faq": D.faq.unshift({ q: "", keys: [], a: "", items: [] }); open = "f:0"; break;
      case "del-faq": D.faq.splice(i, 1); open = null; break;
      case "del-chip": getPath(D, d.path).splice(+d.j, 1); break;
      case "restore": return restore(+d.v);
      default: return;
    }
    markDirty(); render();
  }

  function coordsFrom(href) {
    let t = href; try { t = decodeURIComponent(href); } catch (e) { /* keep as is */ }
    for (const re of [/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|query|ll|destination|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/, /^\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\s*$/]) {
      const m = t.match(re); if (m && Math.abs(+m[1]) <= 90 && Math.abs(+m[2]) <= 180) return [+m[1], +m[2]];
    }
    return null;
  }
  async function findOnMaps(id) {
    const inp = document.getElementById("maps-" + id), v = inp ? inp.value.trim() : "";
    if (!v) { toast("Paste a Google Maps link first.", true); return; }
    let ll = coordsFrom(v), name = "";
    if (!ll) {
      try { const r = await api("resolve-map?url=" + encodeURIComponent(v)); ll = r.ll; name = r.name; }
      catch (e) { if (e.message !== "signed out") toast(e.message, true); return; }
    }
    const it = D.items[id];
    it.ll = [Math.round(ll[0] * 1e7) / 1e7, Math.round(ll[1] * 1e7) / 1e7];
    if (name && (!it.n || /^New place$/.test(it.n))) it.n = name;
    markDirty(); render();
    toast(`Location set: ${far(it) || "found"} from the hotel.`);
  }

  function cleaned() {
    const c = clone(D);
    /* new places get their id from their name */
    for (const id of Object.keys(c.items)) {
      const it = c.items[id];
      if (it.ll && (it.ll[0] === "" || it.ll[1] === "")) it.ll = it.hotel ? undefined : it.ll;
      if (!it.price) delete it.price;
      it.f = (it.f || []).filter(r => r && (String(r[0]).trim() || String(r[1]).trim()));
    }
    c.sponsors.forEach(s => { if (!s.item) delete s.item; if (!s.logo) delete s.logo; });
    return c;
  }

  async function publish() {
    if (busy) return;
    busy = true;
    const btn = document.querySelector('[data-act="publish"]'); if (btn) { btn.disabled = true; btn.textContent = "Publishing…"; }
    const areas = changedAreas();
    try {
      const r = await api("content", { method: "PUT", json: { base, data: cleaned(), note: areas.length ? "Edited " + areas.join(", ") : "Edited in the dashboard" } });
      saved = r.data; D = clone(r.data); base = r.version;
      meta.history = [{ version: r.version, saved_at: r.updated_at, note: areas.length ? "Edited " + areas.join(", ") : "Edited in the dashboard" }].concat(meta.history || []).slice(0, 40);
      markDirty(); render();
      toast("Published. Kiosks update within 5 minutes, the next time they're on the welcome screen.");
    } catch (e) { if (e.message !== "signed out") toast(e.message, true); }
    finally { busy = false; const b2 = document.querySelector('[data-act="publish"]'); if (b2) { b2.disabled = false; b2.textContent = "Publish to kiosks"; } }
  }

  async function restore(v) {
    if (isDirty()) return toast("Publish or discard your changes before restoring a version.", true);
    try {
      const r = await api("restore", { json: { version: v } });
      saved = r.data; D = clone(r.data); base = r.version;
      const c = await api("content"); meta.history = c.history;
      markDirty(); render(); toast(`Version ${v} restored and published as version ${r.version}.`);
    } catch (e) { if (e.message !== "signed out") toast(e.message, true); }
  }

  setInterval(() => { if (D && (tab === "overview" || tab === "kiosks") && !document.hidden) loadStats(); }, 60000);
  boot();
})();
