# Live AI concierge: setup

The kiosk's "Ask the concierge" gets live AI answers through a small relay (`concierge-worker.js`).
Until the relay is set up, the kiosk uses its built-in answers, and it switches back to them automatically
whenever the relay cannot be reached or the free daily AI allowance runs out.

## Free setup (Cloudflare Workers AI, no API key, no credit card)

The relay runs an open AI model (Google Gemma 4) on Cloudflare's free plan.

1. Sign up at https://dash.cloudflare.com (the free plan is enough).
2. Go to **Workers & Pages > Create > Create Worker**. Name it `spotlight-kiosks` (it must match `name` in `wrangler.toml`) and click **Deploy**.
3. Click **Edit code**, delete the sample, paste the whole of `cloudflare/concierge-worker.js`, and click **Deploy**.
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
- Stores nothing. Guest questions are sent to the AI provider (Cloudflare, or Anthropic if a key is added).

## Settings (optional)

| Name | Default |
|---|---|
| `VENUE_URL` | `https://aeroassistindustries.github.io/spotlight-kiosks/assets/lexen-data.json` |
| `ALLOWED_ORIGINS` | `https://aeroassistindustries.github.io` |
| `CF_MODEL` | `@cf/google/gemma-4-26b-a4b-it` (free allowance) |
| `MODEL` | `claude-haiku-5-5` (only with `ANTHROPIC_API_KEY`) |
