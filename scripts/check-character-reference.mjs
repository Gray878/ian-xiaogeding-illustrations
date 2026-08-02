#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const projectFlag = args.indexOf("--project");
if (projectFlag === -1 || !args[projectFlag + 1]) {
  console.error("Usage: node check-character-reference.mjs --project <project-dir>");
  process.exit(2);
}

const projectDir = path.resolve(args[projectFlag + 1]);
const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectDir, "character-reference.json");
const timelinePath = path.join(projectDir, "timeline.json");
const errors = [];

async function readJson(file, required) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (!required && error.code === "ENOENT") return null;
    errors.push(`${path.basename(file)}: ${error.message}`);
    return null;
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const timeline = await readJson(timelinePath, false);
const expectedSceneIds = (timeline?.scenes || [])
  .filter((scene) => scene.mode === "xiaogeding-narrative")
  .map((scene) => scene.sceneId);
for (const scene of (timeline?.scenes || []).filter((entry) => entry.mode === "xiaogeding-narrative")) {
  if (scene.characterId !== "xiaogeding-v1") errors.push(`${scene.sceneId}: characterId must be xiaogeding-v1`);
}

const manifestRequired = expectedSceneIds.length > 0 || await exists(manifestPath);
if (!manifestRequired) {
  console.log(JSON.stringify({ ok: true, skipped: true, reason: "No xiaogeding scenes" }, null, 2));
  process.exit(0);
}

const manifest = await readJson(manifestPath, true);
if (manifest) {
  if (manifest.characterId !== "xiaogeding-v1") errors.push("characterId must be xiaogeding-v1");
  if (manifest.referenceRole !== "identity-only") errors.push("referenceRole must be identity-only");

  const canonical = manifest.canonicalReference;
  if (typeof canonical !== "string" || canonical.length === 0) {
    errors.push("canonicalReference is required");
  } else {
    const candidates = [path.resolve(skillDir, canonical), path.resolve(projectDir, canonical)];
    if (path.isAbsolute(canonical)) candidates.unshift(canonical);
    if (!(await Promise.all(candidates.map(exists))).some(Boolean)) {
      errors.push(`canonicalReference does not exist: ${canonical}`);
    }
  }

  if (!Array.isArray(manifest.scenes) || manifest.scenes.length === 0) {
    errors.push("scenes must contain at least one character record");
  } else {
    const records = new Map();
    for (const scene of manifest.scenes) {
      if (!scene.sceneId) {
        errors.push("Every character record needs sceneId");
        continue;
      }
      if (records.has(scene.sceneId)) errors.push(`Duplicate scene record: ${scene.sceneId}`);
      records.set(scene.sceneId, scene);

      const allowedModes = new Set(["reference-image", "image-edit", "reused-layer", "deterministic-svg"]);
      if (!allowedModes.has(scene.generationMode)) errors.push(`${scene.sceneId}: invalid generationMode`);
      if (["reference-image", "image-edit"].includes(scene.generationMode) && scene.referenceImagePassed !== true) {
        errors.push(`${scene.sceneId}: ${scene.generationMode} requires referenceImagePassed=true`);
      }
      if (scene.identitySourceVerified !== true) errors.push(`${scene.sceneId}: identitySourceVerified must be true`);
      if (scene.identityQa !== "pass") errors.push(`${scene.sceneId}: identityQa must be pass`);
      if (!scene.output) {
        errors.push(`${scene.sceneId}: output is required`);
      } else if (!(await exists(path.resolve(projectDir, scene.output)))) {
        errors.push(`${scene.sceneId}: output does not exist: ${scene.output}`);
      }
    }

    for (const sceneId of expectedSceneIds) {
      if (!records.has(sceneId)) errors.push(`Missing character record for ${sceneId}`);
    }
  }
}

const report = {
  ok: errors.length === 0,
  projectDir,
  expectedSceneIds,
  characterRecordCount: manifest?.scenes?.length || 0,
  errors
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
