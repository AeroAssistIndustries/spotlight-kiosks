/* Work with us: sends the sales rep application to CityPulse Sales Studio (POST /api/web/apply). */
(function () {
  var form = document.getElementById("cp-apply");
  if (!form) return;
  var api = (form.getAttribute("data-api") || "").replace(/\/+$/, ""), t0 = Date.now(), MAX = 1300000;
  var err = document.getElementById("cp-apply-err"), btn = form.querySelector("button[type=submit]");
  function fail(msg, el) {
    err.textContent = msg; err.hidden = false;
    [].forEach.call(form.querySelectorAll("[aria-invalid]"), function (x) { x.removeAttribute("aria-invalid"); });
    if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); }
    else err.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function readFile(f) {
    return new Promise(function (ok, no) {
      if (!f) return ok(null);
      if (f.size > MAX) return no(new Error("Your resume is too big (1.3 MB max). Save a smaller PDF, or skip it."));
      var type = f.type || (/\.pdf$/i.test(f.name) ? "application/pdf" : /\.docx$/i.test(f.name) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : /\.doc$/i.test(f.name) ? "application/msword" : "");
      var r = new FileReader();
      r.onload = function () { ok({ name: f.name, type: type, data: String(r.result).split(",")[1] || "" }); };
      r.onerror = function () { no(new Error("We couldn’t read your resume. Try another file, or skip it.")); };
      r.readAsDataURL(f);
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); err.hidden = true;
    var v = function (n) { return (form.elements[n] && form.elements[n].value || "").trim(); };
    var c = function (n) { return !!(form.elements[n] && form.elements[n].checked); };
    var need = [["name", "Add your full name."], ["email", "Add your email address."], ["phone", "Add your mobile phone number."], ["city", "Add your city."], ["state", "Choose your state."],
      ["experience", "Tell us your sales experience."], ["hours", "Choose the hours you want."], ["start", "Tell us when you could start."]];
    for (var i = 0; i < need.length; i++) if (!v(need[i][0])) return fail(need[i][1], form.elements[need[i][0]]);
    if (!/\s/.test(v("name"))) return fail("Add your first and last name.", form.elements.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) return fail("Check your email address.", form.elements.email);
    if (v("phone").replace(/\D/g, "").replace(/^1/, "").length !== 10) return fail("Add a 10-digit US phone number.", form.elements.phone);
    if (!c("laptop") && !c("smartphone")) return fail("You’ll need a laptop or computer, or a smartphone. Tick the ones you have.", form.elements.laptop);
    if (!c("quietRoom")) return fail("You’ll need a quiet place to make calls. Tick the box to confirm.", form.elements.quietRoom);
    if (v("why").length < 20) return fail("Tell us a little about why you’d be great at this (a sentence or two).", form.elements.why);
    if (!c("agree")) return fail("Tick the box to confirm you understand this is a commission-based independent contractor role.", form.elements.agree);
    btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…";
    readFile(form.elements.resume.files && form.elements.resume.files[0]).then(function (resume) {
      var body = { name: v("name"), email: v("email"), phone: v("phone"), city: v("city"), state: v("state"), linkedin: v("linkedin"), experience: v("experience"), hours: v("hours"), start: v("start"),
        laptop: c("laptop"), smartphone: c("smartphone"), quietRoom: c("quietRoom"), headset: c("headset"), why: v("why"), agree: c("agree"), company_url: v("company_url"), t: Date.now() - t0 };
      if (resume) body.resume = resume;
      return fetch(api + "/api/web/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (!x.ok) throw new Error((x.j && x.j.error) || "That didn’t go through. Please try again, or call 602-975-5513.");
          document.getElementById("cp-apply-name").textContent = ", " + v("name").split(" ")[0];
          document.getElementById("cp-apply-email").textContent = v("email");
          form.hidden = true; var done = document.getElementById("cp-apply-done"); done.hidden = false; done.focus();
          done.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }).catch(function (e2) {
      btn.disabled = false; btn.textContent = label;
      fail(e2 && e2.message && !/Failed to fetch|NetworkError|Load failed/i.test(e2.message) ? e2.message : "We couldn’t reach our server. Check your connection and try again, or call 602-975-5513.");
    });
  });
})();
