/* Spotlight Kiosks — self-serve checkout for one location.
   Order details and files go to Formspree; payment happens on Stripe.
   Settings live in assets/config.js. */
(function () {
  "use strict";
  const CFG = window.SPOTLIGHT_CONFIG || {};
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
    const o = store.get("spotlight-order");
    if (o) { wo.textContent = `Order ${o.id} · ${o.plan} · ${o.market}`; wo.hidden = false; }
    return;
  }

  const form = $("#checkout");
  if (!form) return;
  const steps = $$(".co-step", form), marks = $$(".co-steps li", form);
  const err = $(".form-error", form);
  const back = $("[data-co=back]", form), next = $("[data-co=next]", form), pay = $("[data-co=pay]", form), label = $("[data-co=label]", form);
  const MAX = 10 * 1024 * 1024;
  const files = { logo: null, artwork: null };
  let cur = 0;

  const billing = () => form.elements.billing.value;
  const adSource = () => form.elements.ad_source.value;
  const market = () => form.elements.market.value === "other" ? form.elements.market_other.value.trim() : form.elements.market.value;
  const planText = () => billing() === "annual" ? "1 location · yearly ($399/yr)" : "1 location · monthly ($60/mo)";

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
    $("#co-venue-name").textContent = m ? `to a venue in ${m}` : "to a venue near you";
    $("#co-sum-plan").textContent = billing() === "annual" ? "1 location · yearly" : "1 location · monthly";
    $("#co-sum-city").textContent = m || "Not chosen yet";
    $("#co-sum-total").textContent = billing() === "annual" ? "$399/yr" : "$60/mo";
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
    $("#co-due-label").textContent = billing() === "annual" ? "Due today, renews yearly" : "Due today, then monthly";
    $("#co-due").textContent = billing() === "annual" ? "$399" : "$60";
  }

  /* ---------- files ---------- */
  $$(".drop input[type=file]", form).forEach(input => {
    const box = input.closest(".drop"), out = $(".drop-file", box), key = box.dataset.drop;
    input.addEventListener("change", () => {
      const f = input.files[0];
      if (f && f.size > MAX) { input.value = ""; files[key] = null; out.hidden = false; out.className = "drop-file bad"; out.textContent = `${f.name} is over 10 MB. Try a smaller file.`; preview(); return; }
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
    pay.textContent = stripeLink() ? (billing() === "annual" ? "Pay $399 securely" : "Pay $60 securely") : "Place my order";
    const lg = $("legend", steps[i]); lg.tabIndex = -1;
  }
  function go(i) { show(i); $("legend", steps[i]).focus({ preventScroll: true }); form.scrollIntoView({ behavior: "smooth", block: "start" }); }
  next.addEventListener("click", () => { if (validate(cur)) go(cur + 1); });
  back.addEventListener("click", () => { err.hidden = true; go(cur - 1); });
  marks.forEach((m, j) => m.addEventListener("click", () => { if (j < cur) go(j); }));

  /* ---------- submit ---------- */
  const stripeLink = () => (billing() === "annual" ? CFG.stripeYearly : CFG.stripeMonthly) || "";
  function orderId() { const d = new Date(); return "SK-" + d.toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate(3)) return;
    const id = orderId();
    const fd = new FormData(form);
    if (!files.logo) fd.delete("logo");
    if (!files.artwork || adSource() !== "upload") fd.delete("artwork");
    fd.set("market", market()); fd.delete("market_other");
    fd.set("order_id", id); fd.set("plan", planText());
    fd.set("_subject", `New kiosk order ${id} — ${form.elements.business.value} (${market()})`);
    const order = { id, plan: planText(), market: market(), business: form.elements.business.value };
    store.set("spotlight-order", order);
    pay.disabled = true; const old = pay.textContent; pay.textContent = "Sending your order…";

    if (CFG.formspree) {
      try {
        const r = await fetch(CFG.formspree, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error(String(r.status));
      } catch (x) {
        pay.disabled = false; pay.textContent = old;
        fail(null, `We couldn't send your order just now. Please try again, or email ${"sales@spotlightkiosks.com"} with order ${id}.`);
        return;
      }
    }
    const link = stripeLink();
    if (link) {
      const u = new URL(link);
      u.searchParams.set("prefilled_email", form.elements.email.value.trim());
      u.searchParams.set("client_reference_id", id);
      location.href = u.toString();
      return;
    }
    // No payment link yet: confirm the order and offer an email copy
    const lines = [...fd.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("_") && !k.startsWith("agree") && v).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
    const mail = `mailto:sales@spotlightkiosks.com?subject=${encodeURIComponent(`Kiosk order ${id} — ${order.business}`)}&body=${encodeURIComponent(`Hello Spotlight team,\n\n${lines.join("\n")}\n\n(I'll attach my logo/artwork to this email.)`)}`;
    const done = $("#co-done");
    $("p", done).innerHTML = CFG.formspree
      ? `Your order number is <b>${id}</b>. We've received your details and files, and we'll email your invoice for ${esc(planText())} shortly.`
      : `Your order number is <b>${id}</b>. Send it to us to finish: the email below has your details filled in — just attach your logo or artwork and press send.`;
    $(".btn-row", done).innerHTML = CFG.formspree ? `<a class="btn" href="${form.dataset.welcome}">See what happens next</a>` : `<a class="btn" href="${mail}">Open the email</a><a class="btn btn-ghost" href="${form.dataset.welcome}">What happens next</a>`;
    form.closest(".co-grid").hidden = true; done.hidden = false; done.focus();
  });

  show(0); preview();
  if (pm) setTimeout(() => form.closest("section").scrollIntoView({ behavior: "smooth" }), 300);
})();
