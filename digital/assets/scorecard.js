/* Landmark Digital — instant digital-presence scorecard (runs entirely in the browser) */
(function () {
  "use strict";
  const form = document.querySelector("[data-scorecard]");
  if (!form) return;
  const out = document.querySelector("[data-sc-result]");
  const err = form.querySelector(".form-error");
  const FIX = {
    profile: ["Complete and feed your Google Business Profile", "Fill every field, add 20+ photos and post weekly. It's the highest-return hour in local marketing.", "services/local-listings/"],
    speed: ["Make the site fast on a phone", "Compress images, drop the slider, cache the pages. Target under two seconds with the phone number visible without scrolling.", "services/websites/"],
    reviews: ["Build review volume and recency", "A 4.5+ rating with new reviews every month is what Google and customers both look for.", "services/reputation/"],
    replies: ["Reply to every review within a business day", "The reply is read by the next customer. A calm answer to a bad review is your most persuasive content.", "services/reputation/"],
    asking: ["Ask every customer, automatically", "A text or email after each visit with the direct review link — everyone, every time, within the rules.", "services/reputation/"],
    listings: ["Make your business facts identical everywhere", "Wrong hours on one directory costs you customers quietly and confuses AI engines. Sync and lock 40+ listings.", "services/local-listings/"],
    social: ["Post on a plan, not when you remember", "A monthly calendar, designed posts twice a week and same-day replies turn a quiet feed into social proof.", "services/social-media/"],
    ai: ["Add schema and an answer-first FAQ", "Structured data and plain answers are what ChatGPT, Gemini and Google's AI Overviews cite.", "services/ai-search/"],
    tracking: ["Track calls and leads by source", "Call tracking and form tracking tell you which channel pays — and which to cut.", "services/seo/"]
  };
  const root = form.dataset.root || "";
  form.addEventListener("submit", e => {
    e.preventDefault();
    const qs = [...form.querySelectorAll(".sc-q")];
    const answers = qs.map(q => ({ key: q.dataset.key, label: q.dataset.label, v: (form.querySelector(`input[name="${q.dataset.key}"]:checked`) || {}).value }));
    const missing = answers.find(a => a.v === undefined);
    if (missing) { err.textContent = `Answer question ${answers.indexOf(missing) + 1} to continue.`; err.hidden = false; form.querySelector(`[data-key="${missing.key}"]`).scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    err.hidden = true;
    const total = answers.reduce((s, a) => s + +a.v, 0), score = Math.round(total / (answers.length * 2) * 100);
    const verdict = score >= 85 ? "Strong. You're ahead of most local businesses — the audit will find the last few points." :
                    score >= 60 ? "Solid foundation with clear gaps. The three fixes below are where the next customers are." :
                    score >= 35 ? "You're losing customers you never see. The good news: these fixes are fast and measurable." :
                                  "Most of the moments that win a customer are currently going to a competitor. Start with the three below.";
    out.querySelector("[data-sc-verdict]").textContent = verdict;
    out.querySelector("[data-sc-bars]").innerHTML = answers.map(a => `<li><span>${a.label}</span><i class="b${a.v}"></i></li>`).join("");
    const worst = [...answers].sort((a, b) => a.v - b.v).slice(0, 3);
    out.querySelector("[data-sc-fixes]").innerHTML = worst.map(a => { const f = FIX[a.key]; return `<li><b>${f[0]}</b><p>${f[1]}</p><a class="text-link" href="${root}${f[2]}">How we do it</a></li>`; }).join("");
    const cta = out.querySelector("[data-sc-cta]");
    cta.addEventListener("click", () => {
      const notes = document.querySelector('#audit-form textarea[name="Notes"]');
      if (notes && !notes.value) notes.value = `Scorecard: ${score}/100. Lowest: ${worst.map(a => a.label).join(", ")}.`;
    }, { once: true });
    out.hidden = false; const ph = document.querySelector("[data-sc-placeholder]"); if (ph) ph.hidden = true;
    const num = out.querySelector("[data-sc-score]"), ring = out.querySelector(".sc-prog");
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    ring.style.strokeDashoffset = String(327 - 327 * score / 100);
    if (reduce) { num.textContent = String(score); } else {
      const t0 = performance.now();
      (function tick(now) { const p = Math.min(1, (now - t0) / 1300), e2 = 1 - Math.pow(1 - p, 3); num.textContent = String(Math.round(score * e2)); if (p < 1) requestAnimationFrame(tick); })(t0);
    }
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  out.querySelector("[data-sc-reset]").addEventListener("click", () => { form.reset(); out.hidden = true; const ph = document.querySelector("[data-sc-placeholder]"); if (ph) ph.hidden = false; form.scrollIntoView({ behavior: "smooth", block: "start" }); });
})();
