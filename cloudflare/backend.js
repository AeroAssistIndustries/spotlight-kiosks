/* CityPulse kiosk back end: live content, logos and photos, and visit counts for every kiosk.
   Uses a Cloudflare D1 database bound to this worker as DB (free plan). Without DB the worker still runs the AI
   concierge and the kiosks use the content built into the site.

   Public (kiosks and guests' phones):
     GET  /content?venue=lexen&k=<kiosk>&have=<version>   current content for the kiosk (also tells us the kiosk is online)
     GET  /media/<id>                                    an uploaded logo or photo
     POST /event                                         visit counts from a kiosk (counts only, nothing personal)
     GET  /go/<venue>/<ad|place|guide>/<id>?k=<kiosk>    QR code link: counts the scan, then opens the real page
   Staff (password protected, see admin-page.js):
     /admin and /admin/api/... */

import { ADMIN_HTML, ADMIN_JS, ADMIN_BRAND } from "./admin-page.js";

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS content (venue TEXT PRIMARY KEY, json TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS history (venue TEXT NOT NULL, version INTEGER NOT NULL, json TEXT NOT NULL, saved_at TEXT NOT NULL, note TEXT, PRIMARY KEY (venue, version))",
  "CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, venue TEXT, type TEXT NOT NULL, b64 TEXT NOT NULL, bytes INTEGER, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS events (day TEXT NOT NULL, venue TEXT NOT NULL, kiosk TEXT NOT NULL, type TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, venue, kiosk, type, key))",
  "CREATE TABLE IF NOT EXISTS kiosks (venue TEXT NOT NULL, kiosk TEXT NOT NULL, first_seen TEXT, last_seen TEXT NOT NULL, version INTEGER, ua TEXT, PRIMARY KEY (venue, kiosk))"
];
const EVENT_TYPES = ["sessions", "categories", "places", "questions", "takeHome", "adShown", "adEngaged", "adReach", "qr"];
const ICONS = ["fork", "bell", "coffee", "spark", "bag", "car", "home", "pin", "star", "walk", "phone", "chat", "sun"];
const MAX_MEDIA = 1024 * 1024, MAX_CONTENT = 300 * 1024, HISTORY_KEEP = 40;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/, KIOSK_RE = /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/, DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const enc = new TextEncoder();
const nowIso = () => new Date().toISOString();
const hasDB = env => !!(env && env.DB && typeof env.DB.prepare === "function");
export const dayKey = (tz, d) => new Intl.DateTimeFormat("en-CA", { timeZone: tz || "America/Los_Angeles" }).format(d || new Date());

let schemaReady = null;
function ensure(env) {
  if (!schemaReady) schemaReady = env.DB.batch(SCHEMA.map(s => env.DB.prepare(s))).catch(e => { schemaReady = null; throw e; });
  return schemaReady;
}

/* ---------- content ---------- */
const contentCache = new Map(); /* venue -> { at, version, data, updated_at } */
export function venueId(env) { return (env && env.VENUE_ID) || "lexen"; }

export async function getContent(env, venue, fetchSeed) {
  const c = contentCache.get(venue);
  if (c && Date.now() - c.at < 30000) return c;
  await ensure(env);
  let row = await env.DB.prepare("SELECT json, version, updated_at FROM content WHERE venue = ?").bind(venue).first();
  if (!row && venue === venueId(env) && fetchSeed) {
    /* First run: copy the content from the website into the database. */
    const seed = await fetchSeed();
    if (seed && seed.id === venue) {
      if (!seed.sponsors) seed.sponsors = [];
      seed.sponsors.forEach(s => { if (!s.id) s.id = slug(s.item || s.name); if (s.active === undefined) s.active = true; });
      const json = JSON.stringify(seed), t = nowIso();
      await env.DB.batch([
        env.DB.prepare("INSERT OR IGNORE INTO content (venue, json, version, updated_at) VALUES (?, ?, 1, ?)").bind(venue, json, t),
        env.DB.prepare("INSERT OR IGNORE INTO history (venue, version, json, saved_at, note) VALUES (?, 1, ?, ?, ?)").bind(venue, json, t, "Starting content from the website")
      ]);
      row = await env.DB.prepare("SELECT json, version, updated_at FROM content WHERE venue = ?").bind(venue).first();
    }
  }
  if (!row) return null;
  const out = { at: Date.now(), version: row.version, data: JSON.parse(row.json), updated_at: row.updated_at };
  contentCache.set(venue, out);
  return out;
}

export function slug(s) {
  return String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "x";
}

/* ---------- checking what staff save ---------- */
class Bad extends Error {}
const bad = msg => { throw new Bad(msg); };
function str(v, max, label, required) {
  const s = v == null ? "" : String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (required && !s) bad(`${label} is empty.`);
  if (s.length > max) bad(`${label} is too long (${s.length} characters, the limit is ${max}).`);
  return s;
}
function img(v, label, required) {
  const s = str(v, 200, label, required);
  if (!s) return "";
  if (/^media:[a-f0-9]{24,64}$/.test(s)) return s;
  if (/^[a-z0-9][a-z0-9_/.-]{0,150}\.(png|jpe?g|webp)$/i.test(s) && !s.includes("..")) return s;
  return bad(`${label}: upload the image again.`);
}
function https(v, label, required) {
  const s = str(v, 500, label, required);
  if (!s) return "";
  let u; try { u = new URL(s); } catch (e) { bad(`${label} is not a web address. It should start with https://`); }
  if (u.protocol !== "https:" || !u.hostname.includes(".") || u.username || u.password) bad(`${label} must be a full https:// web address.`);
  return u.href;
}
function ll(v, label, required) {
  if ((v == null || v === "" || (Array.isArray(v) && v.every(x => x === "" || x == null))) && !required) return null;
  if (!Array.isArray(v) || v.length !== 2) bad(`${label}: enter latitude and longitude.`);
  const a = Number(v[0]), b = Number(v[1]);
  if (!isFinite(a) || !isFinite(b) || Math.abs(a) > 90 || Math.abs(b) > 180) bad(`${label}: latitude and longitude are not valid numbers.`);
  return [Math.round(a * 1e7) / 1e7, Math.round(b * 1e7) / 1e7];
}

export function validateContent(input, prev) {
  if (!input || typeof input !== "object") bad("Nothing to save.");
  const out = {
    id: prev.id, /* fixed */
    name: str(input.name, 80, "Hotel name", true),
    short: str(input.short || input.name, 80, "Short name", true),
    address: str(input.address, 160, "Address", true),
    ll: ll(input.ll, "Hotel location", true),
    tz: prev.tz || "America/Los_Angeles",
    ai: prev.ai, /* fixed: the kiosk's own relay address */
    phone: str(input.phone, 30, "Phone", true),
    tel: str(input.tel, 20, "Tap-to-call number", true),
    email: str(input.email, 120, "Email", true),
    logo: img(input.logo, "Hotel logo", true),
    photos: [], tiles: [], categories: {}, items: {}, sponsors: [], faq: []
  };
  if (!/^[\d\s()+.\-]{7,30}$/.test(out.phone)) bad("Phone: use digits, spaces, brackets and dashes only.");
  if (!/^\+?\d{7,15}$/.test(out.tel)) bad("Tap-to-call number: digits only, for example +18188213680.");
  if (!/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(out.email)) bad("Email address is not valid.");

  const photos = Array.isArray(input.photos) ? input.photos : [];
  if (!photos.length) bad("Add at least one background photo.");
  if (photos.length > 8) bad("Use 8 background photos or fewer.");
  out.photos = photos.map((p, i) => img(p, `Background photo ${i + 1}`, true));

  /* places and hotel services */
  const items = input.items && typeof input.items === "object" ? input.items : {};
  const ids = Object.keys(items);
  if (ids.length > 200) bad("Too many places (the limit is 200).");
  for (const id of ids) {
    if (!ID_RE.test(id)) bad(`Place id "${id}" is not valid.`);
    const it = items[id] || {}, label = `Place "${str(it.n, 200, "Name") || id}"`;
    const o = { n: str(it.n, 80, `${label}: name`, true), k: str(it.k, 80, `${label}: type`, true) };
    if (it.hotel) o.hotel = 1;
    else {
      o.addr = str(it.addr, 160, `${label}: address`, true);
      o.ll = ll(it.ll, `${label}: location`, true);
      const price = str(it.price, 8, `${label}: price`);
      if (price) { if (!/^\${1,4}$/.test(price)) bad(`${label}: price should be $, $$, $$$ or $$$$.`); o.price = price; }
    }
    o.d = str(it.d, 400, `${label}: description`, true);
    const f = Array.isArray(it.f) ? it.f : [];
    if (f.length > 8) bad(`${label}: use 8 details or fewer.`);
    o.f = f.map(r => [str(r && r[0], 30, `${label}: detail name`, true), str(r && r[1], 80, `${label}: detail`, true)]);
    out.items[id] = o;
  }

  /* sections (categories) */
  const cats = input.categories && typeof input.categories === "object" ? input.categories : {};
  for (const [key, c] of Object.entries(cats)) {
    if (!ID_RE.test(key)) bad(`Section id "${key}" is not valid.`);
    const label = str(c && c.label, 40, "Section name", true);
    const list = (Array.isArray(c && c.items) ? c.items : []).filter(id => out.items[id]);
    out.categories[key] = { label, icon: ICONS.includes(c.icon) ? c.icon : "pin", intro: str(c.intro, 200, `${label}: intro`), items: [...new Set(list)] };
  }
  if (!Object.keys(out.categories).length) bad("At least one section is needed.");

  /* home screen buttons */
  for (const t of (Array.isArray(input.tiles) ? input.tiles : []).slice(0, 8)) {
    if (!t || !out.categories[t.id]) continue;
    const o = { id: t.id, label: str(t.label, 30, "Button name", true), sub: str(t.sub, 60, `${t.label}: subtitle`), icon: ICONS.includes(t.icon) ? t.icon : out.categories[t.id].icon };
    if (t.photo) o.photo = img(t.photo, `${o.label}: photo`);
    out.tiles.push(o);
  }
  if (!out.tiles.length) bad("At least one home screen button is needed.");

  /* sponsored ads */
  const seen = new Set();
  const sp = Array.isArray(input.sponsors) ? input.sponsors : [];
  if (sp.length > 20) bad("Use 20 ads or fewer.");
  for (const s of sp) {
    const name = str(s && s.name, 60, "Ad: business name", true), label = `Ad "${name}"`;
    let id = s.id && ID_RE.test(s.id) ? s.id : slug(name);
    while (seen.has(id)) id = id.slice(0, 36) + "-" + Math.floor(Math.random() * 900 + 100);
    seen.add(id);
    out.sponsors.push({
      id, name,
      kind: str(s.kind, 50, `${label}: what it is`),
      tagline: str(s.tagline, 110, `${label}: tagline`, true),
      website: str(s.website, 60, `${label}: website shown`),
      url: https(s.url, `${label}: QR code link`, true),
      item: s.item && out.items[s.item] ? s.item : undefined,
      logo: img(s.logo, `${label}: logo`) || undefined,
      sponsored: true,
      active: s.active !== false
    });
  }

  /* concierge answers */
  const faq = Array.isArray(input.faq) ? input.faq : [];
  if (faq.length > 80) bad("Use 80 answers or fewer.");
  for (const f of faq) {
    const q = str(f && f.q, 120, "Answer: question", true);
    const keys = (Array.isArray(f.keys) ? f.keys : String(f.keys || "").split(",")).map(k => str(k, 40, `"${q}": keyword`).toLowerCase()).filter(Boolean);
    if (!keys.length) bad(`"${q}": add at least one keyword.`);
    if (keys.length > 20) bad(`"${q}": use 20 keywords or fewer.`);
    out.faq.push({ q, keys, a: str(f.a, 500, `"${q}": answer`, true), items: (Array.isArray(f.items) ? f.items : []).filter(id => out.items[id]).slice(0, 6) });
  }

  const size = JSON.stringify(out).length;
  if (size > MAX_CONTENT) bad("The content is too large to save.");
  return out;
}

/* ---------- staff sign-in ---------- */
const COOKIE = "cp_admin";
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function hmacKey(env) {
  return crypto.subtle.importKey("raw", enc.encode("citypulse-admin|" + env.ADMIN_PASSWORD), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function sameSecret(a, b) {
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let diff = 0; for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}
async function signedIn(req, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (req.headers.get("Cookie") || "").match(/(?:^|;\s*)cp_admin=([0-9]+)\.([A-Za-z0-9_-]+)/);
  if (!m || +m[1] < Date.now()) return false;
  try { return await crypto.subtle.verify("HMAC", await hmacKey(env), fromB64url(m[2]), enc.encode(m[1])); } catch (e) { return false; }
}
const tries = new Map();
function tooManyTries(ip) {
  const now = Date.now(), list = (tries.get(ip) || []).filter(t => now - t < 15 * 60000);
  tries.set(ip, list);
  return list.length >= 8;
}

/* ---------- helpers ---------- */
function headersFor(origin, extra) {
  const h = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...(extra || {}) };
  if (origin) Object.assign(h, { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400", "Vary": "Origin" });
  return h;
}
const send = (status, obj, origin, extra) => new Response(JSON.stringify(obj), { status, headers: headersFor(origin, extra) });

const evHits = new Map();
function eventLimited(ip) {
  const now = Date.now(), list = (evHits.get(ip) || []).filter(t => now - t < 600000);
  list.push(now); evHits.set(ip, list);
  if (evHits.size > 5000) evHits.clear();
  return list.length > 40;
}

function mapsUrl(v, it) {
  const R = 3958.8, r = d => d * Math.PI / 180;
  let walk = false;
  if (it.ll && v.ll) {
    const x = Math.sin(r(it.ll[0] - v.ll[0]) / 2) ** 2 + Math.cos(r(v.ll[0])) * Math.cos(r(it.ll[0])) * Math.sin(r(it.ll[1] - v.ll[1]) / 2) ** 2;
    walk = 2 * R * Math.asin(Math.sqrt(x)) <= 1.2;
  }
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(it.n + " " + String(it.addr || "").replace(/, CA \d{5}$/, ", CA")) + (walk ? "&travelmode=walking" : "");
}

async function count(env, venue, kiosk, type, key, n) {
  await ensure(env);
  await env.DB.prepare("INSERT INTO events (day, venue, kiosk, type, key, n) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (day, venue, kiosk, type, key) DO UPDATE SET n = n + excluded.n")
    .bind(...[dayKey(), venue, kiosk, type, key, n]).run();
}

function guideBase(env) {
  return (env.GUIDE_URL || "https://aeroassistindustries.github.io/spotlight-kiosks/concierge/").replace(/\/?$/, "/");
}
export function assetsBase(env) {
  const v = env.VENUE_URL || "https://aeroassistindustries.github.io/spotlight-kiosks/assets/lexen-data.json";
  return v.slice(0, v.lastIndexOf("/") + 1);
}

/* ---------- requests ---------- */
/* Returns a Response, or null when the path is not handled here. */
export async function handle(req, env, ctx, { origin, allowedOrigin, fetchSeed, onContentSaved }) {
  if (req.method === "OPTIONS") return null; /* preflight is answered by the main worker */
  const url = new URL(req.url), path = url.pathname;
  const isAdmin = path === "/admin" || path === "/admin/" || path.startsWith("/admin/");
  const isPublic = path === "/content" || path === "/event" || path.startsWith("/media/") || path.startsWith("/go/");
  if (!isAdmin && !isPublic) return null;

  if (isAdmin) return admin(req, env, ctx, url, fetchSeed, onContentSaved);
  if (!hasDB(env) && !path.startsWith("/go/")) return send(503, { error: "back end not set up" }, allowedOrigin ? origin : "");

  const venue = url.searchParams.get("venue") || venueId(env);

  if (path === "/content" && req.method === "GET") {
    if (!allowedOrigin) return send(403, { error: "origin not allowed" });
    if (!ID_RE.test(venue)) return send(400, { error: "bad venue" }, origin);
    const c = await getContent(env, venue, fetchSeed);
    if (!c) return send(404, { error: "no content" }, origin);
    const kiosk = url.searchParams.get("k") || "";
    if (KIOSK_RE.test(kiosk)) {
      const t = nowIso(), ua = (req.headers.get("User-Agent") || "").slice(0, 160);
      ctx.waitUntil(env.DB.prepare("INSERT INTO kiosks (venue, kiosk, first_seen, last_seen, version, ua) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (venue, kiosk) DO UPDATE SET last_seen = excluded.last_seen, version = excluded.version, ua = excluded.ua")
        .bind(venue, kiosk, t, t, +url.searchParams.get("have") || 0, ua).run().catch(() => {}));
    }
    if (+url.searchParams.get("have") === c.version) return send(200, { version: c.version, same: true }, origin);
    return send(200, { version: c.version, data: c.data }, origin);
  }

  if (path.startsWith("/media/") && req.method === "GET") {
    const id = path.slice(7);
    if (!/^[a-f0-9]{24,64}$/.test(id)) return new Response("Not found", { status: 404 });
    await ensure(env);
    const row = await env.DB.prepare("SELECT type, b64 FROM media WHERE id = ?").bind(id).first();
    if (!row) return new Response("Not found", { status: 404 });
    const bytes = Uint8Array.from(atob(row.b64), c => c.charCodeAt(0));
    return new Response(bytes, { headers: { "Content-Type": row.type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox", "Access-Control-Allow-Origin": "*", "Cross-Origin-Resource-Policy": "cross-origin" } });
  }

  if (path === "/event" && req.method === "POST") {
    if (!allowedOrigin) return send(403, { error: "origin not allowed" });
    if (eventLimited(req.headers.get("CF-Connecting-IP") || "local")) return send(429, { error: "busy" }, origin);
    const text = await req.text();
    if (text.length > 20000) return send(413, { error: "too large" }, origin);
    let body; try { body = JSON.parse(text); } catch (e) { return send(400, { error: "bad request" }, origin); }
    const v = ID_RE.test(body && body.venue) ? body.venue : "";
    const kiosk = KIOSK_RE.test(body && body.kiosk) ? body.kiosk : "";
    if (!v || !kiosk || !body.days || typeof body.days !== "object") return send(400, { error: "bad request" }, origin);
    const today = Date.now(), rows = [];
    for (const [day, types] of Object.entries(body.days)) {
      if (!DAY_RE.test(day) || Math.abs(Date.parse(day + "T12:00:00Z") - today) > 4 * 86400000 || !types || typeof types !== "object") continue;
      for (const [type, keys] of Object.entries(types)) {
        if (!EVENT_TYPES.includes(type) || type === "qr" || !keys || typeof keys !== "object") continue;
        for (const [key, n] of Object.entries(keys)) {
          const k = String(key).slice(0, 80), num = Math.floor(+n);
          if (!k || !(num > 0)) continue;
          rows.push([day, v, kiosk, type, k, Math.min(num, 500)]);
        }
      }
    }
    if (rows.length > 300) return send(413, { error: "too many" }, origin);
    if (rows.length) {
      await ensure(env);
      const st = env.DB.prepare("INSERT INTO events (day, venue, kiosk, type, key, n) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (day, venue, kiosk, type, key) DO UPDATE SET n = n + excluded.n");
      await env.DB.batch(rows.map(r => st.bind(...r)));
    }
    return send(200, { ok: true, saved: rows.length }, origin);
  }

  if (path.startsWith("/go/") && req.method === "GET") {
    const [, , v, kind, rawId] = path.split("/");
    const id = decodeURIComponent(rawId || "");
    const fallback = guideBase(env) + "?v=" + encodeURIComponent(ID_RE.test(v || "") ? v : venueId(env));
    const go = to => new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
    if (!ID_RE.test(v || "") || !["ad", "place", "guide"].includes(kind)) return go(fallback);
    let c = null;
    try { c = hasDB(env) ? await getContent(env, v, fetchSeed) : { data: await fetchSeed() }; } catch (e) { /* database busy: still send the guest somewhere useful */ }
    if (c && (!c.data || c.data.id !== v)) c = null;
    if (!c) return go(fallback);
    let to = null;
    if (kind === "ad") { const s = (c.data.sponsors || []).find(x => x.id === id); if (s) to = s.url; }
    else if (kind === "place") { const it = c.data.items[id]; if (it && it.ll) to = mapsUrl(c.data, it); }
    else to = fallback + (id && c.data.items[id] ? "#" + encodeURIComponent(id) : "");
    if (!to) return go(fallback);
    const kiosk = KIOSK_RE.test(url.searchParams.get("k") || "") ? url.searchParams.get("k") : "unknown";
    if (hasDB(env) && !/bot|crawler|spider|preview|facebookexternalhit|slackbot/i.test(req.headers.get("User-Agent") || ""))
      ctx.waitUntil(count(env, v, kiosk, "qr", `${kind}:${id || "guide"}`, 1).catch(() => {}));
    return go(to);
  }

  return send(404, { error: "not found" }, allowedOrigin ? origin : "");
}

/* ---------- staff dashboard ---------- */
const PAGE_HEADERS = {
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store"
};

async function admin(req, env, ctx, url, fetchSeed, onContentSaved) {
  const path = url.pathname.replace(/\/$/, "") || "/admin";
  if (path === "/admin" && req.method === "GET")
    return new Response(ADMIN_HTML, { headers: { "Content-Type": "text/html; charset=utf-8", ...PAGE_HEADERS } });
  if (path === "/admin/app.js" && req.method === "GET")
    return new Response(ADMIN_JS, { headers: { "Content-Type": "text/javascript; charset=utf-8", ...PAGE_HEADERS } });
  if (path.startsWith("/admin/brand/") && req.method === "GET") {
    const svg = ADMIN_BRAND[path.slice(13)];
    if (svg) return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } });
  }
  if (!path.startsWith("/admin/api/")) return new Response("Not found", { status: 404 });

  /* Every staff request must come from the dashboard page itself. */
  const from = req.headers.get("Origin");
  if (req.method !== "GET" && (from !== url.origin || req.headers.get("X-CP") !== "1")) return send(403, { error: "Not allowed." });
  const api = path.slice(11);

  if (api === "status") return send(200, { setup: { password: !!env.ADMIN_PASSWORD, database: hasDB(env) }, signedIn: await signedIn(req, env) });

  if (api === "login" && req.method === "POST") {
    if (!env.ADMIN_PASSWORD) return send(503, { error: "The staff password has not been set yet." });
    const ip = req.headers.get("CF-Connecting-IP") || "local";
    if (tooManyTries(ip)) return send(429, { error: "Too many tries. Wait 15 minutes and try again." });
    let body; try { body = await req.json(); } catch (e) { body = {}; }
    const pw = String((body && body.password) || "").slice(0, 200);
    if (!(await sameSecret(pw, env.ADMIN_PASSWORD))) {
      tries.get(ip).push(Date.now());
      await new Promise(r => setTimeout(r, 400));
      return send(401, { error: "That password is not right." });
    }
    const exp = String(Date.now() + 12 * 3600000);
    const sig = b64url(await crypto.subtle.sign("HMAC", await hmacKey(env), enc.encode(exp)));
    return send(200, { ok: true }, "", { "Set-Cookie": `${COOKIE}=${exp}.${sig}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` });
  }
  if (api === "logout" && req.method === "POST")
    return send(200, { ok: true }, "", { "Set-Cookie": `${COOKIE}=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });

  if (!(await signedIn(req, env))) return send(401, { error: "Please sign in again." });
  if (!hasDB(env)) return send(503, { error: "The database is not connected to the worker yet." });
  await ensure(env);
  const venue = venueId(env);

  if (api === "content" && req.method === "GET") {
    const c = await getContent(env, venue, fetchSeed);
    if (!c) return send(404, { error: "No content yet." });
    const hist = await env.DB.prepare("SELECT version, saved_at, note FROM history WHERE venue = ? ORDER BY version DESC LIMIT ?").bind(venue, HISTORY_KEEP).all();
    return send(200, { version: c.version, updated_at: c.updated_at, data: c.data, history: hist.results || [], assets: assetsBase(env), media: url.origin + "/media/" });
  }

  if (api === "content" && req.method === "PUT") {
    let body; try { body = JSON.parse(await req.text()); } catch (e) { return send(400, { error: "Could not read the changes." }); }
    const cur = await getContent(env, venue, fetchSeed);
    if (!cur) return send(404, { error: "No content yet." });
    if (+body.base !== cur.version) return send(409, { error: "Someone else published changes since you opened this page. Reload to see them, then make your changes again.", version: cur.version });
    let clean; try { clean = validateContent(body.data, cur.data); } catch (e) { if (e instanceof Bad) return send(422, { error: e.message }); throw e; }
    return save(env, venue, cur.version, clean, str(body.note, 120, "Note") || "Edited in the dashboard", onContentSaved);
  }

  if (api === "restore" && req.method === "POST") {
    let body; try { body = await req.json(); } catch (e) { body = {}; }
    const row = await env.DB.prepare("SELECT json FROM history WHERE venue = ? AND version = ?").bind(venue, +body.version || 0).first();
    if (!row) return send(404, { error: "That version is no longer kept." });
    const cur = await getContent(env, venue, fetchSeed);
    return save(env, venue, cur.version, JSON.parse(row.json), `Restored version ${+body.version}`, onContentSaved);
  }

  if (api === "media" && req.method === "POST") {
    const type = (req.headers.get("Content-Type") || "").split(";")[0].trim();
    if (!["image/png", "image/jpeg", "image/webp"].includes(type)) return send(415, { error: "Use a PNG, JPG or WebP image." });
    const buf = new Uint8Array(await req.arrayBuffer());
    if (!buf.length) return send(400, { error: "The image is empty." });
    if (buf.length > MAX_MEDIA) return send(413, { error: "The image is larger than 1 MB." });
    const magic = type === "image/png" ? buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
      : type === "image/jpeg" ? buf[0] === 0xff && buf[1] === 0xd8
      : buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45;
    if (!magic) return send(415, { error: "That file is not a real image." });
    const id = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
    let bin = ""; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    await env.DB.prepare("INSERT OR IGNORE INTO media (id, venue, type, b64, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, venue, type, btoa(bin), buf.length, nowIso()).run();
    return send(200, { ref: "media:" + id, url: url.origin + "/media/" + id });
  }

  if (api === "stats" && req.method === "GET") {
    const c = await getContent(env, venue, fetchSeed);
    const tz = (c && c.data.tz) || "America/Los_Angeles";
    const days = Math.min(Math.max(+url.searchParams.get("days") || 7, 1), 365);
    const from = dayKey(tz, new Date(Date.now() - (days - 1) * 86400000)), to = dayKey(tz);
    const kiosk = url.searchParams.get("kiosk") || "";
    const where = "venue = ? AND day >= ?" + (KIOSK_RE.test(kiosk) ? " AND kiosk = ?" : "");
    const args = KIOSK_RE.test(kiosk) ? [venue, from, kiosk] : [venue, from];
    const [byKey, byDay, kiosks] = await env.DB.batch([
      env.DB.prepare(`SELECT type, key, SUM(n) AS n FROM events WHERE ${where} GROUP BY type, key ORDER BY n DESC`).bind(...args),
      env.DB.prepare(`SELECT day, type, SUM(n) AS n FROM events WHERE ${where} GROUP BY day, type ORDER BY day`).bind(...args),
      env.DB.prepare("SELECT kiosk, first_seen, last_seen, version, ua FROM kiosks WHERE venue = ? ORDER BY last_seen DESC").bind(venue)
    ]);
    return send(200, { from, to, days, tz, now: nowIso(), version: c ? c.version : 0, byKey: byKey.results || [], byDay: byDay.results || [], kiosks: kiosks.results || [] });
  }

  return send(404, { error: "Not found." });
}

async function save(env, venue, base, data, note, onContentSaved) {
  const next = base + 1, json = JSON.stringify(data), t = nowIso();
  const res = await env.DB.batch([
    env.DB.prepare("UPDATE content SET json = ?, version = ?, updated_at = ? WHERE venue = ? AND version = ?").bind(json, next, t, venue, base),
    env.DB.prepare("INSERT OR REPLACE INTO history (venue, version, json, saved_at, note) SELECT ?, ?, ?, ?, ? WHERE changes() > 0").bind(venue, next, json, t, note),
    env.DB.prepare("DELETE FROM history WHERE venue = ? AND version <= ?").bind(venue, next - HISTORY_KEEP)
  ]);
  if (!res[0].meta || !res[0].meta.changes) return send(409, { error: "Someone else published changes at the same moment. Reload and try again." });
  contentCache.delete(venue);
  if (onContentSaved) onContentSaved();
  return send(200, { ok: true, version: next, updated_at: t, data });
}
