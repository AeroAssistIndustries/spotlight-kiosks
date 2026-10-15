/* Landmark Digital — home page: the digital presence score card fills in once it's on screen */
(function () {
  "use strict";
  const card = document.querySelector("[data-score]");
  if (!card) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const num = card.querySelector(".sc-num b");
  const from = +num.dataset.from, to = +num.dataset.to;
  function count() {
    if (reduce) { num.textContent = String(to); return; }
    const t0 = performance.now(), ms = 1600;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / ms), eased = 1 - Math.pow(1 - p, 3);
      num.textContent = String(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function go() { card.classList.add("go"); count(); }
  if (reduce || !("IntersectionObserver" in window)) { setTimeout(go, 400); return; }
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); setTimeout(go, 700); } }, { threshold: 0.4 });
  io.observe(card);
})();
