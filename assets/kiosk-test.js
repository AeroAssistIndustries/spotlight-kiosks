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
      <p><strong>Test check-in to the website</strong></p>
      <input name="site" type="url" placeholder="https://yoursite.com/wp-admin/admin-ajax.php" required>
      <input name="kiosk" placeholder="kiosk slug, e.g. hotel-lobby" required>
      <input name="token" placeholder="device token (shown once in WordPress)" required autocomplete="off">
      <button class="btn" type="submit">Send test check-in</button>
      <p id="kt-result" role="status"></p>
    </form>
    <p><button class="btn btn-ghost btn-small" id="kt-full" type="button">Full screen</button></p>`;
  const clock = () => { document.getElementById("kt-clock").textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }); };
  const net = () => { document.getElementById("kt-online").textContent = navigator.onLine ? "Connected" : "No connection"; };
  clock(); net(); setInterval(clock, 1000);
  window.addEventListener("online", net); window.addEventListener("offline", net);
  document.getElementById("kt-full").addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  });
  document.getElementById("kt-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const out = document.getElementById("kt-result");
    const body = new URLSearchParams({ action: "citypulse_heartbeat", kiosk: f.get("kiosk").trim(), token: f.get("token").trim(), version: "kiosk-test" });
    // no-cors: the browser sends the check-in but cannot read the reply. Check the kiosk in WordPress instead.
    fetch(f.get("site").trim(), { method: "POST", mode: "no-cors", body })
      .then(() => { out.textContent = "Sent. In WordPress, the kiosk should show Online within a minute. If it does not, check the site address, the slug and the token."; })
      .catch(() => { out.textContent = "Could not reach the website. Check the data card connection and the site address."; });
  });
})();
