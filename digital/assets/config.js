/* Landmark Digital — integration settings. The only file you edit to connect forms.
   FORMS — where audit requests, messages and support requests are delivered.
     "formsubmit": no account needed; messages arrive by email at `to`. The first submission
                   sends an activation email to that inbox — click "Activate" once.
     "formspree":  set `endpoint` to your Formspree form URL.
     "wordpress":  WordPress theme only — saved in the WP admin and emailed (Settings → Landmark Digital).
     "none":       forms fall back to opening an email draft in the visitor's own email app. */
window.LANDMARK_CONFIG = {
  forms: { provider: "formsubmit", to: "sarvesh@landmarkdigi.com", endpoint: "" },
  payments: { provider: "stripe", launch: "", grow: "", scale: "" },  // paste the Stripe Payment Link for each plan
  maxUploadMB: 5,
  pagespeedKey: ""   // optional Google PageSpeed Insights API key for the live speed tester (free in Google Cloud Console)
};
