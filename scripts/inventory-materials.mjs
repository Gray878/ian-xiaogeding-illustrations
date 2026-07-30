#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

function usage() {
  console.error(
    "Usage: node scripts/inventory-materials.mjs --dir <material-dir> [--output <json-file>]",
  );
}

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || !process.argv[index + 1]) return null;
  return process.argv[index + 1];
}

function classify(sourceRow) {
  if (!sourceRow) return "blocked-undocumented";

  if (
    /仅编辑参考|不得直接(?:进入|用于)|发布前(?:确认|另行确认)授权|授权不明确|未提供足够明确/.test(
      sourceRow,
    )
  ) {
    return "reference-only";
  }

  if (/CC\s*BY(?:-SA)?|BSD(?:\s*3-Clause)?|署名|相同许可|兼容许可/i.test(sourceRow)) {
    return "publishable-with-credit";
  }

  if (/CC0|公有领域|public domain|自制|原创|本项目生成/i.test(sourceRow)) {
    return "publishable";
  }

  return "needs-review";
}

const materialDirArg = readArg("--dir");
const outputArg = readArg("--output");

if (!materialDirArg) {
  usage();
  process.exit(2);
}

const materialDir = path.resolve(materialDirArg);
if (!fs.existsSync(materialDir) || !fs.statSync(materialDir).isDirectory()) {
  console.error(`Material directory not found: ${materialDir}`);
  process.exit(2);
}

const sourcesPath = path.join(materialDir, "SOURCES.md");
const sourcesText = fs.existsSync(sourcesPath)
  ? fs.readFileSync(sourcesPath, "utf8")
  : "";
const sourceLines = sourcesText.split(/\r?\n/);

const assets = fs
  .readdirSync(materialDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .filter((entry) => SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name, "en"))
  .map((entry) => {
    const absolutePath = path.join(materialDir, entry.name);
    const sourceRow =
      sourceLines.find(
        (line) =>
          line.startsWith("|") &&
          (line.includes(`](${entry.name})`) || line.includes(entry.name)),
      ) || "";

    return {
      file: entry.name,
      extension: path.extname(entry.name).toLowerCase(),
      bytes: fs.statSync(absolutePath).size,
      documented: Boolean(sourceRow),
      policy: classify(sourceRow),
      sourceRow,
    };
  });

const report = {
  version: 1,
  materialDir,
  sourcesFile: fs.existsSync(sourcesPath) ? sourcesPath : null,
  counts: Object.fromEntries(
    [
      "publishable",
      "publishable-with-credit",
      "reference-only",
      "needs-review",
      "blocked-undocumented",
    ].map((policy) => [
      policy,
      assets.filter((asset) => asset.policy === policy).length,
    ]),
  ),
  assets,
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (outputArg) {
  const outputPath = path.resolve(outputArg);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized);
  console.log(outputPath);
} else {
  process.stdout.write(serialized);
}
