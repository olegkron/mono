import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { readPortfolio, renderIndexHtml, renderRobotsTxt, renderSitemapXml } from "./static-site.mjs";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function publicFileExists(url) {
  const cleanUrl = url.split(/[?#]/)[0];
  return existsSync(path.join(root, "public", cleanUrl.replace(/^\//, "")));
}

function walkFiles(dir) {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(dir, entry.name);
    if (entry.isDirectory() && [".git", "node_modules", ".netlify", ".playwright-mcp"].includes(entry.name)) {
      return [];
    }
    if (entry.isDirectory()) return walkFiles(relativePath);
    return relativePath;
  });
}

for (const candidate of walkFiles(".")) {
  assert(!candidate.endsWith(".DS_Store"), `Remove local macOS metadata file: ${candidate}`);
}

const content = readPortfolio();

const generatedFiles = {
  "index.html": renderIndexHtml(content),
  "public/robots.txt": renderRobotsTxt(content),
  "public/sitemap.xml": renderSitemapXml(content),
};

for (const [file, expected] of Object.entries(generatedFiles)) {
  assert(read(file) === expected, `${file} is out of date. Run npm run generate:static.`);
}

const filesToScan = ["index.html", "src/Navigator.tsx", "src/content/portfolio.json"];

const assetPattern = /["'`](\/[^"'`)\s]+\.(?:svg|png|jpg|jpeg|webp|gif|mp4|pdf|ico))["'`]/g;

for (const file of filesToScan) {
  const source = read(file);
  for (const match of source.matchAll(assetPattern)) {
    const assetUrl = match[1];
    assert(publicFileExists(assetUrl), `${file} references missing public asset: ${assetUrl}`);
  }
}

const siteUrl = content.site.siteUrl;
assert(siteUrl, "src/content/portfolio.json must define site.siteUrl");

if (siteUrl) {
  const indexHtml = read("index.html");
  const sitemap = read("public/sitemap.xml");
  const robots = read("public/robots.txt");

  const firstPartyUrls = [
    ...indexHtml.matchAll(/<(?:link|meta)[^>]+(?:href|content)="(https:\/\/[^"]+)"/g),
    ...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g),
    ...robots.matchAll(/Sitemap:\s*(https:\/\/\S+)/g),
  ]
    .map((match) => match[1].replace(/\/$/, ""))
    .filter((url) => !url.startsWith("https://cloud.umami.is"));

  for (const url of firstPartyUrls) {
    assert(
      url === siteUrl || url.startsWith(`${siteUrl}/`),
      `SEO URL "${url}" does not match siteConfig.siteUrl "${siteUrl}"`,
    );
  }

  assert(
    robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`),
    "public/robots.txt Sitemap URL must match siteConfig.siteUrl",
  );
}

if (failures.length > 0) {
  console.error("Template verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Template verification passed.");
