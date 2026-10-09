/* CityPulse kiosk test (temporary). Opens on the kiosk's browser to check the screen, the data card
   connection and a test check-in to the website. It cannot confirm the kiosk is locked down. */
(function () {
  "use strict";
  const app = document.getElementById("ktest-app");
  if (!app) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const conn = navigator.connection || {};
  app.innerHTML = `
    <div class="ktest-stage" aria-hidden="true"><i></i><i></i><i></i><b>CP</b></div>
    <p class="ktest-clock" id="kt-clock"></p>
    <p>CityPulse kiosk check</p>
    <div class="ktest-grid">
      <div><strong>Internet:</strong> <span id="kt-online"></span></div>
      <div><strong>Connection type:</strong> ${esc(conn.effectiveType || "not reported by this browser")}</div>
      <div><strong>Screen:</strong> ${window.innerWidth} × ${window.innerHeight}</div>
    </div>
    <form class="ktest-form" id="kt-form">
      <p><strong>Kiosk setup (saved on this device)</strong></p>
      <input name="site" type="url" placeholder="https://yoursite.com/wp-admin/admin-ajax.php" required>
      <input name="kiosk" placeholder="kiosk slug, e.g. hotel-lobby" required>
      <input name="token" placeholder="device token (shown once in WordPress)" required autocomplete="off">
      <button class="btn" type="submit">Save and start check-ins</button>
      <p id="kt-result" role="status"></p><p id="kt-last"></p><p id="kt-auto"></p>
    </form>
    <p><button class="btn btn-ghost btn-small" id="kt-full" type="button">Full screen</button></p>`;
  const clock = () => { document.getElementById("kt-clock").textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }); };
  const net = () => { document.getElementById("kt-online").textContent = navigator.onLine ? "Connected" : "No connection"; };
  clock(); net(); setInterval(clock, 1000);
  window.addEventListener("online", net); window.addEventListener("offline", net);
  document.getElementById("kt-full").addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  });
  const KEY = "cp-kiosk-setup";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  const form = document.getElementById("kt-form");
  const saved = load();
  if (saved) { form.site.value = saved.site || ""; form.kiosk.value = saved.kiosk || ""; form.token.value = saved.token || ""; }
  const out = document.getElementById("kt-result");
  let timer = null;

  function checkIn(setup) {
    const body = new URLSearchParams({ action: "citypulse_heartbeat", kiosk: setup.kiosk, token: setup.token, version: "kiosk-android-1" });
    // no-cors: the browser sends the check-in but cannot read the reply. Check the kiosk in WordPress instead.
    return fetch(setup.site, { method: "POST", mode: "no-cors", body })
      .then(() => { document.getElementById("kt-last").textContent = "Last check-in sent " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); return true; })
      .catch(() => { document.getElementById("kt-last").textContent = "Check-in failed at " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + ". Checking again in 5 minutes."; return false; });
  }
  function startAuto(setup) {
    clearInterval(timer);
    checkIn(setup);
    timer = setInterval(() => checkIn(setup), 5 * 60 * 1000);
    document.getElementById("kt-auto").textContent = "Automatic check-in every 5 minutes is on for this kiosk.";
  }
  // Keep the screen on while the kiosk runs.
  async function keepAwake() {
    try { if (navigator.wakeLock) await navigator.wakeLock.request("screen"); } catch (e) { /* not supported */ }
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) keepAwake(); });
  keepAwake();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const setup = { site: form.site.value.trim(), kiosk: form.kiosk.value.trim(), token: form.token.value.trim() };
    save(setup);
    out.textContent = "Saved. Sending the first check-in now.";
    startAuto(setup);
  });
  if (saved && saved.site && saved.kiosk && saved.token) startAuto(saved);
  else out.textContent = "Enter the site address, kiosk slug and token once. The kiosk will remember them and check in every 5 minutes.";
})();
