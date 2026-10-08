/* Lexen North Hollywood: kiosk content.
   Source: public hotel listing (Travelocity, hotel information page). Items marked "Ask the front desk"
   are not listed publicly. Confirm everything with the hotel before the demo. */
window.CITYPULSE_VENUE_DATA = {
  venue: {
    name: "Lexen North Hollywood",
    short: "LEXEN NORTH HOLLYWOOD",
    tiles: ["dining", "amenities", "local", "events", "getting", "venuemap"],
    wide: { to: "todo", t: "Things to do nearby", s: "Studios and attractions a short drive away" },
    sponsors: ["lx-ad-1", "lx-ad-2"],
    rooms: ["Front desk", "Lobby", "Elevators", "Restrooms", "Fitness center", "Conference room"]
  },
  categories: [
    { id: "dining", label: "Dining", icon: "fork", intro: "Food and drinks in the lobby. Ask the front desk about nearby restaurants.", items: [
      { id: "lx-snack", n: "Lobby snack bar and deli", k: "Snacks and light meals", m: "In the lobby", d: "Grab-and-go snacks, sandwiches and drinks from the lobby snack bar.", f: [["Where", "Lobby"], ["Hours", "Ask the front desk"]] },
      { id: "lx-coffee", n: "Lobby coffee", k: "Coffee", m: "In the lobby", d: "Coffee is served in the lobby. Ask the front desk for current hours.", f: [["Where", "Lobby"], ["Hours", "Ask the front desk"]] },
      { id: "lx-nearby-food", n: "Restaurants nearby", k: "Ask the front desk", m: "Around the hotel", d: "The front desk can recommend restaurants within walking or driving distance.", f: [["Help", "Front desk"]] }
    ] },
    { id: "amenities", label: "Hotel services", icon: "spark", intro: "Things you can use during your stay.", items: [
      { id: "lx-gym", n: "Fitness center", k: "For guests", m: "Ground floor", d: "A fitness center is available for guests. Ask the front desk for access hours.", f: [["Where", "Ground floor"], ["Hours", "Ask the front desk"]] },
      { id: "lx-wifi", n: "Free WiFi", k: "Throughout the hotel", m: "Everywhere", d: "Complimentary WiFi is available throughout the hotel.", f: [["Cost", "Free"]] },
      { id: "lx-business", n: "Business services", k: "Desks, phones, conference room", m: "Front desk", d: "Desks, phones and a conference room are available. Complimentary local and long-distance calls (restrictions may apply).", f: [["Where", "Front desk"], ["Cost", "Free calls (restrictions apply)"]] },
      { id: "lx-parking", n: "Parking", k: "Limited, first come first served", m: "On site", d: "Limited on-site self parking costs $10 per day, first come, first served. Height restrictions apply.", f: [["Cost", "$10 per day"], ["Spaces", "Limited"]] },
      { id: "lx-checkin", n: "Check-in and check-out", k: "Check-in 3:00 PM, check-out 11:00 AM", m: "Front desk", d: "Check-in starts at 3:00 PM and ends at 11:30 PM. Check-out is before 11:00 AM. Early or late arrangements depend on availability and may have a fee. Minimum check-in age is 21.", f: [["Check-in", "3:00 PM"], ["Check-out", "11:00 AM"]] }
    ] },
    { id: "local", label: "Nearby", icon: "pin", intro: "Studios and attractions. Drive times are from the hotel listing.", items: [
      { id: "lx-universal", n: "Universal Studios Hollywood", k: "About 4 min drive", m: "3.0 mi", d: "Studio tours, rides and shows. About 4 minutes by car from the hotel.", f: [["Drive", "About 4 min"], ["Distance", "3.0 mi"]] },
      { id: "lx-warner", n: "Warner Bros. Studio", k: "About 4 min drive", m: "3.2 mi", d: "Studio tours. About 4 minutes by car from the hotel.", f: [["Drive", "About 4 min"], ["Distance", "3.2 mi"]] },
      { id: "lx-citywalk", n: "Universal CityWalk", k: "About 5 min drive", m: "3.2 mi", d: "Shops, restaurants and entertainment. About 5 minutes by car from the hotel.", f: [["Drive", "About 5 min"], ["Distance", "3.2 mi"]] },
      { id: "lx-wizarding", n: "The Wizarding World of Harry Potter", k: "About 5 min drive", m: "3.2 mi", d: "Themed park area at Universal Studios Hollywood. About 5 minutes by car from the hotel.", f: [["Drive", "About 5 min"], ["Distance", "3.2 mi"]] },
      { id: "lx-disney", n: "Walt Disney Studios", k: "About 6 min drive", m: "4.4 mi", d: "Studio tours. About 6 minutes by car from the hotel.", f: [["Drive", "About 6 min"], ["Distance", "4.4 mi"]] }
    ] },
    { id: "todo", label: "Things to do", icon: "spark", intro: "Ideas for an afternoon near the hotel.", items: [
      { id: "lx-todo-citywalk", n: "Universal CityWalk", k: "Shops and dining", m: "About 5 min drive", d: "Shops, restaurants and nightlife a short drive from the hotel.", f: [["Drive", "About 5 min"]] },
      { id: "lx-todo-warner", n: "Warner Bros. Studio", k: "Studio tours", m: "About 4 min drive", d: "Book studio tours in advance. Ask the front desk for the latest information.", f: [["Drive", "About 4 min"]] }
    ] },
    { id: "offers", label: "Offers", icon: "tag", intro: "Local offers. Sponsor spaces are available.", items: [
      { id: "lx-ad-1", n: "Your business here", k: "Sponsor space", m: "This screen", h: "Put your offer in front of every guest", c: "See packages", d: "Advertising on this screen is available from $399 a year. Ask the front desk for details or visit the CityPulse website.", f: [["Price", "From $399 a year"]] },
      { id: "lx-ad-2", n: "Your business here", k: "Sponsor space", m: "This screen", h: "Reach guests while they browse", c: "See packages", d: "Local businesses can place a sponsor card on this screen. Ask the front desk for details.", f: [["Price", "From $399 a year"]] }
    ] },
    { id: "events", label: "Events", icon: "cal", intro: "What is happening near the hotel.", items: [
      { id: "lx-events", n: "Current events", k: "Ask the front desk", m: "This week", d: "We do not list events here yet. The front desk can tell you what is on this week.", f: [["Help", "Front desk"]] }
    ] },
    { id: "getting", label: "Getting around", icon: "car", intro: "Getting to and from the hotel.", items: [
      { id: "lx-address", n: "Hotel address", k: "5268 Tujunga Ave", m: "North Hollywood, CA 91601", d: "5268 Tujunga Ave, North Hollywood, CA 91601.", f: [["Address", "5268 Tujunga Ave"], ["City", "North Hollywood, CA 91601"]] },
      { id: "lx-shuttle", n: "Airport shuttle", k: "Not offered", m: "Ask the front desk", d: "The hotel does not offer an airport shuttle. Ask the front desk about rideshare or taxi options.", f: [["Shuttle", "Not offered"], ["Help", "Front desk"]] },
      { id: "lx-taxi", n: "Taxi and rideshare", k: "Ask the front desk", m: "Any time", d: "The front desk can help you get a taxi or arrange a rideshare.", f: [["Help", "Front desk"]] }
    ] }
  ]
};
