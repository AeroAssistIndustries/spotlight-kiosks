/* CityPulse Kiosks — DEMO of the host dashboard and kiosk status (GitHub Pages only).
   GitHub Pages cannot receive device check-ins or store logins, so every kiosk, status and
   number here is sample data. The live version runs on WordPress (shortcode [citypulse_host]). */
(function () {
  "use strict";
  const app = document.getElementById("host-app");
  if (!app) return;
  const DEMO_CODE = "citypulse-host";
  const MIN = 60 * 1000;
  const ONLINE_WINDOW = 15 * MIN;
  const KEY = "cp-demo-host";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const signedIn = () => { try { return sessionStorage.getItem(KEY) === "yes"; } catch (e) { return false; } };
  const setSigned = v => { try { v ? sessionStorage.setItem(KEY, "yes") : sessionStorage.removeItem(KEY); } catch (e) { /* private window */ } };

  // Sample fleet. lastSeen is a time offset from now, in minutes (null = never connected).
  const fleet = [
    { id: "hotel-lobby", name: "Hotel lobby kiosk", address: "1 Main St, Phoenix, AZ", status: "live", lastSeen: 2, visits: 214, version: "1.2.3" },
    { id: "dealership", name: "Dealership lounge kiosk", address: "900 Auto Mall Dr, Scottsdale, AZ", status: "live", lastSeen: 45, visits: 88, version: "1.2.3" },
    { id: "clinic", name: "Medical office kiosk", address: "42 Health Way, Tempe, AZ", status: "installing", lastSeen: null, visits: 0, version: "" }
  ];
  const statusLabel = { planned: "Planned", installing: "Installing", live: "Live", paused: "Paused", removed: "Removed" };
  const online = k => k.lastSeen !== null && k.lastSeen <= ONLINE_WINDOW / MIN;
  const seenText = k => k.lastSeen === null ? "Never connected" : (online(k) ? "Online" : "Offline") + ", " + (k.lastSeen < 1 ? "just now" : k.lastSeen + " min ago");
  const response = k => (k.status === "live" || k.status === "installing") ? "run" : "standby";

  function login(note) {
    app.innerHTML = `
      <p class="ops-demo-tag">DEMO · sample data</p>
      <h1 class="ops-h">Host dashboard</h1>
      <p class="ops-lede">Host login. Sign in to see your kiosks, their status and visit counts.</p>
      <form class="ops-form" id="host-form" autocomplete="off">
        <label>Demo code<input type="password" name="code" required autocomplete="off"></label>
        <button class="btn" type="submit">Sign in</button>
        <p class="ops-note">${esc(note || "")}</p>
      </form>
      <p class="ops-small">Demo code for this preview: <code>${DEMO_CODE}</code>.</p>`;
    document.getElementById("host-form").addEventListener("submit", e => {
      e.preventDefault();
      if (e.target.elements.code.value.trim() === DEMO_CODE) { setSigned(true); dashboard(); }
      else login("That code is not correct.");
    });
  }

  function dashboard(msg) {
    const rows = fleet.map((k, i) => `
      <tr>
        <td>${esc(k.name)}<br><small>${esc(k.address)}</small></td>
        <td>${esc(statusLabel[k.status])}</td>
        <td>${esc(seenText(k))}</td>
        <td>${k.visits}</td>
        <td><button class="ops-view" data-i="${i}">Check in now</button> <button class="ops-view" data-i="${i}" data-off="1">Power off</button></td>
      </tr>`).join("");
    app.innerHTML = `
      <p class="ops-demo-tag">DEMO · sample data</p>
      <h1 class="ops-h">Your kiosks</h1>
      <p class="ops-lede">Each kiosk checks in every few minutes over its 4G data card. A kiosk is online if it checked in within the last 15 minutes.</p>
      <div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Kiosk</th><th>Status</th><th>Device</th><th>Phone visits, 30 days</th><th>Try it</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="ops-note" id="host-msg" role="status">${esc(msg || "")}</p>
      ${alertsHtml()}
      <h2 class="ops-h" style="font-size:1.25rem;margin-top:2rem">What the kiosk receives</h2>
      <p class="ops-lede">The kiosk sends its token and kiosk name. The site replies with one of two actions:</p>
      <pre class="ops-note" style="white-space:pre-wrap">Live kiosk:     {"success":true,"data":{"action":"run","status":"live"}}
Paused kiosk:   {"success":true,"data":{"action":"standby","status":"paused"}}
Wrong token:    {"success":false,"data":"Unknown kiosk or token."}</pre>
      <p><button class="btn btn-ghost btn-small" id="host-out" type="button">Sign out</button></p>`;
    app.querySelectorAll(".ops-view").forEach(b => b.addEventListener("click", () => {
      const k = fleet[+b.dataset.i];
      if (b.dataset.off) { k.lastSeen = 30; dashboard(`${k.name}: powered off. No check-in for 30 minutes, so it shows as offline and the administrator gets an email.`); }
      else { k.lastSeen = 0; dashboard(`${k.name}: checked in. Reply: ${response(k)}.`); }
    }));
    document.getElementById("host-out").addEventListener("click", () => { setSigned(false); login("Signed out."); });
  }

  function alertsHtml() {
    const off = fleet.filter(k => k.status === "live" && !online(k));
    if (!off.length) return "";
    return `<p class="ops-note"><strong>Offline alert (sent to the administrator):</strong> ${off.map(k => esc(k.name)).join(", ")} has not checked in for more than 15 minutes.</p>`;
  }

  if (signedIn()) dashboard(); else login();
})();
