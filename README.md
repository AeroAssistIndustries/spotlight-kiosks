# CityPulse Kiosks website

Static multi-page site for CityPulse Kiosks (formerly Spotlight Kiosks) — touch-screen venue kiosks that combine visitor information with local business advertising. Live on GitHub Pages: https://aeroassistindustries.github.io/spotlight-kiosks/

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

## Integrations (forms + payments)

Everything that talks to an outside service goes through two files:

- `assets/config.js` — the settings. **This is the only file you edit to connect services.**
- `assets/integrations.js` — the code that sends forms and builds payment links. Pages never call a provider directly.

### Forms (currently live)

`forms.provider` is `"formsubmit"` and `forms.to` is `sarvesh.joshiaz@gmail.com`. Every inquiry form (Advertise, Host a kiosk,
Support, Contact) and every kiosk order is emailed there.

- **First use:** the first submission sends an activation email from FormSubmit to that inbox. Click *Activate form* once.
  Until then, submissions are held.
- **Orders** arrive with the uploaded logo/artwork attached (up to `maxUploadMB`, default 5 MB) and an order number like `CP-261008-AB12`.
- **To change the inbox,** edit `forms.to`. **To move to Formspree,** set `provider: "formspree"` and `endpoint: "https://formspree.io/f/xxxx"`.
- If delivery fails, the form opens an email draft in the visitor's own email app instead, so nothing is lost.

### Payments (ready for Stripe)

In Stripe create two Payment Links for "CityPulse kiosk ad — 1 location": $399 recurring yearly and $60 recurring monthly.
Under *After payment* redirect to `https://aeroassistindustries.github.io/spotlight-kiosks/welcome/`. Paste the links into
`payments.yearly` and `payments.monthly`.

Checkout then: delivers the order (with files) to your inbox → sends the customer to Stripe with their email pre-filled and the
order number as `client_reference_id` → Stripe returns them to the welcome page. Match the order number in the email to the
Stripe payment. With the links empty, checkout still delivers the order and you invoice the customer.

Other processors with hosted checkout links (Square, PayPal) work the same way — paste their links.

## Markets

Cities in the location dropdown and on the map live in `build/locations_data.py`. After editing it, rebuild the map
pins: export the cities to `cities.json`, run `node build/make-map.mjs build/usmap.json` (needs `npm i us-atlas topojson-client topojson-simplify d3-geo`), then run `python3 build/build.py`.

Map pins are pre-projected into `build/usmap.json` (generated with d3-geo's Albers USA projection and us-atlas state shapes).

## Notes

- Businesses shown inside the kiosk demo and campaign examples are fictional.
