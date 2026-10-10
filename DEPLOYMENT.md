# Deployment — Hostinger shared hosting

The site is 100 % static. Hostinger only needs to serve files from `public_html`.

## 1. Build locally

```bash
npm install
npm run build
```

The output is in `dist/`:

```
dist/
  index.html
  favicon.svg
  robots.txt
  .htaccess            ← hidden file (starts with a dot)
  assets/
    index-xxxx.js / index-xxxx.css
    CinematicExperience-xxxx.js   (lazy: only loaded for the 3D mode)
    vendor-three-xxxx.js, vendor-r3f-xxxx.js, vendor-gsap-xxxx.js
    *.woff2 / *.woff              (self-hosted fonts)
    models/ textures/ audio/      (optional; copied from public/assets)
```

Asset URLs are **relative** (`base: './'`), so the build works from the domain root and from any sub-folder.

Optional local check of the exact files you will upload:

```bash
npm run preview   # http://localhost:4173
```

## 2. Upload `dist/` contents to `public_html`

**Option A — File Manager (simplest)**

1. hPanel → **Websites** → *raveendiran.com* → **File Manager**.
2. Open `public_html`. Remove Hostinger's default placeholder (`default.php` / `index.html`) if present.
3. In File Manager settings enable **Show hidden files** (needed for `.htaccess`).
4. Zip the **contents** of `dist/` (select everything *inside* it, not the folder itself):
   `cd dist && zip -r ../site.zip . && cd ..`
5. Upload `site.zip` into `public_html`, right-click → **Extract**, then delete the zip.
6. Confirm `public_html/index.html` and `public_html/assets/` exist directly (not `public_html/dist/...`).

**Option B — FTP / SFTP** (FileZilla, Cyberduck): hPanel → **Files → FTP Accounts** for host, user, port. Upload everything inside `dist/` into `public_html/`, including `.htaccess`.

**Option C — Git deploy / rsync over SSH** (if SSH is enabled on your plan):
`rsync -avz --delete dist/ USER@HOST:public_html/ -e "ssh -p PORT"`

## 3. Configure the domain

* Domain bought at Hostinger: it is already attached to the hosting plan; check hPanel → **Domains** shows *raveendiran.com* pointing at this website.
* Domain registered elsewhere: set the registrar's nameservers to the Hostinger ones shown in hPanel → **Domains → DNS / Nameservers**, or create an **A record** for `@` (and `www`) pointing to the hosting IP shown in hPanel. DNS can take up to 24 h.
* `www` → apex: in hPanel → **Domains** you can redirect `www.raveendiran.com` to `raveendiran.com` (or the reverse) so there is one canonical URL. The page's `<link rel="canonical">` already points to `https://raveendiran.com`.

## 4. Enable HTTPS

1. hPanel → **Security → SSL** → install the free SSL for *raveendiran.com* (and `www`). Wait until status is **Active**.
2. Turn on **Force HTTPS** in the same screen, **or** open `public_html/.htaccess` and uncomment the three `RewriteEngine / RewriteCond / RewriteRule` lines under *Force HTTPS*.
3. Do the second option only after the certificate is active — otherwise the redirect will break the site.

## 5. Verify static assets

* Open `https://raveendiran.com/assets/` file names from your `dist/assets` (e.g. the `index-*.js`) directly — each must return `200` and the right type (`text/javascript`, `text/css`, `font/woff2`).
* Open DevTools → **Network**, hard-reload. There must be no `404` rows and no mixed-content warnings.
* DevTools → **Console**: no red errors (a one-line `THREE.Clock … deprecated` *warning* from a dependency is harmless).
* `https://raveendiran.com/favicon.svg` and `/robots.txt` load.

## 6. Test the deployed website

Use the checklist below. If you ship an update, re-upload `dist/` and hard-refresh (hashed filenames mean browsers fetch the new files automatically; `index.html` is served with no-cache by `.htaccess`).

### Deployment verification checklist

- [ ] `https://raveendiran.com` loads over HTTPS with a valid padlock; `http://` redirects to `https://`.
- [ ] Intro starts on black; stars fade in; `[ SKIP INTRO ]` is visible and works.
- [ ] Hyperspace jump plays (~3 s) and lands in the cockpit.
- [ ] All six worlds render; hover shows name + description; click flies there and opens a panel.
- [ ] `[ RETURN TO GALAXY ]` and `Esc` return to the map.
- [ ] Terminal (`Terminal` button or `` ` ``): `help`, `whoami`, `skills`, `projects`, `talks`, `contact`, `galaxy`, `clear` respond.
- [ ] RAVI-AI answers the seven suggested questions and says so when it has no data.
- [ ] `Quick profile` button works; the page is usable and fast.
- [ ] Sound is **off** on load; the toggle turns it on/off.
- [ ] Mobile (≈375 px): carousel buttons, bottom-sheet panel, top bar all fit; no horizontal scroll.
- [ ] Tablet (≈768 px) and desktop (≈1440 px) layouts look right.
- [ ] DevTools Network: zero 404s; Console: zero errors.
- [ ] Disable WebGL (or use a very old device): Quick Profile appears automatically.
- [ ] Lighthouse (desktop) Performance for **Quick Profile** ≥ 90.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Blank page, console shows 404 for `/assets/...` | You uploaded the `dist` *folder* instead of its contents, or the files are not directly in `public_html`. |
| `Failed to load module script … MIME type` | Make sure `.htaccess` was uploaded (hidden file) so `.js` is served as JavaScript. |
| Old version still shows | Hard-refresh (⌘⇧R / Ctrl+F5); clear Hostinger CDN cache in hPanel → *Performance → Cache*. |
| Redirect loop after enabling HTTPS | Use only **one** of: hPanel *Force HTTPS* or the `.htaccess` rule. |
| Site in a sub-folder | Works unchanged (relative asset paths). Upload to that folder instead of `public_html` root. |

## Alternative: GitHub Pages

`.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`.

1. Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the workflow from the **Actions** tab).
3. The site appears at `https://<user>.github.io/<repo>/` — asset URLs are relative, so the sub-path works unchanged.
4. Custom domain (optional): add it under **Settings → Pages**, create the DNS records GitHub lists, and don't serve the same site from Hostinger at the same time. `.htaccess` is ignored on Pages (HTTPS is built in).
