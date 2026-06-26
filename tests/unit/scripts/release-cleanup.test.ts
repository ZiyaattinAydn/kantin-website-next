import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertKantinProjectRoot,
  findReleaseCleanupTargets,
  removeReleaseCleanupTargets,
} from "../../../scripts/lib/release-cleanup.mjs";

const temporaryRoots: string[] = [];

function createProjectRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kantin-release-cleanup-"));
  temporaryRoots.push(root);
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "kantin-website-next" }),
  );
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("release cleanup", () => {
  it("yanlış proje kökünde çalışmayı reddeder", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "other-project-"));
    temporaryRoots.push(root);
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "other" }));

    expect(() => assertKantinProjectRoot(root)).toThrow(/yalnız kantin-website-next/);
  });

  it("yalnız sabit eski ve generated hedefleri kaldırır", () => {
    const root = createProjectRoot();
    fs.mkdirSync(path.join(root, ".next"), { recursive: true });
    fs.writeFileSync(path.join(root, ".next", "build.txt"), "generated");
    fs.mkdirSync(path.join(root, "public", "data"), { recursive: true });
    fs.writeFileSync(path.join(root, "public", "data", "events.json"), "[]");
    fs.writeFileSync(path.join(root, "keep.txt"), "koru");

    expect(findReleaseCleanupTargets(root)).toEqual(
      expect.arrayContaining([".next", "public/data/events.json"]),
    );

    const removed = removeReleaseCleanupTargets(root);
    expect(removed).toEqual(expect.arrayContaining([".next", "public/data/events.json"]));
    expect(fs.existsSync(path.join(root, ".next"))).toBe(false);
    expect(fs.existsSync(path.join(root, "public", "data", "events.json"))).toBe(false);
    expect(fs.readFileSync(path.join(root, "keep.txt"), "utf8")).toBe("koru");
  });
});
