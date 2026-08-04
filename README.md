# Coastal & Arbor Real Estate Group — Static V2

A fast, responsive HTML5/CSS rebuild of the Coastal & Arbor website. The V1 WordPress site at `dev.coastalarborgroup.com` is the design and content reference; the V2 preview is intended for `static-dev.coastalarborgroup.com`.

## Build and preview

Node.js is the only local requirement. The website delivered to visitors does not use Node or client-side JavaScript.

```powershell
node build.mjs
node validate.mjs
node server.mjs
```

Open `http://localhost:8080`. The server serves the generated `dist/` directory.

## Project structure

- The root `index.html` and route directories are preserved WordPress exports used as source content.
- `build.mjs` converts that source into clean, semantic HTML5 pages.
- `site.css` contains the shared responsive design and CSS-only interactions.
- `assets/` contains locally hosted brand and hero imagery.
- `dist/` is the generated, deployment-ready website.
- `validate.mjs` verifies page structure, local links and assets, and the absence of WordPress and client-side JavaScript residue.

Run `node build.mjs` after source or template changes. Do not hand-edit generated files in `dist/`, because the next build replaces them.

## Outside services

The site itself is HTML5 and CSS. Only features that require an outside provider remain external:

- REIN MLS property-search and featured-listing iframes
- AppFolio rental-listing iframe and tenant/owner portal links
- FormSubmit consultation-form delivery
- Google review and social-profile links

The review cards and review popup are native HTML/CSS snapshots generated from the source. Google does not allow its review-submission interface to be embedded, so the final posting step opens Google.

## Deployment

Deploy the contents of `dist/` to the DreamHost document root for `https://static-dev.coastalarborgroup.com/`. The preview is intentionally marked `noindex, nofollow`, and `dist/robots.txt` blocks indexing.

The consultation form routes to `info@coastalarborgroup.com`. FormSubmit may send a one-time activation email to that inbox after the first submission.

If automated SFTP deployment is added, the expected GitHub repository secrets are:

- `DREAMHOST_HOST`
- `DREAMHOST_USERNAME`
- `DREAMHOST_PASSWORD`
- `DREAMHOST_PATH`
