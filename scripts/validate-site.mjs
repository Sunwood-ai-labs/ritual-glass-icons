import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function collectMatches(input, pattern) {
  return [...input.matchAll(pattern)].map((match) => match[1] ?? match[0]);
}

const requiredFiles = [
  "README.md",
  "README.ja.md",
  "LICENSE",
  ".gitignore",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml",
  ".nojekyll",
  "robots.txt",
  "site.webmanifest",
  "assets/favicon.svg",
  "assets/ritual-glass-hero.svg",
  "assets/ritual-glass-mark.svg",
  "assets/checks/desktop-check.png",
  "assets/checks/mobile-check.png",
  "scripts/stage-pages.ps1",
  "scripts/validate-site.mjs",
];

for (const file of requiredFiles) {
  assert(await exists(file), `Missing required file: ${file}`);
}

const indexHtml = await read("index.html");
assert(indexHtml.includes('<meta charset="UTF-8" />'), "index.html is missing charset metadata.");
assert(indexHtml.includes('name="viewport"'), "index.html is missing viewport metadata.");
assert(indexHtml.includes("<title>Ritual Glass Icons</title>"), "index.html title is missing or unexpected.");
assert(indexHtml.includes('name="description"'), "index.html is missing a description meta tag.");
assert(indexHtml.includes('rel="icon"'), "index.html is missing a favicon link.");
assert(indexHtml.includes('rel="manifest"'), "index.html is missing a manifest link.");

const iconReferences = collectMatches(indexHtml, /src="\.\/icons\/([^"]+\.svg)"/g);
const uniqueIconReferences = new Set(iconReferences);
assert(iconReferences.length === 10, `Expected 10 icon references in index.html, found ${iconReferences.length}.`);
assert(uniqueIconReferences.size === 10, "Icon references in index.html are not unique.");
assert(collectMatches(indexHtml, /<article class="card">/g).length === 10, "Expected 10 icon cards in index.html.");
assert(
  collectMatches(indexHtml, /alt="" aria-hidden="true"/g).length === 10,
  "Expected 10 decorative image tags in index.html.",
);

for (const iconName of uniqueIconReferences) {
  const iconPath = `icons/${iconName}`;
  assert(await exists(iconPath), `Referenced icon is missing: ${iconPath}`);
  const svg = await read(iconPath);
  assert(/<svg\b/.test(svg), `${iconPath} does not contain an <svg> element.`);
  assert(/viewBox="/.test(svg), `${iconPath} does not contain a viewBox.`);
  assert(/<title>/.test(svg), `${iconPath} does not contain a <title>.`);
}

const readme = await read("README.md");
const readmeJa = await read("README.ja.md");
assert(readme.includes("./README.ja.md"), "README.md is missing the Japanese language switch.");
assert(readmeJa.includes("./README.md"), "README.ja.md is missing the English language switch.");
assert(readme.includes("./assets/ritual-glass-hero.svg"), "README.md is missing the hero asset reference.");
assert(readmeJa.includes("./assets/ritual-glass-hero.svg"), "README.ja.md is missing the hero asset reference.");

const manifest = JSON.parse(await read("site.webmanifest"));
assert(manifest.name === "Ritual Glass Icons", "site.webmanifest name is unexpected.");
assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, "site.webmanifest icons are missing.");

if (errors.length > 0) {
  console.error("Validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Validation passed.");
console.log(`- Required files: ${requiredFiles.length}`);
console.log(`- Icon references: ${iconReferences.length}`);
console.log(`- Unique icons: ${uniqueIconReferences.size}`);
