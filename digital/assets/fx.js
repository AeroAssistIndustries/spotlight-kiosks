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
  // before/after slider
  document.querySelectorAll("[data-ba]").forEach(st => {
    const h = st.querySelector(".ba-handle"); let drag = false;
    const set = x => { const r = st.getBoundingClientRect(); const p = Math.max(4, Math.min(96, (x - r.left) / r.width * 100)); st.style.setProperty("--cut", p + "%"); h.setAttribute("aria-valuenow", Math.round(p)); };
    st.addEventListener("pointerdown", e => { drag = true; set(e.clientX); st.setPointerCapture && st.setPointerCapture(e.pointerId); });
    st.addEventListener("pointermove", e => { if (drag) set(e.clientX); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(ev => st.addEventListener(ev, () => drag = false));
    h.addEventListener("keydown", e => { const v = +h.getAttribute("aria-valuenow"); if (e.key === "ArrowLeft") { st.style.setProperty("--cut", (v - 4) + "%"); h.setAttribute("aria-valuenow", v - 4); } if (e.key === "ArrowRight") { st.style.setProperty("--cut", (v + 4) + "%"); h.setAttribute("aria-valuenow", v + 4); } });
    // gentle auto-sweep until the visitor touches it
    if (!reduce && "IntersectionObserver" in window) { let done = false; st.addEventListener("pointerdown", () => done = true, { once: true });
      new IntersectionObserver(es => { if (!es[0].isIntersecting || done) return; let t = 0; (function sweep() { if (done || t > 1) return; t += .012; const p = 50 + Math.sin(t * Math.PI * 2) * 28; st.style.setProperty("--cut", p + "%"); requestAnimationFrame(sweep); })(); }, { threshold: .5 }).observe(st); }
  });
  // reviews chat replay
  document.querySelectorAll("[data-chat]").forEach(feed => {
    const msgs = [...feed.querySelectorAll(".msg")];
    const typing = document.createElement("div"); typing.className = "msg out typing"; typing.innerHTML = "<i></i><i></i><i></i>";
    function play() {
      msgs.forEach(m => m.classList.remove("on")); let i = 0;
      (function next() {
        if (i >= msgs.length) { setTimeout(play, 6000); return; }
        const m = msgs[i++];
        if (m.classList.contains("out")) { feed.insertBefore(typing, m); typing.classList.add("on"); setTimeout(() => { typing.classList.remove("on"); typing.remove(); m.classList.add("on"); setTimeout(next, 1800); }, 1400); }
        else { m.classList.add("on"); setTimeout(next, 1600); }
      })();
    }
    if (reduce || !("IntersectionObserver" in window)) { msgs.forEach(m => m.classList.add("on")); return; }
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 400); } }, { threshold: .4 }); io.observe(feed);
  });
  // process progress line follows scroll
  const proc = document.querySelector(".process");
  if (proc) { const upd = () => { const r = proc.getBoundingClientRect(); const p = Math.max(0, Math.min(1, (innerHeight * .85 - r.top) / (r.height + innerHeight * .3))); proc.style.setProperty("--prog", p.toFixed(3)); }; addEventListener("scroll", upd, { passive: true }); upd(); }
})();
