/* Landmark Digital — self-serve plan sign-up. Order details are delivered by the form service and
   payment happens on the plan's Stripe Payment Link — both set in assets/config.js (via integrations.js). */
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
    const o = store.get("landmark-order"), q = new URLSearchParams(location.search).get("order");
    if (o && (!q || q === o.id)) { wo.textContent = `Order ${o.id} · ${o.plan} · ${o.business}`; wo.hidden = false; }
    else if (q) { wo.textContent = `Order ${q}`; wo.hidden = false; }
    return;
  }

  const form = $("#checkout");
  if (!form) return;
  const steps = $$(".co-step", form), marks = $$(".co-steps li", form);
  const err = $(".form-error", form);
  const back = $("[data-co=back]", form), next = $("[data-co=next]", form), pay = $("[data-co=pay]", form), label = $("[data-co=label]", form);
  const API = window.Landmark || { formsReady: () => false, paymentLink: () => "", sendWithFiles: async () => false };
  const MAXMB = API.maxUploadMB || 5, MAX = MAXMB * 1024 * 1024;
  const PRICES = { launch: 899, grow: 1799, scale: 2999 }, NAMES = { launch: "Launch", grow: "Grow", scale: "Scale" };
  const money = n => "$" + Math.round(n).toLocaleString("en-US");
  const plan = () => form.elements.plan.value;
  const locs = () => parseInt(form.elements.locations.value, 10) || 1;
  const quote = () => form.elements.locations.value.startsWith("4");
  const total = () => PRICES[plan()] + (plan() === "scale" ? 0 : Math.max(0, Math.min(locs(), 3) - 1) * 450);
  const planText = () => `${NAMES[plan()]} · ${form.elements.locations.value} · ${quote() ? "custom quote" : money(total()) + "/mo"}`;
  let cur = 0, logo = null;

  /* preselect from ?plan= (pricing page buttons link here) */
  const pp = new URLSearchParams(location.search).get("plan");
  if (pp && form.elements.plan) { const r = $$("[name=plan]", form).find(x => x.value === pp); if (r) r.checked = true; }

  function summary() {
    $$("[data-plan-card]").forEach(c => { c.hidden = c.dataset.planCard !== plan(); });
    $("#co-sum-plan").textContent = `${NAMES[plan()]} · ${form.elements.locations.value}`;
    $("#co-sum-biz").textContent = form.elements.business.value.trim() || "—";
    $("#co-sum-total").textContent = quote() ? "We'll quote" : `${money(total())}/mo`;
  }
  function review() {
    const rows = [["Plan", planText()], ["Business", `${form.elements.business.value} · ${form.elements.industry.value}`], ["Contact", `${form.elements.name.value} · ${form.elements.email.value} · ${form.elements.phone.value}`], ["Location", form.elements.city.value], ["Google Business Profile", form.elements.gbp.value], ["Social", form.elements.social.value], ["Top goal", form.elements.goal.value]];
    if (form.elements.website.value) rows.push(["Website", form.elements.website.value]);
    if (form.elements.start_date.value) rows.push(["Start date", form.elements.start_date.value]);
    $("#co-review").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
    $("#co-due-label").textContent = quote() ? "We'll confirm pricing before anything is charged" : "Due today · then monthly (3-month initial term)";
    $("#co-due").textContent = quote() ? "Custom" : money(total());
  }

  /* ---------- logo upload ---------- */
  const input = $("#co-logo"), box = input && input.closest(".drop"), out = box && $(".drop-file", box);
  if (input) {
    input.addEventListener("change", () => {
      const f = input.files[0];
      if (f && f.size > MAX) { input.value = ""; logo = null; out.hidden = false; out.className = "drop-file bad"; out.textContent = `${f.name} is over ${MAXMB} MB. Try a smaller file, or email it to us after sign-up.`; return; }
      logo = f || null; out.className = "drop-file"; out.hidden = !f;
      if (f) out.innerHTML = `${esc(f.name)} <button type="button" class="text-link drop-x">Remove</button>`;
      box.classList.toggle("has", !!f);
    });
    box.addEventListener("click", e => { if (e.target.classList.contains("drop-x")) { input.value = ""; input.dispatchEvent(new Event("change")); } });
    ["dragenter", "dragover"].forEach(t => box.addEventListener(t, e => { e.preventDefault(); box.classList.add("over"); }));
    ["dragleave", "drop"].forEach(t => box.addEventListener(t, e => { e.preventDefault(); box.classList.remove("over"); }));
    box.addEventListener("drop", e => { if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; input.dispatchEvent(new Event("change")); } });
  }

  form.addEventListener("input", e => { if (!err.hidden && e.target.getAttribute("aria-invalid")) { err.hidden = true; e.target.removeAttribute("aria-invalid"); } summary(); });
  form.addEventListener("change", () => summary());

  /* ---------- steps ---------- */
  function fail(el, msg) { err.textContent = msg; err.hidden = false; if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); } return false; }
  function validate(i) {
    $$("[aria-invalid]", form).forEach(x => x.removeAttribute("aria-invalid"));
    if (i === 1) {
      for (const el of $$("[required]", steps[1])) {
        if (!el.value.trim()) return fail(el, `Add ${el.dataset.label.toLowerCase()} to continue.`);
        if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) return fail(el, "Check your email address.");
      }
      const u = form.elements.website.value.trim();
      if (u && !/^https?:\/\/\S+\.\S+/.test(u)) return fail(form.elements.website, "Start the website address with https://");
    }
    if (i === 3) {
      if (!form.elements.agree_terms.checked) return fail(form.elements.agree_terms, "Agree to the Terms & Conditions to continue.");
      if (!form.elements.agree_access.checked) return fail(form.elements.agree_access, "Confirm you're authorized for this business.");
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
    pay.textContent = quote() ? "Send my request" : stripeLink() ? `Pay ${money(total())} securely` : "Start my plan";
    $("legend", steps[i]).tabIndex = -1;
  }
  function go(i) { show(i); $("legend", steps[i]).focus({ preventScroll: true }); form.scrollIntoView({ behavior: "smooth", block: "start" }); }
  next.addEventListener("click", () => { if (validate(cur)) go(cur + 1); });
  back.addEventListener("click", () => { err.hidden = true; go(cur - 1); });
  marks.forEach((m, j) => m.addEventListener("click", () => { if (j < cur) go(j); }));

  /* ---------- submit ---------- */
  const stripeLink = () => quote() ? "" : API.paymentLink(plan(), "", "");
  function orderId() { const d = new Date(); return "LD-" + d.toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validate(3)) return;
    const id = orderId(), email = form.elements.email.value.trim();
    const order = { id, plan: planText(), business: form.elements.business.value };
    store.set("landmark-order", order);
    const link = quote() ? "" : API.paymentLink(plan(), email, id);
    const welcome = new URL(form.dataset.welcome, location.href); welcome.searchParams.set("order", id);
    const dest = link || welcome.toString();
    const extra = { _subject: `New plan sign-up ${id} — ${order.business} (${NAMES[plan()]})`, _replyto: email, order_id: id, plan: planText(), monthly_total: quote() ? "quote" : money(total()), payment: link ? "Sent to Stripe" : "Invoice the customer" };
    if (API.formsReady()) {
      if (input) { input.name = "attachment"; input.disabled = !logo; }
      pay.disabled = true; const old = pay.textContent; pay.textContent = link ? "Sending your details, then on to payment…" : "Sending…";
      const ok = await API.sendWithFiles(form, extra, dest);
      if (!ok) { pay.disabled = false; pay.textContent = old; if (input) input.disabled = false; fail(null, `We couldn't send that just now. Please try again, or email ${(document.querySelector('a[href^="mailto:"]') || {}).textContent || "us"} with order ${id}.`); }
      return;
    }
    location.href = dest;
  });

  show(0); summary();
})();
