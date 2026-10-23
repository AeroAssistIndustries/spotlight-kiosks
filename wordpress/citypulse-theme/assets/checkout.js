/* CityPulse Kiosks — self-serve checkout for one location.
   Payment happens right here in step 4: Square's secure card form (and Google Pay) is shown on the page, the card
   goes from that form straight to Square, and Sales Studio (sales.citypulsekiosks.com/api/web/checkout) charges the
   one-time token at the price it holds. After payment the order and files are delivered by the form service
   (assets/integrations.js). If the card form can't load, checkout falls back to the hosted payment link.
   Coupon codes: "Have a code?" under the card form asks Sales Studio (/api/web/coupon) for the price with the code,
   and the payment sends the code so Sales Studio charges that price. A link like /?code=SPRING25#checkout fills it in. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  /* ---------- welcome page: show the order number ---------- */
  const wo = $("#welcome-order");
  if (wo) {
    const o = store.get("citypulse-order"), q = new URLSearchParams(location.search).get("order");
    if (o && (!q || q === o.id)) { wo.textContent = `Order ${o.id} · ${o.plan} · ${o.market}`; wo.hidden = false; }
    else if (q) { wo.textContent = `Order ${q}`; wo.hidden = false; }
    return;
  }

  const form = $("#checkout");
  if (!form) return;
  const steps = $$(".co-step", form), marks = $$(".co-steps li", form);
  const err = $(".form-error", form);
  const back = $("[data-co=back]", form), next = $("[data-co=next]", form), pay = $("[data-co=pay]", form), label = $("[data-co=label]", form);
  const MAXMB = (window.CityPulse && window.CityPulse.maxUploadMB) || 5, MAX = MAXMB * 1024 * 1024;
  const files = { logo: null, artwork: null };
  let cur = 0;

  const PR = window.CP_PRICE || { sale: false, now: { y1: 798, y3: 2198, y5: 2400, extra: 600, mo: 120 }, reg: { y1: 798, y3: 2198, y5: 2400, extra: 600, mo: 120 }, money: function (n) { return "$" + Math.round(n).toLocaleString("en-US"); } }, Y1 = PR.money(PR.now.y1), MO = PR.money(PR.now.mo);
  const billing = () => form.elements.billing.value;
  const adSource = () => form.elements.ad_source.value;
  const market = () => form.elements.market.value === "other" ? form.elements.market_other.value.trim() : form.elements.market.value;
  const planText = () => billing() === "annual" ? `1 location · yearly (${Y1}/yr)` : `1 location · monthly (${MO}/mo)`;

  /* preselect a city from ?market= (map pins and the Locations page link here) */
  const pm = new URLSearchParams(location.search).get("market");
  if (pm) {
    const opt = [...form.elements.market.options].find(o => o.text === pm || o.value === pm);
    if (opt) form.elements.market.value = opt.value;
  }

  /* ---------- live preview + summary ---------- */
  const ads = [$("#co-ad"), $("#co-ad-big")].filter(Boolean);
  const ad = { set className(v) { ads.forEach(a => { a.className = v; }); }, set innerHTML(v) { ads.forEach(a => { a.innerHTML = v; }); } };
  const url = f => f ? URL.createObjectURL(f) : "";
  let logoURL = "", artURL = "";
  function preview() {
    const isImg = f => f && f.type.startsWith("image/");
    if (adSource() === "upload" && isImg(files.artwork)) {
      ad.className = "co-ad art"; ad.innerHTML = `<img src="${artURL}" alt="Your ad artwork">`;
    } else if (adSource() === "upload" && files.artwork) {
      ad.className = "co-ad"; ad.innerHTML = `<span class="co-ad-txt"><b>${esc(files.artwork.name)}</b><small>PDF received — we'll prepare it for the screen</small></span>`;
    } else {
      const biz = form.elements.business.value.trim() || "Your business";
      const hl = form.elements.headline.value.trim() || (adSource() === "upload" ? "Upload your ad to see it here" : "Your headline goes here");
      const cta = form.elements.cta.value.trim() || "Visit us today";
      const offer = form.elements.offer.value.trim();
      const logo = isImg(files.logo) ? `<img class="co-logo" src="${logoURL}" alt="">` : `<span class="co-logo co-logo-ph">${esc(biz.charAt(0))}</span>`;
      ad.className = "co-ad";
      ad.innerHTML = `${logo}<span class="co-ad-txt"><small>${esc(biz)}</small><b>${esc(hl)}</b>${offer ? `<em>${esc(offer)}</em>` : ""}<i>${esc(cta)}</i></span><span class="co-qr" aria-hidden="true"></span>`;
    }
    const m = market();
    $("#co-venue-name").textContent = m ? `A venue in ${m}` : "A venue near you";
    $("#co-sum-plan").textContent = billing() === "annual" ? "1 location · yearly" : "1 location · monthly";
    $("#co-sum-city").textContent = m || "Not chosen yet";
    $("#co-sum-total").textContent = codeOn() ? `${dueText()} today` : billing() === "annual" ? `${Y1}/yr` : `${MO}/mo`;
    const n = form.elements.headline.value.length; $("#co-hl-count").textContent = `${n} of 60`;
  }

  function review() {
    const rows = [
      ["Plan", planText()], ["City", market()], ["Venue preference", form.elements.venue_type.value],
      ["Business", form.elements.business.value], ["Contact", `${form.elements.name.value} · ${form.elements.email.value} · ${form.elements.phone.value}`],
      ["Your ad", adSource() === "upload" ? `Finished ad: ${files.artwork ? files.artwork.name : "—"}` : `We design it · "${form.elements.headline.value || "headline to be agreed"}"`],
      ["Logo", files.logo ? files.logo.name : "None uploaded"]
    ];
    if (form.elements.destination_url.value) rows.push(["QR code link", form.elements.destination_url.value]);
    $("#co-review").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    $("#co-due-label").textContent = billing() === "annual" ? "Due today, 3-year term, billed yearly" : "Due today, 3-year term, billed monthly";
    $("#co-due").textContent = billing() === "annual" ? Y1 : MO;
    if (SQ.cfg) $("#co-due").textContent = dueText();
  }

  /* ---------- files ---------- */
  $$(".drop input[type=file]", form).forEach(input => {
    const box = input.closest(".drop"), out = $(".drop-file", box), key = box.dataset.drop;
    input.addEventListener("change", () => {
      const f = input.files[0];
      if (f && f.size > MAX) { input.value = ""; files[key] = null; out.hidden = false; out.className = "drop-file bad"; out.textContent = `${f.name} is over ${MAXMB} MB. Try a smaller file, or email it to us after checkout.`; preview(); return; }
      files[key] = f || null;
      if (key === "logo") { if (logoURL) URL.revokeObjectURL(logoURL); logoURL = url(f); }
      else { if (artURL) URL.revokeObjectURL(artURL); artURL = url(f); }
      out.className = "drop-file"; out.hidden = !f;
      if (f) out.innerHTML = `${esc(f.name)} <button type="button" class="text-link drop-x">Remove</button>`;
      box.classList.toggle("has", !!f);
      preview();
    });
    box.addEventListener("click", e => {
      if (!e.target.classList.contains("drop-x")) return;
      input.value = ""; input.dispatchEvent(new Event("change"));
    });
    ["dragenter", "dragover"].forEach(t => box.addEventListener(t, e => { e.preventDefault(); box.classList.add("over"); }));
    ["dragleave", "drop"].forEach(t => box.addEventListener(t, e => { e.preventDefault(); box.classList.remove("over"); }));
    box.addEventListener("drop", e => { if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event("change")); } });
  });

  form.addEventListener("input", e => { if (!err.hidden && e.target.getAttribute("aria-invalid")) { err.hidden = true; e.target.removeAttribute("aria-invalid"); } preview(); });
  form.addEventListener("change", e => { if (!err.hidden && e.target.getAttribute("aria-invalid")) { err.hidden = true; e.target.removeAttribute("aria-invalid"); } });
  form.addEventListener("change", e => {
    if (e.target.name === "market") { const o = $("[data-other]", form); o.hidden = e.target.value !== "other"; if (!o.hidden) o.querySelector("input").focus(); }
    if (e.target.name === "ad_source") {
      const up = adSource() === "upload";
      $("[data-drop=artwork]", form).hidden = !up; $("[data-design]", form).hidden = up;
    }
    preview();
  });

  /* ---------- steps ---------- */
  function fail(el, msg) {
    err.textContent = msg; err.hidden = false;
    if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); }
    return false;
  }
  function validate(i) {
    $$("[aria-invalid]", form).forEach(x => x.removeAttribute("aria-invalid"));
    const s = steps[i];
    if (i === 0) {
      if (!form.elements.market.value) return fail(form.elements.market, "Choose a city to continue.");
      if (form.elements.market.value === "other" && !form.elements.market_other.value.trim()) return fail(form.elements.market_other, "Type your city and state to continue.");
    }
    if (i === 1) {
      for (const el of $$("[required]", s)) {
        if (!el.value.trim()) return fail(el, `Add ${el.dataset.label.toLowerCase()} to continue.`);
        if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) return fail(el, "Check your email address.");
      }
    }
    if (i === 2) {
      if (adSource() === "upload" && !files.artwork) return fail($("#co-art"), "Upload your ad artwork, or choose \"Design it for me\".");
      if (adSource() === "design" && !files.logo && !form.elements.headline.value.trim()) return fail(form.elements.headline, "Add a headline or upload your logo so we have something to design with.");
      const u = form.elements.destination_url.value.trim();
      if (u && !/^https?:\/\/\S+\.\S+/.test(u)) return fail(form.elements.destination_url, "Start the QR link with https://");
    }
    if (i === 3) {
      if (!form.elements.agree_terms.checked) return fail(form.elements.agree_terms, "Agree to the Terms & Conditions to continue.");
      if (!form.elements.agree_rights.checked) return fail(form.elements.agree_rights, "Confirm you have the rights to your logo and artwork.");
      if (!form.elements.agree_advertiser.checked) return fail(form.elements.agree_advertiser, "Accept the Advertiser Agreement to continue.");
      if (form.elements.sign_name.value.trim().length < 2) return fail(form.elements.sign_name, "Type your full legal name to sign.");
    }
    err.hidden = true; return true;
  }
  function show(i) {
    cur = i;
    steps.forEach((s, j) => { s.hidden = j !== i; });
    marks.forEach((m, j) => { m.classList.toggle("on", j === i); m.classList.toggle("done", j < i); });
    back.disabled = i === 0; next.hidden = i === steps.length - 1; pay.hidden = i !== steps.length - 1;
    label.textContent = `Step ${i + 1} of ${steps.length}`;
    if (i === steps.length - 1) review();
    if (i >= steps.length - 2) sqLoad();
    if (i === steps.length - 1) sqShow();
    payLabel();
    const lg = $("legend", steps[i]); lg.tabIndex = -1;
  }
  function payLabel() {
    if (pay.disabled) return;
    pay.textContent = SQ.state === "ready" ? `Pay ${dueText()} securely` : stripeLink() ? (billing() === "annual" ? `Pay ${Y1} securely` : `Pay ${MO} securely`) : "Place my order";
  }

  /* ---------- pay on this page: Square's card form + Google Pay ---------- */
  const CFG = window.CITYPULSE_CONFIG || {};
  const PAY_API = String((CFG.payments && CFG.payments.api) || "https://sales.citypulsekiosks.com").replace(/\/+$/, "");
  const SQ = { state: "idle", cfg: null, payments: null, card: null, gpay: null, req: null, idem: "", orderId: "", coupon: null };
  const baseCents = () => SQ.cfg ? SQ.cfg.prices[planKey()] : (billing() === "annual" ? PR.now.y1 : PR.now.mo) * 100;
  const codeOn = () => !!(SQ.coupon && SQ.coupon.plan === planKey());
  const cents = () => codeOn() ? SQ.coupon.cents : baseCents();
  const dollars = c => "$" + (c / 100).toLocaleString("en-US", { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 });
  const dueText = () => dollars(cents());
  const newIdem = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9-]/g, "").slice(0, 45);
  const LOCK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor"/></svg>';
  function sqBox() {
    let box = $("#co-paybox", form);
    if (box) return box;
    const last = steps[steps.length - 1], fine = $("p.fine", last);
    box = document.createElement("div"); box.className = "co-paybox"; box.id = "co-paybox"; box.hidden = true;
    box.innerHTML = `<div class="co-paybox-h"><b>Payment</b><span>${LOCK} Secured by Square</span></div><div id="co-gpay" class="co-wallet" hidden></div><p class="co-or" hidden><span>or pay by card</span></p><div id="co-card" class="co-card"><span class="fine">Loading the secure card form…</span></div><div class="co-code" id="co-code"></div>`;
    last.insertBefore(box, fine || null);
    return box;
  }
  /* ---------- coupon codes ---------- */
  const urlCode = (new URLSearchParams(location.search).get("code") || "").trim().slice(0, 24);
  if (urlCode) store.set("citypulse-code", urlCode);
  let codeOpen = false, codeBusy = false, codeErr = "", codeTyped = "";
  function codeBox() {
    const box = $("#co-code", form); if (!box) return;
    const c = SQ.coupon;
    if (codeOn()) { box.innerHTML = `<div class="co-code-on"><span>Code <b>${esc(c.code)}</b> · ${/%/.test(c.label) ? esc(c.label) + ", you save " : "you save "}${dollars(c.offCents)}</span><button type="button" class="text-link" data-code="off">Remove</button></div>`; return; }
    if (!codeOpen) { box.innerHTML = `<button type="button" class="text-link" data-code="open">Have a code?</button>`; return; }
    box.innerHTML = `<div class="co-code-row"><label class="field"><span>Coupon code</span><input id="co-code-in" autocomplete="off" autocapitalize="characters" maxlength="24" value="${esc(codeTyped || (c && c.code) || store.get("citypulse-code") || "")}"></label><button type="button" class="btn btn-small btn-dark" data-code="apply"${codeBusy ? " disabled" : ""}>${codeBusy ? "Checking…" : "Apply"}</button></div>${codeErr ? `<p class="co-code-err" role="alert">${esc(codeErr)}</p>` : ""}`;
  }
  function dueChanged() {
    $("#co-due").textContent = dueText();
    const st = $("#co-sum-total"); if (st) st.textContent = codeOn() ? `${dueText()} today` : billing() === "annual" ? `${Y1}/yr` : `${MO}/mo`;
    if (SQ.req) { try { SQ.req.update({ total: { amount: (cents() / 100).toFixed(2), label: billing() === "annual" ? "CityPulse kiosk ad, yearly" : "CityPulse kiosk ad, first month" } }); } catch (e) { /* keep the old total */ } }
    codeBox(); payLabel();
  }
  async function applyCode(code, quiet) {
    code = String(code || "").trim().toUpperCase().replace(/\s+/g, "");
    codeTyped = code;
    if (!code) { codeErr = "Type your code first."; codeBox(); return; }
    codeBusy = true; codeErr = ""; codeBox();
    try {
      const r = await fetch(PAY_API + "/api/web/coupon", { method: "POST", mode: "cors", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, plan: planKey() }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { SQ.coupon = j; store.set("citypulse-code", j.code); codeOpen = false; codeTyped = ""; }
      else { SQ.coupon = null; codeOpen = true; codeErr = j.error || "That code didn't work."; if (quiet) store.set("citypulse-code", code); }
    } catch (e) { codeOpen = true; codeErr = "We couldn't check the code just now. Try again in a moment."; }
    codeBusy = false; dueChanged();
    if (codeOn() && !quiet) { const b = $("#co-code", form); if (b) b.scrollIntoView({ block: "nearest" }); }
  }
  form.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-code]"); if (!b) return;
    e.preventDefault();
    if (b.dataset.code === "open") { codeOpen = true; codeBox(); const i = $("#co-code-in", form); if (i) i.focus(); }
    if (b.dataset.code === "apply") applyCode(($("#co-code-in", form) || {}).value);
    if (b.dataset.code === "off") { codeOpen = true; codeErr = ""; const c = SQ.coupon; SQ.coupon = null; store.set("citypulse-code", ""); dueChanged(); const i = $("#co-code-in", form); if (i && c) i.value = c.code; }
  });
  form.addEventListener("keydown", e => { if (e.key === "Enter" && e.target && e.target.id === "co-code-in") { e.preventDefault(); applyCode(e.target.value); } });
  /* the plan changed after a code was applied, or a code came in the link: check it for this plan */
  function codeFollow() {
    if (SQ.state !== "ready") return;
    if (SQ.coupon && SQ.coupon.plan !== planKey() && !codeBusy) return applyCode(SQ.coupon.code, true);
    const saved = store.get("citypulse-code");
    if (!SQ.coupon && saved && !SQ.triedSaved) { SQ.triedSaved = true; return applyCode(saved, true); }
    codeBox();
  }
  function sqScript(sandbox) {
    if (window.Square) return Promise.resolve(window.Square);
    return new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = sandbox ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js";
      s.onload = () => window.Square ? ok(window.Square) : no(new Error("no Square"));
      s.onerror = () => no(new Error("Square script blocked"));
      document.head.appendChild(s);
    });
  }
  /* Gets the card form ready in the background once the shopper reaches the last two steps. */
  let sqLoading = null;
  function sqLoad() {
    if (sqLoading || SQ.state === "off") return sqLoading;
    SQ.state = "loading";
    sqLoading = (async () => {
      try {
        const r = await fetch(PAY_API + "/api/web/config", { mode: "cors", credentials: "omit" });
        if (!r.ok) throw new Error("config " + r.status);
        SQ.cfg = await r.json();
        if (!SQ.cfg.appId || !SQ.cfg.locationId || !SQ.cfg.prices) throw new Error("not set up");
        const Sq = await sqScript(SQ.cfg.sandbox);
        SQ.payments = Sq.payments(SQ.cfg.appId, SQ.cfg.locationId);
        SQ.card = await SQ.payments.card({ style: { input: { fontSize: "16px", color: "#121B26" }, "input::placeholder": { color: "#8A96A3" }, ".input-container.is-focus": { borderColor: "#22C7B6" }, ".message-icon": { color: "#536170" } } });
        SQ.state = "ready";
        if (!steps[steps.length - 1].hidden) sqShow();
        payLabel();
      } catch (e) {
        SQ.state = "off";
        const box = $("#co-paybox", form); if (box) box.remove();
        payLabel();
      }
    })();
    return sqLoading;
  }
  async function sqShow() {
    if (SQ.state !== "ready" && SQ.state !== "loading") return;
    const box = sqBox(); box.hidden = false;
    $("#co-due").textContent = dueText();
    if (SQ.state !== "ready") return;
    codeFollow();
    if (!SQ.cardOn) { SQ.cardOn = true; $("#co-card", box).innerHTML = ""; try { await SQ.card.attach("#co-card"); } catch (e) { SQ.cardOn = false; } }
    const total = { amount: (cents() / 100).toFixed(2), label: billing() === "annual" ? "CityPulse kiosk ad, yearly" : "CityPulse kiosk ad, first month" };
    if (SQ.req) { try { SQ.req.update({ total }); } catch (e) { /* keep the old total */ } return; }
    try {
      SQ.req = SQ.payments.paymentRequest({ countryCode: "US", currencyCode: "USD", total, requestBillingContact: false });
      SQ.gpay = await SQ.payments.googlePay(SQ.req);
      await SQ.gpay.attach("#co-gpay", { buttonColor: "black", buttonSizeMode: "fill", buttonType: "pay" });
      $("#co-gpay", box).hidden = false; $(".co-or", box).hidden = false;
      $("#co-gpay", box).addEventListener("click", e => { e.preventDefault(); if (!validate(3) || pay.disabled) return; payWith(SQ.gpay); });
    } catch (e) { /* Google Pay isn't available on this browser; the card form still works */ }
  }
  /* Charges the card (or Google Pay), then sends the order and files and moves on to the welcome page. */
  async function payWith(method) {
    const f = form.elements, email = f.email.value.trim(), c = cents();
    const old = pay.textContent; pay.disabled = true; pay.textContent = "Processing payment…"; err.hidden = true;
    const undo = msg => { pay.disabled = false; pay.textContent = old; SQ.idem = ""; fail(null, msg); };
    let t;
    try { t = await method.tokenize(); } catch (e) { return undo("The payment form had a problem. Check the details and try again."); }
    if (!t || t.status !== "OK") { pay.disabled = false; pay.textContent = old; if (t && t.status === "Cancel") return; const m = t && t.errors && t.errors[0] && t.errors[0].message; return undo(m ? `${m}.`.replace(/\.\.$/, ".") : "Check your card details and try again."); }
    const [first, ...rest] = f.name.value.trim().split(/\s+/);
    let verification = "";
    try { const v = await SQ.payments.verifyBuyer(t.token, { amount: (c / 100).toFixed(2), currencyCode: "USD", intent: "CHARGE", billingContact: { givenName: first || "", familyName: rest.join(" "), email, phone: f.phone.value.trim() } }); verification = (v && v.token) || ""; } catch (e) { /* the bank didn't ask for an extra check */ }
    SQ.orderId = SQ.orderId || orderId(); SQ.idem = SQ.idem || newIdem();
    const ad = adSource() === "upload" ? `Finished ad: ${files.artwork ? files.artwork.name : "-"}` : `We design it · "${f.headline.value.trim() || "headline to be agreed"}"`;
    let r, j = {};
    try {
      r = await fetch(PAY_API + "/api/web/checkout", { method: "POST", mode: "cors", credentials: "omit", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        plan: planKey(), token: t.token, verification, idem: SQ.idem, expectCents: c, coupon: codeOn() ? SQ.coupon.code : "",
        order: { id: SQ.orderId, business: f.business.value.trim(), name: f.name.value.trim(), email, phone: f.phone.value.trim(), market: market(), venue: f.venue_type ? f.venue_type.value : "", website: f.destination_url.value.trim(), ad, signed: f.sign_name.value.trim() }
      }) });
      j = await r.json().catch(() => ({}));
    } catch (e) {
      /* keep the same payment key, so pressing Pay again can never charge twice */
      pay.disabled = false; pay.textContent = old;
      return fail(null, "We couldn't confirm your payment because the connection dropped. Press Pay again (you won't be charged twice), or call us at (602) 975-5513.");
    }
    if (!r.ok || !j.ok) {
      if (r.status === 409 && j.coupon === false) { SQ.coupon = null; codeOpen = true; codeErr = ""; if (j.cents) SQ.cfg.prices[planKey()] = j.cents; SQ.idem = ""; dueChanged(); }
      else if (r.status === 409 && j.cents) { if (codeOn()) SQ.coupon.cents = j.cents; else SQ.cfg.prices[planKey()] = j.cents; dueChanged(); }
      return undo(j.error || "The payment didn't go through. Try another card, or call us at (602) 975-5513.");
    }
    paid(j);
  }
  async function paid(j) {
    const id = j.orderId, email = form.elements.email.value.trim();
    const order = { id, plan: planText(), market: market(), business: form.elements.business.value, paid: true };
    store.set("citypulse-order", order);
    const welcome = new URL(form.dataset.welcome, location.href); welcome.searchParams.set("order", id); welcome.searchParams.set("paid", "1");
    pay.textContent = "Paid. Sending your order…";
    const extra = {
      _subject: `Paid kiosk order ${id} — ${order.business} (${order.market})`, _replyto: email,
      order_id: id, plan: planText(), market: order.market, payment: `Paid online ${dollars(j.cents)} by ${j.card}${j.receiptUrl ? " · receipt " + j.receiptUrl : ""}`
    };
    if (API.formsReady()) {
      const logo = $("#co-logo"), art = $("#co-art"), sel = form.elements.market;
      const useArt = adSource() === "upload" && files.artwork;
      art.name = useArt ? "attachment" : "artwork"; art.disabled = !useArt;
      logo.name = useArt ? "attachment_logo" : "attachment"; logo.disabled = !files.logo;
      sel.name = "market_choice"; form.elements.market_other && (form.elements.market_other.disabled = true);
      if (await API.sendWithFiles(form, extra, welcome.toString())) return;
    }
    /* Paid, but the order details didn't send: never ask them to pay again, just to email the files. */
    const mail = `mailto:sales@citypulsekiosks.com?subject=${encodeURIComponent(`Files for paid order ${id} — ${order.business}`)}&body=${encodeURIComponent(`Hello CityPulse team,\n\nI paid for order ${id} (${planText()}, ${order.market}). My logo/artwork is attached.\n\n${form.elements.name.value}`)}`;
    const done = $("#co-done");
    $("p", done).innerHTML = `Your payment went through and your order number is <b>${esc(id)}</b>. We've emailed your confirmation. Please send us your logo or artwork with the button below.`;
    $(".btn-row", done).innerHTML = `<a class="btn" href="${mail}">Email your files</a><a class="btn btn-ghost" href="${welcome}">What happens next</a>`;
    form.closest(".co-grid").hidden = true; done.hidden = false; done.focus();
  }
  function go(i) { show(i); $("legend", steps[i]).focus({ preventScroll: true }); form.scrollIntoView({ behavior: "smooth", block: "start" }); }
  next.addEventListener("click", () => { if (validate(cur)) go(cur + 1); });
  back.addEventListener("click", () => { err.hidden = true; go(cur - 1); });
  marks.forEach((m, j) => m.addEventListener("click", () => { if (j < cur) go(j); }));

  /* ---------- submit ---------- */
  const API = window.CityPulse || { formsReady: () => false, paymentLink: () => "", sendWithFiles: async () => false };
  const planKey = () => billing() === "annual" ? "yearly" : "monthly";
  const stripeLink = () => API.paymentLink(planKey(), "", "");
  function orderId() { const d = new Date(); return "CP-" + d.toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate(3)) return;
    if (pay.disabled) return;
    if (SQ.state === "loading") { pay.disabled = true; pay.textContent = "Loading the payment form…"; await sqLoading; pay.disabled = false; payLabel(); if (SQ.state === "ready") { await sqShow(); return fail(null, "Enter your card details above to finish."); } }
    if (SQ.state === "ready") return payWith(SQ.card);
    const id = orderId(), email = form.elements.email.value.trim();
    const order = { id, plan: planText(), market: market(), business: form.elements.business.value };
    store.set("citypulse-order", order);
    const link = API.paymentLink(planKey(), email, id);
    const welcome = new URL(form.dataset.welcome, location.href); welcome.searchParams.set("order", id);
    const next = link || welcome.toString();
    const extra = {
      _subject: `New kiosk order ${id} — ${order.business} (${order.market})`, _replyto: email,
      order_id: id, plan: planText(), market: order.market, payment: link ? "Sent to online payment" : "Invoice the customer"
    };

    if (API.formsReady()) {
      // name the main upload "attachment" so every form service treats it as a file attachment
      const logo = $("#co-logo"), art = $("#co-art"), sel = form.elements.market;
      const useArt = adSource() === "upload" && files.artwork;
      art.name = useArt ? "attachment" : "artwork"; art.disabled = !useArt;
      logo.name = useArt ? "attachment_logo" : "attachment"; logo.disabled = !files.logo;
      sel.name = "market_choice"; form.elements.market_other && (form.elements.market_other.disabled = true);
      pay.disabled = true; const old = pay.textContent; pay.textContent = link ? "Sending your order, then on to payment…" : "Sending your order…";
      const ok = await API.sendWithFiles(form, extra, next);
      if (!ok) {
        pay.disabled = false; pay.textContent = old; art.disabled = logo.disabled = false; sel.name = "market";
        fail(null, `We couldn't send your order just now. Please try again, or email sales@citypulsekiosks.com with order ${id}.`);
      }
      return;
    }
    // Forms aren't connected yet: hand the order over by email, then offer payment if a link exists
    const fd = new FormData(form); fd.set("market", market());
    const lines = [`Order: ${id}`, `Plan: ${planText()}`, `Advertiser Agreement accepted and signed by: ${fd.get("sign_name") || "—"} on ${new Date().toISOString()}`].concat([...fd.entries()].filter(([k, v]) => typeof v === "string" && v && !/^(_|agree|billing|market_other)/.test(k)).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`));
    const mail = `mailto:sales@citypulsekiosks.com?subject=${encodeURIComponent(`Kiosk order ${id} — ${order.business}`)}&body=${encodeURIComponent(`Hello CityPulse team,\n\n${lines.join("\n")}\n\n(My logo/artwork is attached.)`)}`;
    const done = $("#co-done");
    $("p", done).innerHTML = `Your order number is <b>${id}</b>. One last step: send us the email below with your logo or artwork attached${link ? ", then complete payment" : ""}.`;
    $(".btn-row", done).innerHTML = `<a class="btn" href="${mail}">Open the email</a>${link ? `<a class="btn btn-dark" href="${link}">Continue to payment</a>` : ""}<a class="btn btn-ghost" href="${welcome}">What happens next</a>`;
    form.closest(".co-grid").hidden = true; done.hidden = false; done.focus();
  });

  show(0); preview();
  if (pm) setTimeout(() => form.closest("section").scrollIntoView({ behavior: "smooth" }), 300);
})();
