/* Lexen North Hollywood: kiosk and phone-guide content.
   Hotel facts: the hotel's own site (address, phone, email) and the owner (3:00 PM check-in, $10/day parking).
   Other hotel amenities come from public hotel listings. Places come from public map listings (October 2026).
   Hours change, so the kiosk does not show them: each QR code opens live details and directions on the guest's phone.
   To edit: change the text below, save, and the kiosk updates on its next load. */
window.CP_VENUE = {
  id: "lexen",
  name: "Lexen North Hollywood",
  short: "Lexen North Hollywood",
  address: "5268 Tujunga Ave, North Hollywood, CA 91601",
  ll: [34.1668794, -118.3787684],
  tz: "America/Los_Angeles",
  /* Live AI concierge: the address of the relay (cloudflare/concierge-worker.js), for example
     "https://citypulse-concierge.yourname.workers.dev". Leave empty to use the built-in answers only. */
  ai: { endpoint: "" },
  phone: "(818) 821-3680",
  tel: "+18188213680",
  email: "lexennoho@gmail.com",
  logo: "lexen/logo-transparent.png",
  photos: ["lexen/exterior.jpg", "lexen/room.jpg", "lexen/lounge.jpg"],

  /* Home screen tiles, in order. "photo" tiles use a hotel photo; the rest use an icon. */
  tiles: [
    { id: "eat", label: "Eat & drink", sub: "Restaurants a short walk away", icon: "fork", photo: "lexen/lounge.jpg" },
    { id: "hotel", label: "Hotel services", sub: "Wi-Fi, parking, fitness, check-out", icon: "bell", photo: "lexen/room.jpg" },
    { id: "coffee", label: "Coffee", sub: "Cafés steps from the hotel", icon: "coffee" },
    { id: "todo", label: "Things to do", sub: "Studios, theatre and parks", icon: "spark" },
    { id: "essentials", label: "Essentials", sub: "Pharmacy, groceries, urgent care", icon: "bag" },
    { id: "getting", label: "Getting around", sub: "Metro, rideshare and airports", icon: "car" }
  ],

  categories: {
    eat: {
      label: "Eat & drink", icon: "fork",
      intro: "Restaurants within a short walk of the hotel, plus breakfast in our lobby.",
      items: ["lx-breakfast", "nohodiner", "granville", "smash", "citykitchen", "nohopizza", "maki", "mexislice"]
    },
    coffee: {
      label: "Coffee", icon: "coffee",
      intro: "Coffee in the lobby, and independent cafés on Lankershim Blvd, about three minutes on foot.",
      items: ["lx-coffee", "amp", "moxie", "mooncafe", "horrorvibes", "eggspresso"]
    },
    hotel: {
      label: "Hotel services", icon: "bell",
      intro: "Everything at Lexen North Hollywood. The front desk is open 24 hours.",
      items: ["lx-desk", "lx-checkin", "lx-wifi", "lx-parking", "lx-ev", "lx-fitness", "lx-luggage", "lx-terrace", "lx-meeting"]
    },
    todo: {
      label: "Things to do", icon: "spark",
      intro: "The NoHo Arts District is outside the door. The studios are a short drive or one Metro stop away.",
      items: ["universal", "citywalk", "warner", "elportal", "nohoarts", "nohopark", "griffith", "walkoffame"]
    },
    essentials: {
      label: "Essentials", icon: "bag",
      intro: "Pharmacy, groceries, urgent care and fuel near the hotel. In an emergency, call 911.",
      items: ["exer", "cvs-south", "cvs-north", "ralphs", "foodmart", "shell", "mobil"]
    },
    getting: {
      label: "Getting around", icon: "car",
      intro: "North Hollywood Metro station is a four-minute walk. Rideshare pickup is at the hotel entrance.",
      items: ["metro", "lx-rideshare", "bur", "lax"]
    }
  },

  /* Places and services. ll = map position. Places with ll get distance, walking time and a directions QR code. */
  items: {
    /* Hotel */
    "lx-desk": { n: "Front desk", k: "Open 24 hours", hotel: 1, d: "The front desk is open around the clock for help with your stay, directions, taxis and recommendations. Call (818) 821-3680 or email lexennoho@gmail.com.", f: [["Hours", "24 hours"], ["Phone", "(818) 821-3680"]] },
    "lx-checkin": { n: "Check-in and check-out", k: "Check-in 3:00 PM · Check-out 11:00 AM", hotel: 1, d: "Check-in starts at 3:00 PM. Check-out is by 11:00 AM. For early check-in or late check-out, ask the front desk; it depends on availability.", f: [["Check-in", "3:00 PM"], ["Check-out", "11:00 AM"]] },
    "lx-wifi": { n: "Free Wi-Fi", k: "Throughout the hotel", hotel: 1, d: "Wi-Fi is free for all guests in rooms and public areas. The front desk can give you the network name and password.", f: [["Cost", "Free"], ["Where", "Whole hotel"]] },
    "lx-parking": { n: "Parking", k: "$10 per day", hotel: 1, d: "On-site parking is $10 per day. Spaces are limited. Ask the front desk when you arrive.", f: [["Cost", "$10 per day"], ["Spaces", "Limited"]] },
    "lx-ev": { n: "EV charging", k: "On site", hotel: 1, d: "Electric vehicle charging is available on site. Ask the front desk where to park and how to start a charge.", f: [["Where", "On site"], ["Help", "Front desk"]] },
    "lx-fitness": { n: "Fitness center", k: "Cardio and weights", hotel: 1, d: "A fitness center with cardio and strength equipment is available to hotel guests.", f: [["For", "Hotel guests"], ["Equipment", "Cardio and weights"]] },
    "lx-luggage": { n: "Luggage storage", k: "At the front desk", hotel: 1, d: "Arriving early or leaving late? The front desk can hold your bags.", f: [["Where", "Front desk"], ["Cost", "Ask the front desk"]] },
    "lx-terrace": { n: "Sun terrace", k: "Outdoor seating", hotel: 1, d: "Relax outdoors on the hotel's sun terrace.", f: [["Where", "Hotel terrace"], ["For", "Hotel guests"]] },
    "lx-meeting": { n: "Meetings and business services", k: "Meeting space, copying and fax", hotel: 1, d: "Meeting and banquet space is available, with photocopying and fax at the front desk. Ask the front desk to reserve a room.", f: [["Book", "Front desk"], ["Services", "Copy and fax"]] },
    "lx-breakfast": { n: "Breakfast in the lobby", k: "At the hotel", hotel: 1, d: "Breakfast items, coffee and juice are served in the lobby dining area. Ask the front desk for today's times.", f: [["Where", "Lobby"], ["Times", "Ask the front desk"]] },
    "lx-coffee": { n: "Lobby coffee and juice", k: "At the hotel", hotel: 1, d: "Coffee and juice are available in the lobby dining area.", f: [["Where", "Lobby"], ["Cost", "Included"]] },
    "lx-rideshare": { n: "Rideshare and taxi pickup", k: "At the hotel entrance", hotel: 1, d: "Set your pickup to 5268 Tujunga Ave, North Hollywood. Wait at the main entrance. The front desk can call a taxi for you.", f: [["Pickup", "5268 Tujunga Ave"], ["Taxi", "Ask the front desk"]] },

    /* Eat & drink */
    nohodiner: { n: "North Hollywood Diner", k: "Breakfast and diner classics", addr: "11329 Magnolia Blvd, North Hollywood, CA 91601", ll: [34.1651078, -118.3782916], price: "$", d: "A neighborhood diner around the corner on Magnolia Blvd, serving breakfast and diner classics." },
    granville: { n: "Granville", k: "American restaurant and bar", addr: "11136 Magnolia Blvd, North Hollywood, CA 91601", ll: [34.1646645, -118.3737469], price: "$$", d: "A modern American restaurant and cocktail bar in the NoHo Arts District." },
    smash: { n: "Smash N Stacked Burger", k: "Burgers", addr: "5360 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1685795, -118.3765663], d: "Smash burgers next to North Hollywood station." },
    citykitchen: { n: "City Kitchen", k: "Breakfast, salads and coffee", addr: "5225 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1656426, -118.3752622], d: "Breakfast, salads and coffee on Lankershim Blvd." },
    nohopizza: { n: "NoHo Pizza", k: "Pizza, takeout and delivery", addr: "11300 Magnolia Blvd, North Hollywood, CA 91601", ll: [34.164731, -118.377816], price: "$", d: "Pizza by the slice or pie, for takeout or delivery to the hotel." },
    maki: { n: "Maki-Noho", k: "Japanese and sushi", addr: "5077 Lankershim Blvd, Unit B, North Hollywood, CA 91601", ll: [34.162735, -118.373793], price: "$$", d: "Sushi and Japanese dishes on Lankershim Blvd." },
    mexislice: { n: "MexiSlice", k: "Pizza", addr: "5600 Vineland Ave, Unit B, North Hollywood, CA 91601", ll: [34.172439, -118.369897], d: "Pizza on Vineland Ave." },

    /* Coffee */
    amp: { n: "Amp Coffee LA", k: "Coffee shop", addr: "5259 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1663772, -118.3759153], price: "$", d: "Coffee shop on Lankershim Blvd." },
    moxie: { n: "Moxie Coffee Bar", k: "Coffee bar", addr: "5300 Lankershim Blvd #115, North Hollywood, CA 91601", ll: [34.1679327, -118.3758311], price: "$", d: "Coffee bar near North Hollywood station." },
    mooncafe: { n: "The Moon Café", k: "Coffee, tea and Mediterranean food", addr: "5221 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1654862, -118.3752876], price: "$", d: "Coffee, tea and Mediterranean food." },
    horrorvibes: { n: "Horror Vibes Coffee", k: "Themed coffee shop", addr: "5251 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1661292, -118.3757019], price: "$", d: "A horror-themed coffee shop on Lankershim Blvd." },
    eggspresso: { n: "Eggspresso Muffins", k: "Brunch, coffee and sandwiches", addr: "5156 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1645044, -118.3740665], price: "$", d: "Brunch, coffee and sandwiches." },

    /* Things to do */
    universal: { n: "Universal Studios Hollywood", k: "Theme park and studio tour", addr: "100 Universal City Plaza, Universal City, CA 91608", ll: [34.137071, -118.353306], d: "Rides, shows and the studio tour. By Metro, take the B Line from North Hollywood station one stop to Universal City/Studio City, then the free Universal shuttle.", f: [["By Metro", "1 stop on the B Line"], ["Tickets", "Buy online"]] },
    citywalk: { n: "Universal CityWalk", k: "Shops, dining and entertainment", addr: "100 Universal City Plaza, Universal City, CA 91608", ll: [34.13617, -118.353732], d: "Restaurants, shops and a cinema next to Universal Studios. Entry to CityWalk is free.", f: [["Entry", "Free"], ["By Metro", "1 stop on the B Line"]] },
    warner: { n: "Warner Bros. Studio Tour Hollywood", k: "Studio tour", addr: "3400 Warner Blvd, Burbank, CA 91505", ll: [34.151177, -118.335801], d: "A guided tour of a working film and TV studio. Book tickets ahead.", f: [["Tickets", "Book ahead"]] },
    elportal: { n: "El Portal Theatre", k: "Live theatre", addr: "5269 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.166897, -118.376011], d: "A historic theatre in the NoHo Arts District with plays, comedy and concerts." },
    nohoarts: { n: "NoHo Arts District", k: "Theatres, galleries and dining", addr: "Lankershim Blvd and Magnolia Blvd, North Hollywood, CA 91601", ll: [34.16486, -118.37627], d: "Small theatres, murals, cafés and restaurants around Lankershim and Magnolia, a few minutes' walk from the hotel." },
    nohopark: { n: "North Hollywood Park", k: "Park", addr: "5015 Tujunga Ave, North Hollywood, CA 91601", ll: [34.162836, -118.380423], d: "A large city park on Tujunga Ave with lawns, paths and sports fields. Good for a walk or a run." },
    griffith: { n: "Griffith Observatory", k: "Observatory and city views", addr: "2800 E Observatory Rd, Los Angeles, CA 90027", ll: [34.118434, -118.300394], d: "Views of the Hollywood Sign and the city, with free entry to the building." },
    walkoffame: { n: "Hollywood Walk of Fame", k: "Landmark", addr: "Hollywood Blvd and Vine St, Los Angeles, CA 90028", ll: [34.101606, -118.329569], d: "The stars on Hollywood Blvd. By Metro, take the B Line from North Hollywood station to Hollywood/Vine." , f: [["By Metro", "B Line to Hollywood/Vine"]] },

    /* Essentials */
    exer: { n: "Exer Urgent Care", k: "Urgent care", addr: "11126 Chandler Blvd, North Hollywood, CA 91601", ll: [34.167701, -118.373284], d: "Walk-in urgent care for non-emergencies. In an emergency, call 911." },
    "cvs-south": { n: "CVS Pharmacy", k: "Pharmacy", addr: "4744 Lankershim Blvd, North Hollywood, CA 91602", ll: [34.1570523, -118.369296], d: "Pharmacy and everyday essentials." },
    "cvs-north": { n: "CVS", k: "Pharmacy and convenience", addr: "5969 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1791485, -118.3842253], d: "Pharmacy, snacks and toiletries." },
    ralphs: { n: "Ralphs", k: "Grocery store", addr: "10900 Magnolia Blvd, North Hollywood, CA 91601", ll: [34.1643782, -118.3677842], d: "Full-service grocery store on Magnolia Blvd." },
    foodmart: { n: "Lankershim Food Mart", k: "Convenience store", addr: "5048 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1622806, -118.3728304], d: "Snacks, drinks and basics." },
    shell: { n: "Shell", k: "Gas station", addr: "11407 Burbank Blvd, North Hollywood, CA 91601", ll: [34.172453, -118.379611], d: "Gas station on Burbank Blvd." },
    mobil: { n: "Mobil", k: "Gas station", addr: "11680 Burbank Blvd, North Hollywood, CA 91601", ll: [34.171862, -118.387443], d: "Gas station on Burbank Blvd." },

    /* Getting around */
    metro: { n: "North Hollywood Metro station", k: "B Line and G Line", addr: "5391 Lankershim Blvd, North Hollywood, CA 91601", ll: [34.1688483, -118.3766055], d: "Take the B Line to Universal City (1 stop), Hollywood and Downtown LA, or the G Line across the San Fernando Valley. Pay with a TAP card or the TAP app.", f: [["Lines", "B Line, G Line"], ["Pay", "TAP card or app"]] },
    bur: { n: "Hollywood Burbank Airport (BUR)", k: "Airport", addr: "2627 N Hollywood Way, Burbank, CA 91505", ll: [34.1983122, -118.3574036], d: "The closest airport to the hotel. Allow extra time at rush hour.", f: [["Code", "BUR"]] },
    lax: { n: "Los Angeles International Airport (LAX)", k: "Airport", addr: "1 World Way, Los Angeles, CA 90045", ll: [33.9416, -118.4085], d: "About 20 miles by road. Allow at least an hour by car, more at rush hour.", f: [["Code", "LAX"], ["Allow", "1 hour or more"]] }
  },

  /* Featured businesses in the ad carousel. They rotate on their own; nothing is tappable on the kiosk.
     name, kind, tagline: text on the ad. website: shown as text. url: what the QR code opens on the guest's phone.
     item: the matching place above (adds the walking time). logo: a file in assets/ (for example "lexen/ads/granville.png");
     without a logo the ad shows the business initials. Websites checked October 2026. */
  sponsors: [
    { name: "Granville", kind: "Restaurant and bar", tagline: "Modern American dining and cocktails in the NoHo Arts District.", website: "granvillerestaurants.com", url: "https://www.granvillerestaurants.com/", item: "granville" },
    { name: "El Portal Theatre", kind: "Live theatre", tagline: "Plays, comedy and concerts in a historic NoHo theatre.", website: "elportaltheatre.com", url: "https://elportaltheatre.com/", item: "elportal" },
    { name: "NoHo Diner", kind: "Breakfast and diner classics", tagline: "Around the corner on Magnolia Blvd.", website: "@thenohodiner on Instagram", url: "https://www.instagram.com/thenohodiner/", item: "nohodiner" },
    { name: "Warner Bros. Studio Tour Hollywood", kind: "Studio tour", tagline: "Go behind the scenes of a working film and TV studio.", website: "wbstudiotour.com", url: "https://www.wbstudiotour.com/", item: "warner" }
  ],

  /* Built-in concierge answers. "keys" are words that match a guest's question; "items" link to places. */
  faq: [
    { q: "What time is check-out?", keys: ["checkout", "check-out", "check out", "leave", "late checkout", "late check-out"], a: "Check-out is by 11:00 AM. For a late check-out, ask the front desk; it depends on availability. The front desk can also hold your bags.", items: ["lx-checkin", "lx-luggage"] },
    { q: "What time is check-in?", keys: ["checkin", "check-in", "check in", "arrive", "early check"], a: "Check-in starts at 3:00 PM. Early check-in depends on availability, so ask the front desk. If your room is not ready, they can hold your bags.", items: ["lx-checkin", "lx-luggage"] },
    { q: "What is the Wi-Fi?", keys: ["wifi", "wi-fi", "internet", "password", "network"], a: "Wi-Fi is free throughout the hotel. The front desk can give you the network name and password.", items: ["lx-wifi"] },
    { q: "Where can I park?", keys: ["park", "parking", "car", "garage", "valet"], a: "On-site parking is $10 per day and spaces are limited. Electric vehicle charging is also available on site.", items: ["lx-parking", "lx-ev"] },
    { q: "Is there breakfast?", keys: ["breakfast", "morning", "juice"], a: "Breakfast items, coffee and juice are served in the lobby dining area. Ask the front desk for today's times. North Hollywood Diner, around the corner, also serves breakfast.", items: ["lx-breakfast", "nohodiner", "citykitchen"] },
    { q: "Where can I eat nearby?", keys: ["eat", "food", "dinner", "lunch", "restaurant", "hungry", "burger", "sushi", "pizza", "diner"], a: "There are good places within a five-minute walk: North Hollywood Diner and NoHo Pizza on Magnolia, Smash N Stacked Burger by the Metro, and Granville for dinner and cocktails.", items: ["nohodiner", "nohopizza", "smash", "granville", "maki"] },
    { q: "Where can I get coffee?", keys: ["coffee", "cafe", "café", "espresso", "latte", "tea"], a: "Coffee and juice are available in the lobby. On Lankershim Blvd, about three minutes on foot, try Amp Coffee LA, Moxie Coffee Bar or The Moon Café.", items: ["lx-coffee", "amp", "moxie", "mooncafe"] },
    { q: "How do I get to Universal Studios?", keys: ["universal", "theme park", "citywalk", "harry potter", "studio"], a: "Universal Studios Hollywood is about 2.5 miles away. By Metro, walk four minutes to North Hollywood station and take the B Line one stop to Universal City/Studio City, then the free Universal shuttle. A rideshare takes about 10 to 15 minutes.", items: ["universal", "citywalk", "metro"] },
    { q: "How do I take the Metro?", keys: ["metro", "subway", "train", "b line", "red line", "transit", "bus", "downtown", "hollywood"], a: "North Hollywood station is a four-minute walk at 5391 Lankershim Blvd. The B Line goes to Universal City, Hollywood and Downtown LA. Pay with a TAP card or the TAP app.", items: ["metro", "walkoffame"] },
    { q: "How far is the airport?", keys: ["airport", "flight", "bur", "lax", "fly", "plane"], a: "Hollywood Burbank Airport (BUR) is the closest, about 2.5 miles away. LAX is about 20 miles by road; allow at least an hour by car.", items: ["bur", "lax"] },
    { q: "Where is the nearest pharmacy?", keys: ["pharmacy", "medicine", "cvs", "drugstore", "toiletries", "prescription"], a: "The closest pharmacies are the two CVS stores on Lankershim Blvd, each under a mile away.", items: ["cvs-south", "cvs-north"] },
    { q: "I need a doctor", keys: ["doctor", "urgent care", "sick", "clinic", "hurt", "medical"], a: "Exer Urgent Care is on Chandler Blvd, under a 10-minute walk. In an emergency, call 911 and tell the front desk.", items: ["exer"] },
    { q: "Where is a grocery store?", keys: ["grocery", "groceries", "supermarket", "store", "snacks", "water"], a: "Ralphs, a full grocery store, is on Magnolia Blvd. For snacks and drinks, Lankershim Food Mart is closer.", items: ["ralphs", "foodmart"] },
    { q: "Where can I get gas?", keys: ["gas", "fuel", "petrol"], a: "The nearest gas stations are Shell and Mobil on Burbank Blvd, both under a mile away.", items: ["shell", "mobil"] },
    { q: "How do I get a taxi or Uber?", keys: ["uber", "lyft", "taxi", "rideshare", "ride", "cab"], a: "Set your pickup to 5268 Tujunga Ave, North Hollywood, and wait at the main entrance. The front desk can call a taxi for you.", items: ["lx-rideshare"] },
    { q: "Is there a gym?", keys: ["gym", "fitness", "workout", "exercise", "run", "weights"], a: "The hotel has a fitness center with cardio and weights. For a run, North Hollywood Park is a few minutes' walk down Tujunga Ave.", items: ["lx-fitness", "nohopark"] },
    { q: "What is there to do nearby?", keys: ["to do", "things to do", "attraction", "attractions", "sightseeing", "visit", "fun", "theatre", "theater", "show", "tour", "warner", "museum", "nightlife"], a: "The NoHo Arts District is outside the door, with El Portal Theatre a two-minute walk away. Universal Studios and the Warner Bros. Studio Tour are a short drive.", items: ["elportal", "nohoarts", "universal", "warner"] },
    { q: "How do I call the front desk?", keys: ["front desk", "phone", "call", "contact", "help", "reception", "email"], a: "The front desk is open 24 hours. Call (818) 821-3680 or email lexennoho@gmail.com.", items: ["lx-desk"] },
    { q: "What is the hotel address?", keys: ["address", "where am i", "location", "zip"], a: "Lexen North Hollywood, 5268 Tujunga Ave, North Hollywood, CA 91601.", items: ["lx-rideshare"] },
    { q: "Can you hold my luggage?", keys: ["luggage", "bags", "suitcase", "store"], a: "Yes. The front desk can hold your bags before check-in or after check-out.", items: ["lx-luggage"] }
  ]
};
