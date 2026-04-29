import { writeFileSync } from "node:fs";
import path from "node:path";
import { readPortfolio, renderIndexHtml, renderRobotsTxt, renderSitemapXml } from "./static-site.mjs";

const root = process.cwd();
const content = readPortfolio();

writeFileSync(path.join(root, "index.html"), renderIndexHtml(content));
writeFileSync(path.join(root, "public/robots.txt"), renderRobotsTxt(content));
writeFileSync(path.join(root, "public/sitemap.xml"), renderSitemapXml(content));

console.log("Generated index.html, public/robots.txt, and public/sitemap.xml.");
