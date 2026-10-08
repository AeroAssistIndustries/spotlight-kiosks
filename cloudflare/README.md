# Live AI concierge: setup

The kiosk's "Ask the concierge" uses Claude for live answers through a small relay that holds the API key.
Until the relay is set up, the kiosk uses its built-in answers, and it switches back to them automatically
whenever the relay cannot be reached.

## 1. Claude API key (Anthropic Console)

1. Sign up at https://console.anthropic.com and add a payment method.
2. Go to **Settings > Limits** and set a **monthly spend limit** you are comfortable with. This is the real cost cap.
3. Go to **API Keys > Create Key**. Name it `citypulse-kiosk`. Copy the key. Keep it private: do not email it,
   paste it in chat, or put it in this repository.

## 2. The relay (Cloudflare Workers, free plan)

1. Sign up at https://dash.cloudflare.com (the free plan is enough).
2. Go to **Workers & Pages > Create > Create Worker**. Name it `citypulse-concierge` and click **Deploy**.
3. Click **Edit code**, delete the sample, paste the whole of `cloudflare/concierge-worker.js`, and click **Deploy**.
4. Go to the worker's **Settings > Variables and Secrets > Add**. Choose **Secret**, name `ANTHROPIC_API_KEY`,
   paste the key from step 1, and save.
5. Open `https://citypulse-concierge.<your-subdomain>.workers.dev/health`. It should show `{"ok":true}`.
6. Send the worker address (not the key) to whoever maintains the kiosk. It goes in `assets/lexen-data.js`:
   `ai: { endpoint: "https://citypulse-concierge.<your-subdomain>.workers.dev" }`.

Terminal alternative: `cd cloudflare && npx wrangler deploy && npx wrangler secret put ANTHROPIC_API_KEY`.

## What the relay does

- Builds the AI's instructions from the venue data (`assets/lexen-data.json`, made by `build/build.py`),
  the current Pacific time, and the National Weather Service forecast.
- Tells the AI to use only the verified hotel facts, places and distances, never to invent hours or prices,
  to answer briefly in the guest's language, and to point to 911 and the front desk in an emergency.
- Streams the answer to the kiosk word by word. Places the AI mentions appear as cards with QR codes.
- Accepts requests only from the CityPulse site, limits each location to 30 questions per 10 minutes and
  3,000 per day, and caps message length and conversation size.
- Stores nothing. Guest questions are sent to Anthropic to generate the answer.

## Settings (optional)

| Name | Default |
|---|---|
| `VENUE_URL` | `https://aeroassistindustries.github.io/spotlight-kiosks/assets/lexen-data.json` |
| `ALLOWED_ORIGINS` | `https://aeroassistindustries.github.io` |
| `MODEL` | `claude-haiku-5-5` |
