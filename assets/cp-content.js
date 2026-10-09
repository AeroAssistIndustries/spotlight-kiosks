/* CityPulse live content. Loads before the kiosk (or phone guide) and swaps in the latest content published in the
   staff dashboard. The last copy is kept on the device, so a kiosk without internet still shows recent content.
   Also sends the kiosk's visit counts (numbers only, nothing personal) to the dashboard once a minute. */
(function () {
  "use strict";
  var V = window.CP_VENUE;
  if (!V || !V.id) return;
  var EP = ((V.ai && V.ai.endpoint) || "").replace(/\/$/, "");
  var AI = V.ai, KEY = "cp-content-" + V.id, QKEY = "cp-countq-" + V.id;
  var isKiosk = !!document.getElementById("cpk");
  var APP = "17"; /* kiosk software version, shown in the dashboard */
  var BOOT = Date.now(); /* when this page started: a "Refresh now" from the dashboard after this reloads it */
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  /* 1. Use the saved copy of the latest content, if there is one. */
  var version = 0, cached = store.get(KEY);
  if (cached && cached.data && cached.data.id === V.id && cached.data.items) {
    cached.data.ai = AI; /* the relay address always comes from the site itself */
    window.CP_VENUE = V = cached.data;
    version = cached.version || 0;
  }

  /* 2. This kiosk's name: ?kiosk=lobby once, otherwise a code made up the first time it starts. */
  var kiosk = "";
  if (isKiosk) {
    try {
      var q = new URLSearchParams(location.search).get("kiosk");
      if (q && /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/.test(q)) localStorage.setItem("cp-kiosk-id", q);
      kiosk = localStorage.getItem("cp-kiosk-id") || "";
      if (!kiosk) { kiosk = "kiosk-" + Math.random().toString(36).slice(2, 6); localStorage.setItem("cp-kiosk-id", kiosk); }
    } catch (e) { kiosk = "kiosk"; }
  }

  /* Images can be files on this site, or logos and photos uploaded in the dashboard ("media:<id>"). */
  function img(ref, assets) {
    ref = String(ref || "");
    if (ref.indexOf("media:") === 0) return EP ? EP + "/media/" + ref.slice(6) : "";
    if (/^https:\/\//.test(ref)) return ref;
    return (assets || "") + ref;
  }
  /* QR codes go through the dashboard so scans are counted, then straight on to the real page. */
  function go(kind, id) {
    if (!EP) return "";
    return EP + "/go/" + encodeURIComponent(V.id) + "/" + kind + "/" + encodeURIComponent(id || "") + (kiosk ? "?k=" + encodeURIComponent(kiosk) : "");
  }

  /* 3. Visit counts, sent once a minute. */
  var dayKey = function () { return new Intl.DateTimeFormat("en-CA", { timeZone: V.tz || "America/Los_Angeles" }).format(new Date()); };
  function count(type, key) {
    if (!EP || !kiosk || !key) return;
    var q = store.get(QKEY) || {}, d = dayKey();
    var t = (q[d] = q[d] || {}), g = (t[type] = t[type] || {});
    g[key] = (g[key] || 0) + 1;
    var days = Object.keys(q).sort(); while (days.length > 3) delete q[days.shift()];
    store.set(QKEY, q);
  }
  var sending = false;
  function flush() {
    if (!EP || !kiosk || sending || (navigator.onLine === false)) return;
    var q = store.get(QKEY);
    if (!q || !Object.keys(q).length) return;
    sending = true;
    fetch(EP + "/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venue: V.id, kiosk: kiosk, days: q }), keepalive: true })
      .then(function (r) {
        if (!r.ok) return;
        /* remove what was sent; anything counted meanwhile stays for next time */
        var now = store.get(QKEY) || {};
        Object.keys(q).forEach(function (d) { Object.keys(q[d]).forEach(function (t) { Object.keys(q[d][t]).forEach(function (k) {
          if (now[d] && now[d][t] && now[d][t][k] != null) { now[d][t][k] -= q[d][t][k]; if (now[d][t][k] <= 0) delete now[d][t][k]; }
        }); if (now[d] && now[d][t] && !Object.keys(now[d][t]).length) delete now[d][t]; }); if (now[d] && !Object.keys(now[d]).length) delete now[d]; });
        store.set(QKEY, now);
      })
      .catch(function () { /* offline: try again later */ })
      .then(function () { sending = false; });
  }

  /* 4. Check for newly published content. The kiosk switches to it the next time it's on the welcome screen. */
  var pending = false;
  function check() {
    if (!EP || navigator.onLine === false) return;
    var u = EP + "/content?venue=" + encodeURIComponent(V.id) + "&have=" + version + (kiosk ? "&k=" + encodeURIComponent(kiosk) + "&s=" + Math.round(screen.width) + "x" + Math.round(screen.height) + "&app=" + APP + "&boot=" + BOOT : "");
    fetch(u, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (j && j.reload) pending = true;
      if (!j || j.same || !j.data || j.data.id !== V.id || !j.data.items) return;
      if (j.version === version) return;
      store.set(KEY, { version: j.version, data: j.data, at: Date.now() });
      pending = true;
      if (!isKiosk) {
        /* phone guide: show the new content right away, once */
        try { if (sessionStorage.getItem("cp-reloaded") !== String(j.version)) { sessionStorage.setItem("cp-reloaded", String(j.version)); location.reload(); } } catch (e) { /* skip */ }
      }
    }).catch(function () { /* offline: keep the saved copy */ });
  }
  var bootDay = dayKey();
  function maybeReload() {
    /* new content, or a new day (ad campaigns start and end by date) */
    if (!pending && dayKey() === bootDay) return;
    var k = window.CPK;
    if (k && typeof k.isIdle === "function" && k.isIdle()) location.reload();
  }

  window.CP_LIVE = { endpoint: EP, kiosk: kiosk, version: function () { return version; }, img: img, go: go, count: count, flush: flush, check: check };

  if (EP) {
    setTimeout(check, isKiosk ? 4000 : 300);
    if (isKiosk) {
      setInterval(check, 2 * 60000);
      setInterval(flush, 60000);
      setInterval(maybeReload, 15000);
      window.addEventListener("online", function () { check(); flush(); });
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });
    }
  }
})();
