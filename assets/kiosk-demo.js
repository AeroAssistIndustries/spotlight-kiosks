/* Website demo mode for the kiosk (?demo=1): the same Lexen interface, but
   - the ad slider shows generic "your business" ads (no real advertisers), and nothing nearby is labeled Sponsored;
   - nothing is sent to the venue's dashboard (no visit counts, no live content), so website visitors never touch real numbers.
   Sales Studio demo links add one prospect's own ad (&p=..., made by Sales Studio) so the business sees its ad on the
   real kiosk before it buys; &mark=1 outlines the ad space, and the page around it can switch that on and off. */
(function () {
  var q = new URLSearchParams(location.search);
  if (q.get("demo") !== "1" || !window.CP_VENUE) return;
  window.CP_DEMO = true;
  var url = "https://citypulsekiosks.com/advertise/";
  window.CP_VENUE.sponsors = [
    { id: "demo-1", name: "Your business", house: true, kind: "Your ad here", tagline: "Seen by every guest who taps the screen, all year.", website: "citypulsekiosks.com", url: url, active: true },
    { id: "demo-2", name: "Your restaurant", house: true, kind: "Dinner nearby", tagline: "Put tonight's menu in front of hungry guests.", website: "citypulsekiosks.com", url: url, active: true },
    { id: "demo-3", name: "Your shop or service", house: true, kind: "Local favorite", tagline: window.CP_PRICE ? "From " + CP_PRICE.money(CP_PRICE.now.y1) + " a year, or " + CP_PRICE.money(CP_PRICE.now.mo) + " a month." : "From $798 a year, or $120 a month.", website: "citypulsekiosks.com", url: url, active: true }
  ];
  document.documentElement.classList.add("cp-demo");

  /* A prospect's ad from a Sales Studio demo link. Logos only come from Sales Studio. */
  var LOGO_HOSTS = /^https:\/\/(sales\.citypulsekiosks\.com|citypulse-sales-studio\.pages\.dev)\/d\/[A-Za-z0-9]{10,24}\/logo$/;
  var clip = function (s, n) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n); };
  var p = null;
  try {
    var raw = q.get("p");
    if (raw) p = JSON.parse(decodeURIComponent(escape(atob(raw.replace(/-/g, "+").replace(/_/g, "/")))));
  } catch (e) { p = null; }
  if (p && clip(p.n, 60)) {
    var site = clip(p.u, 200);
    if (!/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(site)) site = "";
    var ad = {
      id: "", name: clip(p.n, 60), kind: clip(p.k, 50) || "Featured nearby", tagline: clip(p.t, 110),
      website: clip(p.w, 60) || (site ? site.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "") : ""),
      url: site || url, active: true, prospect: true
    };
    var logo = clip(p.l, 200);
    if (LOGO_HOSTS.test(logo)) ad.logo = logo;
    /* Their ad holds the featured spot for the whole demo, so they can find it on every screen. */
    window.CP_VENUE.sponsors = [ad];
    if (p.b === 1) document.documentElement.classList.add("cp-demo-light");
  }

  /* "Show where my ad goes": a glowing outline around the ad space, on every screen. */
  var css = document.createElement("style");
  css.textContent =
    ".cp-demo-light .cpk-ad-logo.img{background:#fff!important;border-color:rgba(217,183,110,.7)!important}" +
    ".cp-demo-mark .cpk-ads{overflow:visible!important;box-shadow:0 0 0 .35em #2EE6D2,0 0 2.4em .5em rgba(46,230,210,.55)!important;animation:cpDemoGlow 1.8s ease-in-out infinite}" +
    ".cp-demo-mark .cpk-ads::before{content:var(--cp-demo-label,'Your ad goes here');position:absolute;z-index:5;left:50%;top:0;transform:translate(-50%,-125%);white-space:nowrap;background:#2EE6D2;color:#06222A;font-weight:800;font-size:1.05em;letter-spacing:.01em;padding:.5em 1.1em;border-radius:99px;box-shadow:0 .4em 1.2em rgba(0,0,0,.35)}" +
    "@keyframes cpDemoGlow{50%{box-shadow:0 0 0 .35em #8FF5EA,0 0 3.2em .8em rgba(46,230,210,.75)}}" +
    "@media (prefers-reduced-motion:reduce){.cp-demo-mark .cpk-ads{animation:none}}";
  document.head.appendChild(css);
  var label = p && clip(p.n, 60) ? "Your ad · " + clip(p.n, 40) : "Your ad goes here";
  document.documentElement.style.setProperty("--cp-demo-label", JSON.stringify(label));
  var setMark = function (on) { document.documentElement.classList.toggle("cp-demo-mark", !!on); };
  if (q.get("mark") === "1") setMark(true);
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (d && typeof d === "object" && d.cpDemo === "mark") setMark(!!d.on);
  });
})();
