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

## Notes

- Inquiry forms build an email draft in the visitor's browser (open in email, copy or download). Nothing is posted to a server.
- Businesses shown inside the kiosk demo and campaign examples are fictional.
