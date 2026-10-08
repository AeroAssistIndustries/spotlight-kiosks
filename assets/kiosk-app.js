/* Kiosk full-screen control. Guests can use Full screen. Leaving it needs the staff password.
   The password is stored only as a SHA-256 hash. This keeps guests out of the controls. It is not a
   security lock: the browser still lets anyone press Esc, so the ELO's own kiosk lock is the real control. */
(function () {
  "use strict";
  const app = document.getElementById("kapp");
  if (!app) return;
  const HASH = "704cbe6a49d1c459586a7b85285ea3d55cad79232a382b6c69d9305b0d99930b";
  const btn = document.getElementById("kapp-fs");
  const modal = document.getElementById("kapp-modal");
  const form = document.getElementById("kapp-form");
  const input = document.getElementById("kapp-pass");
  const msg = document.getElementById("kapp-msg");
  const isFs = () => !!document.fullscreenElement;
  const sha = async s => {
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, "0")).join("");
  };
  function sync() { if (btn) btn.textContent = isFs() ? "Staff exit" : "Full screen"; }

  btn.addEventListener("click", () => {
    if (!isFs()) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) req.call(el).catch(() => {});
      return;
    }
    modal.hidden = false; input.value = ""; msg.textContent = ""; input.focus();
  });
  document.getElementById("kapp-cancel").addEventListener("click", () => { modal.hidden = true; });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    let ok = false;
    try { ok = (await sha(input.value)) === HASH; } catch (err) { ok = false; }
    if (ok) {
      modal.hidden = true;
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document).catch(() => {});
    } else {
      msg.textContent = "That password is not correct.";
      input.select();
    }
  });
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync);
  sync();
})();

/* Visible Accessibility button in the corner. It opens the same options panel as the bottom bar. */
(function () {
  const a = document.getElementById("kapp-a11y");
  if (!a) return;
  a.addEventListener("click", () => {
    const b = document.querySelector('#knav button[data-act="access"]');
    if (b) b.click();
  });
})();
