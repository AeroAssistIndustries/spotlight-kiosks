# CityPulse Kiosks — WordPress developer handoff

**Package version:** 1.0.0 · October 2026
**Contact:** Sarvesh Joshi · sarvesh.joshiaz@gmail.com · 602-887-4058
**Reference site (static build of the same pages):** https://aeroassistindustries.github.io/spotlight-kiosks/
**Source repository:** https://github.com/AeroAssistIndustries/spotlight-kiosks

---

## 1. What's in this package

| File | What it is |
|---|---|
| `citypulse-theme.zip` | Installable WordPress theme. Upload it, activate it, and all 30 site pages are created automatically. |
| `HANDOFF.md` / `HANDOFF.pdf` | This document. |
| `brand/` | Logo (SVG + PNG, dark and light versions), favicon, app icon, social share card. |

The theme was tested on WordPress 6.8.3 / PHP 8.3: all 29 pages at desktop, tablet and phone widths (no layout overflow, no script errors, text contrast checked), and 31 interactive flows including real form submissions and file uploads.

## 2. Requirements

- WordPress 6.0 or newer, PHP 7.4 or newer (8.x recommended)
- Pretty permalinks (the theme turns on `/%postname%/` if permalinks are plain)
- HTTPS
- **Outgoing email that works.** Install an SMTP plugin (e.g. WP Mail SMTP, FluentSMTP) and connect it to the company mailbox. Without it, orders are still saved in WordPress but the email copy may not arrive.
- Single-site install. On multisite, only super admins can save the page HTML (see §9).

## 3. Install

1. **Appearance → Themes → Add New → Upload Theme**, choose `citypulse-theme.zip`, then **Activate**.
2. Load any front-end page once. That first page load finishes setup:
   - It creates the 30 pages, with the right parent pages and URLs.
   - It sets **Home** as the front page and **Privacy Policy** as the privacy page.
   - It turns on pretty permalinks if they're off.
   - It sets the site title to "CityPulse Kiosks" if it's still the WordPress default.
3. Go to **Settings → CityPulse** and set:
   - Forms delivery and the "Send to" address
   - Payment links (see §5)
4. Delete WordPress's default "Sample Page" and any default posts.
5. Submit a test inquiry from **/contact/** and a test order from the home page. Check both arrive by email and appear under **Orders & inquiries**.

If a page is ever deleted, **Settings → CityPulse → Create missing pages** recreates it. Tick the box beside it only if you want to reset every page to the original content; that overwrites edits.

## 4. Pages created

```
/                         Home (hero slider, "How it works" animation, checkout, kiosk demo, US map …)
/kiosk/                   The kiosk (demo + hardware)
/advertise/  /pricing/  /campaign-planner/  /creative-studio/  /campaign-ideas/
/audience/  /locations/  /agencies/
/hosts/  /venues/  /venues/hotels/  /venues/medical/  /venues/automotive/  /venues/restaurants/
/resources/  /resources/first-local-campaign/  /resources/screen-creative/  /resources/host-preparation/
/how-it-works/  /media-kit/  /measurement/  /faqs/  /about/  /contact/  /support/
/welcome/                 Shown after payment (Stripe redirects here)
/terms/  /privacy/
/company-documents/       Admins only. Company agreements and policies (PDF). Not in the menu, noindex.
```

## 5. Forms, orders and payments

### Forms and orders

Settings live in **Settings → CityPulse → Forms and orders**.

- **Delivery = WordPress** (default, recommended). Every inquiry and kiosk order is:
  - saved under **Orders & inquiries** in the admin menu, with uploaded files listed in the side box;
  - emailed to the "Send to" address, with the files attached.
- **Uploaded files** go to `wp-content/uploads/citypulse-submissions/`, outside the media library. Direct web access is blocked by `.htaccess` (Apache). **On Nginx, add an equivalent deny rule** for that folder. Admins download files from the order screen.
- **Spam protection:** a honeypot field (`_gotcha`) and a limit of 10 submissions per visitor every 10 minutes.
- **Other delivery options:** FormSubmit (email only, no WordPress copy), Formspree, or Off. With Off, the form opens an email draft in the visitor's own mail app.
- **If delivery fails** for any reason, the visitor gets that same email draft, so no lead is lost.

**Forms on the site:**
- Home-page checkout (one location, $399/yr or $60/mo, with logo/artwork upload)
- Advertise inquiry (`/advertise/#inquiry`)
- Host a kiosk (`/hosts/#inquiry`)
- Support (`/support/#request`)
- Contact message (`/contact/#message`)

### Payments — Stripe Payment Links

1. In Stripe, create two products/prices:
   - "CityPulse kiosk ad — 1 location", recurring **yearly $399**
   - "CityPulse kiosk ad — 1 location", recurring **monthly $60**
2. Create a Payment Link for each one. Under **After payment**, choose **Don't show confirmation page** and redirect to `https://YOUR-DOMAIN/welcome/`.
3. Paste both links into **Settings → CityPulse → Payments**.

How checkout runs:
1. The order and files are saved and emailed.
2. The customer is redirected to Stripe with their email filled in, and the order number (e.g. `CP-261008-AB12`) set as `client_reference_id`.
3. Stripe returns them to `/welcome/`.
4. Match the order number in Stripe to the WordPress order.

Leave the links empty to take orders and invoice manually. Any processor with hosted checkout links (Square, PayPal) works the same way — choose "Other" as the processor.

Multi-location packages (3 for $1,099/yr, 5 for $1,200/yr, +$300/yr for each location after 5) currently go through the Advertise inquiry form and are invoiced by the sales team. Self-serve checkout is one location only. Adding packages to checkout is a natural phase 2.

## 6. Editing content

- **Page content.** Each page is a series of **Custom HTML** blocks, one per section, editable in the block editor.
  - Links inside the content are written as `{{CP_HOME}}advertise/`.
  - Theme images are written as `{{CP_ASSETS}}kiosk-lobby.jpg`.
  - The theme swaps these tokens for the real URLs when the page is shown, so content survives a domain change. Keep the tokens when editing.
- **Page titles and meta descriptions.** The meta description is stored in post meta `_citypulse_desc`. If you install Yoast, Rank Math, All in One SEO or SEOPress, the theme stops printing its own description and social tags, and the plugin takes over.
- **Header and footer:**
  - Navigation, mega-menus and footer columns are in `header.php` and `footer.php`.
  - Contact email, phone and address appear in `footer.php` and in the page content.
  - Social links: the footer has none yet. Add CityPulse profiles to `footer.php` (or to `SOCIALS` in `build/lib.py` if rebuilding).
- **Market list (153 cities, all 50 states + DC)** is in the content of the Home and Locations pages, and in the checkout's city dropdown. To change it, edit `build/locations_data.py` in the repo and re-export (§8). Map pins are pre-calculated in `build/usmap.json`.
- **Pricing.** Pricing copy is in the content of the Pricing, Advertise, Home and FAQ pages. The price calculator's logic is in `assets/site.js` (search for `annual =`). Checkout prices are in `assets/checkout.js` and the payment links.
- **Kiosk demo** content (venues, screens, example businesses) is in `assets/kiosk.js`. All businesses in the demo are fictional.

## 6A. Company documents (admins only)

- The page **/company-documents/** is created automatically. It shows a sign-in button to visitors. Only accounts with the Administrator role see the documents.
- Upload PDFs on that page: enter a name, choose the file (max 25 MB), and click **Upload PDF**. Remove a document with **Remove**.
- PDFs are stored in `wp-content/uploads/citypulse-private/`, which web access is denied to. They are only streamed after the admin check.
- Recommended: turn on two-factor sign-in for every administrator account, because this page holds company agreements.
- Nginx only: deny web access to `wp-content/uploads/citypulse-private/`.

## 7. Theme structure

```
citypulse/
  style.css              Theme header only
  functions.php          Enqueues, meta tags, {{CP_*}} token replacement, nav helpers
  header.php / footer.php
  page.php, front-page.php, index.php, single.php, 404.php
  inc/settings.php       Settings → CityPulse (forms, payments, page tools)
  inc/setup.php          Creates pages on activation from content/pages.json
  inc/forms.php          Orders & inquiries post type, AJAX handler (citypulse_submit), private uploads
  inc/documents.php      Admin-only Company documents page (sign-in gate, PDF upload, private streaming)
  content/pages.json     Original page content (used on activation and for "reset")
  assets/styles.css      All styles (design tokens at the top: navy #0F1C2B, teal #22C7B6)
  assets/site.js         Menus, tabs, filters, forms, planner, studio, calculator, map, slider, journey animation
  assets/kiosk.js        Interactive kiosk demo
  assets/checkout.js     Self-serve checkout
  assets/integrations.js The only code that talks to form services and payment links
  assets/*.svg|png|jpg   Logo, icons, photos
```

**Scripts.** All scripts load on every page in the footer, with no jQuery and no build step. Each script only runs when its elements are on the page. The browser config (`window.CITYPULSE_CONFIG`) is printed inline from the settings. It contains no secrets.

**Fonts.** Bricolage Grotesque, Instrument Sans and Fraunces load from Google Fonts. For GDPR-strict hosting, self-host them and replace the `citypulse-fonts` enqueue.

## 8. Rebuilding the theme from source

The site is generated from Python in the repo, so the static site and the theme always match.

```
python3 build/build.py        # static site (GitHub Pages preview)
python3 build/export_wp.py    # WordPress theme -> dist/citypulse-theme.zip
```

Edit content in `build/build.py`, shared parts in `build/lib.py`, legal text in `build/legal.py`. After re-exporting, upload the new theme. Existing pages are not overwritten; use **Create missing pages** with the reset box ticked to push new content into pages.

## 9. Notes and cautions

- **Caching:** compatible with page caching. Forms post to `admin-ajax.php` and don't use nonces, so cached pages don't break submissions.
- **HTML in pages:** the page content contains forms, SVG and `data-` attributes.
  - Only users with the `unfiltered_html` capability (administrators on single-site) should edit those pages. Editors without it will have parts of the HTML stripped when they save.
  - On multisite, only super admins have it.
- **Email deliverability:** use an SMTP plugin with SPF/DKIM set up for the sending domain.
- **Accessibility:** includes skip link, visible focus, keyboard-operable menus, tabs, sliders and kiosk demo, and support for reduced-motion settings. Text contrast meets WCAG AA across the pages checked.
- **Example data:** the animation figures (views, taps, scans) and the kiosk demo businesses are illustrative and labelled as examples.

## 10. Go-live checklist

- [ ] Domain pointed and HTTPS on; site URL set in Settings → General
- [ ] Mailboxes created for **sales@citypulsekiosks.com** and **support@citypulsekiosks.com** (both appear on the site)
- [ ] SMTP plugin connected; test email received
- [ ] Settings → CityPulse: Delivery = WordPress, Send to = the sales inbox
- [ ] Stripe Payment Links created, pasted, and redirecting to `/welcome/`; one live test order refunded
- [ ] Test each form: contact, advertise, host, support, checkout (with an image upload)
- [ ] Nginx only: deny web access to `wp-content/uploads/citypulse-submissions/`
- [ ] Terms & Conditions and Privacy Policy reviewed by counsel (they describe renewal, cancellation, the 30-day placement refund, and the services used: Stripe and the form service)
- [ ] Add CityPulse social profile links to the footer when the accounts exist
- [ ] Delete the WordPress "Sample Page" and "Hello world" post
- [ ] Analytics (GA4 or similar) added, if wanted; then add it to the Privacy Policy
- [ ] Submit sitemap (`/wp-sitemap.xml`) to Google Search Console
- [ ] Backups and security plugin configured
