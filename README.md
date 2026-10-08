# Spotlight Kiosks website

Static multi-page site for Spotlight Kiosks — touch-screen venue kiosks that combine visitor information with local business advertising. Live on GitHub Pages: https://aeroassistindustries.github.io/spotlight-kiosks/

## Editing

Pages are generated from Python so the header, footer and shared sections stay consistent.

- `build/build.py` — every page's content
- `build/lib.py` — header, footer, navigation, shared components, forms and content data (venues, FAQs, campaign ideas, markets)
- `build/legal.py` — Terms & Conditions and Privacy Policy
- `assets/styles.css` — all styles, including the kiosk screen
- `assets/kiosk.js` — the interactive kiosk demo (venues, screens, the "Your ad here" ad slider, the behind-the-screen counters)
- `assets/site.js` — menus, tabs, filters, inquiry email drafts, campaign planner, creative studio, pricing calculator

After editing anything in `build/`, regenerate the pages:

```
python3 build/build.py
```

Then commit the regenerated `index.html` files along with your changes. No other build step or dependencies.

## Self-serve checkout (home page, "Get on a kiosk today")

One-location orders ($399/yr or $60/mo) go through a four-step checkout on the home page. To switch it on, fill in `assets/config.js`:

1. **Stripe** — in the Stripe dashboard create two Payment Links for "Spotlight kiosk ad — 1 location":
   a recurring yearly price of $399 and a recurring monthly price of $60.
   Under *After payment*, choose "Don't show confirmation page" and redirect to
   `https://aeroassistindustries.github.io/spotlight-kiosks/welcome/`.
   Paste the links into `stripeYearly` and `stripeMonthly`.
2. **Formspree** — create a form at formspree.io (file uploads need a paid plan), set the notification email
   to sales@spotlightkiosks.com, and paste the form endpoint into `formspree`.

The checkout sends the order details and uploaded logo/artwork to Formspree, then sends the customer to Stripe with
their email pre-filled and the order number as the `client_reference_id`, so each Stripe payment matches a Formspree order.
If a value is empty, that step falls back to email.

## Markets

Cities in the location dropdown and on the map live in `build/locations_data.py`. After editing it, rebuild the map
pins: export the cities to `cities.json`, run `node build/make-map.mjs build/usmap.json` (needs `npm i us-atlas topojson-client topojson-simplify d3-geo`), then run `python3 build/build.py`.

Map pins are pre-projected into `build/usmap.json` (generated with d3-geo's Albers USA projection and us-atlas state shapes).

## Notes

- Inquiry forms build an email draft in the visitor's browser (open in email, copy or download). Nothing is posted to a server.
- Businesses shown inside the kiosk demo and campaign examples are fictional.
