"""Photo manifest. Drop high-resolution JPGs into assets/photos/ with these exact filenames and the
build uses them; anything missing falls back to an animated brand graphic, so the site never breaks.

Each entry: filename -> (what the picture should be, alt text, where it's used).
Target: 2400px on the long edge, JPG, landscape unless noted. Real people, natural light, candid."""

PHOTOS = {
  # home
  "hero-owner.jpg": ("A small-business owner (hotel GM, restaurateur or shop owner) on their phone or at the front desk, smiling, looking slightly off-camera. Portrait orientation works best.", "A business owner checking her phone at the front desk", "Home hero"),
  "team-work.jpg": ("A small marketing team at a table with laptops, one person pointing at a screen; warm, candid.", "The CityPulse Digital team reviewing a client's monthly report", "Home 'team at work' band, About"),
  "customer-phone.jpg": ("A person on a city street looking at their phone, choosing where to go — the 'customer is already looking' moment.", "A customer searching for a nearby business on her phone", "Home 'why it matters'"),
  # industries (hero backgrounds, landscape)
  "ind-hotels.jpg": ("Hotel front desk: a receptionist welcoming a guest, lobby in the background.", "A hotel receptionist welcoming a guest", "Hotels industry page hero"),
  "ind-restaurants.jpg": ("A chef or server in a busy restaurant, plates going out, guests in soft focus.", "A server carrying plates through a busy restaurant", "Restaurants industry page hero"),
  "ind-medical.jpg": ("A dentist or doctor greeting a patient at reception, friendly, bright clinic.", "A dentist greeting a patient at the front desk", "Medical industry page hero"),
  "ind-automotive.jpg": ("A service advisor handing keys to a customer at a dealership, cars behind.", "A service advisor handing keys to a customer", "Automotive industry page hero"),
  "ind-home-services.jpg": ("A plumber, electrician or contractor talking with a homeowner at the door, van in the drive.", "A contractor talking with a homeowner at the door", "Home services industry page hero"),
  # services (one person each, portrait or square crop works)
  "svc-websites.jpg": ("A designer reviewing a website on a laptop and phone side by side.", "A designer checking a website on a phone and laptop", "Websites service page"),
  "svc-seo.jpg": ("Someone searching on Google Maps on a phone, map visible.", "Searching for a nearby business on a map", "SEO service page"),
  "svc-social-media.jpg": ("A restaurant owner filming a short video of a dish with a phone.", "A restaurant owner filming a dish for social media", "Social media service page"),
  "svc-reputation.jpg": ("A customer leaving a review on a phone at a counter, staff member smiling.", "A customer leaving a review at the counter", "Reputation service page"),
  "svc-local-listings.jpg": ("A storefront with a clear sign and an 'open' feel — people walking past.", "A welcoming storefront on a busy street", "Local listings service page"),
  "svc-ai-search.jpg": ("A person asking a voice assistant or typing into a chat app on a phone, modern setting.", "Asking an AI assistant for a recommendation", "AI search service page"),
  # stories / about
  "story-restaurant.jpg": ("Family restaurant owners in their dining room, proud, candid.", "The owners of a family restaurant in their dining room", "Restaurant customer story"),
  "story-ecommerce.jpg": ("A small e-commerce founder packing orders or photographing products.", "An e-commerce founder packing orders", "E-commerce customer story"),
  "about-office.jpg": ("A bright, modern small office — Phoenix feel — with two or three people working.", "The CityPulse office in Phoenix", "About page"),
  "about-sarvesh.jpg": ("Sarvesh Joshi, founder — a real headshot, natural light, looking at camera. Square crop.", "Sarvesh Joshi, founder of CityPulse Digital", "About page, team"),
  "audit-call.jpg": ("A consultant on a video call with a client, laptop open, notes beside.", "A CityPulse strategist on a call with a client", "Free audit page, Contact"),
}
