# CityPulse Digital website

Multi-page site for CityPulse Digital (City Pulse Digital LLC) — websites, SEO, social media, reputation
management, local listings and AI search visibility for local businesses. Sister company of CityPulse Kiosks;
same brand system (navy #0F1C2B, pulse teal #22C7B6, Bricolage Grotesque + Instrument Sans).

Built the same way as the CityPulse Kiosks site: pages are generated from Python, so the header, footer and
shared sections stay consistent, and the same source exports an installable WordPress theme.

## Editing

- `build/build.py` — every page's content
- `build/lib.py` — site constants (emails, phone, address), navigation, header, footer, components, forms,
  the service and industry data, testimonials and FAQs
- `build/pricing.py` — plans, website packages and à la carte prices (one place; every page picks them up)
- `build/legal.py` — Terms & Conditions and Privacy Policy
- `assets/styles.css` — all styles · `assets/site.js` — menus, forms, reveals · `assets/home.js` — the hero score card

After editing anything in `build/`, regenerate:

```
python3 build/build.py          # static site (index.html files)
python3 build/export_wp.py      # WordPress theme -> dist/citypulse-digital-theme.zip
```

## Forms

`assets/config.js` chooses where forms deliver (FormSubmit by default, to `forms.to`). In WordPress the theme
delivers forms itself (saved under **Inquiries** and emailed) — set the inbox under **Settings → CityPulse
Digital**. If delivery ever fails, the form opens a ready-made email draft in the visitor's own mail app.

## WordPress

See `HANDOFF.md`. Short version: Appearance → Themes → Upload `dist/citypulse-digital-theme.zip` → Activate.
All 19 pages are created on activation.

## Brand

`build/brand/make_logo.py` draws every logo file from the brand fonts (`build/brand/fonts/`, from
github.com/google/fonts, OFL) — `pip install uharfbuzz fonttools`, then run it and copy `out/*.svg` to
`assets/`. The descriptor reads DIGITAL; the kiosk company's reads KIOSKS. Rules in the kiosks repo:
`build/brand/README.md`.
