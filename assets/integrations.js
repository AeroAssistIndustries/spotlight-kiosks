/* Spotlight Kiosks — one place that talks to outside services.
   Forms and checkout call these helpers; providers are chosen in assets/config.js. */
(function () {
  "use strict";
  const CFG = window.SPOTLIGHT_CONFIG || {};
  const forms = CFG.forms || {}, pay = CFG.payments || {};
  const provider = forms.provider || "none";

  function formsReady() {
    if (provider === "formsubmit") return /@/.test(forms.to || "");
    if (provider === "formspree") return /^https:\/\//.test(forms.endpoint || "");
    return false;
  }

  /* Send a plain message (no files). Resolves true on success, false otherwise. */
  async function send(fields) {
    if (!formsReady()) return false;
    const data = Object.assign({ _template: "table", _captcha: "false" }, fields);
    if (data.email && !data._replyto) data._replyto = data.email;
    try {
      if (provider === "formsubmit") {
        const r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(forms.to), {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data)
        });
        const j = await r.json().catch(() => ({}));
        return r.ok && String(j.success) !== "false";
      }
      if (provider === "formspree") {
        const r = await fetch(forms.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        return r.ok;
      }
    } catch (e) { /* network error */ }
    return false;
  }

  /* Send an order with file uploads, then continue to `next` (payment link or welcome page).
     FormSubmit takes files through a normal form post and redirects to `_next` itself;
     Formspree takes them over fetch and we redirect afterwards. */
  async function sendWithFiles(form, extra, next) {
    if (!formsReady()) return false;
    const fields = Object.assign({ _template: "table", _captcha: "false", _next: next }, extra);
    if (provider === "formsubmit") {
      Object.entries(fields).forEach(([k, v]) => {
        let el = form.querySelector(`input[type=hidden][name="${k}"]`);
        if (!el) { el = document.createElement("input"); el.type = "hidden"; el.name = k; form.appendChild(el); }
        el.value = v;
      });
      form.action = "https://formsubmit.co/" + encodeURIComponent(forms.to);
      form.method = "POST"; form.enctype = "multipart/form-data";
      HTMLFormElement.prototype.submit.call(form);
      return true;
    }
    if (provider === "formspree") {
      const fd = new FormData(form);
      Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
      try {
        const r = await fetch(forms.endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
        if (!r.ok) return false;
        location.href = next; return true;
      } catch (e) { return false; }
    }
    return false;
  }

  /* Hosted payment link for a plan ("yearly" | "monthly"), with the customer's email and order id. */
  function paymentLink(plan, email, ref) {
    const base = (pay[plan] || "").trim();
    if (!base) return "";
    try {
      const u = new URL(base);
      if ((pay.provider || "stripe") === "stripe") {
        if (email) u.searchParams.set("prefilled_email", email);
        if (ref) u.searchParams.set("client_reference_id", ref);
      }
      return u.toString();
    } catch (e) { return ""; }
  }

  window.Spotlight = { formsReady, send, sendWithFiles, paymentLink, maxUploadMB: CFG.maxUploadMB || 5 };
})();
