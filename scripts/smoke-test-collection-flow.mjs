import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "svg-concept-lab-"));

async function copy(relativePath) {
  const source = path.join(root, relativePath);
  const destination = path.join(tmpRoot, relativePath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

try {
  await copy("collections/manifest.json");
  await copy("scripts/new-collection.mjs");

  await execFileAsync(
    process.execPath,
    ["./scripts/new-collection.mjs", "--slug", "smoke-test", "--name", "Smoke Test", "--ja-name", "Smoke Test"],
    { cwd: tmpRoot },
  );

  const registry = JSON.parse(await fs.readFile(path.join(tmpRoot, "collections", "manifest.json"), "utf8"));
  const smokeEntry = registry.collections.find((entry) => entry.slug === "smoke-test");
  if (!smokeEntry) {
    throw new Error("Smoke test collection was not added to collections/manifest.json.");
  }

  const collectionPath = path.join(tmpRoot, "collections", "smoke-test", "collection.json");
  const collection = JSON.parse(await fs.readFile(collectionPath, "utf8"));

  if (collection.status !== "draft") {
    throw new Error("New collections must start in draft status.");
  }

  if (!Array.isArray(collection.icons) || collection.icons.length !== 0) {
    throw new Error("New collections must start with an empty icons array.");
  }

  for (const file of [
    path.join(tmpRoot, "collections", "smoke-test", "icons", ".gitkeep"),
    path.join(tmpRoot, "collections", "smoke-test", "checks", ".gitkeep"),
  ]) {
    await fs.access(file);
  }

  console.log("Collection flow smoke test passed.");
  console.log(`- Temp root: ${tmpRoot}`);
  console.log(`- Registry entries: ${registry.collections.length}`);
  console.log(`- Verified draft scaffold: collections/smoke-test`);
} finally {
  await fs.rm(tmpRoot, { recursive: true, force: true });
}
