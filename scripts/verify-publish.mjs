import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "src/content/portfolio.json",
  "index.html",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/og-image.svg",
];

const placeholderPatterns = [
  /Your Name/i,
  /Your Role/i,
  /your-domain\.com/i,
  /yourhandle/i,
  /you@example\.com/i,
  /example\.com/i,
  /placeholder/i,
];

const failures = [];

for (const file of files) {
  const source = readFileSync(path.join(root, file), "utf8");
  for (const pattern of placeholderPatterns) {
    if (pattern.test(source)) failures.push(`${file} still contains ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error("Publish verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Publish verification passed.");
