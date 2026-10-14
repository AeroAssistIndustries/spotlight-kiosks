# CityPulse Digital — WordPress handoff

**Theme version:** 1.0.0 · October 2026 · **Contact:** Sarvesh Joshi · 602-887-4058

## Install

1. **Appearance → Themes → Add New → Upload Theme**, choose `citypulse-digital-theme.zip`, then **Activate**.
2. Load any front-end page once. That first load creates the 19 pages, sets **Home** as the front page and
   **Privacy Policy** as the privacy page, and turns on pretty permalinks (`/%postname%/`) if they're off.
3. **Settings → CityPulse Digital**: Delivery = WordPress, Send to = the inbox that should get leads.
4. Install an SMTP plugin (WP Mail SMTP or FluentSMTP) connected to the company mailbox so emails arrive.
5. Delete the default "Sample Page" and "Hello world" post.
6. Submit a test from **/free-audit/** and **/contact/**; check both arrive by email and under **Inquiries**.

If a page is ever deleted, **Settings → CityPulse Digital → Create missing pages** recreates it.

## Pages

```
/                      Home (hero score card, services, proof, process, industries, testimonials, plans, FAQ)
/services/             + /services/websites/ /seo/ /social-media/ /reputation/ /local-listings/ /ai-search/
/industries/           hotels · restaurants · medical · automotive · home services (one page, anchored)
/pricing/              Growth plans, website packages, à la carte
/work/                 Hotel Lexen case study, selected work, testimonials
/about/  /how-we-work/  /faqs/
/free-audit/           Lead form (the main call to action across the site)
/contact/  /support/
/terms/  /privacy/
```

## Forms

Three forms: free audit, contact, client support. With Delivery = WordPress each submission is saved as a
private **Inquiry** in the admin and emailed to the Send-to address with Reply-To set to the visitor.
Spam protection: honeypot field and 10 submissions per visitor per 10 minutes. `?plan=pulse-pro` on the
contact page preselects a plan (the pricing buttons use this).

## Editing content

- Each page is a series of **Custom HTML** blocks. Links are written as `{{CP_HOME}}pricing/` and theme
  images as `{{CP_ASSETS}}img/lexen-exterior.jpg`; the theme swaps the tokens for real URLs, so keep them.
- Only administrators (who have `unfiltered_html`) should edit these pages; editors will have SVG and form
  markup stripped on save.
- Prices appear on Home, Pricing, Services and FAQ pages. The source of truth is `build/pricing.py` in the
  repo; re-export and use **Create missing pages** with the reset box ticked to push new prices into pages.
- Header/footer navigation and contact details: `header.php` / `footer.php`.
- Meta descriptions are in post meta `_cpd_desc`. Yoast, Rank Math, AIOSEO or SEOPress take over automatically.
- The home page prints `ProfessionalService` structured data (name, address, phone) — edit in `functions.php`.

## Go-live checklist

- [ ] Domain pointed, HTTPS on, site URL set in Settings → General
- [ ] Mailboxes: **hello@citypulsedigital.com** and **support@citypulsedigital.com** (both appear on the site)
- [ ] SMTP plugin connected; test email received
- [ ] Settings → CityPulse Digital: Delivery = WordPress, Send to = the sales inbox
- [ ] Test all three forms
- [ ] Review prices on /pricing/ and the plan inclusions
- [ ] Terms & Privacy reviewed by counsel (three-month initial term, 30-day cancellation, 50% website deposit)
- [ ] Add social profile links to `footer.php` (or `SOCIALS` in `build/lib.py`) when the accounts exist
- [ ] Google Business Profile for CityPulse Digital; submit `/wp-sitemap.xml` to Search Console
- [ ] Analytics (GA4), then mention it in the Privacy Policy
- [ ] Backups and security plugin
