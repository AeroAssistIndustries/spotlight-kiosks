(function () {
  "use strict";
  // mobile nav
  const toggle = document.querySelector(".nav-toggle"), nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open)); nav.classList.toggle("open", open);
    });
    nav.addEventListener("click", e => { if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); } });
  }

  // CTA buttons preselect the contact form's interest
  document.querySelectorAll("[data-interest]").forEach(a => a.addEventListener("click", () => {
    const want = a.dataset.interest.startsWith("Host") ? "Hosting a kiosk" : "Advertising";
    const r = document.querySelector(`.contact-form input[name=interest][value="${want}"]`);
    if (r) r.checked = true;
  }));

  // contact form → opens the visitor's email app (no backend needed)
  const form = document.getElementById("contact-form"), err = document.getElementById("form-error");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const name = (d.get("name") || "").trim(), email = (d.get("email") || "").trim();
    const missing = [];
    if (!name) missing.push("your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("a valid email");
    if (missing.length) {
      err.textContent = `Add ${missing.join(" and ")} so we can reply.`; err.hidden = false;
      form.querySelector(!name ? "[name=name]" : "[name=email]").focus(); return;
    }
    err.hidden = true;
    const interest = d.get("interest");
    const lines = [
      `Name: ${name}`, `Business or venue: ${d.get("business") || "-"}`, `Email: ${email}`,
      `City or area: ${d.get("area") || "-"}`, `Interested in: ${interest}`, "", d.get("message") || ""
    ];
    const subject = `${interest} inquiry${d.get("business") ? " — " + d.get("business") : ""}`;
    location.href = `mailto:sales@spotlightkiosks.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  });

  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
