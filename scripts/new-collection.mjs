import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "collections", "manifest.json");

function usage() {
  console.error(
    'Usage: node .\\scripts\\new-collection.mjs --slug aurora-arc --name "Aurora Arc" --ja-name "Aurora Arc"',
  );
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function assertSlug(slug) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Collection slug must match "^[a-z0-9-]+$".');
  }
}

function sortRegistryCollections(collections) {
  return [...collections].sort((left, right) => left.slug.localeCompare(right.slug));
}

const args = parseArgs(process.argv.slice(2));
const slug = args.slug;
const name = args.name;
const jaName = args["ja-name"] ?? name;
const summary = args.summary ?? "Draft concept collection.";
const jaSummary = args["ja-summary"] ?? "下書き中のコンセプトコレクションです。";
const description =
  args.description ??
  "Replace this description with the visual direction, motif, and intended design language for the collection.";
const jaDescription =
  args["ja-description"] ??
  "このコレクションの方向性、モチーフ、デザイン言語が伝わる説明に置き換えてください。";

if (!slug || !name) {
  usage();
  process.exit(1);
}

assertSlug(slug);

const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));
if (registry.collections.some((entry) => entry.slug === slug)) {
  throw new Error(`Collection "${slug}" is already registered.`);
}

const collectionRoot = path.join(root, "collections", slug);
const iconsDir = path.join(collectionRoot, "icons");
const checksDir = path.join(collectionRoot, "checks");
const manifestPath = path.join(collectionRoot, "collection.json");

try {
  await fs.access(collectionRoot);
  throw new Error(`Collection directory already exists: ${collectionRoot}`);
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

await fs.mkdir(iconsDir, { recursive: true });
await fs.mkdir(checksDir, { recursive: true });
await fs.writeFile(path.join(iconsDir, ".gitkeep"), "");
await fs.writeFile(path.join(checksDir, ".gitkeep"), "");

const template = {
  slug,
  status: "draft",
  displayOrder: registry.collections.length + 1,
  name: { en: name, ja: jaName },
  summary: { en: summary, ja: jaSummary },
  description: { en: description, ja: jaDescription },
  mark: null,
  hero: null,
  screenshots: {},
  credits: {
    skill: "frontend-design",
    repositoryRole: "Experiment repository for the Codex frontend-design skill.",
  },
  theme: {
    surface: "#0c1524",
    accent: "#9de7ff",
    accentWarm: "#f3c987",
  },
  icons: [],
};

await fs.writeFile(`${manifestPath}`, `${JSON.stringify(template, null, 2)}\n`);

registry.collections = sortRegistryCollections([
  ...registry.collections,
  {
    slug,
    manifest: `./${slug}/collection.json`,
  },
]);

await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log("Created collection scaffold:");
console.log(`- ${path.relative(root, collectionRoot)}`);
console.log(`- ${path.relative(root, manifestPath)}`);
console.log(`- ${path.relative(root, iconsDir)}`);
console.log(`- ${path.relative(root, checksDir)}`);
