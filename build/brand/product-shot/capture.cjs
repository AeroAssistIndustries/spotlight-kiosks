const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const S = process.argv[2]; const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1.5, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8811/kiosk-app/'); await p.waitForTimeout(3000); await p.mouse.click(540, 600); await p.waitForTimeout(2000);
  await p.addScriptTag({ url: 'http://127.0.0.1:8811/assets/vendor/qrcode-generator.js' });
  await p.evaluate(() => {
    // stop the ad carousel on the first slide and make it a "your business here" ad
    document.querySelectorAll('.cpk-ad-track').forEach(t => { t.style.transition = 'none'; t.style.transform = 'none'; });
    const id = setInterval(() => document.querySelectorAll('.cpk-ad-track').forEach(t => { t.style.transform = 'none'; }), 50);
    const ad = document.querySelector('.cpk-ad');
    const q = qrcode(0, 'M'); q.addData('https://citypulsekiosks.com'); q.make();
    ad.querySelector('.cpk-ad-logo').innerHTML = '<span style="font:800 15px/1.1 Georgia,serif;letter-spacing:.12em;color:#d9b56a;text-align:center">YOUR<br>LOGO</span>';
    ad.querySelector('.cpk-ad-tag').textContent = 'Your ad here';
    ad.querySelector('.cpk-ad-t').textContent = 'Your business';
    ad.querySelector('.cpk-ad-s').textContent = 'Seen by every guest who taps';
    const x = ad.querySelector('.cpk-ad-x'); if (x) x.textContent = 'On every screen at this hotel, all year.';
    ad.querySelector('.cpk-ad-web').textContent = 'citypulsekiosks.com';
    const qr = ad.querySelector('.cpk-ad-qr'); const svg = qr.querySelector('svg, img, canvas');
    const holder = document.createElement('div'); holder.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const ns = holder.firstElementChild; ns.style.width = (svg ? svg.getBoundingClientRect().width : 90) + 'px'; ns.style.height = ns.style.width;
    if (svg) svg.replaceWith(ns); else qr.prepend(ns);
  });
  await p.addStyleTag({ content: '.cpk-ads > :not(.cpk-ad-track){display:none!important} .lt-faces .lt-face:not(:first-child){display:none!important} .lt-faces .lt-face:first-child{opacity:1!important;transform:none!important}' });
  // a typical North Hollywood afternoon for the weather tile (the live forecast can't load here)
  await p.evaluate(() => { const w = document.getElementById('lt-wx'); if (w) w.querySelector('.lt-big').textContent = '74°'; });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: S + '/kiosk-portrait-home.png' });
  await (await p.$('.cpk-ad')).screenshot({ path: S + '/ad-card.png' });
  await b.close();
})();
