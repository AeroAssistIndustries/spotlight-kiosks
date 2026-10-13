/* Website demo mode for the kiosk (?demo=1): the same Lexen interface, but
   - the ad slider shows generic "your business" ads (no real advertisers), and nothing nearby is labeled Sponsored;
   - nothing is sent to the venue's dashboard (no visit counts, no live content), so website visitors never touch real numbers. */
(function () {
  var q = new URLSearchParams(location.search);
  if (q.get("demo") !== "1" || !window.CP_VENUE) return;
  window.CP_DEMO = true;
  var url = "https://citypulsekiosks.com/advertise/";
  window.CP_VENUE.sponsors = [
    { id: "demo-1", name: "Your business", house: true, kind: "Your ad here", tagline: "Seen by every guest who taps the screen, all year.", website: "citypulsekiosks.com", url: url, active: true },
    { id: "demo-2", name: "Your restaurant", house: true, kind: "Dinner nearby", tagline: "Put tonight's menu in front of hungry guests.", website: "citypulsekiosks.com", url: url, active: true },
    { id: "demo-3", name: "Your shop or service", house: true, kind: "Local favorite", tagline: "From $399 a year, or $60 a month.", website: "citypulsekiosks.com", url: url, active: true }
  ];
  document.documentElement.classList.add("cp-demo");
})();
