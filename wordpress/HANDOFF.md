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

## 6B. Concierge visit counts

- Every phone-page visit from a kiosk QR code is counted per venue, per day and per device (phone or desktop), and per item opened.
- Counts only. No IP addresses, names, phone numbers or cookies are stored.
- View them under **Orders & inquiries → Concierge visits** (administrators only).
- Counts are kept for one year.

## 6C. Hosts & kiosks (back end)

- **Hosts & kiosks** (admin menu) lists every host venue and kiosk. Administrators only.
- Each kiosk records: host name, email and phone, venue address, venue type, status (Planned, Installing, Live, Paused, Removed), install date, package, and internal notes.
- **Status controls what visitors see.** Only Live and Installing kiosks show a phone guide. Paused, Planned and Removed kiosks return "not found" to visitors.
- **Phone guide:** up to 8 cards (title, detail, hours). Shown when a visitor scans that kiosk's code.
- **Ad placements:** up to 6 per kiosk, with advertiser, headline, start and end dates, and an Active box. An ad shows only while it is active and within its dates.
- **Phone link:** each saved kiosk shows its link, `/concierge/?k=<kiosk-slug>`. Use this link in the kiosk's QR code.
- Host contact details and internal notes are never sent to visitors.
- Kiosk visits are counted under **Orders & inquiries → Concierge visits**, in a Kiosks table.
- Not included yet: live kiosk status from the hardware, ad tap reports per placement, and host logins. Those need the kiosk device software.

## 6D. Team operations area (access code)

- The page **/operations/** is created automatically. It is not in the menu and is hidden from search engines.
- Visitors enter a team access code. There are no user accounts for the team. The code is stored only as a password hash.
- A correct code lasts 12 hours. Changing the code signs everyone out.
- Failed attempts are limited to 10 per 15 minutes per visitor.
- Administrators set the access code and add team files on the same page: single PDF, Word or Excel files, or one .zip of them (up to 60 files).
- Team files are kept in `wp-content/uploads/citypulse-private/team/`, which web access is denied to. Each file downloads only after the code is checked.
- Share the access code only with team members. Change it when someone leaves.

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
  inc/visits.php         Concierge visit counts (AJAX endpoint citypulse_visit) and the report screen
  inc/kiosks.php         Hosts & kiosks back end: kiosk records, phone guide, ad placements, guide endpoint
  inc/access.php         Team operations area: access code, signed 12-hour cookie, team file downloads
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

## 6E. Kiosk fleet (device heartbeat, host logins, offline alerts)

File: `inc/fleet.php`.

- **Device token:** each kiosk has a token, generated when the kiosk is first saved (or when "Generate a new token" is ticked). It's shown once in the kiosk's "Device and host login" box. Only a keyed hash is stored.
- **Heartbeat:** the device POSTs to `/wp-admin/admin-ajax.php?action=citypulse_heartbeat` with `kiosk` (the kiosk slug), `token` and `version`, every 2 to 5 minutes. The reply is `{"action":"run"}` for Live or Installing kiosks and `{"action":"standby"}` otherwise, so the device knows whether to show the program.
- **Online:** a kiosk is online if its last heartbeat was within 15 minutes. The kiosks list shows the device status.
- **Host login:** create a user with the role "Kiosk host", then choose that user in the kiosk's "Host login" box. Create a page with the slug `host` and the shortcode `[citypulse_host]`. Hosts see only their kiosks: status, device status, and phone and desktop visits for the last 30 days. Hosts are sent away from wp-admin.
- **Offline alerts:** every 10 minutes, the administrator email gets a message for each Live kiosk that hasn't checked in for 15 minutes. At most one alert per kiosk every 6 hours.
- **Privacy:** no IP addresses or personal data are stored. Only the last-seen time, the app version and the status.

Tested with a stub harness (`/tmp/cp_fleettest/test.php`, 21 checks). It has not been tested on a live WordPress site or on a kiosk device.

## 6F. Kiosk screen content and player (inc/media.php)

- **Add content:** Hosts & kiosks → edit a kiosk → "Screen content (pictures and videos)" → "Add pictures or videos" (WordPress media library) → Update. Order is the order shown. Up to 40 items. PDFs and other files are ignored.
- **Player page:** create a page with the slug `kiosk-player` and the shortcode `[citypulse_kiosk_player]`. Open it on the kiosk in Chrome, enter the kiosk's slug and device token once, then tap Full screen. The kiosk remembers them.
- **What the player does:** loads the kiosk's pictures and videos, refreshes the list every 10 minutes, checks in every 5 minutes (Device column shows Online), and keeps the screen awake. Pictures change every 8 seconds; videos play to the end. Standby kiosks (Paused or Removed) receive no content.
- **Server limits:** videos need the host's upload limit set high enough (typically 64 MB or more). Check `upload_max_filesize` and `post_max_size` with the host.
- **Requirements:** HTTPS on the site (the kiosk's connection depends on it), and PHP 8.0 or newer.

Tested with stub harnesses (`media_test.php`, 6 checks) and a browser test of the player with mocked site responses. Not yet tested on a live WordPress site or the ELO device.

## 6G. Live concierge kiosk (Lexen North Hollywood)

- **Kiosk screen:** `/kiosk-app/`. Built by `assets/cp-kiosk.js` and `assets/cp-kiosk.css`. The website demo kiosk (`/kiosk/`, `assets/kiosk.js`) is separate and unchanged.
- **Content:** all text, places, tiles and concierge answers are in `assets/lexen-data.js`. Edit that file, push to `main`, and the kiosk updates on its next load.
- **Featured businesses (ads):** listed in `sponsors` in `assets/lexen-data.js`: name, kind, tagline, website (shown as text), url (opened by the QR code on the guest's phone), item (the matching place, for walking time) and an optional logo file. They rotate every 8 seconds with equal time each. Nothing in the carousel can be tapped. With no sponsors listed, one "Advertise here" slide shows instead. The staff menu shows ad views per business.
- **Phone guide:** every "Take this guide with you" QR code opens `/concierge/?v=lexen`. Each place's QR code opens Google Maps directions.
- **Offline:** `kiosk-app/sw.js` keeps the kiosk working if the internet drops. When you change `cp-kiosk.js`, `cp-kiosk.css` or `lexen-data.js`, raise the `?v=` number in `build/build.py` and in `CORE` in `sw.js`, and change `CACHE` (for example `cpk-v2`).
- **Staff menu:** hold the hotel logo for 3 seconds, or tap the corner button while in full screen. After the staff password, it shows the last 7 days of activity on that kiosk (sessions, places opened, questions, ad views and taps). These counts stay on the kiosk; reporting across kiosks needs the WordPress back end.
- **Weather:** from the US National Weather Service (free, no key): current conditions in the top bar and a 7-day forecast on the home screen. The last forecast stays on the kiosk if the internet drops.
- **Time zone:** the clock and greeting use the venue's time zone (`tz` in the data file, Pacific for the Lexen), whatever the kiosk device is set to.
- **Lockdown:** `/kiosk-app/` is a standalone page with no website links. A Content Security Policy lets it load only its own files and the weather service. Links, new tabs, right-click, zoom, text selection and browser shortcuts are blocked. QR codes are the only way out, and they open on the guest's phone. Also turn on the ELO's own kiosk mode (EloView or Android single-app mode) so guests cannot leave the browser.
- **Navigation:** Back is at the top left on every screen and also in the bottom bar, so it stays within wheelchair reach. Lists remember their scroll position. After 48 seconds idle (96 with accessibility options on), a 12-second "Are you still there?" warning appears before the screen resets.

- **Live AI concierge:** "Ask the concierge" is a conversation. With the relay set up (`cloudflare/README.md`), answers come from a free Cloudflare Workers AI model (or Claude, if a key is added), stream in word by word, use the venue's verified facts plus live Pacific time and weather, reply in the guest's language, and show cards (with QR codes) for places they mention. Without the relay, or if it fails or takes more than 10 seconds, the built-in answers reply instantly, labeled "quick answer". The conversation clears when the kiosk resets. The relay address goes in `ai.endpoint` in `assets/lexen-data.js`; the kiosk's security policy already allows `*.workers.dev`.
- **Neighborhood map and Plan my day (v14):** the home screen has two feature cards. "Your neighborhood" is a drawn map (no map service) with the hotel at the center, rings for 5, 10, 20 and 30 minutes on foot, and every place as a colored point at its real direction and walking time (filters by section; tap a point, or use the nearest-first list). "Plan my morning / afternoon / evening" builds a 2-stop walking plan from the hotel's own places (templates in `PLANS` in `assets/cp-kiosk.js`), with times, the route drawn on a zoomed map, and one QR code (`/go/<venue>/plan/<id>.<id>`) that opens the whole walking route in Google Maps. A sponsored place that fits a step and is only a short walk further is chosen first and labeled Sponsored. The kiosk also got a quieter, more cinematic look: light display type, hairline glass, a slow sheen over the hotel name, and soft fade-and-focus page changes.
- **Home screen tiles (v15):** the home screen is a grid of square "live tiles" (after Windows Phone / Metro): a large clock tile in hotel time, a weather tile with now plus all 7 days, a gold Ask the concierge tile cycling real questions, the six section tiles (photo or deep color), the neighborhood map tile, a Plan my day tile cycling plan ideas, and a white Take it with you QR tile. Tiles tilt toward the touch when pressed. The grid always fits the screen (6 columns landscape, 4 portrait). Corners are square across the kiosk (`--r: 3px`); the map stays round.
- **Header and dock (v16):** the hotel logo is larger. The bottom dock (Home, Back, Ask, Accessibility) uses cut-corner buttons with a dark metal gradient; the button for the current screen turns brushed gold with a light sweep, and any button flashes gold while pressed. Back is dimmed when there is nowhere to go back to. The kiosk root can no longer be scrolled by accident (no strip of photo below the dock).
- **QA polish (v17):** full guest walkthrough in both orientations. Larger text and Lower the screen now scale the home tiles to fit (nothing clipped); ads keep standard size in Larger text and long ad descriptions stop at two lines; the neighborhood tile label sits on a dark fade so the moving lights never cover it; between midnight and 4 AM the clock tile says "Late night in NoHo" instead of "Good evening".
- **Dashboard theme (v6):** the staff dashboard now matches the kiosk: always-dark navy, square Metro-style tiles (KPI cards and quick actions in the kiosk's deep tile colors), cut-corner metal buttons with uppercase labels, and brushed gold (AeroAssist style) for primary actions, the selected period and the current page in the sidebar. Styles are the "v6: kiosk theme" block at the end of `cloudflare/admin/index.html`; rebuild with `node cloudflare/build-admin.mjs`.
- **Staff dashboard (back end):** `https://spotlight-kiosks.sarvesh-bb0.workers.dev/admin`, password protected (secret `ADMIN_PASSWORD` on the worker). Edit hotel details, logo and background photos, home screen buttons, places, concierge answers and sponsored ads (logo upload, show/hide, order); publish; restore earlier versions. Overview shows sessions, places, questions, ad views and QR scans across all kiosks, with a CSV ad report for advertisers, and a Kiosks tab shows each screen's last check-in. Content and counts live in a free Cloudflare D1 database (binding `DB`). Kiosks load `assets/cp-content.js` before the kiosk script: it uses the last published content saved on the device, checks for new content every 5 minutes (switching on the welcome screen), sends counts once a minute, and routes QR codes through counted `/go/` links on the worker. Name a kiosk by opening it once with `?kiosk=lobby`. Also in the dashboard: ad campaign start/end dates (the kiosk shows an ad only within them and reloads at the start of each day), a printable advertiser report per business (Print or save as PDF), views with a guest present and guests reached per ad, busiest hours, a live preview of each ad as it looks on the kiosk, Google Maps link lookup for place locations, and offline alerts with each kiosk's screen size and software version. Also: announcements shown on the kiosk (with dates), remote Restart per kiosk or all kiosks (within about 2 minutes, when idle) and Remove from the list, private deal details per advertiser (contact, monthly price, status, notes; stored in the `deals` table and never sent to kiosks) with a monthly revenue total, and a private live report link per advertiser (`/r/<venue>/<ad>/<token>`, no sign-in; changing ADMIN_PASSWORD turns all links off). Dashboard layout (v5): dark sidebar with badges, top bar with a live hotel-time clock and search (Ctrl/⌘ K command palette to jump to any page, place, advertiser, answer or action), Overview hero with analog and digital clock and a plain-English summary of the period, KPI cards with change vs the previous period and sparklines, Next best actions, kiosk status, ad revenue, quick actions, recent changes, and a shared Notes board (sticky notes, colors, pin, to-dos; `notes` table). Setup steps: `cloudflare/README.md`.
