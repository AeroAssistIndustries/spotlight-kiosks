"""Packages and prices for CityPulse Digital. Edit here; every page and the theme pick it up."""

def money(n):
    return f"${n:,.0f}"

# Monthly growth plans (the main offer). "popular" marks the highlighted card.
PLANS = [
    dict(id="pulse", name="Pulse", price=899, tagline="Get found and look the part.",
         who="Single-location businesses that need the basics done right, every month.",
         includes=[
             "Google Business Profile setup and weekly optimization",
             "Listings synced across Google, Apple, Bing, Yelp and 40+ directories",
             "Review monitoring with written responses within one business day",
             "Automated review requests by text and email",
             "Social media on 2 platforms — 8 posts a month, designed and scheduled",
             "Monthly performance report in plain English",
         ]),
    dict(id="pulse-pro", name="Pulse Pro", price=1799, popular=True, tagline="Rank, grow and keep your reputation ahead.",
         who="Businesses competing for local search and ready to grow on every channel.",
         includes=[
             "Everything in Pulse",
             "Local SEO: keyword strategy, on-page work, technical fixes and local content",
             "AI search visibility — getting cited by ChatGPT, Gemini and Perplexity",
             "Social media on 3 platforms — 16 posts a month plus stories and community replies",
             "Reputation: review generation campaigns and competitor review tracking",
             "Website care: updates, backups, security and speed",
             "Quarterly strategy call",
         ]),
    dict(id="pulse-max", name="Pulse Max", price=2999, tagline="A full marketing department, without the payroll.",
         who="Multi-location brands, hotels and groups that need a team behind them.",
         includes=[
             "Everything in Pulse Pro",
             "Up to 3 locations included (more at $450 per location)",
             "Content: 2 blog articles or landing pages a month",
             "Paid social and Google Ads management (ad spend billed separately)",
             "Short-form video: 4 edited clips a month from your footage",
             "Dedicated account manager and monthly strategy call",
         ]),
]

# One-time website projects.
WEBSITES = [
    dict(name="Launch site", price=1499, pages="Up to 5 pages", lead="A fast, polished site for a new or small business.",
         includes=["Custom design on WordPress", "Mobile-first and accessible", "Contact forms, maps and click-to-call", "On-page SEO and Google indexing", "Launched in 2–3 weeks"]),
    dict(name="Business site", price=2999, pages="Up to 12 pages", lead="Room for services, locations, menus and a blog.", popular=True,
         includes=["Everything in Launch", "Booking, menu or inventory sections", "Reviews and social feeds built in", "Copywriting for every page", "Speed and schema optimization", "Launched in 3–5 weeks"]),
    dict(name="Custom build", price=None, pages="Unlimited", lead="Hotels, groups, e-commerce and anything with moving parts.",
         includes=["Discovery and strategy workshop", "Custom components and integrations", "E-commerce or booking engine", "Multi-location structure", "Training for your team"]),
]
CARE = 49  # website care plan, monthly

# Stand-alone services (monthly) for businesses that want one thing.
ALACARTE = [
    ("Social media management", 399, "2 platforms, 8 posts a month, scheduling and replies"),
    ("Local SEO", 499, "Google Business Profile, listings, on-page SEO, monthly report"),
    ("Reputation management", 199, "Review monitoring, responses and automated review requests"),
    ("Website care plan", CARE, "Updates, backups, security, speed and small edits"),
    ("AI search visibility (GEO)", 299, "Content and structured data for ChatGPT, Gemini and Perplexity"),
]

def fill(text):
    """Replace [[PLAN:id]] with a plan's monthly price and [[CARE]] with the care plan price."""
    for p in PLANS:
        text = text.replace(f"[[PLAN:{p['id']}]]", money(p["price"]))
    return text.replace("[[CARE]]", money(CARE))
