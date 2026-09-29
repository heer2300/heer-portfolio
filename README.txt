HEER PATEL PORTFOLIO  (Python 3.8+, no packages to install)

RUN
  python server.py            (Windows: py server.py)
  open http://127.0.0.1:8000  (different port: python server.py 9000)

FIRST RUN asks you to choose an ADMIN PASSWORD (saved hashed in config.json).

ADMIN
  Click the small "admin" link in the page footer, log in with your password.
  You can: change name/tagline/hero image, set the background MUSIC file, edit LinkedIn/GitHub/WhatsApp links,
  add/delete categories, add/delete projects (title, text, link, image), change password.
  GitHub is hidden until you paste your GitHub URL under "Connect links".

FILES
  server.py        server + login + upload API
  static/          the website (index.html, style.css, app.js)
  data/site.json   all your content (back this up)
  uploads/         images you upload (back this up)
  config.json      password hash (delete it to set a new password)

Needs internet only for Google Fonts; the site still works without them.
The server listens on 127.0.0.1 (your computer only). For a public website, put it
behind a real host with HTTPS, otherwise the admin password travels unencrypted.

THEME + MUSIC
  Nav bar buttons: light/dark theme toggle and a music play/pause button.
  Upload the track in the admin panel (Music section: mp3, ogg, wav or m4a, max 25 MB).
  Browsers only start audio after a click, so it never autoplays.

CONTACT FORM (real email sending)
  In the admin panel, open "Contact form (email)": enter your Gmail address and a
  Gmail App Password (Google Account -> Security -> 2-Step Verification -> App
  Passwords; needs 2-Step Verification turned on). Messages sent from the Connect
  form on the site are then emailed straight to you, with the visitor's address
  as Reply-To. Until this is set up, the form shows an error and points visitors
  to the email link instead.

RESUME PAGE
  /resume shows a clean, printable page built from your name/about/timeline/skills,
  with a "Print / Save as PDF" button. It updates whenever you edit that content
  in admin. This is separate from the uploaded PDF/Word file, which downloads as-is.

BACKUP
  Admin panel -> Backup -> Download backup gives you a zip of data/site.json plus
  everything in uploads/. Keep a copy somewhere safe, especially before you deploy
  online or switch computers.

GOING ONLINE
  This server is fine for local use but is not hardened for the public internet on
  its own (no HTTPS, single-process). For a public deployment: put it behind a
  reverse proxy (e.g. nginx or Caddy) that terminates HTTPS, or move it onto a
  small VPS/PaaS. Ask if you'd like help with that step.

HOSTING (Render, GitHub)
  server.py reads PORT from the environment and binds 0.0.0.0 when PORT is set, so it
  works on Render as-is. DATA_DIR (optional) redirects data/site.json, config.json and
  uploads/ to a separate folder -- point it at a Render persistent Disk so your content
  and uploads survive restarts and redeploys.
