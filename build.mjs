import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const outputRoot = join(root, "dist");
const siteCssVersion = createHash("sha256").update(readFileSync(join(root, "site.css"), "utf8")).digest("hex").slice(0, 12);

const pages = [
  { source: "index.html", route: "", label: "Home", title: "Coastal & Arbor Real Estate Group – Real Estate & Property Management", description: "Residential and commercial real estate, property management, leasing, and investment services in Hampton Roads." },
  { source: "search-homes/index.html", route: "search-homes", label: "Search Homes", title: "Search Homes | Coastal & Arbor Real Estate Group" },
  { source: "property-management/index.html", route: "property-management", label: "Property Management", title: "Property Management | Coastal & Arbor Real Estate Group" },
  { source: "buy/index.html", route: "buy", label: "Buy", title: "Buy | Coastal & Arbor Real Estate Group" },
  { source: "sell/index.html", route: "sell", label: "Sell", title: "Sell | Coastal & Arbor Real Estate Group" },
  { source: "available-rentals/index.html", route: "available-rentals", label: "Available Rentals", title: "Available Rentals | Coastal & Arbor Real Estate Group" },
  { source: "services/index.html", route: "services", label: "Services", title: "Services | Coastal & Arbor Real Estate Group" },
  { source: "reviews/index.html", route: "reviews", label: "Reviews", title: "Reviews | Coastal & Arbor Real Estate Group" },
  { source: "about/index.html", route: "about", label: "About Us", title: "About Us | Coastal & Arbor Real Estate Group" },
  { source: "contact/index.html", route: "contact", label: "Contact", title: "Contact | Coastal & Arbor Real Estate Group" },
  { source: "consultation/index.html", route: "consultation", label: "Consultation", title: "Request a Consultation | Coastal & Arbor Real Estate Group" },
  { source: "consultation/index.html", route: "thank-you", label: "Thank You", title: "Thank You | Coastal & Arbor Real Estate Group", description: "Thank you for contacting Coastal & Arbor Real Estate Group." },
];

const navItems = [
  ["Search Homes", "/search-homes/"],
  ["Property Management", "/property-management/"],
  ["Buy", "/buy/"],
  ["Sell", "/sell/"],
  ["Available Rentals", "/available-rentals/"],
  ["Services", "/services/"],
  ["Reviews", "/reviews/"],
  ["About Us", "/about/"],
  ["Contact", "/contact/"],
];

const socialIcons = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 22v-8.8h3l.45-3.45H13.7v-2.2c0-1 .28-1.68 1.73-1.68h1.85V2.8a24.5 24.5 0 0 0-2.7-.14c-2.67 0-4.5 1.63-4.5 4.63v2.46H7.05v3.45h3.03V22h3.62Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.49 22H3.37l7.25-8.29L2.97 2H9.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.46 4.05H6.61L17.8 19.84Z"/></svg>',
};

function navMarkup(currentRoute, mobile = false) {
  const list = navItems.map(([label, href]) => {
    const active = href === `/${currentRoute}/` || (!currentRoute && href === "/");
    return `<li><a href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a></li>`;
  }).join("");
  return `<nav class="${mobile ? "mobile-navigation" : "primary-navigation"}" aria-label="${mobile ? "Mobile" : "Primary"} navigation"><ul>${list}</ul></nav>`;
}

function headerMarkup(route) {
  return `<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
  <div class="site-header__inner">
    <a class="site-title" href="/">Coastal &amp; Arbor Real Estate Group</a>
    ${navMarkup(route)}
    <details class="mobile-menu">
      <summary aria-label="Open navigation"><span></span><span></span><span></span><b>Menu</b></summary>
      ${navMarkup(route, true)}
    </details>
  </div>
</header>`;
}

function footerMarkup() {
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <a class="footer-brand" href="/">
      <img src="/assets/coastal-arbor-logo.png" alt="" width="180" height="105">
      <span>Coastal &amp; Arbor Real Estate Group</span>
    </a>
    <nav class="social-navigation" aria-label="Social media">
      <a href="https://www.instagram.com/" aria-label="Instagram" rel="noopener">${socialIcons.instagram}</a>
      <a href="https://www.facebook.com/" aria-label="Facebook" rel="noopener">${socialIcons.facebook}</a>
      <a href="https://x.com/" aria-label="X" rel="noopener">${socialIcons.x}</a>
    </nav>
  </div>
</footer>`;
}

function extractEntry(source) {
  const marker = '<div class="entry-content';
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error("Could not find entry content");
  const start = source.indexOf(">", markerIndex) + 1;
  const mainEnd = source.lastIndexOf("</main>");
  const end = source.lastIndexOf("</div>", mainEnd);
  if (start < 1 || end < start) throw new Error("Could not isolate entry content");
  return source.slice(start, end);
}

function cleanClassAttribute(match, value) {
  const classes = value.split(/\s+/).filter(Boolean).filter((name) =>
    !name.startsWith("wp-") &&
    !name.startsWith("has-") &&
    !name.startsWith("is-") &&
    !name.startsWith("ext-") &&
    !name.startsWith("wp-container-") &&
    name !== "alignfull" &&
    name !== "alignwide"
  );
  return classes.length ? `class="${classes.join(" ")}"` : "";
}

function cleanContent(content) {
  return content
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/\s(?:data-[\w-]+|onclick|onerror|decoding|fetchpriority|srcset|sizes)=("[^"]*"|'[^']*')/gi, "")
    .replace(/\sstyle=("[^"]*"|'[^']*')/gi, "")
    .replace(/class="([^"]*)"/gi, cleanClassAttribute)
    .replace(/https:\/\/dev\.coastalarborgroup\.com\/wp-content\/uploads\/2026\/07\/coastal-arbor-logo\.png/gi, "/assets/coastal-arbor-logo.png")
    .replace(/\s+\?<\/a>/g, "</a>")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, ">\n<")
    .trim();
}

function enhanceExternalEmbeds(content, route) {
  const labels = {
    "": ["Featured listings", "Open featured listings"],
    "search-homes": ["Interactive REIN MLS home search", "Open full MLS search"],
    "available-rentals": ["Current AppFolio rental listings", "Open full rental listings"],
  };
  if (!labels[route]) return content;
  const [title, action] = labels[route];
  return content.replace(/<div class="cag-idx-shell">\s*(<iframe\b[^>]*\bsrc="([^"]+)"[^>]*><\/iframe>)\s*<\/div>/i,
    `<div class="cag-idx-shell"><div class="cag-idx-toolbar"><div><strong>${title}</strong><span>Live information supplied by the listing provider</span></div><a href="$2" target="_blank" rel="noopener">${action}<span aria-hidden="true">↗</span></a></div>$1</div>`);
}

function consultationContent() {
  return `<section class="cag-page-hero">
  <div class="cag-inner">
    <p class="cag-eyebrow">Start a Conversation</p>
    <h1>Request a Consultation</h1>
    <p class="cag-lead">Tell us what you are looking for and a member of Coastal &amp; Arbor will follow up with you directly.</p>
  </div>
</section>
<section class="cag-section">
  <div class="cag-inner cag-consultation-wrap">
    <div class="cag-consultation-card">
      <form class="cag-consultation-form" action="https://formsubmit.co/info@coastalarborgroup.com" method="post">
        <input type="hidden" name="_subject" value="New Coastal &amp; Arbor consultation request">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_next" value="https://static-dev.coastalarborgroup.com/thank-you/">
        <label for="consultation-name">Full name</label>
        <input id="consultation-name" name="name" type="text" autocomplete="name" required>
        <label for="consultation-email">Email address</label>
        <input id="consultation-email" name="email" type="email" autocomplete="email" required>
        <label for="consultation-phone">Phone number</label>
        <input id="consultation-phone" name="phone" type="tel" autocomplete="tel">
        <label for="consultation-type">How can we help?</label>
        <select id="consultation-type" name="consultation-type" required>
          <option value="">Select a consultation type</option>
          <option>Buying a home</option><option>Selling a property</option><option>Property management</option>
          <option>Real estate investment</option><option>Rental inquiry</option><option>Other</option>
        </select>
        <label for="consultation-message">Message</label>
        <textarea id="consultation-message" name="message" rows="7" maxlength="2000" required></textarea>
        <button class="cag-button" type="submit">Request a Consultation</button>
      </form>
    </div>
    <p class="centered-note">Prefer email? Contact <a href="mailto:info@coastalarborgroup.com">info@coastalarborgroup.com</a>.</p>
  </div>
</section>`;
}

function thankYouContent() {
  return `<section class="cag-page-hero cag-thank-you-hero">
  <div class="cag-inner">
    <p class="cag-eyebrow">Message Received</p>
    <h1>Thank you for reaching out.</h1>
    <p class="cag-lead">Your consultation request has been sent to Coastal &amp; Arbor Real Estate Group.</p>
  </div>
</section>
<section class="cag-section cag-thank-you">
  <div class="cag-inner">
    <h2>What happens next?</h2>
    <p>April or a member of the Coastal &amp; Arbor team will review your information and follow up with you directly. You can continue exploring the site while you wait.</p>
    <div class="cag-actions"><a class="cag-button" href="/">Return Home</a><a class="cag-button cag-button--outline" href="/search-homes/">Search Homes</a></div>
  </div>
</section>`;
}

function reviewData(source) {
  const blocks = source.split('<div class="rpi-slide grw-review">').slice(1, 10);
  return blocks.map((block) => {
    const name = block.match(/class="wp-google-name"[^>]*>([^<]+)<\/a>/)?.[1] || "Google reviewer";
    const time = block.match(/class="wp-google-time"[^>]*>([^<]+)<\/div>/)?.[1] || "Verified review";
    const text = block.match(/class="wp-google-text">([\s\S]*?)<\/span>/)?.[1]?.replace(/<[^>]+>/g, "").trim() || "Five-star Google review.";
    return { name, time, text };
  });
}

function reviewCards(reviews) {
  return `<div class="review-grid">${reviews.map(({ name, time, text }) => {
    const reviewText = text.length > 320
      ? `<p>${text.slice(0, 260).trim()}…</p><details class="review-full"><summary>Read full review</summary><p>${text}</p></details>`
      : `<p>${text}</p>`;
    return `<article class="review-card">
    <div class="review-card__header"><span class="review-avatar" aria-hidden="true">${name.charAt(0)}</span><div><h3>${name}</h3><p>${time}</p></div></div>
    <div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
    ${reviewText}
  </article>`;
  }).join("")}</div>`;
}

function reviewBrowser(reviews, prefix) {
  const pages = [reviews.slice(0, 3), reviews.slice(3, 6), reviews.slice(6, 9)];
  const controls = pages.map((_, index) => `<input class="review-browser__state review-state--${index + 1}" type="radio" name="${prefix}-page" id="${prefix}-page-${index + 1}"${index === 0 ? " checked" : ""}>`).join("");
  const pageMarkup = pages.map((pageReviews, index) => {
    const page = index + 1;
    const previous = page === 1 ? pages.length : page - 1;
    const next = page === pages.length ? 1 : page + 1;
    const dots = pages.map((_, dotIndex) => `<label for="${prefix}-page-${dotIndex + 1}" aria-label="Show review page ${dotIndex + 1}"></label>`).join("");
    return `<section class="review-page review-page--${page}" aria-label="Google reviews page ${page} of ${pages.length}">${reviewCards(pageReviews)}<div class="review-pagination"><label class="review-arrow" for="${prefix}-page-${previous}" aria-label="Previous reviews">←</label><div class="review-dots">${dots}</div><span>Page ${page} of ${pages.length}</span><label class="review-arrow" for="${prefix}-page-${next}" aria-label="Next reviews">→</label></div></section>`;
  }).join("");
  return `<div class="review-browser">${controls}<div class="review-pages">${pageMarkup}</div></div>`;
}

function reviewsContent(source) {
  const reviews = reviewData(source);
  const cards = reviewBrowser(reviews, "reviews");
  const modalCards = reviewBrowser(reviews, "modal-reviews");
  return `<section id="reviews" class="cag-section cag-section--mist">
  <div class="cag-inner"><p class="cag-eyebrow">Client Experiences</p><h1>Real feedback from Google.</h1><p class="cag-lead">Browse selected reviews from Coastal &amp; Arbor’s verified Google Business Profile. Use the arrows to move through all available review pages.</p></div>
</section>
<section class="cag-section"><div class="cag-inner">
  <div class="cag-google-summary"><div class="cag-google-rating">5.0 on Google</div><div class="cag-google-stars" aria-label="5 out of 5 stars">★★★★★</div><p>Based on 13 verified Google reviews.</p></div>
  ${cards}
  <div class="cag-review-actions"><a class="cag-button" href="https://www.google.com/search?q=Coastal+%26+Arbor+Real+Estate+Group&amp;hl=en" target="_blank" rel="noopener">Read All on Google</a><a class="cag-button cag-button--outline" href="#google-review-popup">Leave a Review</a></div>
</div></section>
<section class="cag-cta"><h2>Ready to experience the Coastal &amp; Arbor standard?</h2><p>Start with a conversation about your real estate or property-management goals.</p><p><a class="cag-button cag-button--light" href="/contact/">Contact April</a></p></section>
<section id="google-review-popup" class="cag-review-modal" role="dialog" aria-modal="true" aria-labelledby="google-review-popup-title">
  <div class="cag-review-modal__panel"><a class="cag-review-modal__close" href="#reviews" aria-label="Close Google reviews popup">×</a><p class="cag-eyebrow">Google Reviews</p><h2 id="google-review-popup-title">See what clients are saying.</h2><p>Browse the latest verified reviews, then continue to Google to share your own experience.</p>${cards}<div class="cag-review-modal__actions"><a class="cag-button" href="https://search.google.com/local/writereview?placeid=ChIJtQhtI4mBuokR30ZVQjo0yTk" target="_blank" rel="noopener">Continue to Google</a><a class="cag-button cag-button--outline" href="#reviews">Close</a></div></div>
</section>`.replace(`<p>Browse the latest verified reviews, then continue to Google to share your own experience.</p>${cards}<div class="cag-review-modal__actions">`, `<p>Browse the latest verified reviews, then continue to Google to share your own experience.</p>${modalCards}<div class="cag-review-modal__actions">`);
}

function pageDocument(page, content) {
  const description = page.description || `${page.label} services and information from Coastal & Arbor Real Estate Group in Hampton Roads.`;
  const pageLabel = page.route ? `<div class="page-label"><div>${page.label}</div></div>` : "";
  return `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="description" content="${description}">
  <title>${page.title}</title>
  <link rel="stylesheet" href="/site.css?v=${siteCssVersion}">
</head>
<body class="${page.route || "home"}">
${headerMarkup(page.route)}
<main id="main-content">
  ${pageLabel}
  ${content}
</main>
${footerMarkup()}
</body>
</html>
`;
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const page of pages) {
  const sourcePath = join(root, page.source);
  if (!existsSync(sourcePath)) throw new Error(`Missing source page: ${page.source}`);
  const source = readFileSync(sourcePath, "utf8");
  let content = page.route === "consultation"
    ? consultationContent()
    : page.route === "thank-you"
      ? thankYouContent()
    : page.route === "reviews"
      ? reviewsContent(source)
      : enhanceExternalEmbeds(cleanContent(extractEntry(source)), page.route);
  if (!/<h1\b/i.test(content)) content = content.replace(/<h2\b/i, "<h1").replace(/<\/h2>/i, "</h1>");

  const outputPath = page.route ? join(outputRoot, page.route, "index.html") : join(outputRoot, "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, pageDocument(page, content), "utf8");
}

cpSync(join(root, "site.css"), join(outputRoot, "site.css"));
cpSync(join(root, "assets"), join(outputRoot, "assets"), { recursive: true });
cpSync(join(root, ".htaccess"), join(outputRoot, ".htaccess"));
writeFileSync(join(outputRoot, "robots.txt"), "User-agent: *\nDisallow: /\n", "utf8");

console.log(`Built ${pages.length} static pages in ${outputRoot}`);
