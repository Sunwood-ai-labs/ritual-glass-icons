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

function isLocalizedText(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.en === "string" &&
      value.en.trim() &&
      typeof value.ja === "string" &&
      value.ja.trim(),
  );
}

function collectMatches(input, pattern) {
  return [...input.matchAll(pattern)].map((match) => match[1] ?? match[0]);
}

function toRelativePath(fromFile, targetPath) {
  const baseDir = path.dirname(fromFile);
  return path.normalize(path.join(baseDir, targetPath));
}

async function validateSvg(relativePath) {
  assert(await exists(relativePath), `Referenced SVG is missing: ${relativePath}`);

  if (!(await exists(relativePath))) {
    return;
  }

  const svg = await read(relativePath);
  assert(/<svg\b/.test(svg), `${relativePath} does not contain an <svg> element.`);
  assert(/viewBox="/.test(svg), `${relativePath} does not contain a viewBox.`);
  assert(/<title>/.test(svg), `${relativePath} does not contain a <title>.`);
}

const requiredFiles = [
  "README.md",
  "README.ja.md",
  "CONTRIBUTING.md",
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
  "collections/README.md",
  "collections/manifest.json",
  "collections/ritual-glass/collection.json",
  "scripts/new-collection.mjs",
  "scripts/smoke-test-collection-flow.mjs",
  "scripts/site-catalog.mjs",
  "scripts/stage-pages.ps1",
  "scripts/validate-site.mjs",
];

for (const file of requiredFiles) {
  assert(await exists(file), `Missing required file: ${file}`);
}

const indexHtml = await read("index.html");
assert(indexHtml.includes('<meta charset="UTF-8" />'), "index.html is missing charset metadata.");
assert(indexHtml.includes('name="viewport"'), "index.html is missing viewport metadata.");
assert(indexHtml.includes("<title>SVG Concept Lab</title>"), "index.html title is missing or unexpected.");
assert(indexHtml.includes('name="description"'), "index.html is missing a description meta tag.");
assert(indexHtml.includes('rel="icon"'), "index.html is missing a favicon link.");
assert(indexHtml.includes('rel="manifest"'), "index.html is missing a manifest link.");
assert(indexHtml.includes('./scripts/site-catalog.mjs'), "index.html is missing the catalog script.");
assert(indexHtml.includes('id="collection-switcher"'), "index.html is missing the collection switcher.");
assert(indexHtml.includes('id="featured-collection"'), "index.html is missing the featured collection slot.");
assert(indexHtml.includes('id="collection-list"'), "index.html is missing the collection list slot.");

const registry = JSON.parse(await read("collections/manifest.json"));
assert(typeof registry.site?.title === "string", "collections/manifest.json is missing site.title.");
assert(registry.site?.title === "SVG Concept Lab", "collections/manifest.json site.title is unexpected.");
assert(typeof registry.defaultCollection === "string", "collections/manifest.json is missing defaultCollection.");
assert(Array.isArray(registry.collections) && registry.collections.length > 0, "collections/manifest.json has no collections.");

const registrySlugs = new Set();
const collectionManifests = [];

for (const entry of registry.collections ?? []) {
  assert(typeof entry.slug === "string", "Registry entry is missing a slug.");
  assert(/^[a-z0-9-]+$/.test(entry.slug ?? ""), `Invalid collection slug in registry: ${entry.slug}`);
  assert(!registrySlugs.has(entry.slug), `Duplicate collection slug in registry: ${entry.slug}`);
  registrySlugs.add(entry.slug);

  assert(typeof entry.manifest === "string", `Registry entry ${entry.slug} is missing a manifest path.`);
  const manifestPath = toRelativePath("collections/manifest.json", entry.manifest ?? "");
  assert(await exists(manifestPath), `Collection manifest is missing: ${manifestPath}`);

  if (!(await exists(manifestPath))) {
    continue;
  }

  const collection = JSON.parse(await read(manifestPath));
  collectionManifests.push(collection);

  assert(collection.slug === entry.slug, `Collection manifest slug mismatch for ${manifestPath}.`);
  assert(["draft", "published"].includes(collection.status), `${manifestPath} has an invalid status.`);
  assert(Number.isInteger(collection.displayOrder), `${manifestPath} is missing an integer displayOrder.`);
  assert(isLocalizedText(collection.name), `${manifestPath} is missing localized name text.`);
  assert(isLocalizedText(collection.summary), `${manifestPath} is missing localized summary text.`);
  assert(isLocalizedText(collection.description), `${manifestPath} is missing localized description text.`);
  assert(Array.isArray(collection.icons), `${manifestPath} must contain an icons array.`);

  for (const assetPath of [collection.mark, collection.hero, collection.screenshots?.desktop, collection.screenshots?.mobile]) {
    if (!assetPath) {
      continue;
    }

    const resolved = toRelativePath(manifestPath, assetPath);
    assert(await exists(resolved), `Missing collection asset referenced by ${manifestPath}: ${resolved}`);
  }

  const iconIds = new Set();
  const iconOrders = new Set();

  for (const icon of collection.icons ?? []) {
    assert(typeof icon.id === "string" && icon.id.trim(), `${manifestPath} contains an icon without an id.`);
    assert(!iconIds.has(icon.id), `${manifestPath} contains a duplicate icon id: ${icon.id}`);
    iconIds.add(icon.id);

    assert(Number.isInteger(icon.order), `${manifestPath} icon ${icon.id} is missing an integer order.`);
    assert(!iconOrders.has(icon.order), `${manifestPath} contains a duplicate icon order: ${icon.order}`);
    iconOrders.add(icon.order);

    assert(isLocalizedText(icon.name), `${manifestPath} icon ${icon.id} is missing localized name text.`);
    assert(isLocalizedText(icon.description), `${manifestPath} icon ${icon.id} is missing localized description text.`);
    assert(typeof icon.file === "string" && icon.file.endsWith(".svg"), `${manifestPath} icon ${icon.id} has an invalid file path.`);
    assert(Array.isArray(icon.tags), `${manifestPath} icon ${icon.id} is missing tags.`);

    if (typeof icon.file === "string" && icon.file.endsWith(".svg")) {
      const resolved = toRelativePath(manifestPath, icon.file);
      await validateSvg(resolved);
    }
  }
}

assert(
  registry.collections.some((entry) => entry.slug === registry.defaultCollection),
  "collections/manifest.json defaultCollection does not match a registered collection.",
);

const readme = await read("README.md");
const readmeJa = await read("README.ja.md");
assert(readme.includes("./README.ja.md"), "README.md is missing the Japanese language switch.");
assert(readmeJa.includes("./README.md"), "README.ja.md is missing the English language switch.");
assert(readme.includes("./collections/manifest.json"), "README.md is missing the collection registry reference.");
assert(readmeJa.includes("./collections/manifest.json"), "README.ja.md is missing the collection registry reference.");
assert(readme.includes("./scripts/new-collection.mjs"), "README.md is missing the scaffold script reference.");
assert(readmeJa.includes("./scripts/new-collection.mjs"), "README.ja.md is missing the scaffold script reference.");
assert(readme.includes("smoke-test-collection-flow.mjs"), "README.md is missing the smoke test reference.");
assert(readmeJa.includes("smoke-test-collection-flow.mjs"), "README.ja.md is missing the smoke test reference.");

const webManifest = JSON.parse(await read("site.webmanifest"));
assert(webManifest.name === "SVG Concept Lab", "site.webmanifest name is unexpected.");
assert(Array.isArray(webManifest.icons) && webManifest.icons.length > 0, "site.webmanifest icons are missing.");

const totalIcons = collectionManifests.reduce((count, collection) => count + (collection.icons?.length ?? 0), 0);
const siteScript = await read("scripts/site-catalog.mjs");
assert(siteScript.includes("collections/manifest.json"), "site-catalog.mjs does not reference the collection registry.");

if (errors.length > 0) {
  console.error("Validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Validation passed.");
console.log(`- Required files: ${requiredFiles.length}`);
console.log(`- Collections: ${registry.collections.length}`);
console.log(`- Total icons: ${totalIcons}`);
console.log(`- Default collection: ${registry.defaultCollection}`);
