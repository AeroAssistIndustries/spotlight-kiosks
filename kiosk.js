/* Spotlight Kiosks — interactive kiosk demo.
   Everything here is fictional demo content. No data leaves the page. */
(function () {
  "use strict";

  /* ---------- icons ---------- */
  const P = {
    fork: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 3c-2 1-3 4-3 7h3v11"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    flag: '<path d="M6 21V3l10 4-10 4"/><ellipse cx="12" cy="20.5" rx="7" ry="1.5"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9" r="2.4"/><path d="M15.5 14c2.6 0 4.4 1.6 5 4.5"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    spark: '<path d="M12 3c1 4 3 6 7 7-4 1-6 3-7 7-1-4-3-6-7-7 4-1 6-3 7-7z"/>',
    car: '<path d="M4 16v-4l2-5h12l2 5v4H4z"/><circle cx="8" cy="16.5" r="1.8"/><circle cx="16" cy="16.5" r="1.8"/><path d="M4 12h16"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
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
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  const svg = (k, cls) => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${P[k] || ""}</svg>`;

  /* ---------- content ---------- */
  const G = {
    dining: "linear-gradient(135deg,#7a3b1f,#c9773a)", course: "linear-gradient(135deg,#1f5a32,#8fbf5a)",
    teetimes: "linear-gradient(135deg,#2f6b34,#b7d36a)", events: "linear-gradient(135deg,#2a2f5c,#8a64b0)",
    membership: "linear-gradient(135deg,#3b4a3f,#9aa77a)", proshop: "linear-gradient(135deg,#22384f,#4f7fa8)",
    local: "linear-gradient(120deg,#2b5876 10%,#c2702f 70%,#f2c46d)", amenities: "linear-gradient(135deg,#1f6f78,#7cc4c0)",
    getting: "linear-gradient(135deg,#34495e,#7f9bb5)", map: "linear-gradient(135deg,#4a5568,#9aa8bb)",
    checkin: "linear-gradient(135deg,#1b6ca8,#62b6cb)", pharmacy: "linear-gradient(135deg,#227a5c,#8ccfa6)",
    coffee: "linear-gradient(135deg,#4e3122,#b07a4f)", parking: "linear-gradient(135deg,#3d4a5c,#7d8ea3)",
    wellness: "linear-gradient(135deg,#6e4772,#d29ab0)", service: "linear-gradient(135deg,#2d3436,#e17055)",
    todo: "linear-gradient(135deg,#5a2c82,#e2a65b)", accessories: "linear-gradient(135deg,#24343f,#5f7a8a)",
    offers: "linear-gradient(135deg,#a2740a,#e8b923)"
  };

  const I = {}; // item index by id
  function cat(id, label, icon, intro, items) { items.forEach(it => { it.cat = id; I[it.id] = it; }); return { id, label, icon, intro, items, g: G[id] }; }

  const CATS = {};
  [
    cat("dining", "Dining", "fork", "Good places to eat, a short walk or drive away.", [
      { id: "willow", n: "Willow Kitchen", k: "Seasonal American", m: "6 min walk", sp: 1, d: "A relaxed dining room with a wood-fired oven and a menu that changes with the season. Walk-ins welcome before 6 pm.", f: [["Open today", "5–10 pm"], ["Price", "$$"]], o: "Dessert on us for tables of two or more. Show this screen to your server." },
      { id: "cornercup", n: "Corner Cup & Co.", k: "Coffee & bakery", m: "3 min walk", sp: 1, d: "Espresso, cold brew and pastries baked in-house every morning. Plenty of seats and fast Wi-Fi.", f: [["Open today", "6 am–4 pm"], ["Price", "$"]], o: "Free pastry with any large drink before 11 am." },
      { id: "salt", n: "Salt & Ember", k: "Wood-fired grill", m: "0.8 mi", d: "Steaks, grilled vegetables and a long patio with fire pits. Reservations recommended on weekends.", f: [["Open today", "4–11 pm"], ["Price", "$$$"]] },
      { id: "mesa", n: "Mesa Verde Taqueria", k: "Street tacos", m: "1.1 mi", d: "Handmade tortillas, a salsa bar and quick counter service. A local favorite for lunch.", f: [["Open today", "10 am–9 pm"], ["Price", "$"]] }
    ]),
    cat("local", "Discover local", "pin", "Places people around here love.", [
      { id: "gallery", n: "Copper Lane Gallery", k: "Local art", m: "0.4 mi", d: "Rotating exhibits from Arizona artists, with a free first-Friday opening each month.", f: [["Open today", "10 am–6 pm"], ["Entry", "Free"]] },
      { id: "bloom", n: "Desert Bloom Spa", k: "Massage & facials", m: "0.6 mi", sp: 1, d: "Day spa with massage, facials and a quiet courtyard. Same-day appointments most weekdays.", f: [["Open today", "9 am–8 pm"], ["Price", "$$"]], o: "15% off weekday massages when you book from this kiosk." },
      { id: "trail", n: "Agave Ridge Trail", k: "Easy 2-mile loop", m: "10 min drive", d: "A gentle desert loop with saguaros and wide valley views. Best at sunrise or just before sunset.", f: [["Difficulty", "Easy"], ["Bring", "Water"]] },
      { id: "rooftop", n: "Lantern Rooftop", k: "Cocktails & views", m: "0.9 mi", d: "Small plates and cocktails on a rooftop with mountain views. Live acoustic sets on weekends.", f: [["Open today", "4 pm–12 am"], ["Price", "$$"]] }
    ]),
    cat("todo", "Things to do", "spark", "Ways to spend an hour or an afternoon.", [
      { id: "market", n: "Third Friday Night Market", k: "Food & makers", m: "Fri 6–10 pm", d: "Food trucks, local makers and live music in the plaza every third Friday.", f: [["Entry", "Free"], ["Distance", "1.2 mi"]] },
      { id: "gallery2", n: "Copper Lane Gallery", k: "Local art", m: "0.4 mi", d: "Rotating exhibits from Arizona artists, with a free first-Friday opening each month.", f: [["Open today", "10 am–6 pm"], ["Entry", "Free"]] },
      { id: "trail2", n: "Agave Ridge Trail", k: "Easy 2-mile loop", m: "10 min drive", d: "A gentle desert loop with saguaros and wide valley views.", f: [["Difficulty", "Easy"], ["Bring", "Water"]] },
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
    cat("course", "Course guide", "flag", "Today on the course.", [
      { id: "front", n: "Front nine", k: "Par 36 · 3,412 yd", m: "Pace 2 hr 05", d: "Opens with a generous par 4. Watch the water left on 7.", f: [["Greens", "Fast"], ["Carts", "Path only on 4"]] },
      { id: "backnine", n: "Back nine", k: "Par 36 · 3,488 yd", m: "Pace 2 hr 10", d: "The signature 16th plays over the arroyo. Take one more club than you think.", f: [["Greens", "Fast"], ["Carts", "Anywhere"]] },
      { id: "range", n: "Practice range", k: "Grass tees open", m: "6 am–6 pm", d: "Grass tees today. Short-game area and putting green next to the range.", f: [["Balls", "$12 bucket"], ["Targets", "6"]] },
      { id: "cond", n: "Today's conditions", k: "Sunny, 84°", m: "Wind 6 mph SW", d: "Greens rolling quickly. Hole locations are in the middle of the green on most holes.", f: [["Stimp", "11"], ["Frost delay", "None"]] }
    ]),
    cat("membership", "Membership", "people", "Join the club or book a tour.", [
      { id: "social", n: "Social membership", k: "Dining, pool & events", m: "Monthly", d: "Full access to dining, the pool and member events. Golf available at member guest rates.", f: [["Initiation", "Ask us"], ["Tour", "Weekdays"]] },
      { id: "golfmem", n: "Golf membership", k: "Unlimited play", m: "Monthly", d: "Unlimited golf, priority tee times and access to the practice facility.", f: [["Initiation", "Ask us"], ["Tour", "Weekdays"]] },
      { id: "junior", n: "Junior program", k: "Ages 8–17", m: "Spring & fall", d: "Weekly clinics and on-course play with our teaching staff.", f: [["Sessions", "8 weeks"], ["Ages", "8–17"]] }
    ]),
    cat("proshop", "Pro shop", "bag", "On the lower level, next to the starter.", [
      { id: "fit", n: "Club fitting", k: "45 minutes", m: "$75", d: "Launch-monitor fitting with a PGA professional. Fee credited toward a purchase.", f: [["Book", "Pro shop"], ["Length", "45 min"]] },
      { id: "lesson", n: "Lesson with a pro", k: "30 minutes", m: "$65", d: "Private lesson on the range or short-game area.", f: [["Book", "Pro shop"], ["Length", "30 min"]] },
      { id: "polo", n: "Club logo polo", k: "Men's & women's", m: "$68", d: "Performance fabric with the club crest. Several colors in stock.", f: [["Sizes", "XS–XXL"], ["Colors", "5"]] },
      { id: "range2", n: "Rangefinder rental", k: "Per round", m: "$10", d: "Laser rangefinders available at the starter's window.", f: [["Pickup", "Starter"], ["Return", "After round"]] }
    ]),
    cat("checkin", "Check-in help", "clip", "Make your visit a little faster.", [
      { id: "phonecheck", n: "Check in from your phone", k: "Skip the line", m: "2 minutes", d: "Scan the code to confirm your details and insurance before you're called.", f: [["Needs", "Photo ID"], ["Time", "2 min"]] },
      { id: "forms", n: "Forms & insurance", k: "New patients", m: "5 minutes", d: "New-patient forms and insurance card upload. You can finish them on your phone.", f: [["Needs", "Insurance card"], ["Time", "5 min"]] },
      { id: "wait", n: "Current wait", k: "About 12 minutes", m: "Updated now", d: "Average time from check-in to exam room right now. We'll text you when it's your turn.", f: [["Wait", "~12 min"], ["Text alerts", "Available"]] }
    ]),
    cat("pharmacy", "Pharmacy nearby", "pill", "Pick up a prescription on the way home.", [
      { id: "northside", n: "Northside Pharmacy", k: "Same building, level 1", m: "1 min walk", d: "Prescriptions sent from this office are usually ready in 20 minutes.", f: [["Open today", "8 am–9 pm"], ["Drive-thru", "No"]] },
      { id: "corner24", n: "Corner 24 Pharmacy", k: "Open 24 hours", m: "0.7 mi", d: "Drive-thru pharmacy open around the clock.", f: [["Open", "24 hours"], ["Drive-thru", "Yes"]] }
    ]),
    cat("coffee", "Coffee & food", "coffee", "Something good while you wait.", [
      { id: "cornercup2", ref: "cornercup" },
      { id: "juice", n: "Green Leaf Juice Bar", k: "Smoothies & bowls", m: "2 min walk", d: "Cold-pressed juices, smoothies and acai bowls.", f: [["Open today", "7 am–5 pm"], ["Price", "$"]] },
      { id: "mesa2", ref: "mesa" }
    ]),
    cat("parking", "Parking & directions", "map", "Getting in and out easily.", [
      { id: "patpark", n: "Patient parking", k: "Lot B, east side", m: "Free 2 hours", d: "Free for two hours with validation at the front desk.", f: [["Cost", "Free"], ["Validate", "Front desk"]] },
      { id: "access", n: "Accessible entrance", k: "East doors", m: "Ramp & auto doors", d: "Step-free entrance with automatic doors next to accessible parking spaces.", f: [["Spaces", "8"], ["Doors", "Automatic"]] },
      { id: "ride2", ref: "ride" }
    ]),
    cat("wellness", "Wellness", "heart", "Feel-better places close by.", [
      { id: "bloom2", ref: "bloom" },
      { id: "stride", n: "Stride Physical Therapy", k: "Sports & recovery", m: "Level 3", d: "Physical therapy in this building. Most plans accepted.", f: [["Open today", "7 am–6 pm"], ["Referral", "Not required"]] },
      { id: "sunrise", n: "Sunrise Yoga Studio", k: "All levels", m: "0.5 mi", d: "Drop-in classes every morning and evening. First class free.", f: [["Next class", "5:30 pm"], ["First class", "Free"]] }
    ]),
    cat("accessories", "Accessories", "tag", "Add-ons we can install while you wait.", [
      { id: "mats", n: "All-weather floor mats", k: "Custom fit", m: "$129", d: "Laser-measured mats for your exact model. Installed in minutes.", f: [["Install", "Free"], ["Fit", "Custom"]] },
      { id: "shade", n: "Windshield sunshade", k: "Folds flat", m: "$39", d: "Reflective shade cut for your windshield. Keeps the cabin cooler in summer.", f: [["Install", "None"], ["Fit", "Custom"]] },
      { id: "tint", n: "Window tint", k: "Ceramic film", m: "From $299", d: "Ceramic film that blocks heat and UV. Book a time with the service desk.", f: [["Time", "2–3 hrs"], ["Warranty", "Lifetime"]] }
    ]),
    cat("offers", "Local offers", "tag", "Deals from businesses nearby.", [
      { id: "willow2", ref: "willow" },
      { id: "shine", n: "Shine Express Car Wash", k: "Full-service wash", m: "0.5 mi", sp: 1, d: "Hand-dried exterior, interior vacuum and windows in about 20 minutes.", f: [["Open today", "7 am–7 pm"], ["Price", "From $15"]], o: "$5 off any full-service wash this week." },
      { id: "cornercup3", ref: "cornercup" }
    ])
  ].forEach(c => { CATS[c.id] = c; });
  // resolve item references (same business listed in more than one category)
  Object.values(CATS).forEach(c => { c.items = c.items.map(it => it.ref ? I[it.ref] : it); });

  // special screens that aren't simple lists
  const SPECIAL = {
    teetimes: { label: "Tee times", icon: "cal", g: G.teetimes },
    service: { label: "Service status", icon: "wrench", g: G.service },
    venuemap: { label: "Venue map", icon: "map", g: G.map }
  };

  const VENUES = {
    golf: {
      name: "Saguaro Hills Golf Club", short: "SAGUARO HILLS", finish: "black",
      theme: { fg: "#1d2b45", sub: "#596577", accent: "#1f4d36", bg: "linear-gradient(180deg,#dbe6ef 0%,#f5f6f4 36%,#f3f3ef 100%)" },
      ag: "linear-gradient(165deg,#24503a,#6f9a5b 58%,#e1c98d)",
      tiles: ["course", "teetimes", "dining", "events", "membership", "proshop"],
      wide: { to: "local", t: "Discover local", s: "Places our members love nearby" },
      sponsors: ["willow", "bloom", "cornercup"],
      rooms: ["Pro shop", "Locker rooms", "Grill room", "Starter", "Restrooms", "Event lawn"]
    },
    hotel: {
      name: "The Arden Hotel", short: "THE ARDEN", finish: "silver",
      theme: { fg: "#1d2b45", sub: "#5a6578", accent: "#1d2b45", bg: "linear-gradient(180deg,#dfe8f1 0%,#f6f7f8 38%,#f4f4f2 100%)" },
      ag: "linear-gradient(165deg,#1d2b45,#4a6a8a 55%,#e0a96d)",
      tiles: ["dining", "amenities", "local", "events", "getting", "venuemap"],
      wide: { to: "todo", t: "Experience more today", s: "Things to do near the hotel" },
      sponsors: ["willow", "cornercup", "bloom"],
      rooms: ["Front desk", "Elevators", "Restaurant", "Ballroom", "Restrooms", "Pool access"]
    },
    medical: {
      name: "Camelback Family Health", short: "CAMELBACK FAMILY HEALTH", finish: "silver",
      theme: { fg: "#12384a", sub: "#4f6772", accent: "#1b6ca8", bg: "linear-gradient(180deg,#d9edf3 0%,#f4f8f9 38%,#f3f6f6 100%)" },
      ag: "linear-gradient(165deg,#145a8a,#4fa3bf 60%,#cfe9ef)",
      tiles: ["checkin", "pharmacy", "coffee", "parking", "wellness", "venuemap"],
      wide: { to: "local", t: "While you wait", s: "A few good places nearby" },
      sponsors: ["cornercup", "bloom", "willow"],
      rooms: ["Check-in", "Lab", "Imaging", "Pharmacy", "Restrooms", "Exit to Lot B"]
    },
    auto: {
      name: "Valley Motors Service Lounge", short: "VALLEY MOTORS", finish: "black",
      theme: { fg: "#1f2428", sub: "#5d666d", accent: "#c4511b", bg: "linear-gradient(180deg,#e6e8ea 0%,#f6f6f5 38%,#f3f3f1 100%)" },
      ag: "linear-gradient(165deg,#1f2428,#4b5862 55%,#e17055)",
      tiles: ["service", "dining", "getting", "todo", "accessories", "offers"],
      wide: { to: "local", t: "Got an hour?", s: "Make the most of your wait" },
      sponsors: ["shine", "cornercup", "willow"],
      rooms: ["Service desk", "Lounge", "Parts", "Showroom", "Restrooms", "Shuttle"]
    }
  };

  /* ---------- state ---------- */
  const $ = s => document.querySelector(s);
  const screen = $("#screen"), device = $("#device");
  if (!screen) return;
  const S = {
    venue: "golf", mode: "attract", stack: [], large: false,
    stats: { sessions: 0, views: 0, impr: 0, scans: 0 },
    adIdx: 0, idleT: null, idleStart: 0, adT: null, visible: true,
    tee: { day: 0, players: 2, slot: null, held: false },
    svc: { step: 2 }, room: null, sent: {}
  };
  const IDLE_MS = 45000;

  /* ---------- console ---------- */
  const feed = $("#feed");
  function stat(k, n = 1) {
    S.stats[k] += n;
    const el = $("#st-" + k);
    if (!el) return;
    el.textContent = S.stats[k].toLocaleString();
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  }
  function log(text, tag) {
    const empty = feed.querySelector(".feed-empty"); if (empty) empty.remove();
    const li = document.createElement("li"); li.className = "new";
    const t = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }).replace(/\s?[AP]M/i, "");
    const tags = { sponsor: "Sponsor", scan: "To phone", session: "Session" };
    li.innerHTML = `<time>${t}</time><span>${text}${tag ? ` <span class="tag tag-${tag}">${tags[tag]}</span>` : ""}</span>`;
    feed.prepend(li);
    while (feed.children.length > 30) feed.lastChild.remove();
  }

  /* ---------- helpers ---------- */
  const V = () => VENUES[S.venue];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const catOf = id => CATS[id] || SPECIAL[id];
  function clock() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  function qr(seed) {
    // decorative QR-style pattern (demo only)
    let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const N = 21; let r = "";
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#111"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#111"/>`;
    const inF = (x, y) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inF(x, y) && rnd() > .52) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    return `<svg viewBox="0 0 21 21" role="img" aria-label="QR code to open this on your phone" shape-rendering="crispEdges"><g fill="#111">${r}</g>${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}</svg>`;
  }
  const initial = n => n.replace(/^The /, "").charAt(0);

  /* ---------- render ---------- */
  function applyTheme(root) {
    const t = V().theme;
    root.style.setProperty("--k-fg", t.fg); root.style.setProperty("--k-sub", t.sub);
    root.style.setProperty("--k-accent", t.accent); root.style.setProperty("--k-bg", t.bg);
  }

  function render(dir) {
    const v = V();
    device.dataset.finish = v.finish;
    if (S.mode === "attract") return renderAttract();
    const top = S.stack[S.stack.length - 1] || { view: "home" };
    let body = "";
    if (top.view === "home") body = viewHome();
    else if (top.view === "cat") body = viewCat(top.id);
    else if (top.view === "item") body = viewItem(top.id);
    else if (top.view === "teetimes") body = viewTee();
    else if (top.view === "service") body = viewService();
    else if (top.view === "venuemap") body = viewMap();

    const sp = I[v.sponsors[S.adIdx % v.sponsors.length]];
    screen.innerHTML = `
      <div class="k${S.large ? " large" : ""}">
        <div class="k-status"><b>${esc(v.short)}</b><span>${clock()} &nbsp; ☀ 84°</span></div>
        <div class="k-view ${dir || ""}" id="kview">${body}</div>
        <button class="k-sponsor" data-act="sponsor" data-id="${sp.id}" aria-label="Sponsored: ${esc(sp.n)}. ${esc(sp.o || "")}">
          <span class="dot" style="--sg:${CATS[sp.cat].g}">${initial(sp.n)}</span>
          <span class="txt"><b>${esc(sp.n)}</b><small>${esc(sp.o || sp.k)}</small></span>
          <span class="lbl">Sponsored</span>
        </button>
        <div class="k-timer" aria-hidden="true"><i id="ktimer"></i></div>
        <nav class="k-nav" aria-label="Kiosk navigation">
          <button data-act="home" ${top.view === "home" ? "disabled" : ""}>${svg("home")}Home</button>
          <button data-act="back" ${S.stack.length <= 1 ? "disabled" : ""}>${svg("back")}Back</button>
          <button data-act="large" aria-pressed="${S.large}">${svg("text")}${S.large ? "Smaller text" : "Larger text"}</button>
        </nav>
      </div>`;
    applyTheme(screen.firstElementChild);
    stat("views");
    resetIdle();
  }

  function renderAttract() {
    const v = V();
    const sp = I[v.sponsors[S.adIdx % v.sponsors.length]];
    screen.innerHTML = `
      <button class="k k-attract" data-act="start" style="--ag:${v.ag}" aria-label="Touch to begin using the ${esc(v.name)} kiosk">
        <span class="a-top">${esc(v.short)}</span>
        <span class="a-mid"><span class="a-welcome">Welcome</span><span class="a-venue">to ${esc(v.name)}</span></span>
        <span class="a-ad"><small>Sponsored · nearby</small><b>${esc(sp.n)}</b><span>${esc(sp.o || sp.k)}</span></span>
        <span class="a-touch"><span class="ring"></span>Touch anywhere to begin</span>
      </button>`;
  }

  function tile(id) {
    const c = catOf(id);
    return `<button class="k-tile" style="--g:${c.g}" data-act="open" data-id="${id}">${svg(c.icon)}<span>${esc(c.label)}</span></button>`;
  }
  function viewHome() {
    const v = V();
    const w = v.wide;
    return `
      <h2 class="k-welcome">Welcome</h2>
      <p class="k-venue">to ${esc(v.name)}</p>
      <div class="k-tiles">
        ${v.tiles.map(tile).join("")}
        <button class="k-tile wide" style="--g:${G.local}" data-act="open" data-id="${w.to}"><span>${esc(w.t)}</span><small>${esc(w.s)}</small></button>
      </div>`;
  }
  function head(c) {
    return `<div class="k-head"><span class="ico" style="--g:${c.g}">${svg(c.icon)}</span><h2>${esc(c.label)}</h2></div>`;
  }
  function viewCat(id) {
    const c = CATS[id];
    // sponsored items float to the top, the way a placement would
    const items = [...c.items].sort((a, b) => (b.sp || 0) - (a.sp || 0));
    return `${head(c)}<p class="k-intro">${esc(c.intro)}</p>
      <div class="k-list">${items.map(it => `
        <button class="k-item" data-act="item" data-id="${it.id}">
          <span class="thumb" style="--g:${CATS[it.cat].g}">${initial(it.n)}</span>
          <span class="body"><b>${esc(it.n)}</b><small>${esc(it.k)} · ${esc(it.m)}</small>${it.sp ? '<span class="k-chip">Sponsored</span>' : ""}</span>
          ${svg("chev", "chev")}
        </button>`).join("")}
      </div>`;
  }
  function viewItem(id) {
    const it = I[id];
    const sent = S.sent[id];
    return `<div class="k-detail">
      <div class="k-detail-hero" style="--g:${CATS[it.cat].g}"><div><h2>${esc(it.n)}</h2><p>${esc(it.k)} · ${esc(it.m)}</p></div></div>
      <p class="k-blurb">${esc(it.d)}</p>
      <div class="k-facts">${it.f.map(([a, b]) => `<div><small>${esc(a)}</small><b>${esc(b)}</b></div>`).join("")}</div>
      ${it.o ? `<div class="k-offer"><b>Kiosk offer</b>${esc(it.o)}</div>` : ""}
      <div class="k-take">
        <div class="k-qr">${qr(it.id)}</div>
        <div><b>Take it with you</b>
          <button class="k-btn${sent ? " done" : ""}" data-act="send" data-id="${it.id}">${svg(sent ? "check" : "phone")}${sent ? "Sent to phone" : "Scan or send to phone"}</button>
        </div>
      </div>
    </div>`;
  }
  function viewTee() {
    const t = S.tee, c = SPECIAL.teetimes;
    const days = ["Today", "Tomorrow", "Sat"];
    const base = [["7:20", 0], ["7:40", 1], ["8:10", 0], ["8:50", 0], ["9:30", 1], ["10:10", 0], ["11:00", 0], ["12:40", 0], ["1:20", 0]];
    const slots = base.map(([tm, full], i) => ({ tm, full: (full + t.day + i) % 4 === 1 || (t.players > 3 && i % 3 === 0) }));
    const sel = slots[t.slot];
    return `${head(c)}
      <p class="k-label">Day</p>
      <div class="k-chips">${days.map((d, i) => `<button data-act="tee-day" data-v="${i}" aria-pressed="${t.day === i}">${d}</button>`).join("")}</div>
      <p class="k-label">Players</p>
      <div class="k-chips">${[1, 2, 3, 4].map(n => `<button data-act="tee-pl" data-v="${n}" aria-pressed="${t.players === n}">${n}</button>`).join("")}</div>
      <p class="k-label">Available times</p>
      <div class="k-slots">${slots.map((s, i) => `<button data-act="tee-slot" data-v="${i}" aria-pressed="${t.slot === i}" ${s.full ? "disabled" : ""}>${s.tm}<small>${s.full ? "Full" : (i < 3 ? "am" : i < 7 ? "am" : "pm")}</small></button>`).join("")}</div>
      ${t.held && sel ? `<div class="k-confirm"><b>Held: ${days[t.day]} at ${sel.tm}</b>${t.players} player${t.players > 1 ? "s" : ""}. Confirm at the starter within 10 minutes.</div>`
        : `<button class="k-btn" data-act="tee-hold" ${t.slot == null ? 'style="opacity:.45"' : ""}>${svg("cal")}Hold this time</button>`}`;
  }
  function viewService() {
    const c = SPECIAL.service;
    const steps = ["Checked in", "Multi-point inspection", "Oil & filter change", "Tire rotation", "Wash", "Ready for pickup"];
    const s = Math.min(S.svc.step, steps.length - 1);
    const pct = Math.round((s / (steps.length - 1)) * 100);
    const mins = Math.max(0, (steps.length - 1 - s) * 12);
    return `${head(c)}
      <div class="k-progress">
        <small class="k-label">Ticket #4821 · 2024 sedan</small>
        <b style="display:block;font-size:4.6cqw">${s === steps.length - 1 ? "Your vehicle is ready" : `About ${mins} minutes left`}</b>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <ol class="k-steps">${steps.map((t, i) => `<li class="${i < s ? "done" : i === s ? "now" : ""}"><i></i>${t}</li>`).join("")}</ol>
      </div>
      <button class="k-btn${S.sent.svc ? " done" : ""}" data-act="send" data-id="svc">${svg(S.sent.svc ? "check" : "phone")}${S.sent.svc ? "We'll text you" : "Text me when it's ready"}</button>`;
  }
  function viewMap() {
    const c = SPECIAL.venuemap, rooms = V().rooms;
    const pos = [[6, 6, 40, 26], [54, 6, 40, 26], [6, 38, 40, 26], [54, 38, 40, 26], [6, 70, 26, 22], [68, 70, 26, 22]];
    const walk = [1, 2, 2, 3, 1, 2];
    const r = S.room;
    return `${head(c)}<p class="k-intro">Tap a place to see the way.</p>
      <div class="k-map"><svg viewBox="0 0 100 98" role="group" aria-label="Map of ${esc(V().name)}">
        <rect x="1" y="1" width="98" height="96" rx="3" fill="none" stroke="#c9ced6" stroke-width=".8"/>
        ${rooms.map((nm, i) => { const [x, y, w, h] = pos[i]; return `<g class="room${r === i ? " on" : ""}" data-act="room" data-v="${i}" tabindex="0" role="button" aria-label="${esc(nm)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#e8ecf1"/><text x="${x + w / 2}" y="${y + h / 2 + 1.4}" text-anchor="middle" font-size="4" fill="#33415a" font-family="Instrument Sans,Arial">${esc(nm)}</text></g>`; }).join("")}
        ${r != null ? (() => { const [x, y, w, h] = pos[r]; const d = y >= 66 ? `M50 84 H${x < 50 ? x + w : x}` : `M50 84 V67 H${x + w / 2} V${y + h}`; return `<path d="${d}" fill="none" stroke="var(--k-accent)" stroke-width="1.4" stroke-dasharray="2.4 1.6" stroke-linecap="round"/>`; })() : ""}
        <circle cx="50" cy="84" r="3.2" fill="#e14b3b"/><circle cx="50" cy="84" r="5.5" fill="none" stroke="#e14b3b" stroke-width=".6" opacity=".6"/>
        <text x="50" y="94.5" text-anchor="middle" font-size="3.4" fill="#e14b3b" font-weight="600" font-family="Instrument Sans,Arial">You are here</text>
      </svg></div>
      <div class="k-route">${r == null ? "Choose a place on the map." : `<b>${esc(rooms[r])}</b>About ${walk[r]} minute${walk[r] > 1 ? "s" : ""} on foot. Follow the dotted line from the kiosk.`}</div>`;
  }

  /* ---------- idle + sponsor rotation ---------- */
  function resetIdle() {
    clearTimeout(S.idleT);
    S.idleStart = Date.now();
    const bar = document.getElementById("ktimer");
    if (bar) {
      bar.style.transition = "none"; bar.style.transform = "scaleX(1)"; void bar.offsetWidth;
      bar.style.transition = `transform ${IDLE_MS}ms linear`; bar.style.transform = "scaleX(0)";
    }
    S.idleT = setTimeout(() => { if (S.mode === "session") { endSession("Session ended after 45 seconds idle"); } }, IDLE_MS);
  }
  function endSession(msg) {
    S.mode = "attract"; S.stack = []; S.room = null;
    log(msg, "session");
    render();
  }
  function rotateAd() {
    if (!S.visible || document.hidden) return;
    S.adIdx++;
    const v = V(), sp = I[v.sponsors[S.adIdx % v.sponsors.length]];
    stat("impr");
    if (S.mode === "attract") { renderAttract(); return; }
    const el = screen.querySelector(".k-sponsor");
    if (!el) return;
    el.dataset.id = sp.id;
    el.setAttribute("aria-label", `Sponsored: ${sp.n}. ${sp.o || ""}`);
    el.querySelector(".dot").style.setProperty("--sg", CATS[sp.cat].g);
    el.querySelector(".dot").textContent = initial(sp.n);
    el.querySelector("b").textContent = sp.n;
    el.querySelector("small").textContent = sp.o || sp.k;
    el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap");
  }

  /* ---------- navigation ---------- */
  function go(entry) {
    S.stack.push(entry);
    render("enter");
    const v = document.getElementById("kview"); if (v) v.scrollTop = 0;
  }
  function label(entry) {
    if (entry.view === "item") return I[entry.id].n;
    if (entry.view === "cat") return CATS[entry.id].label;
    return (SPECIAL[entry.view] || {}).label || entry.view;
  }

  screen.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b || b.disabled) return;
    const act = b.dataset.act, id = b.dataset.id, val = b.dataset.v;
    if (S.mode === "session") resetIdle();
    switch (act) {
      case "start":
        S.mode = "session"; S.stack = [{ view: "home" }];
        stat("sessions"); stat("impr"); log("Session started");
        render("enter"); break;
      case "home":
        S.stack = [{ view: "home" }]; log("Went home"); render("back"); break;
      case "back":
        S.stack.pop(); render("back"); break;
      case "large":
        S.large = !S.large; log(S.large ? "Turned on larger text" : "Turned off larger text");
        render(); break;
      case "open": {
        const entry = CATS[id] ? { view: "cat", id } : { view: id };
        log(`Opened ${label(entry)}`); go(entry);
        if (CATS[id]) { const n = CATS[id].items.filter(i => i.sp).length; if (n) stat("impr", n); }
        break;
      }
      case "item": {
        const it = I[id];
        log(`Viewed ${it.n}`, it.sp ? "sponsor" : null); go({ view: "item", id }); break;
      }
      case "sponsor": {
        const it = I[id];
        log(`Tapped sponsor slot: ${it.n}`, "sponsor"); go({ view: "item", id }); break;
      }
      case "send": {
        if (S.sent[id]) break;
        S.sent[id] = true; stat("scans");
        log(id === "svc" ? "Asked for a text when the car is ready" : `Took ${I[id].n} to phone`, "scan");
        render(); toast(id === "svc" ? "We'll text you when it's ready." : "Link sent. It's on your phone now."); break;
      }
      case "tee-day": S.tee.day = +val; S.tee.slot = null; S.tee.held = false; render(); break;
      case "tee-pl": S.tee.players = +val; S.tee.slot = null; S.tee.held = false; render(); break;
      case "tee-slot": S.tee.slot = +val; S.tee.held = false; render(); break;
      case "tee-hold":
        if (S.tee.slot == null) { toast("Choose a time first."); break; }
        S.tee.held = true; log("Held a tee time"); render(); break;
      case "room":
        S.room = +val; log(`Looked up directions to ${V().rooms[S.room]}`); render(); break;
    }
  });
  screen.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("g[data-act]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  });

  function toast(msg) {
    const k = screen.querySelector(".k"); if (!k) return;
    const t = document.createElement("div"); t.className = "k-toast"; t.setAttribute("role", "status"); t.textContent = msg;
    k.appendChild(t); setTimeout(() => t.remove(), 2700);
  }

  // service ticket moves along while you watch
  setInterval(() => {
    if (S.venue === "auto" && S.svc.step < 5) {
      S.svc.step++;
      const top = S.stack[S.stack.length - 1];
      if (S.mode === "session" && top && top.view === "service") { const sc = document.getElementById("kview").scrollTop; render(); document.getElementById("kview").scrollTop = sc; }
    }
  }, 9000);

  /* ---------- venue switch + reset ---------- */
  document.querySelectorAll(".venue-switch [data-venue]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (S.venue === btn.dataset.venue) return;
      document.querySelectorAll(".venue-switch [data-venue]").forEach(b => b.setAttribute("aria-checked", String(b === btn)));
      S.venue = btn.dataset.venue; S.stack = []; S.mode = "attract"; S.room = null; S.adIdx = 0; S.svc.step = 2;
      S.tee = { day: 0, players: 2, slot: null, held: false }; S.sent = {};
      log(`Switched to ${V().name}`);
      render();
    });
  });
  const vs = document.querySelector(".venue-switch");
  if (vs) vs.addEventListener("keydown", e => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const bs = [...vs.querySelectorAll("button")], i = bs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = bs[(i + (e.key === "ArrowRight" ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
  });
  const reset = $("#reset-demo");
  if (reset) reset.addEventListener("click", () => {
    S.stats = { sessions: 0, views: 0, impr: 0, scans: 0 };
    ["sessions", "views", "impr", "scans"].forEach(k => { $("#st-" + k).textContent = "0"; });
    feed.innerHTML = '<li class="feed-empty">Tap the kiosk screen to start a session.</li>';
    S.mode = "attract"; S.stack = []; S.sent = {}; S.tee = { day: 0, players: 2, slot: null, held: false };
    clearTimeout(S.idleT); render();
  });

  // only rotate ads while the demo is on screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { S.visible = es[0].isIntersecting; }, { threshold: .2 }).observe(screen);
  }
  S.adT = setInterval(rotateAd, 6000);
  setInterval(() => { const st = screen.querySelector(".k-status span"); if (st) st.innerHTML = `${clock()} &nbsp; ☀ 84°`; }, 20000);

  render();
})();
