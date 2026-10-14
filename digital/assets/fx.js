/* CityPulse Digital — site-wide effects: scroll progress, cursor-lit cards, gradient ring on the score card */
(function () {
  "use strict";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // scroll progress line
  const bar = document.createElement("div"); bar.className = "scroll-progress"; document.body.appendChild(bar);
  function prog() { const h = document.documentElement, m = h.scrollHeight - h.clientHeight; bar.style.setProperty("--p", m > 0 ? (h.scrollTop / m).toFixed(4) : 0); }
  addEventListener("scroll", prog, { passive: true }); prog();
  // cursor-lit glass cards
  const sel = ".svc-card,.guide-card,.ind-card,.plan,.quote,.process li,.stats div,.value,.counters div,.story-card,.work-card,.case,.contact-card,.scorecard,.news-form";
  const cards = document.querySelectorAll(sel);
  cards.forEach(c => c.classList.add("card-fx"));
  if (!reduce && matchMedia("(hover:hover)").matches) {
    document.addEventListener("pointermove", e => {
      const c = e.target.closest && e.target.closest(".card-fx"); if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }
  // gradient stroke for the score ring
  const ring = document.querySelector(".sc-ring svg");
  if (ring && !ring.querySelector("defs")) ring.insertAdjacentHTML("afterbegin", '<defs><linearGradient id="cpGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2EF2E2"/><stop offset=".6" stop-color="#7C6CFF"/><stop offset="1" stop-color="#FF4FD8"/></linearGradient></defs>');
})();
