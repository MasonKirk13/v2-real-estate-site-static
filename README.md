# Coastal & Arbor Real Estate Group — Static V2

A fast, responsive static rebuild of the Coastal & Arbor website. The V1 WordPress site at `dev.coastalarborgroup.com` is the content reference; the V2 preview domain is `static-dev.coastalarborgroup.com`.

## Local preview

Serve the repository root with any static web server. For example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

- `index.html` — shared HTML shell
- `content.js` — route-specific page content
- `styles.css` — responsive visual system
- `script.js` — routing, mobile navigation, review dialog, and page metadata
- Each route directory contains an identical `index.html` shell so clean URLs work on standard static hosting.

## Deployment

The intended preview host is DreamHost at `https://static-dev.coastalarborgroup.com/`. The preview is intentionally marked `noindex, nofollow`.

The consultation form uses FormSubmit and routes to `info@coastalarborgroup.com`. FormSubmit may send a one-time activation email to that inbox after the first submission.

Required GitHub repository secrets for automated SFTP deployment:

- `DREAMHOST_HOST`
- `DREAMHOST_USERNAME`
- `DREAMHOST_PASSWORD`
- `DREAMHOST_PATH`
