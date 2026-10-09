/* CityPulse Sales Studio: the call-center CRM, served by this worker at /sales.

   Uses the same D1 database (binding DB) as the kiosk dashboard, in its own crm_* tables.
   Sign-in is per person (username + password). The first admin is created with the staff dashboard password.

   Secrets (Workers & Pages > spotlight-kiosks > Settings > Variables and Secrets). All optional except ADMIN_PASSWORD:
     ADMIN_PASSWORD            already set for the kiosk dashboard; needed once to create the first Sales Studio admin
     SALES_SECRET              signs sign-in cookies; if missing, ADMIN_PASSWORD is used (changing it signs everyone out)
     TWILIO_ACCOUNT_SID        Twilio account (AC…)                         } browser calling
     TWILIO_API_KEY            Twilio API key SID (SK…)                     }
     TWILIO_API_SECRET         that key's secret                            }
     TWILIO_AUTH_TOKEN         checks that phone webhooks really come from Twilio
     TWILIO_TWIML_APP_SID      TwiML app (AP…) whose Voice URL is /sales/voice/outbound
     TWILIO_CALLER_ID          the CityPulse number shown on outgoing calls (+1…)
     TWILIO_SMS_FROM           number that sends texts (+1…), or TWILIO_MESSAGING_SERVICE_SID (MG…)
     GOOGLE_CLIENT_ID          Google OAuth client for "Send from Gmail"
     GOOGLE_CLIENT_SECRET
     ANTHROPIC_API_KEY         optional: Claude for drafts and call prep (otherwise the free Workers AI model)

   Routes
     GET  /sales                         the app
     POST /sales/api/...                 app API (signed-in, same-origin, header X-CP-Req: 1)
     POST /sales/voice/{outbound,incoming,notice,missed,recording,voicemail}   Twilio voice webhooks (signed by Twilio)
     POST /sales/sms/incoming            Twilio text webhook (signed by Twilio)
     GET  /sales/google/callback         Google sign-in return */

import { SALES_HTML } from "./sales-page.js";

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS crm_docs (path TEXT PRIMARY KEY, col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, seq INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0)",
  "CREATE INDEX IF NOT EXISTS crm_docs_seq ON crm_docs(seq)",
  "CREATE INDEX IF NOT EXISTS crm_docs_col ON crm_docs(col, deleted)",
  "CREATE TABLE IF NOT EXISTS crm_users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT, role TEXT NOT NULL, pass TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, owner INTEGER NOT NULL DEFAULT 0, must_change INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, last_login TEXT)",
  "CREATE TABLE IF NOT EXISTS crm_locks (path TEXT PRIMARY KEY, holder TEXT NOT NULL, exp INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS crm_google (user_id TEXT PRIMARY KEY, email TEXT, token TEXT NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS crm_recordings (call_sid TEXT PRIMARY KEY, recording_sid TEXT NOT NULL, duration INTEGER, created_at TEXT NOT NULL)"
];
const ROLES = ["agent", "supervisor", "admin"];
const SEG_RE = /^[A-Za-z0-9_\-.~:@+]{1,200}$/, FIELD_RE = /^[A-Za-z0-9_]{1,60}$/, USER_RE = /^[a-z0-9._-]{3,32}$/;
const OPS = { "==": "=", "!=": "!=", "<": "<", "<=": "<=", ">": ">", ">=": ">=" };
const MAX_DOC = 256 * 1024, SESSION_HOURS = 12;
const enc = new TextEncoder(), dec = new TextDecoder();
const nowIso = () => new Date().toISOString();
const hasDB = env => !!(env && env.DB && typeof env.DB.prepare === "function");
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64url = buf => b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlStr = s => b64url(enc.encode(s));
const fromB64 = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const rid = n => b64url(crypto.getRandomValues(new Uint8Array(n))).replace(/[-_]/g, "x").slice(0, Math.ceil(n * 4 / 3));
const normPhone = p => { let d = String(p || "").replace(/\D/g, ""); if (d.length === 10) d = "1" + d; return d; };
const xml = s => String(s ?? "").replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]));
const secret = env => env.SALES_SECRET || env.ADMIN_PASSWORD || "";

let schemaReady = null;
function ensure(env) {
  if (!schemaReady) schemaReady = env.DB.batch(SCHEMA.map(s => env.DB.prepare(s))).catch(e => { schemaReady = null; throw e; });
  return schemaReady;
}

/* ---------- responses ---------- */
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "X-Frame-Options": "DENY", "Cache-Control": "no-store" };
const jsonRes = (status, obj, extra) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...SEC, ...(extra || {}) } });
const twiml = body => new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, { headers: { "Content-Type": "text/xml; charset=utf-8", "Cache-Control": "no-store" } });

/* ---------- crypto helpers ---------- */
async function hmac(keyStr, msg, hash = "SHA-256") {
  const key = await crypto.subtle.importKey("raw", enc.encode(keyStr), { name: "HMAC", hash }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", key, enc.encode(msg));
}
function eq(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
async function hashPassword(pw, saltB64, iter = 100000) {
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256);
  return `pbkdf2$${iter}$${b64(salt)}$${b64(bits)}`;
}
async function checkPassword(pw, stored) {
  const [, iter, salt] = String(stored).split("$");
  if (!iter || !salt) return false;
  return eq(await hashPassword(pw, salt, +iter), stored);
}
async function aesKey(env) {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(secret(env) + "|citypulse-google"));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function seal(env, text) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(env), enc.encode(text)); return b64(iv) + "." + b64(ct); }
async function unseal(env, s) { const [iv, ct] = String(s).split("."); return dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv) }, await aesKey(env), fromB64(ct))); }

/* ---------- sessions ---------- */
const COOKIE = "cp_sales";
async function sessionCookie(env, uid) {
  const exp = Date.now() + SESSION_HOURS * 3600e3;
  const sig = b64url(await hmac(secret(env), `sales|${uid}|${exp}`));
  return `${COOKIE}=${uid}.${exp}.${sig}; Path=/sales; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`;
}
const userCache = new Map();
async function loadUser(env, id) {
  const hit = userCache.get(id);
  if (hit && hit.at > Date.now() - 15000) return hit.user;
  const u = await env.DB.prepare("SELECT id, username, name, email, role, active, owner, must_change, last_login FROM crm_users WHERE id = ?").bind(id).first();
  userCache.set(id, { at: Date.now(), user: u || null });
  return u || null;
}
async function currentUser(req, env) {
  if (!secret(env)) return null;
  const m = (req.headers.get("Cookie") || "").match(/(?:^|;\s*)cp_sales=([A-Za-z0-9_]+)\.(\d+)\.([A-Za-z0-9_-]+)/);
  if (!m || +m[2] < Date.now()) return null;
  if (!eq(b64url(await hmac(secret(env), `sales|${m[1]}|${m[2]}`)), m[3])) return null;
  const u = await loadUser(env, m[1]);
  return u && u.active ? u : null;
}
const tries = new Map();
function tooManyTries(ip, add) {
  const now = Date.now(), list = (tries.get(ip) || []).filter(t => now - t < 15 * 60000);
  if (add) list.push(now);
  tries.set(ip, list); if (tries.size > 5000) tries.clear();
  return list.length >= 10;
}
const publicUser = u => ({ id: u.id, username: u.username, name: u.name, email: u.email || "", role: u.role, active: !!u.active, owner: !!u.owner, mustChange: !!u.must_change, lastLogin: u.last_login || "" });

/* ---------- document store ---------- */
function splitPath(path, wantDoc) {
  if (typeof path !== "string") throw bad("path");
  const s = path.split("/");
  if (!s.length || s.length > 16 || path.length > 1000 || s.some(x => !SEG_RE.test(x) || x === "." || x === "..")) throw bad("path");
  if (wantDoc !== undefined && (s.length % 2 === 0) !== wantDoc) throw bad(wantDoc ? "document path must have an even number of parts" : "collection path must have an odd number of parts");
  return s;
}
function bad(msg) { const e = new Error(msg); e.code = "invalid_argument"; return e; }
function canRead(u, path) { const s = path.split("/"); return !(s[0] === "data" && s[1] === "users" && s[2] !== u.id); }
function canWrite(u, path) {
  const s = path.split("/"), admin = u.role === "admin";
  if (s[0] === "data" && s[1] === "users") return s[2] === u.id;
  if (s[0] === "members" || s[0] === "agentStatus") return s.length === 2 && (s[1] === u.id || admin);
  if (["staff", "config", "library", "templates"].includes(s[0])) return admin;
  if (s[0] === "locks") return false;
  return true;
}
function prepPut(env, path, data) {
  const s = path.split("/"), col = s.slice(0, -1).join("/");
  if (col === "leads") { data = Object.assign({}, data); data._phone = normPhone(data.phone); }
  const json = JSON.stringify(data);
  if (json.length > MAX_DOC) throw bad("document is too large");
  return env.DB.prepare("INSERT INTO crm_docs (path, col, id, data, seq, deleted) VALUES (?1, ?2, ?3, ?4, (SELECT COALESCE(MAX(seq), 0) + 1 FROM crm_docs), 0) ON CONFLICT(path) DO UPDATE SET data = excluded.data, seq = excluded.seq, deleted = 0")
    .bind(path, col, s[s.length - 1], json);
}
const putDoc = (env, path, data) => prepPut(env, path, data).run();
async function getDoc(env, path) {
  const r = await env.DB.prepare("SELECT data FROM crm_docs WHERE path = ? AND deleted = 0").bind(path).first();
  return r ? JSON.parse(r.data) : null;
}
async function delDoc(env, path) {
  await env.DB.prepare("UPDATE crm_docs SET deleted = 1, data = '{}', seq = (SELECT COALESCE(MAX(seq), 0) + 1 FROM crm_docs) WHERE path = ?").bind(path).run();
}
function merge(a, b) {
  const o = Object.assign({}, a);
  for (const [k, v] of Object.entries(b)) o[k] = (v && typeof v === "object" && !Array.isArray(v) && o[k] && typeof o[k] === "object" && !Array.isArray(o[k])) ? merge(o[k], v) : v;
  return o;
}
async function runQuery(env, u, q) {
  const col = q && q.col; splitPath(col, false);
  if (!canRead(u, col + "/x")) return [];
  let sql = "SELECT id, data FROM crm_docs WHERE col = ? AND deleted = 0"; const binds = [col];
  const wheres = Array.isArray(q.wheres) ? q.wheres.slice(0, 10) : [];
  for (const [f, op, v] of wheres) {
    if (!FIELD_RE.test(f) || !OPS[op]) throw bad("bad filter");
    sql += ` AND json_extract(data, '$.${f}') ${OPS[op]} ?`;
    binds.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
  }
  if (q.order) { const [f, dir] = q.order; if (!FIELD_RE.test(f)) throw bad("bad order"); sql += ` ORDER BY json_extract(data, '$.${f}') ${dir === "desc" ? "DESC" : "ASC"}`; }
  sql += " LIMIT ?"; binds.push(Math.max(1, Math.min(1000, +q.limit || 1000)));
  const r = await env.DB.prepare(sql).bind(...binds).all();
  return (r.results || []).map(x => ({ id: x.id, data: JSON.parse(x.data) }));
}

/* ---------- AI ---------- */
async function ai(env, prompt) {
  if (env.ANTHROPIC_API_KEY) {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 700, temperature: 0.4, messages: [{ role: "user", content: prompt }] }) });
    if (!r.ok) throw new Error("ai " + r.status);
    const j = await r.json(); return (j.content || []).map(c => c.text || "").join("").trim();
  }
  if (env.AI && typeof env.AI.run === "function") {
    const out = await env.AI.run(env.CF_MODEL || "@cf/google/gemma-4-26b-a4b-it", { messages: [{ role: "user", content: prompt }], max_tokens: 700, temperature: 0.4, chat_template_kwargs: { enable_thinking: false } });
    const t = out && (out.response || (out.result && out.result.response) || (out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content));
    if (!t) throw new Error("ai empty");
    return String(t).trim();
  }
  throw new Error("ai not configured");
}

/* ---------- integrations: status ---------- */
const voiceOn = env => !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_API_KEY && env.TWILIO_API_SECRET && env.TWILIO_TWIML_APP_SID && env.TWILIO_CALLER_ID && env.TWILIO_AUTH_TOKEN);
const smsOn = env => !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_API_KEY && env.TWILIO_API_SECRET && env.TWILIO_AUTH_TOKEN && (env.TWILIO_SMS_FROM || env.TWILIO_MESSAGING_SERVICE_SID));
const googleOn = env => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
const twBasic = env => "Basic " + btoa(`${env.TWILIO_API_KEY}:${env.TWILIO_API_SECRET}`);

async function twilioSigned(req, env, params) {
  const sig = req.headers.get("X-Twilio-Signature") || "";
  if (!env.TWILIO_AUTH_TOKEN || !sig) return false;
  const data = req.url + Object.keys(params).sort().map(k => k + params[k]).join("");
  return eq(b64(await hmac(env.TWILIO_AUTH_TOKEN, data, "SHA-1")), sig);
}
async function formParams(req) { const f = await req.formData(); const o = {}; for (const [k, v] of f.entries()) o[k] = String(v); return o; }
async function voiceToken(env, identity) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT", cty: "twilio-fpa;v=1" };
  const payload = { jti: `${env.TWILIO_API_KEY}-${now}`, iss: env.TWILIO_API_KEY, sub: env.TWILIO_ACCOUNT_SID, iat: now, exp: now + 3600,
    grants: { identity, voice: { incoming: { allow: true }, outgoing: { application_sid: env.TWILIO_TWIML_APP_SID } } } };
  const unsigned = b64urlStr(JSON.stringify(header)) + "." + b64urlStr(JSON.stringify(payload));
  return unsigned + "." + b64url(await hmac(env.TWILIO_API_SECRET, unsigned));
}
async function leadByPhone(env, phone) {
  const p = normPhone(phone); if (!p) return null;
  const r = await env.DB.prepare("SELECT id, data FROM crm_docs WHERE col = 'leads' AND deleted = 0 AND json_extract(data, '$._phone') = ? LIMIT 1").bind(p).first();
  return r ? Object.assign({ id: r.id }, JSON.parse(r.data)) : null;
}
const isDnc = async (env, phone) => { const p = normPhone(phone); return !!(p && await getDoc(env, "dnc/" + p)); };
async function logActivity(env, data) { await putDoc(env, "activity/" + Date.now().toString(36) + rid(6), Object.assign({ at: nowIso() }, data)); }
async function admins(env) { const r = await env.DB.prepare("SELECT id FROM crm_users WHERE active = 1 AND role = 'admin'").all(); return (r.results || []).map(x => x.id); }
async function config(env) { return (await getDoc(env, "config/main")) || {}; }

/* ---------- Google (Gmail send) ---------- */
async function googleAccess(env, uid) {
  const row = await env.DB.prepare("SELECT email, token FROM crm_google WHERE user_id = ?").bind(uid).first();
  if (!row) return null;
  const refresh = await unseal(env, row.token);
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: refresh, grant_type: "refresh_token" }) });
  if (!r.ok) return { error: "Google sign-in expired. Connect Gmail again in Settings." };
  const j = await r.json(); return { token: j.access_token, email: row.email };
}
function mime({ to, subject, body, from }) {
  const enc8 = s => "=?UTF-8?B?" + b64(enc.encode(s)) + "?=";
  const lines = [from ? `From: ${from}` : null, `To: ${to}`, `Subject: ${enc8(subject || "")}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", b64(enc.encode(body || "")).replace(/.{76}/g, "$&\r\n")].filter(x => x !== null);
  return b64url(enc.encode(lines.join("\r\n")));
}

/* ========================================================== */
export async function handleSales(req, env, ctx) {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, "") || "/";
  if (!hasDB(env)) return jsonRes(503, { error: "The database isn't set up on this worker." });
  await ensure(env);

  if (path === "/sales" && req.method === "GET") return new Response(SALES_HTML, { headers: { "Content-Type": "text/html; charset=utf-8", ...SEC } });
  if (path.startsWith("/sales/voice/") && req.method === "POST") return voiceHook(req, env, path.slice(13), url);
  if (path === "/sales/sms/incoming" && req.method === "POST") return smsHook(req, env);
  if (path === "/sales/google/callback" && req.method === "GET") return googleCallback(req, env, url);
  if (!path.startsWith("/sales/api/")) return jsonRes(404, { error: "not found" });

  const api = path.slice(11), ip = req.headers.get("CF-Connecting-IP") || "local";
  if (req.method === "POST" && req.headers.get("X-CP-Req") !== "1") return jsonRes(403, { error: "bad request" });
  let body = {};
  if (req.method === "POST") { try { body = await req.json(); } catch (e) { body = {}; } }

  /* ----- signed-out routes ----- */
  if (api === "me") {
    const u = await currentUser(req, env);
    const count = (await env.DB.prepare("SELECT COUNT(*) n FROM crm_users").first()).n;
    if (!u) return jsonRes(200, { signedIn: false, needsSetup: count === 0, ready: !!secret(env) });
    const g = await env.DB.prepare("SELECT email FROM crm_google WHERE user_id = ?").bind(u.id).first();
    return jsonRes(200, { signedIn: true, user: publicUser(u), status: { voice: voiceOn(env), sms: smsOn(env), google: googleOn(env), ai: !!(env.ANTHROPIC_API_KEY || env.AI) }, google: { connected: !!g, email: g ? g.email : "" } });
  }
  if (api === "setup" && req.method === "POST") {
    const count = (await env.DB.prepare("SELECT COUNT(*) n FROM crm_users").first()).n;
    if (count > 0) return jsonRes(409, { error: "Sales Studio is already set up. Sign in instead." });
    if (tooManyTries(ip)) return jsonRes(429, { error: "Too many tries. Wait 15 minutes." });
    if (!env.ADMIN_PASSWORD || !eq(body.adminPassword || "", env.ADMIN_PASSWORD)) { tooManyTries(ip, true); return jsonRes(403, { error: "That isn’t the staff dashboard password." }); }
    const err = checkNewUser(body); if (err) return jsonRes(400, { error: err });
    const id = "u_" + rid(16);
    await env.DB.prepare("INSERT INTO crm_users (id, username, name, email, role, pass, active, owner, must_change, created_at) VALUES (?, ?, ?, ?, 'admin', ?, 1, 1, 0, ?)")
      .bind(id, body.username.toLowerCase(), body.name.trim(), (body.email || "").trim(), await hashPassword(body.password), nowIso()).run();
    await putDoc(env, "staff/" + id, { role: "admin", active: true });
    await putDoc(env, "members/" + id, { joinedAt: nowIso() });
    return jsonRes(200, { ok: true }, { "Set-Cookie": await sessionCookie(env, id) });
  }
  if (api === "login" && req.method === "POST") {
    if (tooManyTries(ip)) return jsonRes(429, { error: "Too many tries. Wait 15 minutes and try again." });
    const row = await env.DB.prepare("SELECT id, pass, active FROM crm_users WHERE username = ?").bind(String(body.username || "").trim().toLowerCase()).first();
    if (!row || !row.active || !(await checkPassword(String(body.password || ""), row.pass))) { tooManyTries(ip, true); return jsonRes(401, { error: "Wrong username or password." }); }
    await env.DB.prepare("UPDATE crm_users SET last_login = ? WHERE id = ?").bind(nowIso(), row.id).run();
    return jsonRes(200, { ok: true }, { "Set-Cookie": await sessionCookie(env, row.id) });
  }
  if (api === "logout") return jsonRes(200, { ok: true }, { "Set-Cookie": `${COOKIE}=; Path=/sales; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });

  /* ----- signed-in routes ----- */
  const u = await currentUser(req, env);
  if (!u) return jsonRes(401, { error: "Signed out. Sign in again." });
  const admin = u.role === "admin";
  try {
    switch (api) {
      case "password": {
        const row = await env.DB.prepare("SELECT pass FROM crm_users WHERE id = ?").bind(u.id).first();
        if (!(await checkPassword(String(body.current || ""), row.pass))) return jsonRes(403, { error: "Your current password is wrong." });
        if (String(body.next || "").length < 10) return jsonRes(400, { error: "Use at least 10 characters." });
        await env.DB.prepare("UPDATE crm_users SET pass = ?, must_change = 0 WHERE id = ?").bind(await hashPassword(body.next), u.id).run();
        userCache.delete(u.id);
        return jsonRes(200, { ok: true });
      }
      case "users": {
        if (!admin) return jsonRes(403, { error: "Only admins manage logins." });
        if (req.method === "GET") { const r = await env.DB.prepare("SELECT * FROM crm_users ORDER BY name").all(); return jsonRes(200, { users: (r.results || []).map(publicUser) }); }
        const err = checkNewUser(body); if (err) return jsonRes(400, { error: err });
        if (!ROLES.includes(body.role)) return jsonRes(400, { error: "Pick a role." });
        const exists = await env.DB.prepare("SELECT 1 FROM crm_users WHERE username = ?").bind(body.username.toLowerCase()).first();
        if (exists) return jsonRes(409, { error: "That username is taken." });
        const id = "u_" + rid(16);
        await env.DB.prepare("INSERT INTO crm_users (id, username, name, email, role, pass, active, owner, must_change, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, 0, 1, ?)")
          .bind(id, body.username.toLowerCase(), body.name.trim(), (body.email || "").trim(), body.role, await hashPassword(body.password), nowIso()).run();
        await putDoc(env, "staff/" + id, { role: body.role, active: true });
        await putDoc(env, "members/" + id, { joinedAt: nowIso() });
        return jsonRes(200, { ok: true, id });
      }
      case "profiles": {
        const ids = (Array.isArray(body.ids) ? body.ids : []).filter(x => /^u_[A-Za-z0-9]+$/.test(x)).slice(0, 100);
        if (!ids.length) return jsonRes(200, { profiles: {} });
        const r = await env.DB.prepare(`SELECT id, name FROM crm_users WHERE id IN (${ids.map(() => "?").join(",")})`).bind(...ids).all();
        return jsonRes(200, { profiles: Object.fromEntries((r.results || []).map(x => [x.id, { id: x.id, name: x.name }])) });
      }
      case "db/get": { const s = splitPath(body.path, true); if (!canRead(u, body.path)) return jsonRes(200, { exists: false }); const d = await getDoc(env, s.join("/")); return jsonRes(200, d ? { exists: true, data: d } : { exists: false }); }
      case "db/query": return jsonRes(200, { docs: await runQuery(env, u, body) });
      case "db/write": {
        const p = body.path; splitPath(p, true);
        if (!canWrite(u, p)) return jsonRes(403, { code: "invalid_argument", error: "You don’t have permission to change this." });
        if (body.op === "delete") { await delDoc(env, p); }
        else {
          if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) throw bad("body must be an object");
          let data = body.data;
          if (body.op === "update") { const cur = await getDoc(env, p); if (!cur) throw bad("document does not exist"); data = merge(cur, data); }
          await putDoc(env, p, data);
          if (p.startsWith("staff/") && admin) await syncStaff(env, u, p.split("/")[1], data);
        }
        const seq = (await env.DB.prepare("SELECT seq FROM crm_docs WHERE path = ?").bind(p).first() || {}).seq || 0;
        return jsonRes(200, { ok: true, seq });
      }
      case "db/acquire": {
        const p = body.path; splitPath(p, true);
        const now = Date.now(), ttl = Math.max(1000, Math.min(1800000, +body.ttlMs || 30000));
        const r = await env.DB.prepare("INSERT INTO crm_locks (path, holder, exp) VALUES (?1, ?2, ?3) ON CONFLICT(path) DO UPDATE SET holder = excluded.holder, exp = excluded.exp WHERE crm_locks.exp < ?4 OR crm_locks.holder = excluded.holder")
          .bind(p, u.id, now + ttl, now).run();
        return jsonRes(200, { acquired: (r.meta && r.meta.changes) > 0 });
      }
      case "db/changes": {
        const since = Math.max(0, +url.searchParams.get("since") || 0), wait = url.searchParams.get("wait") === "1";
        const until = Date.now() + 20000;
        for (;;) {
          const top = (await env.DB.prepare("SELECT MAX(seq) m FROM crm_docs").first()).m || 0;
          if (top > since || !wait || Date.now() > until) {
            const r = top > since ? await env.DB.prepare("SELECT path, col, id, data, seq, deleted FROM crm_docs WHERE seq > ? ORDER BY seq LIMIT 500").bind(since).all() : { results: [] };
            const rows = r.results || [];
            return jsonRes(200, { seq: rows.length ? rows[rows.length - 1].seq : Math.max(since, top), more: rows.length === 500,
              changes: rows.filter(x => canRead(u, x.path)).map(x => ({ path: x.path, col: x.col, id: x.id, deleted: !!x.deleted, data: x.deleted ? null : JSON.parse(x.data) })) });
          }
          await new Promise(r => setTimeout(r, 1500));
        }
      }
      case "db/seq": return jsonRes(200, { seq: (await env.DB.prepare("SELECT MAX(seq) m FROM crm_docs").first()).m || 0 });
      case "ai": {
        const prompt = String(body.prompt || "").slice(0, 12000);
        if (!prompt) return jsonRes(400, { error: "empty" });
        try { return jsonRes(200, { text: await ai(env, prompt) }); } catch (e) { return jsonRes(502, { code: "unavailable", error: "The writing assistant isn’t available right now." }); }
      }
      case "backup": {
        if (!admin) return jsonRes(403, { error: "Only admins can export." });
        const r = await env.DB.prepare("SELECT path, data FROM crm_docs WHERE deleted = 0 AND path NOT LIKE 'data/users/%' ORDER BY path").all();
        return jsonRes(200, { format: "citypulse-sales-backup", version: 1, exported: nowIso(), docs: (r.results || []).map(x => ({ path: x.path, data: JSON.parse(x.data) })) });
      }
      case "restore": {
        if (!admin) return jsonRes(403, { error: "Only admins can restore." });
        if (!body || body.format !== "citypulse-sales-backup" || !Array.isArray(body.docs)) return jsonRes(400, { error: "That file isn’t a Sales Studio backup." });
        const docs = body.docs.slice(0, 5000); let n = 0;
        for (let i = 0; i < docs.length; i += 50) {
          const stmts = [];
          for (const d of docs.slice(i, i + 50)) {
            if (typeof d.path !== "string" || d.path.startsWith("data/users/") || d.path.startsWith("locks/")) continue;
            splitPath(d.path, true);
            const data = JSON.parse(JSON.stringify(d.data || {}).replace(/__OWNER__/g, u.id));
            if (d.path.startsWith("leads/")) data.updatedAt = nowIso(); /* open screens pick up restored leads right away */
            stmts.push(prepPut(env, d.path.replace(/__OWNER__/g, u.id), data));
          }
          if (stmts.length) { await env.DB.batch(stmts); n += stmts.length; }
        }
        return jsonRes(200, { ok: true, restored: n });
      }
      /* ----- integrations ----- */
      case "voice/token": {
        if (!voiceOn(env)) return jsonRes(503, { error: "Browser calling isn’t set up yet." });
        return jsonRes(200, { token: await voiceToken(env, u.id), identity: u.id });
      }
      case "recording": {
        const call = url.searchParams.get("call") || "";
        if (!/^CA[0-9a-f]{32}$/.test(call) || !voiceOn(env)) return new Response("Not found", { status: 404 });
        const r = await env.DB.prepare("SELECT recording_sid FROM crm_recordings WHERE call_sid = ?").bind(call).first();
        if (!r) return new Response("No recording for this call.", { status: 404 });
        let up; try { up = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Recordings/${r.recording_sid}.mp3`, { headers: { Authorization: twBasic(env) } }); } catch (e) { return new Response("Recording unavailable.", { status: 502 }); }
        if (!up.ok) return new Response("Recording unavailable.", { status: 502 });
        return new Response(up.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" } });
      }
      case "sms/send": {
        if (!smsOn(env)) return jsonRes(503, { error: "Texting isn’t set up yet." });
        const to = normPhone(body.to), text = String(body.body || "").trim();
        if (to.length < 11 || !text) return jsonRes(400, { error: "Add a phone number and a message." });
        if (await isDnc(env, to)) return jsonRes(403, { error: "That number is on the do-not-call list." });
        const form = new URLSearchParams({ To: "+" + to, Body: text.slice(0, 1500) });
        if (env.TWILIO_MESSAGING_SERVICE_SID) form.set("MessagingServiceSid", env.TWILIO_MESSAGING_SERVICE_SID); else form.set("From", env.TWILIO_SMS_FROM);
        let r; try { r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: "POST", headers: { Authorization: twBasic(env), "Content-Type": "application/x-www-form-urlencoded" }, body: form }); }
        catch (e) { return jsonRes(502, { error: "Couldn’t reach Twilio. Try again in a minute." }); }
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return jsonRes(502, { error: "Twilio didn’t send it: " + String(j.message || r.status).slice(0, 160) });
        await logActivity(env, { leadId: String(body.leadId || ""), type: "text", direction: "outbound", outcome: "Sent", note: text.slice(0, 500), by: u.id, messageSid: j.sid || "" });
        return jsonRes(200, { ok: true });
      }
      case "google/start": {
        if (!googleOn(env)) return jsonRes(503, { error: "Gmail sending isn’t set up yet." });
        const exp = Date.now() + 600000, state = `${u.id}.${exp}.${b64url(await hmac(secret(env), `google|${u.id}|${exp}`))}`;
        const q = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: url.origin + "/sales/google/callback", response_type: "code", scope: "openid email https://www.googleapis.com/auth/gmail.send", access_type: "offline", prompt: "consent", include_granted_scopes: "true", state });
        return jsonRes(200, { url: "https://accounts.google.com/o/oauth2/v2/auth?" + q });
      }
      case "google/disconnect": { await env.DB.prepare("DELETE FROM crm_google WHERE user_id = ?").bind(u.id).run(); return jsonRes(200, { ok: true }); }
      case "email/send": {
        if (!googleOn(env)) return jsonRes(503, { error: "Gmail sending isn’t set up yet." });
        const to = String(body.to || "").trim();
        if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(to)) return jsonRes(400, { error: "Add a valid email address." });
        if (body.leadId) { const l = await getDoc(env, "leads/" + body.leadId); if (l && l.status === "Do not contact") return jsonRes(403, { error: "This business asked not to be contacted." }); }
        let acc; try { acc = await googleAccess(env, u.id); } catch (e) { return jsonRes(502, { error: "Couldn’t reach Google. Try again in a minute." }); }
        if (!acc) return jsonRes(409, { error: "Connect your Gmail in Settings first." });
        if (acc.error) return jsonRes(409, { error: acc.error });
        let r; try { r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", { method: "POST", headers: { Authorization: "Bearer " + acc.token, "Content-Type": "application/json" },
          body: JSON.stringify({ raw: mime({ to, subject: String(body.subject || "").slice(0, 300), body: String(body.body || "").slice(0, 20000) }) }) }); }
        catch (e) { return jsonRes(502, { error: "Couldn’t reach Gmail. Try again in a minute." }); }
        if (!r.ok) { const j = await r.json().catch(() => ({})); return jsonRes(502, { error: "Gmail didn’t send it: " + String((j.error && j.error.message) || r.status).slice(0, 160) }); }
        await logActivity(env, { leadId: String(body.leadId || ""), type: "email", direction: "outbound", outcome: "Sent", note: `${String(body.subject || "")}: ${String(body.body || "")}`.slice(0, 600), by: u.id, sentFrom: acc.email || "" });
        return jsonRes(200, { ok: true, from: acc.email || "" });
      }
    }
    if (api.startsWith("users/") && req.method === "POST") {
      if (!admin) return jsonRes(403, { error: "Only admins manage logins." });
      const id = api.slice(6), t = await env.DB.prepare("SELECT * FROM crm_users WHERE id = ?").bind(id).first();
      if (!t) return jsonRes(404, { error: "No such person." });
      if (t.owner && (body.active === false || (body.role && body.role !== "admin"))) return jsonRes(400, { error: "The owner stays an active admin." });
      const sets = [], binds = [];
      if (typeof body.name === "string" && body.name.trim()) { sets.push("name = ?"); binds.push(body.name.trim().slice(0, 80)); }
      if (typeof body.email === "string") { sets.push("email = ?"); binds.push(body.email.trim().slice(0, 120)); }
      if (ROLES.includes(body.role)) { sets.push("role = ?"); binds.push(body.role); }
      if (typeof body.active === "boolean") { sets.push("active = ?"); binds.push(body.active ? 1 : 0); }
      if (body.password) { if (String(body.password).length < 10) return jsonRes(400, { error: "Use at least 10 characters." }); sets.push("pass = ?", "must_change = 1"); binds.push(await hashPassword(String(body.password))); }
      if (sets.length) await env.DB.prepare(`UPDATE crm_users SET ${sets.join(", ")} WHERE id = ?`).bind(...binds, id).run();
      userCache.delete(id);
      const cur = (await getDoc(env, "staff/" + id)) || {};
      if (ROLES.includes(body.role) || typeof body.active === "boolean") await putDoc(env, "staff/" + id, Object.assign(cur, ROLES.includes(body.role) ? { role: body.role } : {}, typeof body.active === "boolean" ? { active: body.active } : {}));
      return jsonRes(200, { ok: true });
    }
    return jsonRes(404, { error: "not found" });
  } catch (e) {
    if (e && e.code === "invalid_argument") return jsonRes(400, { code: "invalid_argument", error: e.message });
    console.error("sales api", api, e && e.stack || e);
    return jsonRes(500, { code: "unavailable", error: "Something went wrong. Try again." });
  }
}
function checkNewUser(b) {
  if (!USER_RE.test(String(b.username || "").toLowerCase())) return "Usernames are 3–32 letters, numbers, dots, dashes or underscores.";
  if (!String(b.name || "").trim()) return "Add the person’s name.";
  if (String(b.password || "").length < 10) return "Passwords need at least 10 characters.";
  return "";
}
/* Roles live on the login (who can do what on the server) and in staff/<id> (what the app shows). Keep them in step. */
async function syncStaff(env, actor, id, data) {
  const t = await env.DB.prepare("SELECT owner FROM crm_users WHERE id = ?").bind(id).first();
  if (!t) return;
  const sets = [], binds = [];
  if (ROLES.includes(data.role) && !(t.owner && data.role !== "admin")) { sets.push("role = ?"); binds.push(data.role); }
  if (typeof data.active === "boolean" && !(t.owner && !data.active)) { sets.push("active = ?"); binds.push(data.active ? 1 : 0); }
  if (sets.length) { await env.DB.prepare(`UPDATE crm_users SET ${sets.join(", ")} WHERE id = ?`).bind(...binds, id).run(); userCache.delete(id); }
}

/* ---------- Twilio voice webhooks ---------- */
async function voiceHook(req, env, hook, url) {
  if (!voiceOn(env)) return twiml("<Say>Calling is not set up.</Say><Hangup/>");
  const p = await formParams(req);
  if (!(await twilioSigned(req, env, p))) return new Response("Forbidden", { status: 403 });
  const base = url.origin + "/sales/voice/";
  const cfgDoc = await config(env);
  if (hook === "outbound") {
    const agent = String(p.From || "").replace(/^client:/, "");
    const u = /^u_[A-Za-z0-9]+$/.test(agent) ? await loadUser(env, agent) : null;
    if (!u || !u.active) return twiml("<Say>This account can’t place calls.</Say><Hangup/>");
    const to = normPhone(p.To);
    if (to.length < 11) return twiml("<Say>That number looks incomplete.</Say><Hangup/>");
    if (await isDnc(env, to)) return twiml("<Say>This number is on the do not call list.</Say><Hangup/>");
    const rec = cfgDoc.recordCalls ? ` record="record-from-answer-dual" recordingStatusCallback="${xml(base + "recording?parent=" + encodeURIComponent(p.CallSid || ""))}" recordingStatusCallbackEvent="completed"` : "";
    const notice = cfgDoc.recordCalls ? ` url="${xml(base + "notice")}"` : "";
    return twiml(`<Dial callerId="${xml(env.TWILIO_CALLER_ID)}" answerOnBridge="true" timeout="30"${rec}><Number${notice}>+${to}</Number></Dial>`);
  }
  if (hook === "notice") return twiml("<Say>This call may be recorded.</Say>");
  if (hook === "recording") {
    const parent = url.searchParams.get("parent") || p.CallSid || "";
    if (p.RecordingSid && /^CA[0-9a-f]{32}$/.test(parent))
      await env.DB.prepare("INSERT OR REPLACE INTO crm_recordings (call_sid, recording_sid, duration, created_at) VALUES (?, ?, ?, ?)").bind(parent, p.RecordingSid, +p.RecordingDuration || 0, nowIso()).run();
    return new Response(null, { status: 204 });
  }
  if (hook === "incoming") {
    const r = await env.DB.prepare("SELECT id FROM crm_docs WHERE col = 'agentStatus' AND deleted = 0 AND json_extract(data, '$.state') = 'available' LIMIT 10").all();
    const ids = [];
    for (const x of r.results || []) { const u = await loadUser(env, x.id); if (u && u.active) ids.push(x.id); }
    if (!ids.length) return twiml(voicemailTwiml(base));
    return twiml(`<Dial timeout="25" answerOnBridge="true" action="${xml(base + "missed")}">${ids.map(id => `<Client>${xml(id)}</Client>`).join("")}</Dial>`);
  }
  if (hook === "missed") {
    if (p.DialCallStatus === "completed" || p.DialCallStatus === "answered") return twiml("<Hangup/>");
    return twiml(voicemailTwiml(base));
  }
  if (hook === "voicemail") {
    if (p.RecordingSid && /^CA[0-9a-f]{32}$/.test(p.CallSid || "")) {
      await env.DB.prepare("INSERT OR REPLACE INTO crm_recordings (call_sid, recording_sid, duration, created_at) VALUES (?, ?, ?, ?)").bind(p.CallSid, p.RecordingSid, +p.RecordingDuration || 0, nowIso()).run();
      const lead = await leadByPhone(env, p.From);
      const who = lead ? lead.name : p.From;
      await logActivity(env, { leadId: lead ? lead.id : "", type: "voicemail", direction: "inbound", outcome: "Voicemail", note: `Voicemail from ${who} (${p.From}), ${+p.RecordingDuration || 0} seconds.`, by: "", callSid: p.CallSid, from: p.From });
      const assignee = (lead && lead.rep) || (await admins(env))[0] || "";
      await putDoc(env, "tasks/" + Date.now().toString(36) + rid(6), { leadId: lead ? lead.id : "", assignee, type: "callback", title: `Return voicemail: ${who}`, due: nowIso(), done: false, createdAt: nowIso(), createdBy: "", callSid: p.CallSid, phone: p.From });
    }
    return new Response(null, { status: 204 });
  }
  return twiml("<Hangup/>");
}
const voicemailTwiml = base => `<Say>Thanks for calling CityPulse Kiosks. Please leave your name, business and number after the tone, and we’ll call you back.</Say><Record maxLength="120" playBeep="true" recordingStatusCallback="${xml(base + "voicemail")}" recordingStatusCallbackEvent="completed"/><Say>Thank you. Goodbye.</Say>`;

/* ---------- Twilio incoming texts ---------- */
async function smsHook(req, env) {
  const p = await formParams(req);
  if (!(await twilioSigned(req, env, p))) return new Response("Forbidden", { status: 403 });
  const from = normPhone(p.From), text = String(p.Body || "").trim();
  const lead = await leadByPhone(env, from);
  const stop = /^(stop|stopall|unsubscribe|cancel|end|quit)$/i.test(text);
  if (stop && from) await putDoc(env, "dnc/" + from, { phone: p.From, name: lead ? lead.name : "", reason: "Replied STOP to a text", at: nowIso(), by: "" });
  if (stop && lead && lead.status !== "Do not contact") await putDoc(env, "leads/" + lead.id, Object.assign({}, lead, { status: "Do not contact", updatedAt: nowIso(), updatedBy: "" }));
  await logActivity(env, { leadId: lead ? lead.id : "", type: "text", direction: "inbound", outcome: stop ? "Opted out" : "Received", note: text.slice(0, 600), by: "", from: p.From });
  if (!stop) {
    const assignee = (lead && lead.rep) || (await admins(env))[0] || "";
    await putDoc(env, "tasks/" + Date.now().toString(36) + rid(6), { leadId: lead ? lead.id : "", assignee, type: "text", title: `Reply to text from ${lead ? lead.name : p.From}`, due: nowIso(), done: false, createdAt: nowIso(), createdBy: "", phone: p.From });
  }
  return twiml("");
}

/* ---------- Google sign-in return ---------- */
async function googleCallback(req, env, url) {
  const back = (msg) => Response.redirect(url.origin + "/sales#" + (msg ? "gmail-" + msg : "gmail-connected"), 302);
  const u = await currentUser(req, env);
  const [uid, exp, sig] = String(url.searchParams.get("state") || "").split(".");
  if (!u || u.id !== uid || +exp < Date.now() || !eq(b64url(await hmac(secret(env), `google|${uid}|${exp}`)), sig || "")) return back("failed");
  const code = url.searchParams.get("code"); if (!code || !googleOn(env)) return back("failed");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: url.origin + "/sales/google/callback", grant_type: "authorization_code" }) });
  if (!r.ok) return back("failed");
  const j = await r.json();
  if (!j.refresh_token) return back("failed");
  let email = "";
  try { email = JSON.parse(dec.decode(fromB64(String(j.id_token || "").split(".")[1] || ""))).email || ""; } catch (e) {}
  await env.DB.prepare("INSERT OR REPLACE INTO crm_google (user_id, email, token, updated_at) VALUES (?, ?, ?, ?)").bind(u.id, email, await seal(env, j.refresh_token), nowIso()).run();
  return back("");
}

export const _test = { normPhone, mime, voiceToken, canWrite, canRead, hashPassword, checkPassword };
