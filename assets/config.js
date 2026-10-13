/* CityPulse Kiosks — integration settings. This is the only file you need to edit
   to connect forms and payments. Commit it and the site picks it up.

   FORMS — where inquiries and kiosk orders are delivered.
     "formsubmit": no account needed. Orders and messages arrive by email at `to`.
                   The very first submission sends an activation email to that inbox —
                   click "Activate" once and every form starts delivering.
     "formspree":  set `endpoint` to your Formspree form URL (https://formspree.io/f/xxxx).
     "wordpress":  WordPress theme only — saved in the WP admin and emailed (set in Settings → CityPulse).
     "none":       forms fall back to opening an email draft in the visitor's own email app.

   PAYMENTS — where checkout sends the customer to pay.
     "stripe": paste your Stripe Payment Links. Customers arrive with their email filled in
               and the order number as client_reference_id. Leave both empty to skip payment
               (orders are still delivered and you invoice the customer).
     Any other processor with hosted checkout links (Square, PayPal) works the same way:
     paste its links and set provider to its name. */
window.CITYPULSE_CONFIG = {
  forms: {
    provider: "formsubmit",
    to: "sarvesh.joshiaz@gmail.com",
    endpoint: ""
  },
  payments: {
    provider: "stripe",
    yearly: "",   // 1 location, yearly: $598 during the launch sale (regular $798 from April 1, 2027)
    monthly: ""   // 1 location, monthly: $90 during the launch sale (regular $120 from April 1, 2027)
  },
  maxUploadMB: 5
};
