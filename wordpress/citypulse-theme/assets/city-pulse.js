/* CityPulse hero: a live city at night.
   Host venues glow teal and send pulse rings along the ground; people walking the streets light up
   as a pulse reaches them, the way a kiosk ad reaches every visitor in the lobby.
   Loaded by site.js only on the home page. Pauses off-screen; a still frame for reduced motion. */
import * as THREE from "./vendor/three.module.min.js";

const hero = document.querySelector(".hero2");
// Build the 3D city only after the page has loaded and the browser is idle, so it never delays first paint.
if (hero && !hero.querySelector(".cp-city")) {
  const go = () => ("requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200));
  document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
}

function softwareGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r);
  } catch (e) { return false; }
}

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
}

function start() {
  if (!webglOK()) return;
  // reduced motion, or a device drawing 3D without a graphics chip (software rendering): show one composed still frame
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches || softwareGL();
  const phone = matchMedia("(max-width: 760px)").matches;
  // phones and low-core laptops: 30 fps and fewer pixels, which halves the work per second
  const lowPower = phone || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const FRAME = lowPower ? 1000 / 30 - 2 : 0; let lastDraw = 0;
  const NAVY = new THREE.Color("#0a1522"), TEAL = new THREE.Color("#22c7b6");

  /* ---------- stage ---------- */
  const wrap = document.createElement("div");
  wrap.className = "cp-city"; wrap.setAttribute("aria-hidden", "true");
  const labels = document.createElement("div"); labels.className = "cp-city-labels";
  wrap.appendChild(labels);
  hero.prepend(wrap);
  hero.classList.add("hero-live");

  const renderer = new THREE.WebGLRenderer({ antialias: !phone, powerPreference: "high-performance" });
  let dpr = Math.min(devicePixelRatio || 1, phone ? 1 : lowPower ? 1.25 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(NAVY, 1);
  wrap.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const FOG_NEAR = 110, FOG_FAR = 330;
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 900);

  /* ---------- the city plan ---------- */
  const rnd = mulberry(20261011);
  const BLOCK = 11, STREET = 3.4, PITCH = BLOCK + STREET, N = phone ? 11 : 18;
  const HALF = (N * PITCH) / 2;
  const lots = [];
  for (let bx = 0; bx < N; bx++) for (let bz = 0; bz < N; bz++) {
    const x0 = -HALF + bx * PITCH + STREET / 2, z0 = -HALF + bz * PITCH + STREET / 2;
    const split = rnd() < 0.7 ? 2 : 1, s = BLOCK / split;
    for (let i = 0; i < split; i++) for (let j = 0; j < split; j++) {
      if (rnd() < 0.06) continue; // a little open space
      const cx = x0 + s * (i + 0.5), cz = z0 + s * (j + 0.5);
      const d = Math.hypot(cx, cz);
      const tall = Math.exp(-d / 52) * 30 * (0.4 + rnd() * 0.8);
      const h = Math.max(2.4, tall + 2 + rnd() * 4.5 + (rnd() < 0.035 ? 16 : 0));
      const m = 0.9 + rnd() * 0.9;
      lots.push({ x: cx, z: cz, w: s - m, d: s - m * (0.8 + rnd() * 0.5), h });
    }
  }
  // host venues: spread out, not the tallest towers (lobbies people wait in)
  const KINDS = ["Hotel lobby", "Medical office", "Dealership lounge", "Restaurant"];
  const hosts = [];
  const order = lots.map((l, i) => i).sort(() => rnd() - 0.5);
  for (const i of order) {
    const l = lots[i];
    if (l.h > 22 || Math.hypot(l.x, l.z) > HALF * 0.78) continue;
    if (hosts.some(h => Math.hypot(h.x - l.x, h.z - l.z) < (phone ? 17 : 26))) continue;
    l.host = true;
    hosts.push({ x: l.x, z: l.z, h: l.h, kind: KINDS[hosts.length % 4], next: 0, on: 0 });
    if (hosts.length >= (phone ? 12 : 16)) break;
  }

  /* ---------- pulses: shared by the ground, the buildings and the people ---------- */
  const MAXP = 24;
  const pulses = Array.from({ length: MAXP }, () => new THREE.Vector4(0, 0, -99, 0));
  const SPEED = 15, LIFE = 3.6;

  /* ---------- buildings: one instanced box, windows drawn in the shader ---------- */
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const bMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFog: { value: NAVY }, uNear: { value: FOG_NEAR }, uFar: { value: FOG_FAR },
      uBase: { value: new THREE.Color("#101f31") }, uTop: { value: new THREE.Color("#2a3f58") }, uTeal: { value: TEAL }, uIntro: { value: 0 }, uP: { value: pulses }, uSpeed: { value: SPEED }, uLife: { value: LIFE } },
    vertexShader: `
      attribute vec3 iSize; attribute float iSeed; attribute float iHost;
      varying vec3 vL; varying vec3 vN; varying float vSeed; varying float vHost; varying float vH; varying float vDepth; varying vec3 vW;
      void main(){
        vL = position * iSize; vN = normal; vSeed = iSeed; vHost = iHost; vH = iSize.y;
        vec4 w = modelMatrix * instanceMatrix * vec4(position,1.0); vW = w.xyz;
        vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uTime, uNear, uFar, uIntro, uSpeed, uLife; uniform vec3 uFog, uBase, uTop, uTeal; uniform vec4 uP[${MAXP}];
      varying vec3 vL; varying vec3 vN; varying float vSeed; varying float vHost; varying float vH; varying float vDepth; varying vec3 vW;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      void main(){
        float h = vL.y;
        vec3 col = mix(uBase, uTop, clamp(h / 34.0, 0.0, 1.0));
        if (abs(vN.y) < 0.5) {
          float u = abs(vN.x) > 0.5 ? vL.z : vL.x;
          vec2 g = vec2(u / 1.5, h / 2.1);
          vec2 cell = floor(g), f = fract(g);
          float win = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.78);
          float r = hash(cell + vSeed * 19.7);
          float flick = step(0.995, hash(cell + floor(uTime * 0.25) + vSeed));
          float lit = step(0.83, r) * step(1.0, h) * (1.0 - smoothstep(170.0, 320.0, vDepth));
          lit = abs(lit - flick);
          vec3 wc = mix(vec3(1.0, 0.80, 0.52), vec3(0.72, 0.88, 1.0), step(0.85, r));
          col += win * lit * wc * (0.22 + 0.3 * hash(cell.yx + vSeed)) * uIntro;
          col *= abs(vN.x) > 0.5 ? (vN.x > 0.0 ? 0.78 : 0.62) : (vN.z > 0.0 ? 1.0 : 0.7);
          if (vHost > 0.5) {
            float band = smoothstep(vH - 1.3, vH - 0.5, h);
            float lobby = (1.0 - step(2.6, h)) * win;
            float beat = 0.55 + 0.45 * sin(uTime * 2.2 + vSeed * 6.0);
            col += uTeal * (band * 0.9 + lobby * 1.1 * beat) * uIntro;
          }
        } else {
          col = uTop * 1.35 + vec3(0.02, 0.03, 0.04);
          if (vHost > 0.5) col = mix(col, uTeal, 0.28 * uIntro);
        }
        // a passing pulse washes over the walls, strongest at street level
        float wash = 0.0;
        for (int i = 0; i < ${MAXP}; i++) {
          vec4 q = uP[i]; float age = uTime - q.z;
          if (age < 0.0 || age > uLife) continue;
          float d = distance(vW.xz, q.xy), r = age * uSpeed;
          wash += exp(-pow((d - r) / 1.8, 2.0)) * pow(1.0 - age / uLife, 1.4) * q.w;
        }
        col += uTeal * wash * (0.75 * exp(-h * 0.09) + 0.12);
        float fogF = smoothstep(uNear, uFar, vDepth);
        gl_FragColor = vec4(mix(col, uFog, fogF), 1.0);
      }`
  });
  const bMesh = new THREE.InstancedMesh(box, bMat, lots.length);
  const iSize = new Float32Array(lots.length * 3), iSeed = new Float32Array(lots.length), iHost = new Float32Array(lots.length);
  const M = new THREE.Matrix4();
  lots.forEach((l, i) => {
    M.makeScale(l.w, l.h, l.d); M.setPosition(l.x, 0, l.z); bMesh.setMatrixAt(i, M);
    iSize.set([l.w, l.h, l.d], i * 3); iSeed[i] = rnd(); iHost[i] = l.host ? 1 : 0;
  });
  box.setAttribute("iSize", new THREE.InstancedBufferAttribute(iSize, 3));
  box.setAttribute("iSeed", new THREE.InstancedBufferAttribute(iSeed, 1));
  box.setAttribute("iHost", new THREE.InstancedBufferAttribute(iHost, 1));
  bMesh.frustumCulled = false;
  scene.add(bMesh);

  /* ---------- ground: streets and the pulse rings ---------- */
  const gMat = new THREE.ShaderMaterial({
    transparent: false,
    uniforms: { uTime: { value: 0 }, uP: { value: pulses }, uFog: { value: NAVY }, uNear: { value: FOG_NEAR }, uFar: { value: FOG_FAR },
      uTeal: { value: TEAL }, uPitch: { value: PITCH }, uStreet: { value: STREET }, uHalf: { value: HALF }, uSpeed: { value: SPEED }, uLife: { value: LIFE } },
    vertexShader: `varying vec3 vW; varying float vDepth;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      uniform float uTime, uNear, uFar, uPitch, uStreet, uHalf, uSpeed, uLife; uniform vec3 uFog, uTeal; uniform vec4 uP[${MAXP}];
      varying vec3 vW; varying float vDepth;
      void main(){
        vec2 p = vW.xz + uHalf + uStreet * 0.5;
        vec2 m = mod(p, uPitch);
        float street = max(1.0 - step(uStreet, m.x), 1.0 - step(uStreet, m.y));
        vec3 col = mix(vec3(0.03, 0.06, 0.095), vec3(0.075, 0.13, 0.19), street);
        vec2 c = abs(m - uStreet * 0.5);
        float lane = (1.0 - step(0.08, min(c.x, c.y))) * street * step(0.5, fract((p.x + p.y) * 0.25));
        col += lane * 0.06;
        float glow = 0.0;
        for (int i = 0; i < ${MAXP}; i++) {
          vec4 q = uP[i];
          float age = uTime - q.z;
          if (age < 0.0 || age > uLife) continue;
          float r = age * uSpeed;
          float d = distance(vW.xz, q.xy);
          float fade = pow(1.0 - age / uLife, 1.6) * q.w;
          float ring = exp(-pow((d - r) / 1.5, 2.0)) * 1.6;
          float wake = smoothstep(r - 12.0, r, d) * step(d, r) * 0.28;
          glow += (ring + wake) * fade;
          glow += exp(-d * 0.35) * 0.5 * fade;
        }
        col += uTeal * glow * (0.55 + street * 0.6);
        float fogF = smoothstep(uNear, uFar, vDepth);
        gl_FragColor = vec4(mix(col, uFog, fogF), 1.0);
      }`
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 4, HALF * 4), gMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  /* ---------- beacons above host venues ---------- */
  const beamGeo = new THREE.CylinderGeometry(0.16, 0.16, 1, 8, 1, true); beamGeo.translate(0, 0.5, 0);
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTeal: { value: TEAL }, uA: { value: 0 } },
    vertexShader: `varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uTeal; uniform float uA; varying float vY; void main(){ gl_FragColor = vec4(uTeal * pow(1.0 - vY, 1.6) * 0.42 * uA, 1.0); }`
  });
  const beams = new THREE.InstancedMesh(beamGeo, beamMat, hosts.length);
  hosts.forEach((h, i) => { M.makeScale(1, 22, 1); M.setPosition(h.x, h.h, h.z); beams.setMatrixAt(i, M); });
  beams.frustumCulled = false;
  scene.add(beams);

  /* ---------- pulse rings in the air, above the rooftops ---------- */
  const ringGeo = new THREE.RingGeometry(0.965, 1, 96, 1); ringGeo.rotateX(-Math.PI / 2);
  const ringA = new Float32Array(MAXP);
  ringGeo.setAttribute("aA", new THREE.InstancedBufferAttribute(ringA, 1));
  const ringMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTeal: { value: TEAL } },
    vertexShader: `attribute float aA; varying float vA; void main(){ vA = aA; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uTeal; varying float vA; void main(){ gl_FragColor = vec4(uTeal * vA, 1.0); }`
  });
  const rings = new THREE.InstancedMesh(ringGeo, ringMat, MAXP);
  rings.frustumCulled = false;
  scene.add(rings);
  const R = new THREE.Matrix4();
  function updateRings(time) {
    for (let k = 0; k < MAXP; k++) {
      const q = pulses[k], age = time - q.z;
      const live = age >= 0 && age <= LIFE;
      const r = Math.max(0.01, age * SPEED);
      const y = 1.5 + Math.min(age, 1.2) * 7;            // the ring lifts off the street as it spreads
      R.makeScale(live ? r : 0.001, 1, live ? r : 0.001); R.setPosition(q.x, y, q.y);
      rings.setMatrixAt(k, R);
      ringA[k] = live ? Math.pow(1 - age / LIFE, 1.5) * 0.9 : 0;
    }
    rings.instanceMatrix.needsUpdate = true;
    ringGeo.attributes.aA.needsUpdate = true;
  }

  /* ---------- soft halos over host venues ---------- */
  const haloTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(34,199,182,0.85)"); gr.addColorStop(0.25, "rgba(34,199,182,0.35)"); gr.addColorStop(1, "rgba(34,199,182,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const halos = hosts.map(h => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    sp.position.set(h.x, h.h + 1.2, h.z); sp.scale.set(16, 16, 1);
    scene.add(sp); h.halo = sp; return sp;
  });

  /* ---------- people on the streets ---------- */
  const COUNT = phone ? 650 : 1500;
  const ppos = new Float32Array(COUNT * 3), pglow = new Float32Array(COUNT), pdir = [];
  for (let i = 0; i < COUNT; i++) {
    const alongX = rnd() < 0.5, line = Math.floor(rnd() * (N + 1));
    const lane = (rnd() - 0.5) * (STREET * 0.7);
    const pos = -HALF + rnd() * HALF * 2;
    const speed = (rnd() < 0.5 ? -1 : 1) * (1.2 + rnd() * 2.6) * (rnd() < 0.12 ? 3.2 : 1);
    pdir.push({ alongX, fixed: -HALF + line * PITCH + lane, pos, speed });
    ppos[i * 3 + 1] = 0.35;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(ppos, 3));
  pGeo.setAttribute("aGlow", new THREE.BufferAttribute(pglow, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTeal: { value: TEAL }, uScale: { value: 1 }, uNear: { value: FOG_NEAR }, uFar: { value: FOG_FAR }, uIntro: { value: 0 } },
    vertexShader: `attribute float aGlow; uniform float uScale; varying float vG; varying float vFog;
      void main(){ vG = aGlow; vec4 mv = modelViewMatrix * vec4(position,1.0); vFog = -mv.z;
        gl_PointSize = (3.2 + aGlow * 6.0) * uScale * (180.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uTeal; uniform float uNear, uFar, uIntro; varying float vG; varying float vFog;
      void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        vec3 base = vec3(0.70, 0.80, 0.95) * 0.9;
        vec3 col = mix(base, uTeal * 1.6 + 0.15, vG);
        float fog = 1.0 - smoothstep(uNear, uFar, vFog);
        gl_FragColor = vec4(col * a * fog * uIntro, 1.0); }`
  });
  const people = new THREE.Points(pGeo, pMat);
  people.frustumCulled = false;
  scene.add(people);

  /* ---------- sizing ---------- */
  let W = 1, H = 1, offsetX = 0;
  function resize() {
    const r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = W > 980 ? 32 : 48;   // tall phone heroes need a wider lens to see whole blocks
    // push the busy middle of the city to the right of the headline on wide screens
    offsetX = W > 900 ? -W * 0.2 : 0;
    // phones: the city shows in the gap between the text and the slider card (about 52% down)
    const offsetY = W > 980 ? 0 : -H * 0.04;
    camera.setViewOffset(W, H, offsetX, offsetY, W, H);
    camera.updateProjectionMatrix();
    pMat.uniforms.uScale.value = dpr * (H / 760);
  }
  resize();
  addEventListener("resize", resize);

  /* ---------- pointer parallax ---------- */
  let px = 0, py = 0, tx = 0, ty = 0;
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
  });

  /* ---------- venue labels ---------- */
  const shown = new Map();
  const v3 = new THREE.Vector3();
  function showLabel(h, t) {
    if (W < 900 || shown.size >= 2 || shown.has(h)) return;
    const el = document.createElement("span");
    el.className = "cp-city-label";
    el.innerHTML = `<i></i>${h.kind}`;
    labels.appendChild(el);
    shown.set(h, { el, until: t + 2.8 });
  }
  function placeLabels(t) {
    for (const [h, s] of shown) {
      if (t > s.until) { s.el.classList.add("out"); if (t > s.until + 0.5) { s.el.remove(); shown.delete(h); } }
      v3.set(h.x, h.h + 4, h.z).project(camera);
      const x = (v3.x * 0.5 + 0.5) * W, y = (-v3.y * 0.5 + 0.5) * H;
      const hide = v3.z > 1 || x < W * 0.5 || x > W - 60 || y < 80 || y > H * 0.56;
      s.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      s.el.style.opacity = hide || s.el.classList.contains("out") ? 0 : 1;
    }
  }

  /* ---------- the loop ---------- */
  let pi = 0, last = performance.now(), t0 = last, t = 0, running = false, visible = true, raf = 0;
  let slow = 0, frames = 0;
  function emit(h, time) {
    pulses[pi % MAXP].set(h.x, h.z, time, 1); pi++;
  }
  const ease = x => 1 - Math.pow(1 - x, 3);

  function step(now) {
    if (running && FRAME && now - lastDraw < FRAME) { raf = requestAnimationFrame(step); return; }
    lastDraw = now;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    t = (now - t0) / 1000;
    // intro: the city fades up and the camera settles, then hosts switch on one by one
    const intro = still ? 1 : ease(Math.min(1, t / 3.2));
    bMat.uniforms.uIntro.value = intro; pMat.uniforms.uIntro.value = intro;
    bMat.uniforms.uTime.value = t; gMat.uniforms.uTime.value = t;
    beamMat.uniforms.uA.value = intro;

    hosts.forEach((h, i) => {
      const onAt = 1.4 + i * 0.18;
      if (t < onAt) return;
      if (!h.on) { h.on = 1; h.next = t; }
      if (t >= h.next) { emit(h, t); h.last = t; showLabel(h, t); h.next = t + 2.6 + rnd() * 3.4; }
    });

    // people walk; a passing ring lights them up
    const life = LIFE;
    for (let i = 0; i < COUNT; i++) {
      const p = pdir[i];
      p.pos += p.speed * dt;
      if (p.pos > HALF) p.pos -= HALF * 2; else if (p.pos < -HALF) p.pos += HALF * 2;
      const x = p.alongX ? p.pos : p.fixed, z = p.alongX ? p.fixed : p.pos;
      ppos[i * 3] = x; ppos[i * 3 + 2] = z;
      let g = pglow[i] * Math.exp(-dt * 1.6);
      for (let k = 0; k < MAXP; k++) {
        const q = pulses[k], age = t - q.z;
        if (age < 0 || age > life) continue;
        const d = Math.hypot(x - q.x, z - q.y), r = age * SPEED;
        if (Math.abs(d - r) < 1.4) g = 1;
      }
      pglow[i] = g;
    }
    updateRings(t);
    hosts.forEach(h => { if (!h.halo) return; const since = t - (h.last || -9); h.halo.material.opacity = (h.on ? 0.24 : 0) * intro + Math.max(0, 1 - since / 1.2) * 0.55; const sc = 11 + Math.max(0, 1 - since / 1.2) * 9; h.halo.scale.set(sc, sc, 1); });
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.aGlow.needsUpdate = true;

    // camera: a slow orbit, a gentle dolly-in at the start, parallax from the pointer
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    const az = 0.65 + t * 0.018 + px * 0.25;
    const dist = (W > 980 ? 275 : 300) - 55 * intro + py * 12;
    const el = 1.12 - 0.2 * intro - py * 0.06;
    camera.position.set(Math.cos(az) * dist * Math.cos(el), Math.sin(el) * dist, Math.sin(az) * dist * Math.cos(el));
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    placeLabels(t);

    // if this device struggles, draw fewer pixels
    frames++; if (dt > 0.03) slow++;
    if (frames === 90 && slow > 40 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); resize(); }

    if (running) raf = requestAnimationFrame(step);
  }

  function play() { if (running || still) return; running = true; last = performance.now(); raf = requestAnimationFrame(step); }
  function pause() { running = false; cancelAnimationFrame(raf); }

  if (still) {
    // one composed still frame: the network lit, a few rings mid-flight
    t0 = performance.now() - 9000; last = performance.now();
    hosts.forEach((h, i) => { h.on = 1; h.next = 1e9; h.last = 9 - (i % 4) * 0.8; pulses[i % MAXP].set(h.x, h.z, h.last, 1); });
    step(performance.now());
  } else {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; visible && !document.hidden ? play() : pause(); }, { threshold: 0.02 }).observe(hero);
    document.addEventListener("visibilitychange", () => (document.hidden || !visible ? pause() : play()));
    play();
  }
  requestAnimationFrame(() => wrap.classList.add("on"));
}

function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
