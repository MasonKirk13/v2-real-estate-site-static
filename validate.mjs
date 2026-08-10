import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "dist");
const siteUrl = (process.env.SITE_URL || "https://static-dev.coastalarborgroup.com").replace(/\/+$/, "");
const isIndexable = process.env.SITE_INDEXABLE === "true";
const failures = [];
const htmlFiles = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".html")) htmlFiles.push(path);
  }
}

walk(root);

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const relative = file.slice(root.length + 1);
  for (const tag of ["header", "nav", "main", "footer"]) {
    if (!new RegExp(`<${tag}\\b`, "i").test(html)) failures.push(`${relative}: missing <${tag}>`);
  }
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) failures.push(`${relative}: expected one h1, found ${h1Count}`);
  const route = relative === "index.html" ? "" : relative.replace(/[\\/]index\.html$/, "").replace(/\\/g, "/");
  const pathname = route ? `/${route}/` : "/";
  const expectedCanonical = `<link rel="canonical" href="${siteUrl}${pathname}">`;
  if (!html.includes(expectedCanonical)) failures.push(`${relative}: missing canonical ${siteUrl}${pathname}`);
  const expectedRobots = isIndexable && route !== "thank-you" ? "index, follow" : isIndexable ? "noindex, follow" : "noindex, nofollow";
  if (!html.includes(`<meta name="robots" content="${expectedRobots}">`)) failures.push(`${relative}: incorrect robots directive`);
  if (/<script\b|wp-content|wp-includes|wp-block|data-wp-|\sonclick=|\sonerror=|javascript:/i.test(html)) failures.push(`${relative}: contains WordPress or client-side script residue`);
  if (/\sstyle=("[^"]*"|'[^']*')/i.test(html)) failures.push(`${relative}: contains inline styles`);

  for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
    const pathname = match[1].split(/[?#]/)[0];
    if (!pathname || pathname === "/") continue;
    const target = pathname.endsWith("/") ? join(root, pathname, "index.html") : join(root, pathname);
    if (!existsSync(target)) failures.push(`${relative}: broken internal link ${match[1]}`);
  }
  for (const match of html.matchAll(/src="(\/[^"]*)"/g)) {
    const target = join(root, match[1]);
    if (!existsSync(target)) failures.push(`${relative}: missing local asset ${match[1]}`);
  }
  for (const match of html.matchAll(/<(?:iframe|form)\b[^>]*(?:src|action)="([^"]+)"/g)) {
    if (!/^https:\/\/(?:reinmls\.mlsmatrix\.com|coastalarborgroup\.appfolio\.com|formsubmit\.co)\//.test(match[1])) {
      failures.push(`${relative}: unapproved outside element ${match[1]}`);
    }
  }
}

if (htmlFiles.length !== 12) failures.push(`expected 12 HTML pages, found ${htmlFiles.length}`);

const robots = readFileSync(join(root, "robots.txt"), "utf8");
if (isIndexable) {
  if (!robots.includes("Allow: /") || !robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) failures.push("production robots.txt is not indexable");
  if (!existsSync(join(root, "sitemap.xml"))) failures.push("production sitemap.xml is missing");
} else {
  if (!robots.includes("Disallow: /")) failures.push("staging robots.txt does not block indexing");
  if (existsSync(join(root, "sitemap.xml"))) failures.push("staging build unexpectedly contains sitemap.xml");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} semantic static pages with no WordPress or client-side JavaScript residue.`);
}
