import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

export function readPortfolio() {
  return JSON.parse(readFileSync(path.join(root, "src/content/portfolio.json"), "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function absoluteUrl(siteUrl, pathName = "") {
  const base = siteUrl.replace(/\/$/, "");
  const suffix = pathName ? `/${pathName.replace(/^\//, "")}` : "";
  return `${base}${suffix}`;
}

function externalProfileLinks(content) {
  return content.contacts
    .map((contact) => contact.link)
    .filter((link) => /^https?:\/\//.test(link));
}

export function renderIndexHtml(content) {
  const { site } = content;
  const siteUrl = site.siteUrl.replace(/\/$/, "");
  const socialImage = absoluteUrl(siteUrl, "og-image.svg");
  const twitterHandle = site.twitterHandle ? `@${site.twitterHandle.replace(/^@/, "")}` : "";
  const sameAs = externalProfileLinks(content)
    .map((link) => `        "${escapeHtml(link)}"`)
    .join(",\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <meta name="theme-color" content="#000000" />

    <title>${escapeHtml(site.title)}</title>

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://cloud.umami.is" />

    <!-- Primary meta -->
    <meta name="description" content="${escapeHtml(site.description)}" />
    <meta name="author" content="${escapeHtml(site.name)}" />
    <meta name="keywords" content="portfolio, developer, engineer" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${absoluteUrl(siteUrl, "/")}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${absoluteUrl(siteUrl, "/")}" />
    <meta property="og:title" content="${escapeHtml(site.title)}" />
    <meta property="og:description" content="${escapeHtml(site.description)}" />
    <meta property="og:image" content="${socialImage}" />
    <meta property="og:site_name" content="${escapeHtml(site.name)}" />
    <meta property="og:locale" content="${escapeHtml(site.locale)}" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${escapeHtml(twitterHandle)}" />
    <meta name="twitter:creator" content="${escapeHtml(twitterHandle)}" />
    <meta name="twitter:url" content="${absoluteUrl(siteUrl, "/")}" />
    <meta name="twitter:title" content="${escapeHtml(site.title)}" />
    <meta name="twitter:description" content="${escapeHtml(site.description)}" />
    <meta name="twitter:image" content="${socialImage}" />

    <!-- Structured data: Person -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "${escapeHtml(site.name)}",
      "url": "${siteUrl}",
      "jobTitle": "${escapeHtml(site.title.replace(site.name, "").replace(/^\\s*-\\s*/, ""))}",
      "sameAs": [
${sameAs}
      ],
      "description": "${escapeHtml(site.description)}"
    }
    </script>

    <!-- Analytics (deferred) - set VITE_ANALYTICS_ID in .env.local -->
    <script>
      var _aid = '%VITE_ANALYTICS_ID%';
      if (_aid && _aid !== '%VITE_ANALYTICS_ID%') {
        window.addEventListener('load', function() {
          var s = document.createElement('script');
          s.src = 'https://cloud.umami.is/script.js';
          s.setAttribute('data-website-id', _aid);
          document.head.appendChild(s);
        });
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script src="/src/main.tsx" type="module"></script>
  </body>
</html>
`;
}

export function renderRobotsTxt(content) {
  return `User-agent: *
Allow: /

Sitemap: ${absoluteUrl(content.site.siteUrl, "sitemap.xml")}
`;
}

export function renderSitemapXml(content) {
  const siteUrl = content.site.siteUrl.replace(/\/$/, "");
  const urls = [
    { loc: absoluteUrl(siteUrl, "/"), changefreq: "monthly", priority: "1.0" },
    ...content.projects.map((project) => ({
      loc: absoluteUrl(siteUrl, `projects/${project.slug}`),
      changefreq: project.category === "visual" ? "yearly" : "monthly",
      priority: project.category === "visual" ? "0.5" : "0.8",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}
