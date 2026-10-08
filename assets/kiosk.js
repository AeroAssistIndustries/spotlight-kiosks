/* CityPulse Kiosks — interactive kiosk demo.
   All businesses are fictional demo content. Nothing leaves the page. */
(function () {
  "use strict";

  const P = {
    fork: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M8 17h2M12 17h2"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    flag: '<path d="M6 21V3l10 4-10 4"/><ellipse cx="12" cy="20.5" rx="7" ry="1.5"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9" r="2.4"/><path d="M15.5 14c2.6 0 4.4 1.6 5 4.5"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    spark: '<path d="M12 3c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7z"/>',
    car: '<path d="M4 16v-4l2-5h12l2 5v4H4z"/><circle cx="8" cy="16.5" r="1.8"/><circle cx="16" cy="16.5" r="1.8"/><path d="M4 12h16"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/>',
    coffee: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3c-.5 1 .5 2 0 3M12 3c-.5 1 .5 2 0 3"/>',
    heart: '<path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
    pill: '<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-35 12 12)"/><path d="M9.5 8.5l5 7"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    pool: '<path d="M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M8 14V5a2 2 0 0 1 4 0M14 14V5a2 2 0 0 1 4 0M8 9h6"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12l2 2 4-4"/>',
    home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
    back: '<path d="M14 6l-6 6 6 6"/>',
    text: '<path d="M3 19l5-13 5 13M4.8 14.5h6.4M15 19l3-8 3 8M15.9 16.6h4.2"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    mega: '<path d="M3 10v4h3l7 4V6L6 10H3zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>'
  };
  const svg = (k, cls) => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${P[k] || ""}</svg>`;

  const G = {
    dining: "linear-gradient(135deg,#7a3b1f,#c9773a)",  events: "linear-gradient(135deg,#2a2f5c,#8a64b0)",
    local: "linear-gradient(120deg,#2b5876 10%,#c2702f 70%,#f2c46d)", amenities: "linear-gradient(135deg,#1f6f78,#7cc4c0)",
    getting: "linear-gradient(135deg,#34495e,#7f9bb5)", map: "linear-gradient(135deg,#4a5568,#9aa8bb)",
    checkin: "linear-gradient(135deg,#1b6ca8,#62b6cb)", pharmacy: "linear-gradient(135deg,#227a5c,#8ccfa6)",
    coffee: "linear-gradient(135deg,#4e3122,#b07a4f)", parking: "linear-gradient(135deg,#3d4a5c,#7d8ea3)",
    wellness: "linear-gradient(135deg,#6e4772,#d29ab0)", service: "linear-gradient(135deg,#2d3436,#e17055)",
    todo: "linear-gradient(135deg,#5a2c82,#e2a65b)", accessories: "linear-gradient(135deg,#24343f,#5f7a8a)",
    offers: "linear-gradient(135deg,#a2740a,#e8b923)"
  };

  const I = {};
  function cat(id, label, icon, intro, items) { items.forEach(it => { if (!it.ref) { it.cat = id; I[it.id] = it; } }); return { id, label, icon, intro, items, g: G[id] }; }
  const CATS = {};
  [
    cat("dining", "Dining", "fork", "Good places to eat, a short walk or drive away.", [
      { id: "willow", n: "Willow Kitchen", k: "Seasonal American", m: "6 min walk", sp: 1, h: "A good evening starts nearby.", c: "Explore the menu", d: "A relaxed dining room with a wood-fired oven and a menu that changes with the season. Walk-ins welcome before 6 pm.", f: [["Open today", "5–10 pm"], ["Price", "$$"]], o: "Dessert on us for tables of two or more. Show this screen to your server." },
      { id: "cornercup", n: "Corner Cup & Co.", k: "Coffee & bakery", m: "3 min walk", sp: 1, h: "Something good for the way home.", c: "View the menu", d: "Espresso, cold brew and pastries baked in-house every morning. Plenty of seats and fast Wi-Fi.", f: [["Open today", "6 am–4 pm"], ["Price", "$"]], o: "Free pastry with any large drink before 11 am." },
      { id: "salt", n: "Salt & Ember", k: "Wood-fired grill", m: "0.8 mi", d: "Steaks, grilled vegetables and a long patio with fire pits. Reservations recommended on weekends.", f: [["Open today", "4–11 pm"], ["Price", "$$$"]] },
      { id: "mesa", n: "Mesa Verde Taqueria", k: "Street tacos", m: "1.1 mi", d: "Handmade tortillas, a salsa bar and quick counter service. A local favorite for lunch.", f: [["Open today", "10 am–9 pm"], ["Price", "$"]] }
    ]),
    cat("local", "Discover local", "pin", "Places people around here love.", [
      { id: "gallery", n: "Copper Lane Gallery", k: "Local art", m: "0.4 mi", d: "Rotating exhibits from Arizona artists, with a free first-Friday opening each month.", f: [["Open today", "10 am–6 pm"], ["Entry", "Free"]] },
      { id: "bloom", n: "Desert Bloom Spa", k: "Massage & facials", m: "0.6 mi", sp: 1, h: "Unwind ten minutes away.", c: "Book a massage", d: "Day spa with massage, facials and a quiet courtyard. Same-day appointments most weekdays.", f: [["Open today", "9 am–8 pm"], ["Price", "$$"]], o: "15% off weekday massages when you book from this kiosk." },
      { id: "trail", n: "Agave Ridge Trail", k: "Easy 2-mile loop", m: "10 min drive", d: "A gentle desert loop with saguaros and wide valley views. Best at sunrise or just before sunset.", f: [["Difficulty", "Easy"], ["Bring", "Water"]] },
      { id: "rooftop", n: "Lantern Rooftop", k: "Cocktails & views", m: "0.9 mi", d: "Small plates and cocktails on a rooftop with mountain views. Live acoustic sets on weekends.", f: [["Open today", "4 pm–12 am"], ["Price", "$$"]] }
    ]),
    cat("todo", "Things to do", "spark", "Ways to spend an hour or an afternoon.", [
      { id: "market", n: "Third Friday Night Market", k: "Food & makers", m: "Fri 6–10 pm", d: "Food trucks, local makers and live music in the plaza every third Friday.", f: [["Entry", "Free"], ["Distance", "1.2 mi"]] },
      { ref: "gallery" }, { ref: "trail" },
      { id: "cinema", n: "The Palms Cinema", k: "Movies & dine-in", m: "1.4 mi", d: "Recliner seating and food delivered to your seat. Matinees every day.", f: [["Next show", "2:15 pm"], ["Price", "$$"]] }
    ]),
    cat("events", "Events", "cal", "What's happening this week.", [
      { id: "jazz", n: "Live jazz in the lounge", k: "Tonight", m: "7–10 pm", d: "A trio playing standards in the lounge. No cover, full bar menu.", f: [["Where", "Lounge"], ["Cost", "Free"]] },
      { id: "wine", n: "Thursday wine tasting", k: "Thursday", m: "6 pm", d: "Four pours from Arizona wineries with light bites.", f: [["Where", "Terrace"], ["Cost", "$25"]] },
      { id: "yoga", n: "Sunrise yoga on the lawn", k: "Saturday", m: "7 am", d: "All levels welcome. Mats provided.", f: [["Where", "Main lawn"], ["Cost", "Free"]] },
      { id: "brunch", n: "Sunday brunch", k: "Sunday", m: "9 am–1 pm", d: "Buffet brunch with an omelet station and bottomless coffee.", f: [["Where", "Dining room"], ["Cost", "$38"]] }
    ]),
    cat("getting", "Getting around", "car", "Rides, transit and directions.", [
      { id: "ride", n: "Rideshare pickup", k: "North entrance", m: "1 min walk", d: "Pickup zone is outside the north doors, to the left of the main entrance.", f: [["Zone", "North doors"], ["Wait", "~5 min"]] },
      { id: "rail", n: "Light rail stop", k: "Central Ave station", m: "6 min walk", d: "Trains every 12–15 minutes. Tap a card or phone to pay at the platform.", f: [["Next train", "8 min"], ["Fare", "$2"]] },
      { id: "bike", n: "Bike share dock", k: "12 bikes available", m: "2 min walk", d: "Unlock with the app. First 30 minutes included with a day pass.", f: [["Day pass", "$8"], ["Docks", "18"]] },
      { id: "airport", n: "Airport shuttle", k: "Every 30 min", m: "Front drive", d: "Complimentary shuttle to the airport, 5 am to 11 pm. Ask the front desk to reserve a seat.", f: [["Next", "On the half hour"], ["Cost", "Free"]] }
    ]),
    cat("amenities", "Amenities", "pool", "Everything included with your stay.", [
      { id: "pool", n: "Pool & cabanas", k: "Level 2", m: "7 am–10 pm", d: "Heated pool, hot tub and cabanas you can reserve at the front desk.", f: [["Towels", "Poolside"], ["Cabanas", "Reserve"]] },
      { id: "gym", n: "Fitness center", k: "Level 2", m: "Open 24 hours", d: "Cardio, free weights and a stretching area. Use your room key to enter.", f: [["Access", "Room key"], ["Hours", "24/7"]] },
      { id: "biz", n: "Business center", k: "Lobby level", m: "Open 24 hours", d: "Printing, two workstations and a small meeting room.", f: [["Printing", "Free"], ["Room", "Reserve"]] },
      { id: "valet", n: "Valet & parking", k: "Front drive", m: "In and out", d: "Valet is available at the front drive. Self-parking is in the garage off 2nd Street.", f: [["Valet", "$28/night"], ["Self", "$18/night"]] }
    ]),
    cat("checkin", "Check-in help", "clip", "Make your visit a little faster.", [
      { id: "phonecheck", n: "Check in from your phone", k: "Skip the line", m: "2 minutes", d: "Scan the code to confirm your details and insurance before you're called.", f: [["Needs", "Photo ID"], ["Time", "2 min"]] },
      { id: "forms", n: "Forms & insurance", k: "New patients", m: "5 minutes", d: "New-patient forms and insurance card upload. You can finish them on your phone.", f: [["Needs", "Insurance card"], ["Time", "5 min"]] },
      { id: "wait", n: "Current wait", k: "About 12 minutes", m: "Updated now", d: "Average time from check-in to exam room right now. We'll text you when it's your turn.", f: [["Wait", "~12 min"], ["Text alerts", "Available"]] }
    ]),
    cat("pharmacy", "Pharmacy", "pill", "Pick up a prescription on the way home.", [
      { id: "northside", n: "Northside Pharmacy", k: "Same building, level 1", m: "1 min walk", d: "Prescriptions sent from this office are usually ready in 20 minutes.", f: [["Open today", "8 am–9 pm"], ["Drive-thru", "No"]] },
      { id: "corner24", n: "Corner 24 Pharmacy", k: "Open 24 hours", m: "0.7 mi", d: "Drive-thru pharmacy open around the clock.", f: [["Open", "24 hours"], ["Drive-thru", "Yes"]] }
    ]),
    cat("coffee", "Coffee & food", "coffee", "Something good while you wait.", [
      { ref: "cornercup" },
      { id: "juice", n: "Green Leaf Juice Bar", k: "Smoothies & bowls", m: "2 min walk", d: "Cold-pressed juices, smoothies and acai bowls.", f: [["Open today", "7 am–5 pm"], ["Price", "$"]] },
      { ref: "mesa" }
    ]),
    cat("parking", "Parking", "map", "Getting in and out easily.", [
      { id: "patpark", n: "Patient parking", k: "Lot B, east side", m: "Free 2 hours", d: "Free for two hours with validation at the front desk.", f: [["Cost", "Free"], ["Validate", "Front desk"]] },
      { id: "access", n: "Accessible entrance", k: "East doors", m: "Ramp & auto doors", d: "Step-free entrance with automatic doors next to accessible parking spaces.", f: [["Spaces", "8"], ["Doors", "Automatic"]] },
      { ref: "ride" }
    ]),
    cat("wellness", "Wellness", "heart", "Feel-better places close by.", [
      { ref: "bloom" },
      { id: "stride", n: "Stride Physical Therapy", k: "Sports & recovery", m: "Level 3", d: "Physical therapy in this building. Most plans accepted.", f: [["Open today", "7 am–6 pm"], ["Referral", "Not required"]] },
      { id: "sunrise", n: "Sunrise Yoga Studio", k: "All levels", m: "0.5 mi", d: "Drop-in classes every morning and evening. First class free.", f: [["Next class", "5:30 pm"], ["First class", "Free"]] }
    ]),
    cat("accessories", "Accessories", "tag", "Add-ons we can install while you wait.", [
      { id: "mats", n: "All-weather floor mats", k: "Custom fit", m: "$129", d: "Laser-measured mats for your exact model. Installed in minutes.", f: [["Install", "Free"], ["Fit", "Custom"]] },
      { id: "shade", n: "Windshield sunshade", k: "Folds flat", m: "$39", d: "Reflective shade cut for your windshield. Keeps the cabin cooler in summer.", f: [["Install", "None"], ["Fit", "Custom"]] },
      { id: "tint", n: "Window tint", k: "Ceramic film", m: "From $299", d: "Ceramic film that blocks heat and UV. Book a time with the service desk.", f: [["Time", "2–3 hrs"], ["Warranty", "Lifetime"]] }
    ]),
    cat("offers", "Local offers", "tag", "Deals from businesses nearby.", [
      { ref: "willow" },
      { id: "shine", n: "Shine Express Car Wash", k: "Full-service wash", m: "0.5 mi", sp: 1, h: "Drive out sparkling.", c: "See wash options", d: "Hand-dried exterior, interior vacuum and windows in about 20 minutes.", f: [["Open today", "7 am–7 pm"], ["Price", "From $15"]], o: "$5 off any full-service wash this week." },
      { ref: "cornercup" }
    ])
  ].forEach(c => { CATS[c.id] = c; });
  Object.values(CATS).forEach(c => { c.items = c.items.map(it => it.ref ? I[it.ref] : it); });

  const SPECIAL = {
    service: { label: "Service status", icon: "wrench", g: G.service },
    venuemap: { label: "Venue map", icon: "map", g: G.map }
  };

  const VENUES = {
    hotel: {
      name: "The Arden Hotel", short: "THE ARDEN", finish: "silver",
      theme: { fg: "#1d2b45", sub: "#5a6578", accent: "#1d2b45", bg: "linear-gradient(180deg,#dfe8f1 0%,#f6f7f8 38%,#f4f4f2 100%)" },
      tiles: ["dining", "amenities", "local", "events", "getting", "venuemap"],
      wide: { to: "todo", t: "Experience more today", s: "Things to do near the hotel" },
      sponsors: ["willow", "cornercup"],
      rooms: ["Front desk", "Elevators", "Restaurant", "Ballroom", "Restrooms", "Pool access"]
    },
    medical: {
      name: "Camelback Family Health", short: "CAMELBACK FAMILY HEALTH", finish: "silver",
      theme: { fg: "#12384a", sub: "#4f6772", accent: "#1b6ca8", bg: "linear-gradient(180deg,#d9edf3 0%,#f4f8f9 38%,#f3f6f6 100%)" },
      tiles: ["checkin", "pharmacy", "coffee", "parking", "wellness", "venuemap"],
      wide: { to: "local", t: "While you wait", s: "A few good places nearby" },
      sponsors: ["cornercup", "bloom"],
      rooms: ["Check-in", "Lab", "Imaging", "Pharmacy", "Restrooms", "Exit to Lot B"]
    },
    auto: {
      name: "Valley Motors Service Lounge", short: "VALLEY MOTORS", finish: "black",
      theme: { fg: "#1f2428", sub: "#5d666d", accent: "#c4511b", bg: "linear-gradient(180deg,#e6e8ea 0%,#f6f6f5 38%,#f3f3f1 100%)" },
      tiles: ["service", "dining", "getting", "todo", "accessories", "offers"],
      wide: { to: "local", t: "Got an hour?", s: "Make the most of your wait" },
      sponsors: ["shine", "cornercup"],
      rooms: ["Service desk", "Lounge", "Parts", "Showroom", "Restrooms", "Shuttle"]
    }
  };

  const $ = s => document.querySelector(s);
  const screen = $("#screen"), device = $("#device");
  if (!screen) return;
  const ROOT = screen.dataset.root || "./";
  const S = {
    venue: "hotel", mode: "attract", stack: [], large: false,
    stats: { sessions: 0, views: 0, impr: 0, scans: 0 },
    slide: 0, slides: [], idleT: null, visible: true, paused: false,
    svc: { step: 2 }, room: null, sent: {}
  };
  const IDLE_MS = 45000, SLIDE_MS = 5000;

  /* ---------- console ---------- */
  const feed = $("#feed");
  function stat(k, n = 1) {
    S.stats[k] += n;
    const el = $("#st-" + k); if (!el) return;
    el.textContent = S.stats[k].toLocaleString();
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  }
  function log(text, tag) {
    if (!feed) return;
    const empty = feed.querySelector(".feed-empty"); if (empty) empty.remove();
    const li = document.createElement("li"); li.className = "new";
    const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }).replace(/\s?[AP]M/i, "");
    const tags = { sponsor: "Ad", scan: "To phone", session: "Session", open: "Ad space" };
    li.innerHTML = `<time>${t}</time><span>${text}${tag ? ` <span class="tag tag-${tag}">${tags[tag]}</span>` : ""}</span>`;
    feed.prepend(li);
    while (feed.children.length > 30) feed.lastChild.remove();
  }

  const V = () => VENUES[S.venue];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const catOf = id => CATS[id] || SPECIAL[id];
  const clock = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const initial = n => n.replace(/^The /, "").charAt(0);
  /* Real QR code for a link. Uses the vendored qrcode-generator (MIT). */
  function qr(text) {
    if (typeof qrcode !== "function") return "";
    const q = qrcode(0, "M"); q.addData(text); q.make();
    const N = q.getModuleCount(); let r = "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (q.isDark(y, x)) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    return `<svg viewBox="0 0 ${N} ${N}" role="img" aria-label="QR code: scan to open on your phone" shape-rendering="crispEdges"><rect width="${N}" height="${N}" fill="#fff"/><g fill="#111">${r}</g></svg>`;
  }
  /* Link a phone opens. Concierge links carry the venue (and item) so the phone page matches the kiosk. */
  function link(path, id) {
    const u = new URL(ROOT + path, location.href);
    if (path === "concierge/") { u.searchParams.set("v", S.venue); if (id) u.searchParams.set("i", id); }
    return u.href;
  }

  /* ---------- frame (built once per venue) ---------- */
  const PKGS = [["1 location", "$399"], ["3 locations", "$1,099"], ["5 locations", "$1,200"]];
  function buildSlides() {
    const v = V();
    S.slides = [{ type: "open" }, { type: "sp", id: v.sponsors[0] }, { type: "pkg" }, { type: "sp", id: v.sponsors[1] }];
  }
  function slideHTML(s, i) {
    if (s.type === "open") {
      return `<button class="ad ad-open" data-act="adopen" data-i="${i}" aria-label="Your ad here. This ad space is available from $399 a year. Tap to see packages.">
        <span class="ad-frame">${svg("mega", "ad-ico")}
          <span class="ad-txt"><span class="ad-big">YOUR AD HERE</span><span class="ad-sub">Put your business in front of every visitor at ${esc(V().name)}.</span></span>
          <span class="ad-cta">From $399/yr<small>Tap to see packages</small></span>
        </span></button>`;
    }
    if (s.type === "pkg") {
      return `<button class="ad ad-pkg" data-act="adopen" data-i="${i}" aria-label="Advertise on this kiosk. 1 location $399 a year, 3 locations $1,099 a year, 5 locations $1,200 a year, or $60 a month per location. Tap to learn more.">
        <span class="ad-pkg-head"><b>Advertise on this kiosk</b><span>Tap to choose a package</span></span>
        <span class="ad-pkgs">${PKGS.map(([l, p], j) => `<span class="pk${j === 2 ? " best" : ""}"><small>${l}</small><b>${p}</b><em>per year</em></span>`).join("")}</span>
        <span class="ad-pkg-foot">Or $60/month per location · Each location after 5 is $300/yr</span>
      </button>`;
    }
    const it = I[s.id];
    return `<button class="ad ad-sp" style="--g:${CATS[it.cat].g}" data-act="sponsor" data-id="${it.id}" data-i="${i}" aria-label="Ad: ${esc(it.n)}. ${esc(it.h)}">
      <span class="ad-txt"><span class="ad-chip">Example ad · ${esc(it.n)}</span><span class="ad-head">${esc(it.h)}</span><span class="ad-btn">${esc(it.c)}</span></span>
      <span class="ad-qr">${qr(link("concierge/", it.id))}</span>
    </button>`;
  }
  function buildFrame() {
    const v = V();
    device.dataset.finish = v.finish;
    buildSlides(); S.slide = 0;
    screen.innerHTML = `
      <div class="k${S.large ? " large" : ""}">
        <div class="k-status"><b>${esc(v.short)}</b><span id="kclock">${clock()} &nbsp; ☀ 84°</span></div>
        <div class="k-view" id="kview"></div>
        <div class="k-ads" aria-roledescription="carousel" aria-label="Ad space">
          <div class="k-track" id="ktrack">${S.slides.map(slideHTML).join("")}</div>
          <div class="k-dots" role="tablist">${S.slides.map((s, i) => `<button role="tab" data-act="dot" data-i="${i}" aria-label="Show slide ${i + 1}" aria-selected="${i === 0}"></button>`).join("")}</div>
        </div>
        <div class="k-timer" aria-hidden="true"><i id="ktimer"></i></div>
        <nav class="k-nav" id="knav" aria-label="Kiosk navigation"></nav>
      </div>`;
    const t = V().theme, root = screen.firstElementChild;
    root.style.setProperty("--k-fg", t.fg); root.style.setProperty("--k-sub", t.sub);
    root.style.setProperty("--k-accent", t.accent); root.style.setProperty("--k-bg", t.bg);
    bindSwipe();
    showSlide(0, true);
    render();
  }

  /* ---------- slider ---------- */
  function showSlide(i, quiet) {
    const n = S.slides.length; S.slide = (i + n) % n;
    const tr = document.getElementById("ktrack"); if (!tr) return;
    tr.style.transform = `translateX(-${S.slide * 100}%)`;
    tr.querySelectorAll(".ad").forEach((el, j) => { el.tabIndex = j === S.slide ? 0 : -1; el.setAttribute("aria-hidden", String(j !== S.slide)); });
    screen.querySelectorAll(".k-dots button").forEach((d, j) => d.setAttribute("aria-selected", String(j === S.slide)));
    if (!quiet) stat("impr");
  }
  function bindSwipe() {
    const box = screen.querySelector(".k-ads"); let x0 = null, moved = false;
    box.addEventListener("pointerdown", e => { x0 = e.clientX; moved = false; });
    box.addEventListener("pointermove", e => { if (x0 != null && Math.abs(e.clientX - x0) > 12) moved = true; });
    box.addEventListener("pointerup", e => {
      if (x0 == null) return; const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { showSlide(S.slide + (dx < 0 ? 1 : -1)); if (S.mode === "session") resetIdle(); }
    });
    box.addEventListener("click", e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    box.addEventListener("mouseenter", () => { S.paused = true; });
    box.addEventListener("mouseleave", () => { S.paused = false; });
  }

  /* ---------- views ---------- */
  function render(dir) {
    const view = document.getElementById("kview"), nav = document.getElementById("knav");
    if (!view) return;
    const k = screen.firstElementChild;
    k.classList.toggle("large", S.large);
    k.classList.toggle("attract", S.mode === "attract");
    if (S.mode === "attract") {
      view.className = "k-view";
      view.innerHTML = `<button class="k-attract" data-act="start" aria-label="Touch to begin">
        <span class="a-welcome">Welcome</span><span class="a-venue">to ${esc(V().name)}</span>
        <span class="a-touch"><span class="ring"></span>Touch to begin</span></button>`;
      nav.innerHTML = "";
      return;
    }
    const top = S.stack[S.stack.length - 1] || { view: "home" };
    let body = "";
    if (top.view === "home") body = viewHome();
    else if (top.view === "cat") body = viewCat(top.id);
    else if (top.view === "item") body = viewItem(top.id);
    else if (top.view === "adspace") body = viewAdspace();
    else if (top.view === "take") body = viewTake();
    else if (top.view === "service") body = viewService();
    else if (top.view === "venuemap") body = viewMap();
    view.className = "k-view" + (dir ? " " + dir : "");
    view.innerHTML = body;
    nav.innerHTML = `
      <button data-act="home" ${top.view === "home" ? "disabled" : ""}>${svg("home")}Home</button>
      <button data-act="back" ${S.stack.length <= 1 ? "disabled" : ""}>${svg("back")}Back</button>
      <button data-act="large" aria-pressed="${S.large}">${svg("text")}${S.large ? "Smaller text" : "Larger text"}</button>`;
    stat("views");
    resetIdle();
  }

  function tile(id) {
    const c = catOf(id);
    return `<button class="k-tile" style="--g:${c.g}" data-act="open" data-id="${id}">${svg(c.icon)}<span>${esc(c.label)}</span></button>`;
  }
  function viewHome() {
    const v = V(), w = v.wide;
    return `<h2 class="k-welcome">Welcome</h2><p class="k-venue">to ${esc(v.name)}</p>
      <div class="k-tiles">${v.tiles.map(tile).join("")}
        <button class="k-tile wide" style="--g:${G.local}" data-act="open" data-id="${w.to}"><span>${esc(w.t)}</span><small>${esc(w.s)}</small></button>
      </div>
      <button class="k-btn k-cta" data-act="take">${svg("phone")}Take this concierge experience with me</button>`;
  }
  const head = c => `<div class="k-head"><span class="ico" style="--g:${c.g}">${svg(c.icon)}</span><h2>${esc(c.label)}</h2></div>`;
  function viewCat(id) {
    const c = CATS[id];
    const items = [...c.items].sort((a, b) => (b.sp || 0) - (a.sp || 0));
    return `${head(c)}<p class="k-intro">${esc(c.intro)}</p>
      <div class="k-list">${items.map(it => `
        <button class="k-item" data-act="item" data-id="${it.id}">
          <span class="thumb" style="--g:${CATS[it.cat].g}">${initial(it.n)}</span>
          <span class="body"><b>${esc(it.n)}</b><small>${esc(it.k)} · ${esc(it.m)}</small>${it.sp ? '<span class="k-chip">Featured</span>' : ""}</span>
          ${svg("chev", "chev")}</button>`).join("")}
      </div>`;
  }
  function viewItem(id) {
    const it = I[id], sent = S.sent[id];
    return `<div class="k-detail">
      <div class="k-detail-hero" style="--g:${CATS[it.cat].g}"><div><h2>${esc(it.n)}</h2><p>${esc(it.k)} · ${esc(it.m)}</p></div></div>
      <p class="k-blurb">${esc(it.d)}</p>
      <div class="k-facts">${it.f.map(([a, b]) => `<div><small>${esc(a)}</small><b>${esc(b)}</b></div>`).join("")}</div>
      ${it.o ? `<div class="k-offer"><b>Kiosk offer</b>${esc(it.o)}</div>` : ""}
      <div class="k-take"><div class="k-qr">${qr(link("concierge/", it.id))}</div>
        <div><b>Take it with you</b><button class="k-btn${sent ? " done" : ""}" data-act="send" data-id="${it.id}">${svg(sent ? "check" : "phone")}${sent ? "Sent to phone" : "Send to phone"}</button></div>
      </div></div>`;
  }
  function viewTake() {
    return `<div class="k-detail">
      <div class="k-detail-hero" style="--g:${V().theme.accent}"><div><h2>Take this concierge with you</h2><p>${esc(V().name)}</p></div></div>
      <p class="k-blurb">Scan this code with your phone camera. Your phone opens the directory, offers and map for this venue. Nothing to install.</p>
      <div class="k-take"><div class="k-qr">${qr(link("concierge/"))}</div>
        <div><b>Scan to continue on your phone</b><small class="k-label">Opens in your phone's browser</small></div></div></div>`;
  }
  function viewAdspace() {
    return `<div class="k-detail">
      <div class="k-detail-hero" style="--g:linear-gradient(135deg,#17231E,#2f4a3d 60%,#c9a227)"><div><h2>Advertise on this kiosk</h2><p>Your ad runs in the space below, on every screen</p></div></div>
      <div class="k-pk-list">${PKGS.map(([l, p], j) => `<div class="${j === 2 ? "best" : ""}"><span><b>${l}</b><small>${j === 0 ? "Or $60 a month" : j === 1 ? "Or $180 a month" : "Best value · or $300 a month"}</small></span><strong>${p}<small>/yr</small></strong></div>`).join("")}</div>
      <p class="k-pk-note">Each location after 5 is $300 a year. Includes ad artwork, digital copy and 12 months on screen.</p>
      <div class="k-take"><div class="k-qr">${qr(link("pricing/"))}</div>
        <div><b>Scan or tap to get started</b><a class="k-btn" href="${ROOT}pricing/" target="_top">${svg("mega")}See packages</a></div>
      </div></div>`;
  }
  function viewService() {
    const steps = ["Checked in", "Multi-point inspection", "Oil & filter change", "Tire rotation", "Wash", "Ready for pickup"];
    const s = Math.min(S.svc.step, steps.length - 1), pct = Math.round(s / (steps.length - 1) * 100), mins = (steps.length - 1 - s) * 12;
    return `${head(SPECIAL.service)}
      <div class="k-progress"><small class="k-label">Ticket #4821 · 2024 sedan</small>
        <b class="k-eta">${s === steps.length - 1 ? "Your vehicle is ready" : `About ${mins} minutes left`}</b>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <ol class="k-steps">${steps.map((t, i) => `<li class="${i < s ? "done" : i === s ? "now" : ""}"><i></i>${t}</li>`).join("")}</ol></div>
      <button class="k-btn${S.sent.svc ? " done" : ""}" data-act="send" data-id="svc">${svg(S.sent.svc ? "check" : "phone")}${S.sent.svc ? "We'll text you" : "Text me when it's ready"}</button>`;
  }
  function viewMap() {
    const rooms = V().rooms, r = S.room;
    const pos = [[6, 6, 40, 26], [54, 6, 40, 26], [6, 38, 40, 26], [54, 38, 40, 26], [6, 70, 26, 22], [68, 70, 26, 22]];
    const walk = [1, 2, 2, 3, 1, 2];
    let path = "";
    if (r != null) { const [x, y, w, h] = pos[r]; const d = y >= 66 ? `M50 84 H${x < 50 ? x + w : x}` : `M50 84 V67 H${x + w / 2} V${y + h}`; path = `<path d="${d}" fill="none" stroke="var(--k-accent)" stroke-width="1.4" stroke-dasharray="2.4 1.6" stroke-linecap="round"/>`; }
    return `${head(SPECIAL.venuemap)}
      <div class="k-map"><svg viewBox="0 0 100 98" role="group" aria-label="Map of ${esc(V().name)}">
        <rect x="1" y="1" width="98" height="96" rx="3" fill="none" stroke="#c9ced6" stroke-width=".8"/>
        ${rooms.map((nm, i) => { const [x, y, w, h] = pos[i]; return `<g class="room${r === i ? " on" : ""}" data-act="room" data-v="${i}" tabindex="0" role="button" aria-label="${esc(nm)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#e8ecf1"/><text x="${x + w / 2}" y="${y + h / 2 + 1.4}" text-anchor="middle" font-size="4" fill="#33415a" font-family="Instrument Sans,Arial">${esc(nm)}</text></g>`; }).join("")}
        ${path}
        <circle cx="50" cy="84" r="3.2" fill="#e14b3b"/><text x="50" y="94.5" text-anchor="middle" font-size="3.4" fill="#e14b3b" font-weight="600" font-family="Instrument Sans,Arial">You are here</text>
      </svg></div>
      <div class="k-route">${r == null ? "Tap a place to see the way." : `<b>${esc(rooms[r])}</b>About ${walk[r]} min on foot. Follow the dotted line.`}</div>`;
  }

  /* ---------- idle ---------- */
  function resetIdle() {
    clearTimeout(S.idleT);
    const bar = document.getElementById("ktimer");
    if (bar) { bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth; bar.style.transition = `transform ${IDLE_MS}ms linear`; bar.style.transform = "scaleX(0)"; }
    S.idleT = setTimeout(() => { if (S.mode === "session") endSession("Session ended after 45 seconds idle"); }, IDLE_MS);
  }
  function endSession(msg) {
    S.mode = "attract"; S.stack = []; S.room = null;
    const bar = document.getElementById("ktimer"); if (bar) { bar.style.transition = "none"; bar.style.transform = "scaleX(0)"; }
    log(msg, "session"); render();
  }
  function startSession() {
    S.mode = "session"; S.stack = [{ view: "home" }];
    stat("sessions"); log("Session started"); render("enter");
  }

  function go(entry) { S.stack.push(entry); render("enter"); const v = document.getElementById("kview"); if (v) v.scrollTop = 0; }
  function label(e) { if (e.view === "item") return I[e.id].n; if (e.view === "cat") return CATS[e.id].label; return (SPECIAL[e.view] || {}).label || e.view; }
  function toast(msg) {
    const k = screen.querySelector(".k"); if (!k) return;
    const t = document.createElement("div"); t.className = "k-toast"; t.setAttribute("role", "status"); t.textContent = msg;
    k.appendChild(t); setTimeout(() => t.remove(), 2700);
  }

  screen.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    const act = b.dataset.act, id = b.dataset.id, val = b.dataset.v;
    if (act === "dot") { showSlide(+b.dataset.i); if (S.mode === "session") resetIdle(); return; }
    if (S.mode === "attract" && act !== "start" && act !== "adopen" && act !== "sponsor") return;
    if (S.mode === "attract" && (act === "adopen" || act === "sponsor")) startSession();
    else if (S.mode === "session") resetIdle();
    switch (act) {
      case "start": startSession(); break;
      case "home": S.stack = [{ view: "home" }]; render("back"); break;
      case "back": S.stack.pop(); render("back"); break;
      case "large": S.large = !S.large; log(S.large ? "Turned on larger text" : "Turned off larger text"); render(); break;
      case "open": { const entry = CATS[id] ? { view: "cat", id } : { view: id }; log(`Opened ${label(entry)}`); go(entry); break; }
      case "item": { const it = I[id]; log(`Viewed ${it.n}`, it.sp ? "sponsor" : null); go({ view: "item", id }); break; }
      case "sponsor": log(`Tapped ad: ${I[id].n}`, "sponsor"); go({ view: "item", id }); break;
      case "take": log("Showed the concierge QR code", "scan"); go({ view: "take" }); break;
      case "adopen": log("Tapped the ad space packages", "open"); go({ view: "adspace" }); break;
      case "send":
        if (S.sent[id]) break;
        S.sent[id] = true; stat("scans");
        log(id === "svc" ? "Asked for a text when the car is ready" : `Took ${I[id].n} to phone`, "scan");
        render(); toast(id === "svc" ? "We'll text you when it's ready." : "Link sent. It's on your phone now."); break;
      case "room": S.room = +val; log(`Looked up directions to ${V().rooms[S.room]}`); render(); break;
    }
  });
  screen.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("g[data-act]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
    if (e.target.closest(".k-ads") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) { showSlide(S.slide + (e.key === "ArrowRight" ? 1 : -1)); const a = screen.querySelectorAll(".ad")[S.slide]; if (a) a.focus(); }
  });

  setInterval(() => {
    if (S.venue === "auto" && S.svc.step < 5) {
      S.svc.step++;
      const top = S.stack[S.stack.length - 1];
      if (S.mode === "session" && top && top.view === "service") { const v = document.getElementById("kview"), sc = v.scrollTop; render(); v.scrollTop = sc; }
    }
  }, 9000);

  document.querySelectorAll(".venue-switch [data-venue]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (S.venue === btn.dataset.venue) return;
      document.querySelectorAll(".venue-switch [data-venue]").forEach(b => b.setAttribute("aria-checked", String(b === btn)));
      S.venue = btn.dataset.venue; S.stack = []; S.mode = "attract"; S.room = null; S.svc.step = 2;
      S.sent = {};
      clearTimeout(S.idleT);
      log(`Switched to ${V().name}`); buildFrame();
    });
  });
  const vs = document.querySelector(".venue-switch");
  if (vs) vs.addEventListener("keydown", e => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const bs = [...vs.querySelectorAll("button")], i = bs.indexOf(document.activeElement); if (i < 0) return;
    const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
  });
  const reset = $("#reset-demo");
  if (reset) reset.addEventListener("click", () => {
    S.stats = { sessions: 0, views: 0, impr: 0, scans: 0 };
    ["sessions", "views", "impr", "scans"].forEach(k => { const el = $("#st-" + k); if (el) el.textContent = "0"; });
    if (feed) feed.innerHTML = '<li class="feed-empty">Tap the kiosk screen to start a session.</li>';
    S.mode = "attract"; S.stack = []; S.sent = {};
    clearTimeout(S.idleT); buildFrame();
  });

  if ("IntersectionObserver" in window) new IntersectionObserver(es => { S.visible = es[0].isIntersecting; }, { threshold: .2 }).observe(screen);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  setInterval(() => {
    if (reduce || !S.visible || S.paused || document.hidden) return;
    if (screen.contains(document.activeElement) && document.activeElement.closest(".k-ads")) return;
    showSlide(S.slide + 1);
  }, SLIDE_MS);
  setInterval(() => { const c = document.getElementById("kclock"); if (c) c.innerHTML = `${clock()} &nbsp; ☀ 84°`; }, 20000);

  buildFrame();
})();
