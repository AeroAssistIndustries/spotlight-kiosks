/* Test the kiosk: live demo (the real kiosk app in demo mode) + five sizes drawn to scale. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- live kiosk ---------------- */
  var screen = $("#tk-screen"), device = $("#tk-device");
  if (screen && device) {
    // Static site (GitHub Pages / local): same-origin copy. WordPress: the hosted copy.
    var host = location.hostname;
    var useLocal = /github\.io$|^127\.|^localhost$/.test(host) || location.protocol === "file:";
    var src = useLocal ? screen.dataset.local : screen.dataset.remote;
    var full = $("#tk-full"); if (full) full.href = src;
    var frame = null;

    var fit = function () {
      if (!frame) return;
      var w = screen.clientWidth;
      frame.style.transform = "scale(" + (w / 1080) + ")";
    };
    var start = function () {
      if (frame) return;
      frame = document.createElement("iframe");
      frame.title = "CityPulse kiosk, live demo";
      frame.src = src;
      frame.setAttribute("allow", "fullscreen");
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      frame.className = "tk-frame";
      frame.addEventListener("load", function () { screen.classList.add("live"); });
      screen.insertBefore(frame, screen.firstChild);
      screen.classList.add("loading");
      fit();
    };
    $("#tk-start").addEventListener("click", start);
    $("#tk-restart").addEventListener("click", function () {
      if (!frame) { start(); return; }
      screen.classList.remove("live"); frame.src = src;
    });
    if (window.ResizeObserver) new ResizeObserver(fit).observe(screen); else window.addEventListener("resize", fit);

    // Desktop with a mouse: load right away. Phones and tablets: tap to start, so the
    // kiosk never traps the page scroll before the visitor means to use it.
    if (window.matchMedia("(pointer: fine) and (min-width: 981px)").matches) {
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); io.disconnect(); } });
        io.observe(screen);
      } else start();
    }

    var ads = $("#tk-adspace");
    ads.addEventListener("change", function () { screen.classList.toggle("show-ad", ads.checked); });

    $$(".tk-finish button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".tk-finish button").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
        device.dataset.finish = b.dataset.finish;
        $$(".tk-k").forEach(function (k) { k.dataset.finish = b.dataset.finish; });
      });
    });
  }

  /* ---------------- sizes, to scale ---------------- */
  var lineup = $("#tk-lineup"), room = $("#tk-room"), pick = $("#tk-sizepick"), spec = $("#tk-spec");
  if (!lineup) return;
  var R = 18.3576; // sqrt(16² + 9²)
  var SIZES = [
    { id: "c21", d: 21.5, name: "Countertop", kind: "counter", tall: 61,
      best: "Front desks, check-in counters and side tables in waiting rooms.",
      where: "Sits on a counter or desk on a compact stand.", overall: "About 2 ft tall on its stand" },
    { id: "w27", d: 27, name: "Wall mount", kind: "wall", tall: 70,
      best: "Elevator landings, hallways and lobbies short on floor space.",
      where: "Mounted flat to the wall at eye level, about 3 in deep.", overall: "About 2 ft 1 in × 1 ft 2 in" },
    { id: "f32", d: 32, name: "Floor stand", kind: "stand", tall: 64,
      best: "Hotel lobbies, medical offices and service lounges.",
      where: "Free-standing on a weighted base. Needs one outlet.", overall: "About 5 ft 4 in tall" },
    { id: "t43", d: 43, name: "Totem", kind: "totem", tall: 76,
      best: "Busy lobbies, showrooms and dealership floors.",
      where: "Free-standing enclosure, cables hidden inside.", overall: "About 6 ft 4 in tall" },
    { id: "x55", d: 55, name: "Tower", kind: "tower", tall: 86,
      best: "Large lobbies, resorts and main entrances. The big one.",
      where: "Free-standing tower you can spot from across the room.", overall: "About 7 ft 2 in tall" }
  ];
  SIZES.forEach(function (s) { s.w = s.d * 9 / R; s.h = s.d * 16 / R; });
  var PERSON = 69; // 5'9"
  var sel = "f32";
  var ft = function (inches) { var f = Math.floor(inches / 12), i = Math.round(inches - f * 12); if (i === 12) { f++; i = 0; } return f + "′" + (i ? " " + i + "″" : ""); };
  var r1 = function (n) { return (Math.round(n * 10) / 10).toString(); };

  // Each piece is laid out in inches; --u (px per inch) is set from the room width.
  var px = function (n) { return "calc(var(--u) * " + n.toFixed(2) + ")"; };
  var box = function (cls, x, y, w, h, extra) {
    return '<i class="' + cls + '" style="left:' + px(x) + ";bottom:" + px(y) + ";width:" + px(w) + ";height:" + px(h) + (extra || "") + '"></i>';
  };
  var scr = function (x, y, w, h) {
    return '<b class="tk-scr" style="left:' + px(x) + ";bottom:" + px(y) + ";width:" + px(w) + ";height:" + px(h) + '"><em></em></b>';
  };

  function kiosk(s) {
    var bz = s.d < 30 ? 0.7 : 0.9, W, html = "", hw = s.w + bz * 2, hh = s.h + bz * 2, top;
    if (s.kind === "counter") {
      W = 40;
      html += box("tk-counter", 0, 0, W, 36);
      var cx = (W - hw) / 2, by = 36 + 4.2;
      html += box("tk-cbase", W / 2 - 4.5, 36, 9, 0.9) + box("tk-cneck", W / 2 - 1.4, 36.9, 2.8, 3.6);
      html += box("tk-bezel", cx, by, hw, hh) + scr(cx + bz, by + bz, s.w, s.h);
      top = by + hh;
    } else if (s.kind === "wall") {
      W = 28;
      var wy = 57 - hh / 2, wx = (W - hw) / 2;
      html += box("tk-wallplate", wx - 1.5, wy - 1.5, hw + 3, hh + 3);
      html += box("tk-bezel", wx, wy, hw, hh) + scr(wx + bz, wy + bz, s.w, s.h);
      top = wy + hh;
    } else if (s.kind === "stand") {
      W = 22;
      var sy = 64 - hh, sx = (W - hw) / 2;
      html += box("tk-base", W / 2 - 9, 0, 18, 1.2) + box("tk-pole", W / 2 - 2.4, 1.2, 4.8, sy - 1.2);
      html += box("tk-bezel", sx, sy, hw, hh) + scr(sx + bz, sy + bz, s.w, s.h);
      top = 64;
    } else {
      var ew = s.w + (s.kind === "tower" ? 3.6 : 3.2), eh = s.tall - 2;
      W = ew + 2;
      html += box("tk-plinth", 0, 0, W, 2);
      html += box("tk-encl", 1, 2, ew, eh);
      var ty = 2 + eh - 2.4 - s.h;
      html += scr(1 + (ew - s.w) / 2, ty, s.w, s.h);
      html += box("tk-badge", 1 + ew / 2 - 3, 2 + (ty - 2) * 0.55, 6, 1.1);
      html += box("tk-grille", 1 + ew * 0.2, 2 + (ty - 2) * 0.22, ew * 0.6, Math.min(5, (ty - 2) * 0.18));
      top = s.tall;
    }
    return { html: html, W: W, top: top };
  }

  var PROPS = {
    hotel: [["tk-lamp", 0, 0, 14, 62], ["tk-plant", 0, 0, 18, 44]],
    medical: [["tk-chair", 0, 0, 22, 34], ["tk-chair", 0, 0, 22, 34]],
    auto: [["tk-plant", 0, 0, 18, 44], ["tk-plant", 0, 0, 18, 44]]
  };

  function draw() {
    var scene = room.dataset.scene, narrow = room.clientWidth < 720;
    var gap = narrow ? 8 : 9, x = 6, items = [], H = 104;
    var show = narrow ? SIZES.filter(function (s) { return s.id === sel; }) : SIZES;
    // person first
    items.push('<i class="tk-person" style="left:' + px(x) + ";bottom:0;width:" + px(22) + ";height:" + px(PERSON) + '"><svg viewBox="0 0 22 69" preserveAspectRatio="none"><path d="M11 0a4.6 4.6 0 1 1 0 9.2A4.6 4.6 0 0 1 11 0Zm-4.4 10.6h8.8a3.6 3.6 0 0 1 3.6 3.6V33a1.6 1.6 0 0 1-3.2 0V18.5h-.9V67a2 2 0 0 1-4 0V40h-.8v27a2 2 0 0 1-4 0V18.5h-.9V33a1.6 1.6 0 0 1-3.2 0V14.2a3.6 3.6 0 0 1 3.6-3.6Z"/></svg></i>');
    items.push('<span class="tk-plabel" style="left:' + px(x) + ";bottom:" + px(PERSON + 2) + ";width:" + px(22) + '">5′9″</span>');
    x += 22 + gap;
    show.forEach(function (s) {
      var k = kiosk(s), on = s.id === sel;
      items.push('<div class="tk-k' + (on ? " on" : "") + '" data-id="' + s.id + '" data-finish="' + (device ? device.dataset.finish : "black") + '" style="left:' + px(x) + ";width:" + px(k.W) + ";height:" + px(k.top) + '">' + k.html +
        '<span class="tk-klabel" style="bottom:' + px(k.top + 2) + '"><b>' + s.d + '″</b>' + s.name + "</span>" +
        (on ? '<span class="tk-dim" style="height:' + px(k.top) + '"><em>' + ft(k.top) + "</em></span>" : "") + "</div>");
      x += k.W + gap;
    });
    var total = x - gap + 6;
    // props fill the room behind
    var props = (PROPS[scene] || []).map(function (p, i) { return { cls: p[0], w: p[3], h: p[4], i: i }; });
    var extra = narrow ? 6 : 10;
    var u = room.clientWidth / Math.max(total + extra, narrow ? 64 : 0);
    var uH = (room.clientHeight - 8) / H;
    u = Math.min(u, uH);
    room.style.setProperty("--u", u + "px");
    var offset = (room.clientWidth / u - total) / 2;
    var bg = "";
    props.forEach(function (p) {
      var left = p.i === 0 ? offset - p.w - 3 : offset + total + 3;
      if (p.cls === "tk-car") left = offset + total - p.w * 0.35;
      bg += '<i class="tk-prop ' + p.cls + '" style="left:' + px(left) + ";bottom:0;width:" + px(p.w) + ";height:" + px(p.h) + '"></i>';
    });
    lineup.style.left = px(offset);
    lineup.innerHTML = '<div class="tk-props" style="left:' + px(-offset) + '">' + bg + "</div>" + items.join("");
    // ruler
    var marks = "";
    for (var f = 0; f <= 7; f++) marks += '<span style="bottom:' + px(f * 12) + '">' + (f ? f + "′" : "0") + "</span>";
    $(".tk-ruler", room).innerHTML = marks;
    $$(".tk-k", lineup).forEach(function (k) { k.addEventListener("click", function () { choose(k.dataset.id); }); });
    renderSpec();
  }

  function renderSpec() {
    var s = SIZES.filter(function (z) { return z.id === sel; })[0];
    var adW = s.w * 0.9185, adH = s.h * 0.1208;
    spec.innerHTML =
      '<div class="tk-spec-main"><p class="tk-spec-k">' + s.d + '-inch</p><h3>' + s.name + "</h3><p>" + s.best + "</p></div>" +
      '<dl class="tk-spec-grid">' +
      "<div><dt>Screen</dt><dd>" + s.d + "″ portrait touch · " + r1(s.w) + "″ × " + r1(s.h) + "″</dd></div>" +
      "<div><dt>Overall</dt><dd>" + s.overall + "</dd></div>" +
      "<div><dt>Where it goes</dt><dd>" + s.where + "</dd></div>" +
      '<div class="tk-adsize"><dt>Your ad at this size</dt><dd><b>' + r1(adW) + "″ × " + r1(adH) + "″</b> on every screen</dd></div>" +
      "</dl>";
    $$("button", pick).forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.id === sel)); });
  }

  function choose(id) { sel = id; draw(); }

  pick.innerHTML = SIZES.map(function (s) {
    return '<button type="button" role="radio" aria-checked="' + (s.id === sel) + '" data-id="' + s.id + '"><b>' + s.d + '″</b><span>' + s.name + "</span></button>";
  }).join("");
  $$("button", pick).forEach(function (b) { b.addEventListener("click", function () { choose(b.dataset.id); }); });
  $$(".tk-scene button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".tk-scene button").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
      room.dataset.scene = b.dataset.scene; draw();
    });
  });
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 80); });
  draw();
})();
