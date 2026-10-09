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
  "CREATE TABLE IF NOT EXISTS kiosks (venue TEXT NOT NULL, kiosk TEXT NOT NULL, first_seen TEXT, last_seen TEXT NOT NULL, version INTEGER, ua TEXT, PRIMARY KEY (venue, kiosk))",
  /* advertiser deal details: staff only, never sent to kiosks */
  "CREATE TABLE IF NOT EXISTS deals (venue TEXT NOT NULL, sponsor TEXT NOT NULL, json TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (venue, sponsor))",
  /* staff notes and to-dos (dashboard only) */
  "CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, venue TEXT NOT NULL, text TEXT NOT NULL, color TEXT, pinned INTEGER DEFAULT 0, done INTEGER DEFAULT 0, todo INTEGER DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"
];
const EVENT_TYPES = ["sessions", "hours", "categories", "places", "questions", "takeHome", "adShown", "adEngaged", "adReach", "qr"];
const ICONS = ["fork", "bell", "coffee", "spark", "bag", "car", "home", "pin", "star", "walk", "phone", "chat", "sun"];
const MAX_MEDIA = 1024 * 1024, MAX_CONTENT = 300 * 1024, HISTORY_KEEP = 40;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/, KIOSK_RE = /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/, DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const enc = new TextEncoder();
const nowIso = () => new Date().toISOString();
const hasDB = env => !!(env && env.DB && typeof env.DB.prepare === "function");
export const dayKey = (tz, d) => new Intl.DateTimeFormat("en-CA", { timeZone: tz || "America/Los_Angeles" }).format(d || new Date());

let schemaReady = null;
/* Columns added after the first release; adding one that already exists fails harmlessly. */
const UPGRADES = ["ALTER TABLE kiosks ADD COLUMN screen TEXT", "ALTER TABLE kiosks ADD COLUMN app TEXT", "ALTER TABLE kiosks ADD COLUMN reload_at TEXT"];
function ensure(env) {
  if (!schemaReady) schemaReady = env.DB.batch(SCHEMA.map(s => env.DB.prepare(s)))
    .then(() => Promise.all(UPGRADES.map(u => env.DB.prepare(u).run().catch(() => null))))
    .catch(e => { schemaReady = null; throw e; });
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
function date(v, label) {
  const s = str(v, 10, label);
  if (!s) return undefined;
  if (!DAY_RE.test(s) || isNaN(Date.parse(s + "T12:00:00Z"))) bad(`${label} is not a valid date.`);
  return s;
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
      active: s.active !== false,
      start: date(s.start, `${label}: start date`),
      end: date(s.end, `${label}: end date`)
    });
    const last = out.sponsors[out.sponsors.length - 1];
    if (last.start && last.end && last.end < last.start) bad(`${label}: the end date is before the start date.`);
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

  /* announcements shown on the kiosk */
  const notices = Array.isArray(input.notices) ? input.notices : [];
  if (notices.length > 10) bad("Use 10 announcements or fewer.");
  out.notices = notices.map((n, i) => {
    const text = str(n && n.text, 120, `Announcement ${i + 1}`, true), label = `Announcement "${text.slice(0, 30)}"`;
    const o = { id: n.id && ID_RE.test(n.id) ? n.id : "n" + Date.now().toString(36) + i, text, active: n.active !== false, start: date(n.start, `${label}: start date`), end: date(n.end, `${label}: end date`) };
    if (o.start && o.end && o.end < o.start) bad(`${label}: the end date is before the start date.`);
    return o;
  });

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
  const isPublic = path === "/content" || path === "/event" || path.startsWith("/media/") || path.startsWith("/go/") || path.startsWith("/r/");
  if (!isAdmin && !isPublic) return null;

  if (isAdmin) return admin(req, env, ctx, url, fetchSeed, onContentSaved);
  if (path.startsWith("/r/") && req.method === "GET") return sharedReport(env, url, fetchSeed);
  if (!hasDB(env) && !path.startsWith("/go/")) return send(503, { error: "back end not set up" }, allowedOrigin ? origin : "");

  const venue = url.searchParams.get("venue") || venueId(env);

  if (path === "/content" && req.method === "GET") {
    if (!allowedOrigin) return send(403, { error: "origin not allowed" });
    if (!ID_RE.test(venue)) return send(400, { error: "bad venue" }, origin);
    const c = await getContent(env, venue, fetchSeed);
    if (!c) return send(404, { error: "no content" }, origin);
    const kiosk = url.searchParams.get("k") || "";
    let reload = false;
    if (KIOSK_RE.test(kiosk)) {
      /* "Refresh now" from the dashboard: reload once if the request is newer than when this kiosk page started */
      await ensure(env);
      const row = await env.DB.prepare("SELECT reload_at FROM kiosks WHERE venue = ? AND kiosk = ?").bind(venue, kiosk).first().catch(() => null);
      const booted = +url.searchParams.get("boot") || 0;
      if (row && row.reload_at && booted && booted < Date.parse(row.reload_at)) reload = true;
      const t = nowIso(), ua = (req.headers.get("User-Agent") || "").slice(0, 160);
      const screen = /^\d{2,5}x\d{2,5}$/.test(url.searchParams.get("s") || "") ? url.searchParams.get("s") : null;
      const app = /^[\w.-]{1,16}$/.test(url.searchParams.get("app") || "") ? url.searchParams.get("app") : null;
      ctx.waitUntil(env.DB.prepare("INSERT INTO kiosks (venue, kiosk, first_seen, last_seen, version, ua, screen, app) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (venue, kiosk) DO UPDATE SET last_seen = excluded.last_seen, version = excluded.version, ua = excluded.ua, screen = excluded.screen, app = excluded.app")
        .bind(venue, kiosk, t, t, +url.searchParams.get("have") || 0, ua, screen, app).run().catch(() => {}));
    }
    if (+url.searchParams.get("have") === c.version) return send(200, { version: c.version, same: true, reload }, origin);
    return send(200, { version: c.version, data: c.data, reload }, origin);
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
    if (!ID_RE.test(v || "") || !["ad", "place", "guide", "plan"].includes(kind)) return go(fallback);
    let c = null;
    try { c = hasDB(env) ? await getContent(env, v, fetchSeed) : { data: await fetchSeed() }; } catch (e) { /* database busy: still send the guest somewhere useful */ }
    if (c && (!c.data || c.data.id !== v)) c = null;
    if (!c) return go(fallback);
    let to = null;
    if (kind === "ad") { const s = (c.data.sponsors || []).find(x => x.id === id); if (s) to = s.url; }
    else if (kind === "place") { const it = c.data.items[id]; if (it && it.ll) to = mapsUrl(c.data, it); }
    else if (kind === "plan") {
      /* a walking plan from the kiosk: open all its stops as one Google Maps route */
      const its = id.split(".").slice(0, 5).map(x => c.data.items[x]).filter(it => it && it.ll);
      if (its.length) {
        const q = it => encodeURIComponent(it.n + " " + String(it.addr || "").replace(/, CA \d{5}$/, ", CA"));
        to = "https://www.google.com/maps/dir/?api=1&destination=" + q(its[its.length - 1]) + (its.length > 1 ? "&waypoints=" + its.slice(0, -1).map(q).join("%7C") : "") + "&travelmode=walking";
      }
    }
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

  /* Google Maps short links (maps.app.goo.gl/...) hide the coordinates; follow the redirect to find them. */
  if (api === "resolve-map" && req.method === "GET") {
    let u; try { u = new URL(url.searchParams.get("url") || ""); } catch (e) { return send(400, { error: "That is not a link." }); }
    const okHost = /^(maps\.app\.goo\.gl|goo\.gl|maps\.google\.com|www\.google\.com|google\.com)$/.test(u.hostname);
    if (u.protocol !== "https:" || !okHost) return send(400, { error: "Paste a Google Maps link." });
    let href = u.href;
    for (let i = 0; i < 4 && /goo\.gl$/.test(new URL(href).hostname); i++) {
      const r = await withTimeoutFetch(href);
      const loc = r && r.headers.get("Location");
      if (!loc) break;
      href = new URL(loc, href).href;
    }
    const ll = coordsFrom(href);
    if (!ll) return send(422, { error: "Couldn't find the location in that link. In Google Maps, right-click the place and copy the numbers instead." });
    return send(200, { ll, name: placeName(href) });
  }

  /* kiosk remote control */
  if (api === "kiosk-action" && req.method === "POST") {
    let body; try { body = await req.json(); } catch (e) { body = {}; }
    const k = String(body.kiosk || "");
    if (k !== "*" && !KIOSK_RE.test(k)) return send(400, { error: "Unknown kiosk." });
    if (body.action === "reload") {
      const r = k === "*" ? await env.DB.prepare("UPDATE kiosks SET reload_at = ? WHERE venue = ?").bind(nowIso(), venue).run()
        : await env.DB.prepare("UPDATE kiosks SET reload_at = ? WHERE venue = ? AND kiosk = ?").bind(nowIso(), venue, k).run();
      return send(200, { ok: true, kiosks: (r.meta && r.meta.changes) || 0 });
    }
    if (body.action === "remove" && k !== "*") {
      await env.DB.prepare("DELETE FROM kiosks WHERE venue = ? AND kiosk = ?").bind(venue, k).run();
      return send(200, { ok: true });
    }
    return send(400, { error: "Unknown action." });
  }

  /* advertiser deals (private) */
  if (api === "deals" && req.method === "GET") {
    const r = await env.DB.prepare("SELECT sponsor, json, updated_at FROM deals WHERE venue = ?").bind(venue).all();
    const deals = {}; (r.results || []).forEach(x => { try { deals[x.sponsor] = { ...JSON.parse(x.json), updated_at: x.updated_at }; } catch (e) { /* skip */ } });
    return send(200, { deals });
  }
  if (api === "deals" && req.method === "PUT") {
    let body; try { body = await req.json(); } catch (e) { body = {}; }
    if (!ID_RE.test(body.sponsor || "")) return send(400, { error: "Unknown ad." });
    let d; try { d = cleanDeal(body.deal || {}); } catch (e) { if (e instanceof Bad) return send(422, { error: e.message }); throw e; }
    const t = nowIso();
    await env.DB.prepare("INSERT INTO deals (venue, sponsor, json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (venue, sponsor) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at").bind(venue, body.sponsor, JSON.stringify(d), t).run();
    return send(200, { ok: true, deal: { ...d, updated_at: t } });
  }

  /* staff notes */
  if (api === "notes") {
    const COLORS = ["yellow", "teal", "pink", "blue", "gray"];
    if (req.method === "GET") {
      const r = await env.DB.prepare("SELECT id, text, color, pinned, done, todo, created_at, updated_at FROM notes WHERE venue = ? ORDER BY pinned DESC, updated_at DESC LIMIT 300").bind(venue).all();
      return send(200, { notes: r.results || [] });
    }
    let body; try { body = await req.json(); } catch (e) { body = {}; }
    if (req.method === "DELETE") {
      if (!/^[a-z0-9]{6,32}$/.test(body.id || "")) return send(400, { error: "Unknown note." });
      await env.DB.prepare("DELETE FROM notes WHERE venue = ? AND id = ?").bind(venue, body.id).run();
      return send(200, { ok: true });
    }
    let text; try { text = str(body.text, 2000, "Note", true); } catch (e) { if (e instanceof Bad) return send(422, { error: e.message }); throw e; }
    const color = COLORS.includes(body.color) ? body.color : "yellow", t = nowIso();
    const flags = [body.pinned ? 1 : 0, body.done ? 1 : 0, body.todo ? 1 : 0];
    if (req.method === "POST") {
      const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM notes WHERE venue = ?").bind(venue).first();
      if (n && n.n >= 300) return send(422, { error: "You have 300 notes. Delete some old ones first." });
      const id = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, "0")).join("");
      await env.DB.prepare("INSERT INTO notes (id, venue, text, color, pinned, done, todo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, venue, text, color, ...flags, t, t).run();
      return send(200, { note: { id, text, color, pinned: flags[0], done: flags[1], todo: flags[2], created_at: t, updated_at: t } });
    }
    if (req.method === "PUT") {
      if (!/^[a-z0-9]{6,32}$/.test(body.id || "")) return send(400, { error: "Unknown note." });
      await env.DB.prepare("UPDATE notes SET text = ?, color = ?, pinned = ?, done = ?, todo = ?, updated_at = ? WHERE venue = ? AND id = ?").bind(text, color, ...flags, t, venue, body.id).run();
      return send(200, { ok: true, updated_at: t });
    }
  }

  /* private link to an advertiser's own live report */
  if (api === "share" && req.method === "GET") {
    const sp = url.searchParams.get("sponsor") || "";
    if (!ID_RE.test(sp)) return send(400, { error: "Unknown ad." });
    return send(200, { url: `${url.origin}/r/${venue}/${sp}/${await shareToken(env, venue, sp)}` });
  }

  if (api === "stats" && req.method === "GET") {
    const c = await getContent(env, venue, fetchSeed);
    const tz = (c && c.data.tz) || "America/Los_Angeles";
    const days = Math.min(Math.max(+url.searchParams.get("days") || 7, 1), 365);
    const from = dayKey(tz, new Date(Date.now() - (days - 1) * 86400000)), to = dayKey(tz);
    const kiosk = url.searchParams.get("kiosk") || "";
    const where = "venue = ? AND day >= ?" + (KIOSK_RE.test(kiosk) ? " AND kiosk = ?" : "");
    const args = KIOSK_RE.test(kiosk) ? [venue, from, kiosk] : [venue, from];
    const prevFrom = dayKey(tz, new Date(Date.now() - (2 * days - 1) * 86400000));
    const prevWhere = "venue = ? AND day >= ? AND day < ?" + (KIOSK_RE.test(kiosk) ? " AND kiosk = ?" : "");
    const prevArgs = KIOSK_RE.test(kiosk) ? [venue, prevFrom, from, kiosk] : [venue, prevFrom, from];
    const [byKey, byDay, adDays, kiosks, prev] = await env.DB.batch([
      env.DB.prepare(`SELECT type, key, SUM(n) AS n FROM events WHERE ${where} GROUP BY type, key ORDER BY n DESC`).bind(...args),
      env.DB.prepare(`SELECT day, type, SUM(n) AS n FROM events WHERE ${where} GROUP BY day, type ORDER BY day`).bind(...args),
      env.DB.prepare(`SELECT day, type, key, SUM(n) AS n FROM events WHERE ${where} AND (type IN ('adShown', 'adEngaged', 'adReach') OR (type = 'qr' AND key LIKE 'ad:%')) GROUP BY day, type, key ORDER BY day`).bind(...args),
      env.DB.prepare("SELECT kiosk, first_seen, last_seen, version, ua, screen, app FROM kiosks WHERE venue = ? ORDER BY last_seen DESC").bind(venue),
      env.DB.prepare(`SELECT type, SUM(n) AS n FROM events WHERE ${prevWhere} GROUP BY type`).bind(...prevArgs)
    ]);
    return send(200, { from, to, days, tz, now: nowIso(), version: c ? c.version : 0, byKey: byKey.results || [], byDay: byDay.results || [], adDays: adDays.results || [], kiosks: kiosks.results || [], prev: Object.fromEntries((prev.results || []).map(r => [r.type, r.n])) });
  }

  return send(404, { error: "Not found." });
}

function cleanDeal(d) {
  const STAT = ["Active", "Pending", "Paused", "Ended"];
  const price = d.price === "" || d.price == null ? null : Number(d.price);
  if (price != null && (!isFinite(price) || price < 0 || price > 100000)) bad("Monthly price must be a number.");
  const email = str(d.email, 120, "Email");
  if (email && !/^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(email)) bad("Email address is not valid.");
  return { contact: str(d.contact, 80, "Contact name"), email, phone: str(d.phone, 30, "Phone"), price, status: STAT.includes(d.status) ? d.status : "Active", notes: str(d.notes, 1000, "Notes") };
}

async function shareToken(env, venue, sponsor) {
  const key = await crypto.subtle.importKey("raw", enc.encode("citypulse-share|" + (env.ADMIN_PASSWORD || "")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(venue + "|" + sponsor))).slice(0, 22);
}

const escH = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
/* The advertiser's own live report, opened from a private link (no sign-in). */
async function sharedReport(env, url, fetchSeed) {
  const [, , venue, sponsor, token] = url.pathname.split("/");
  const page = (status, body) => new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' https: data:; base-uri 'none'; form-action 'none'" } });
  const nope = page(404, "<!doctype html><meta charset=utf-8><title>Report not found</title><p style='font-family:system-ui;padding:40px'>This report link is not valid. Ask CityPulse Kiosks for a new one.</p>");
  if (!env.ADMIN_PASSWORD || !hasDB(env) || !ID_RE.test(venue || "") || !ID_RE.test(sponsor || "") || !token) return nope;
  const want = await shareToken(env, venue, sponsor);
  if (want.length !== token.length || !(await sameSecret(want, token))) return nope;
  const c = await getContent(env, venue, fetchSeed);
  const s = c && (c.data.sponsors || []).find(x => x.id === sponsor);
  if (!s) return nope;
  const v = c.data, tz = v.tz || "America/Los_Angeles";
  const days = [7, 30, 90].includes(+url.searchParams.get("days")) ? +url.searchParams.get("days") : 30;
  const list = []; for (let i = days - 1; i >= 0; i--) list.push(dayKey(tz, new Date(Date.now() - i * 86400000)));
  const r = await env.DB.prepare("SELECT day, type, SUM(n) AS n FROM events WHERE venue = ? AND day >= ? AND ((type IN ('adShown', 'adEngaged', 'adReach') AND (key = ? OR key = ?)) OR (type = 'qr' AND key = ?)) GROUP BY day, type").bind(venue, list[0], s.id, s.name, "ad:" + s.id).all();
  const rows = r.results || [];
  const per = type => list.map(d => rows.filter(x => x.day === d && x.type === type).reduce((a, x) => a + x.n, 0));
  const eng = per("adEngaged"), tot = per("adShown"), rch = per("adReach"), qrs = per("qr");
  const sum = a => a.reduce((x, y) => x + y, 0), fmt = n => Number(n).toLocaleString("en-US");
  const R = sum(rch), E = sum(eng), T = sum(tot), Q = sum(qrs);
  const nice = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const lab = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const max = Math.max(4, ...eng), W = 720, H = 150, bw = W / days, every = Math.ceil(days / 8);
  const bars = list.map((d, i) => { const w = Math.max(2, bw * 0.34), he = eng[i] / max * (H - 8), hq = qrs[i] / max * (H - 8);
    return `<rect x="${i * bw + bw / 2 - w - 1}" y="${H - he}" width="${w}" height="${he}" rx="2" fill="#0B7F74"><title>${lab(d)}: ${eng[i]} views with a guest</title></rect><rect x="${i * bw + bw / 2 + 1}" y="${H - hq}" width="${w}" height="${hq}" rx="2" fill="#0F1C2B"><title>${lab(d)}: ${qrs[i]} QR scans</title></rect>${i % every === 0 ? `<text x="${i === 0 ? 0 : i * bw + bw / 2}" y="${H + 15}" text-anchor="${i === 0 ? "start" : "middle"}">${lab(d)}</text>` : ""}`; }).join("");
  const logo = s.logo ? (s.logo.startsWith("media:") ? `${url.origin}/media/${s.logo.slice(6)}` : assetsBase(env) + s.logo) : "";
  const kpi = (l, n, sub) => `<div class="kpi"><span>${l}</span><b>${n}</b><small>${sub}</small></div>`;
  const seg = [7, 30, 90].map(d => d === days ? `<b>${d} days</b>` : `<a href="?days=${d}">${d} days</a>`).join("");
  return page(200, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${escH(s.name)} · Advertising report</title><link rel="icon" href="/admin/brand/favicon.svg">
<style>
:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;background:#f5f5f7}
body{margin:0;padding:24px 16px 60px}.r{max-width:900px;margin:0 auto;background:#fff;border-radius:20px;padding:34px 38px;box-shadow:0 6px 24px rgba(0,0,0,.06)}
.h{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:16px;border-bottom:3px solid #16B8A8}.h img{height:42px}
.t{text-align:right}.t span{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0B7F74}.t b{font-size:15px}
.biz{display:flex;gap:20px;align-items:center;margin:24px 0 18px}.lg{width:120px;height:90px;border:1px solid #d2d2d7;border-radius:14px;display:grid;place-items:center;padding:10px;flex:none}.lg img{max-width:100%;max-height:100%}
h1{font-size:28px;margin:0;letter-spacing:-.02em}.biz p{color:#6e6e73;margin:4px 0 0}
.seg{display:flex;gap:6px;margin:0 0 18px;font-size:14px}.seg a,.seg b{padding:6px 12px;border-radius:999px;background:#e8e8ed;color:#1d1d1f;text-decoration:none}.seg b{background:#0B7F74;color:#fff}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.kpi{border:1px solid #e8e8ed;border-radius:14px;padding:14px 16px}.kpi span{color:#6e6e73;font-size:13px}.kpi b{display:block;font-size:30px;margin:2px 0;letter-spacing:-.03em}.kpi small{color:#6e6e73;font-size:12px}
h2{font-size:18px;margin:28px 0 8px}svg{width:100%;height:auto;display:block}svg text{fill:#6e6e73;font-size:11px}.lgd{font-size:13px;color:#6e6e73;display:flex;gap:16px}.lgd i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}
.f{margin-top:28px;padding-top:14px;border-top:1px solid #e8e8ed;color:#6e6e73;font-size:13px}
@media(max-width:700px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.r{padding:22px 18px}.h img{height:32px}}
@media print{body{background:#fff;padding:0}.r{box-shadow:none;padding:0}.seg{display:none}}
</style></head><body><article class="r">
<header class="h"><img src="/admin/brand/logo.svg" alt="CityPulse Kiosks"><div class="t"><span>Advertising report</span><b>${escH(nice(list[0]))} – ${escH(nice(list[list.length - 1]))}</b></div></header>
<div class="biz">${logo ? `<div class="lg"><img src="${escH(logo)}" alt=""></div>` : ""}<div><h1>${escH(s.name)}</h1><p>Featured on the CityPulse concierge kiosk at ${escH(v.name)}, ${escH(v.address)}</p></div></div>
<nav class="seg" aria-label="Period">${seg}</nav>
<div class="kpis">${kpi("Guests reached", fmt(R), "Guest sessions that saw your ad")}${kpi("Views with a guest", fmt(E), "Ad on screen while a guest used the kiosk")}${kpi("Total views", fmt(T), "Every time your ad came on screen")}${kpi("QR scans", fmt(Q), R ? (Q / R * 100).toFixed(1) + " per 100 guests reached" : "Phones that opened your link")}</div>
<h2>Day by day</h2><div class="lgd"><span><i style="background:#0B7F74"></i>Views with a guest</span><span><i style="background:#0F1C2B"></i>QR scans</span></div>
<svg viewBox="0 0 ${W} ${H + 20}" role="img" aria-label="Views with a guest and QR scans per day">${bars}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="#000" stroke-opacity=".12"/></svg>
<p class="f"><b>How we count.</b> Ads rotate every 8 seconds. A view with a guest is counted when your ad is on screen while someone is using the kiosk; each guest session counts once toward guests reached. QR scans are counted when a phone opens your ad's QR code. Figures update every few minutes. No personal information is collected.<br><br>Prepared by CityPulse Kiosks · citypulsekiosks.com</p>
</article></body></html>`);
}

async function withTimeoutFetch(href) {
  try { return await Promise.race([fetch(href, { redirect: "manual" }), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000))]); }
  catch (e) { return null; }
}
export function coordsFrom(href) {
  const s = decodeURIComponent(href);
  const pats = [/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|query|ll|destination|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/];
  for (const re of pats) {
    const m = s.match(re);
    if (m) { const a = +m[1], b = +m[2]; if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b]; }
  }
  return null;
}
function placeName(href) {
  const m = decodeURIComponent(href).match(/\/place\/([^/@?]+)/);
  return m ? m[1].replace(/\+/g, " ").slice(0, 80) : "";
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
