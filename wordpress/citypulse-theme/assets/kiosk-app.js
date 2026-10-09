/* Kiosk staff controls: full screen, staff exit and today's activity.
   Guests can turn on full screen. Leaving it needs the staff password, stored only as a SHA-256 hash.
   This keeps guests out of the controls. It is not a security lock: the browser still allows Esc, so the
   ELO's own kiosk mode is the real lock. */
(function () {
  "use strict";
  const btn = document.getElementById("kapp-fs");
  const modal = document.getElementById("kapp-modal");
  if (!btn || !modal) return;
  const HASH = "704cbe6a49d1c459586a7b85285ea3d55cad79232a382b6c69d9305b0d99930b";
  const form = document.getElementById("kapp-form");
  const input = document.getElementById("kapp-pass");
  const msg = document.getElementById("kapp-msg");
  const stats = document.getElementById("kapp-stats");
  const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const sha = async s => {
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, "0")).join("");
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function sync() { btn.setAttribute("aria-label", isFs() ? "Staff menu" : "Full screen"); btn.classList.toggle("on", isFs()); }

  function goFull() {
    const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) { const p = req.call(el); if (p && p.catch) p.catch(() => {}); }
  }
  function openStaff() {
    form.hidden = false; stats.hidden = true;
    modal.hidden = false; input.value = ""; msg.textContent = ""; input.focus();
  }
  btn.addEventListener("click", () => { if (!isFs()) goFull(); else openStaff(); });
  /* Staff can also hold the logo for 3 seconds to open the staff menu. */
  let hold = null;
  document.addEventListener("pointerdown", e => { if (e.target.closest(".cpk-logo")) hold = setTimeout(openStaff, 3000); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev => document.addEventListener(ev, () => clearTimeout(hold)));

  modal.addEventListener("click", e => {
    if (e.target.closest("[data-close]")) modal.hidden = true;
    if (e.target.closest("[data-exitfs]")) { modal.hidden = true; const x = document.exitFullscreen || document.webkitExitFullscreen; if (x) { const p = x.call(document); if (p && p.catch) p.catch(() => {}); } }
    if (e.target.closest("[data-reload]")) location.reload();
  });

  function report() {
    let all = {};
    try { all = JSON.parse(localStorage.getItem("cpk-stats") || "{}"); } catch (e) { /* ignore */ }
    const days = Object.keys(all).sort().reverse().slice(0, 7);
    const sum = (d, g) => Object.values((all[d] || {})[g] || {}).reduce((a, b) => a + b, 0);
    const top = (g, n) => {
      const t = {};
      days.forEach(d => Object.entries((all[d] || {})[g] || {}).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; }));
      return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, n);
    };
    const names = window.CP_VENUE ? window.CP_VENUE.items : {};
    const rows = days.map(d => `<tr><td>${d}</td><td>${sum(d, "sessions")}</td><td>${sum(d, "places")}</td><td>${sum(d, "questions")}</td><td>${sum(d, "adShown")}</td></tr>`).join("") || '<tr><td colspan="5">No activity yet.</td></tr>';
    const list = (g, map) => top(g, 5).map(([k, v]) => `<li>${esc(map && map[k] ? map[k].n : k)}<b>${v}</b></li>`).join("") || "<li>None yet</li>";
    stats.innerHTML = `<h2>Kiosk activity</h2><p>Last 7 days on this kiosk.</p>
      <div class="kapp-table"><table><thead><tr><th>Day</th><th>Sessions</th><th>Places opened</th><th>Questions</th><th>Ad views</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="kapp-cols"><div><h3>Top places</h3><ol>${list("places", names)}</ol></div><div><h3>Top questions</h3><ol>${list("questions")}</ol></div><div><h3>Ad views by business</h3><ol>${list("adShown")}</ol></div></div>
      <div class="kapp-row"><button type="button" class="kapp-btn-ghost" data-reload>Reload content</button><button type="button" class="kapp-btn-ghost" data-close>Close</button>${isFs() ? '<button type="button" class="kapp-btn" data-exitfs>Exit full screen</button>' : ""}</div>`;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    let ok = false;
    try { ok = (await sha(input.value)) === HASH; } catch (err) { ok = false; }
    if (!ok) { msg.textContent = "That password is not correct."; input.select(); return; }
    form.hidden = true; report(); stats.hidden = false;
  });
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);
  sync();
})();
