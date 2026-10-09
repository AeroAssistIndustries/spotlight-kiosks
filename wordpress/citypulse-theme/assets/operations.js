/* CityPulse Kiosks — DEMO of the team operations library (GitHub Pages only).
   This is a temporary demo. It only shows file names and never includes the real documents.
   The real library runs on WordPress with a server-side access code (see /operations/ there). */
(function () {
  "use strict";
  const DEMO_CODE = "citypulse-demo";
  const FILES = [
    ["00_Operations_Playbook.docx", "Word"], ["01_Advertiser_Services_Agreement.docx", "Word"],
    ["02_Advertising_Order.docx", "Word"], ["03_Host_Location_Agreement.docx", "Word"],
    ["04_Host_Site_Survey.docx", "Word"], ["05_Installation_and_Activation_Checklist.docx", "Word"],
    ["06_Creative_Approval_Form.docx", "Word"], ["07_Service_Change_and_Cancellation_Form.docx", "Word"],
    ["08_Commission_Approval_Form.docx", "Word"], ["09_Monthly_Finance_Checklist.docx", "Word"],
    ["CityPulse_Complete_Operations_Manual.docx", "Word"], ["CityPulse_Operations_Tracker.xlsx", "Excel"],
    ["CityPulse-Company-Documents.pdf", "PDF"], ["CityPulse-Go-Live-Steps.docx", "Word"],
    ["CityPulse-Developer-Handoff.pdf", "PDF"], ["CityPulse-WordPress-Theme.zip", "Zip"]
  ];
  const app = document.getElementById("ops-app");
  if (!app) return;
  const KEY = "cp-demo-ops";
  const signedIn = () => { try { return sessionStorage.getItem(KEY) === "yes"; } catch (e) { return false; } };
  const setSigned = v => { try { v ? sessionStorage.setItem(KEY, "yes") : sessionStorage.removeItem(KEY); } catch (e) { /* private window */ } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function gate(note) {
    app.innerHTML = `
      <p class="ops-demo-tag">DEMO · for review only</p>
      <h1 class="ops-h">Team library</h1>
      <p class="ops-lede">Enter your team access code to view the operations files.</p>
      <form class="ops-form" id="ops-form" autocomplete="off">
        <label>Access code<input type="password" name="code" required autocomplete="off"></label>
        <button class="btn" type="submit">Open library</button>
        <p class="ops-note" id="ops-note">${esc(note || "")}</p>
      </form>
      <p class="ops-small">Demo code for this preview: <code>${DEMO_CODE}</code>. Without a code, email info@citypulsekiosks.com to request one.</p>`;
    document.getElementById("ops-form").addEventListener("submit", e => {
      e.preventDefault();
      const code = e.target.elements.code.value.trim();
      if (code === DEMO_CODE) { setSigned(true); library(); }
      else gate("That code is not correct.");
    });
  }

  function library() {
    const rows = FILES.map(([n, t], i) => `<tr><td>${esc(n)}</td><td>${t}</td><td><button class="ops-view" data-i="${i}">Preview</button></td></tr>`).join("");
    app.innerHTML = `
      <p class="ops-demo-tag">DEMO · for review only</p>
      <h1 class="ops-h">Team library</h1>
      <p class="ops-lede">Files for the CityPulse team. Previews in this demo show file names only.</p>
      <div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>File</th><th>Type</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <p id="ops-preview" class="ops-note" role="status"></p>
      <p><button class="btn btn-ghost btn-small" id="ops-out" type="button">Sign out</button></p>`;
    app.querySelectorAll(".ops-view").forEach(b => b.addEventListener("click", () => {
      document.getElementById("ops-preview").textContent = `Demo: "${FILES[+b.dataset.i][0]}" is stored on the WordPress site and is not published in this demo.`;
    }));
    document.getElementById("ops-out").addEventListener("click", () => { setSigned(false); gate("Signed out."); });
  }

  if (signedIn()) library(); else gate();
})();
