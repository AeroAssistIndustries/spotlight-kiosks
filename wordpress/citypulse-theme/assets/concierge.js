/* CityPulse Kiosks — mobile concierge page (opened from the kiosk's QR code).
   Venue content is example data. Nothing is sent or stored. */
(function () {
  "use strict";
  const app = document.getElementById("cc-app");
  if (!app) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const VENUES = {
    hotel: {
      name: "The Arden Hotel", welcome: "Your stay, planned in one place.",
      guides: [
        ["Dining", "Restaurant on the lobby level for breakfast, lunch and dinner.", "Lobby level · 6:30 AM to 10 PM"],
        ["Amenities", "Pool, fitness room, business center and valet parking.", "Ask at the front desk"],
        ["Local guide", "Galleries, trails and shops within a short walk.", "Central Ave · 10 min walk"],
        ["Events", "Live music tonight and this week's guided tours.", "Check the lobby board"]
      ]
    },
    medical: {
      name: "Camelback Family Health", welcome: "Your visit, made easier.",
      guides: [
        ["Check-in", "Confirm your details before you are called.", "Front desk · 2 minutes"],
        ["Pharmacy", "Prescriptions can be picked up on the way out.", "Ground floor · open until 7 PM"],
        ["Coffee", "A café with light meals, a short walk from the clinic.", "Suite 120 · 7 AM to 3 PM"],
        ["Parking", "Lot B is free for patients. Validate your ticket at the desk.", "Exit by Lab, follow signs"]
      ]
    },
    auto: {
      name: "Valley Motors Service Lounge", welcome: "Your visit, while we service your car.",
      guides: [
        ["Service status", "Follow your vehicle from check-in to ready for pickup.", "Ticket at the service desk"],
        ["Lounge dining", "Coffee and snacks, with free Wi-Fi in the lounge.", "Lounge · open all day"],
        ["Shuttle", "Shuttle to nearby shops and back, about every 20 minutes.", "Pickup outside the showroom"],
        ["Things to do", "Quick local errands and a short walk to the park.", "Ask the service desk"]
      ]
    }
  };
  const venue = VENUES[q()] || null;
  /* Count the visit when the site is served by WordPress (the static site has no endpoint). Counts only. */
  function track(key) {
    const cfg = window.CITYPULSE_CONFIG && CITYPULSE_CONFIG.forms && CITYPULSE_CONFIG.forms.ajaxUrl;
    if (!cfg) return;
    const body = new URLSearchParams({ action: "citypulse_visit", venue: key, item: new URLSearchParams(location.search).get("i") || "", device: matchMedia("(max-width: 720px)").matches ? "phone" : "desktop" });
    fetch(cfg, { method: "POST", body, credentials: "same-origin", keepalive: true }).catch(() => {});
  }
  function q() { return new URLSearchParams(location.search).get("v") || ""; }

  if (venue) track(q());
  if (!venue) {
    app.innerHTML = `<h1 class="cc-h">Your CityPulse guide</h1>
      <p class="cc-lede">Scan the code on a CityPulse kiosk to open its guide here.</p>
      <p><a class="btn" href="../">See CityPulse Kiosks</a></p>`;
    return;
  }
  const cards = venue.guides.map(([t, d, f]) => `
    <article class="cc-card"><h2>${esc(t)}</h2><p>${esc(d)}</p><small>${esc(f)}</small></article>`).join("");
  app.innerHTML = `
    <p class="cc-kicker">CityPulse concierge</p>
    <h1 class="cc-h">${esc(venue.name)}</h1>
    <p class="cc-lede">${esc(venue.welcome)}</p>
    <div class="cc-list">${cards}</div>
    <article class="cc-card cc-sponsor"><small>Sponsored · example business</small><h2>Your next stop</h2><p>Local businesses on the CityPulse kiosk offer visitors something to try.</p></article>
    <section class="cc-tip"><h2>Keep this guide</h2>
      <p><b>iPhone:</b> tap Share, then Add to Home Screen.</p>
      <p><b>Android:</b> open the browser menu, then Add to Home screen.</p></section>`;
})();
