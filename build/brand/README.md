# CityPulse logo source

`make_logo.py` draws every logo file from the brand fonts, so the logo can be rebuilt exactly.

1. Put `BricolageGrotesque.ttf` and `InstrumentSans.ttf` (from github.com/google/fonts, OFL) in `build/brand/fonts/`.
2. `pip install uharfbuzz fonttools` then `cd build/brand && python3 make_logo.py` — files land in `build/brand/out/`.
3. Copy the files you changed into `assets/`.

**The idea.** The pulse is a place sending a signal to the people nearby. It is the teal dot on the "i",
and the icon: a dot with rings that open into a C.

**Rules.** Navy wordmark with teal dot on light backgrounds; white wordmark with teal dot on navy; navy wordmark
with a white dot on teal. Don't put the icon next to the wordmark (it reads "C CityPulse"): use the wordmark on
its own, and the icon where there's only room for a square (app, favicon, social avatar, kiosk corner).
Clear space around the logo: the height of the "C". Smallest size: 22 px tall for the wordmark, 16 px for the icon.

**Colors.** Night navy #0F1C2B · Pulse teal #22C7B6 · Deep teal #0E6B63 (text and links on light) · Paper #F4F6F7 · Slate #4A5C70.
**Type.** Bricolage Grotesque (headlines, wordmark) · Instrument Sans (text, the KIOSKS descriptor).
