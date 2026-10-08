# CityPulse kiosk back end: setup

One free Cloudflare Worker (`spotlight-kiosks`) does three jobs:

1. **Staff dashboard** at `https://spotlight-kiosks.<your-subdomain>.workers.dev/admin`: edit the hotel's details,
   places, concierge answers and sponsored ads (with logo upload), see visits, ad views and QR scans across every
   kiosk, and restore earlier versions.
2. **Live content for the kiosks.** Kiosks check for published changes every 5 minutes and switch to them the next
   time they are on the welcome screen. They keep the last copy, so they keep working without internet.
3. **The live AI concierge** (below).

Files: `concierge-worker.js` (entry point and AI relay), `backend.js` (content, images, counts, dashboard API),
`admin/` (the dashboard page; run `node cloudflare/build-admin.mjs` after editing it to regenerate `admin-page.js`).
Cloudflare builds and deploys the worker from GitHub on every push to `main` (root directory `cloudflare`).

## Dashboard setup (once)

1. **Database.** Done: a D1 database named `citypulse` is bound in `wrangler.toml`. (For another account: open
   **Storage & Databases > D1**, click **Create**, and put its **Database ID** in the `[[d1_databases]]` block.)
   The tables are created automatically on first use, and the content is copied in from the website.
2. **Staff password.** Open **Workers & Pages > spotlight-kiosks > Settings > Variables and Secrets**, click **Add**,
   choose type **Secret**, name it `ADMIN_PASSWORD`, and enter a long password. Share it only with staff.
   Changing it signs everyone out.
3. Open `/admin` on the worker address and sign in.

Once the dashboard is live, edit content there rather than in `assets/lexen-data.js`; the file is only the starting
copy and the fallback.

## What is counted

Per kiosk and per day: guest sessions, sections and places opened, questions (approved-answer titles only; free-typed
questions are counted without their text), take-home opens, ad views (each time an ad is on screen) and QR scans
(counted when a phone opens a kiosk QR code, then sent straight on to the real page). No names, no device IDs beyond
the kiosk's own name, no cookies on guests' phones. Counts are best-effort: they are sent once a minute and kept on
the kiosk while offline (up to 3 days).

QR codes on the kiosk point to `/go/...` on the worker so scans can be counted. If the database is not set up, those
links still work: they go straight on to the business, Google Maps or the guide.

## Free plan limits

D1 free plan: 5 GB storage, 5 million reads and 100,000 writes a day. A kiosk uses roughly 300 to 2,000 writes a day,
so one free database covers dozens of kiosks. Uploaded images are limited to 1 MB each (the dashboard resizes them).

---

# Live AI concierge: setup

The kiosk's "Ask the concierge" gets live AI answers through a small relay (`concierge-worker.js`).
Until the relay is set up, the kiosk uses its built-in answers, and it switches back to them automatically
whenever the relay cannot be reached or the free daily AI allowance runs out.

## Free setup (Cloudflare Workers AI, no API key, no credit card)

The relay runs an open AI model (Google Gemma 4) on Cloudflare's free plan.

1. Sign up at https://dash.cloudflare.com (the free plan is enough).
2. Go to **Workers & Pages > Create > Create Worker**. Name it `spotlight-kiosks` (it must match `name` in `wrangler.toml`) and click **Deploy**.
3. Connect the worker to the GitHub repository (root directory `cloudflare`) so Cloudflare builds it from `concierge-worker.js`, `backend.js` and `admin-page.js`. Pasting a single file into the code editor no longer works, because the worker is now several files.
4. In the worker's **Settings**, find **Bindings**, add a **Workers AI** binding, and name it exactly `AI`. Deploy again if asked.
5. Open `https://spotlight-kiosks.<your-subdomain>.workers.dev/health`. It should show `{"ok":true}`.
6. Send the worker address to whoever maintains the kiosk. It goes in `assets/lexen-data.js`:
   `ai: { endpoint: "https://spotlight-kiosks.<your-subdomain>.workers.dev" }`.

Terminal alternative: `cd cloudflare && npx wrangler deploy` (the AI binding is already in `wrangler.toml`).

Free plan notes: Cloudflare gives a daily allowance of AI use (counted in "neurons") that resets at midnight UTC.
When it runs out, the kiosk quietly uses its built-in answers until the reset. The free model is smaller than
Claude, so its answers are simpler and slightly more likely to be wrong; the kiosk shows a note saying AI answers
can be wrong and gives the front desk number.

## Optional upgrade: Claude

For better answers, add a Claude API key; the relay then uses Claude instead of the free model.

1. Sign up at https://console.anthropic.com, add a payment method, and set a **monthly spend limit** first.
2. Create an API key. Keep it private: do not email it, paste it in chat, or put it in this repository.
3. In the worker's **Settings > Variables and Secrets**, add a **Secret** named `ANTHROPIC_API_KEY` with the key.

## What the relay does

- Builds the AI's instructions from the venue data (`assets/lexen-data.json`, made by `build/build.py`),
  the current Pacific time, and the National Weather Service forecast.
- Tells the AI to use only the verified hotel facts, places and distances, never to invent hours or prices,
  to answer briefly in the guest's language, to answer harmless general questions briefly, and to point to 911
  and the front desk in an emergency.
- Streams the answer to the kiosk word by word. Places the AI mentions appear as cards with QR codes.
- Accepts requests only from the CityPulse site, limits each location to 30 questions per 10 minutes and
  3,000 per day, and caps message length and conversation size.
- Stores no conversations. Guest questions are sent to the AI provider (Cloudflare, or Anthropic if a key is added).

## Settings (optional)

| Name | Default |
|---|---|
| `VENUE_URL` | `https://aeroassistindustries.github.io/spotlight-kiosks/assets/lexen-data.json` |
| `ALLOWED_ORIGINS` | `https://aeroassistindustries.github.io` |
| `CF_MODEL` | `@cf/google/gemma-4-26b-a4b-it` (free allowance) |
| `MODEL` | `claude-haiku-5-5` (only with `ANTHROPIC_API_KEY`) |
| `ADMIN_PASSWORD` | none (secret; the dashboard stays locked until it is set) |
| `VENUE_ID` | `lexen` (the venue the dashboard manages) |
| `GUIDE_URL` | `https://aeroassistindustries.github.io/spotlight-kiosks/concierge/` (where guide QR codes lead) |
