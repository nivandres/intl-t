// AI generated test
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { promises } from "fs";
import { join } from "path";
import { generateDeclarations } from "../src/index";
import { createTempDir, exists, removeTempDir, writeJson } from "./helpers";

const tempDirs: string[] = [];
const originalCwd = process.cwd();

async function makeSearchDir() {
  const dir = await createTempDir("decl-search-");
  tempDirs.push(dir);
  return dir;
}

function searchDeclarations() {
  return generateDeclarations({ inputs: [], disableSearch: false, silent: true });
}

afterEach(async () => {
  process.chdir(originalCwd);
  for (const dir of tempDirs.splice(0)) await removeTempDir(dir);
});

describe("generateDeclarations JSON search", () => {
  it("finds translation folders by their conventional names and skips ignored locations", async () => {
    const dir = await makeSearchDir();
    await promises.mkdir(join(dir, "locales"));
    await writeJson(join(dir, "locales", "en.json"), { hello: "world" });
    await promises.writeFile(join(dir, "locales", "readme.txt"), "notes", "utf-8");
    await promises.writeFile(join(dir, "locales", "todo.txt"), "notes", "utf-8");
    await promises.mkdir(join(dir, "misc"));
    await writeJson(join(dir, "misc", "one.json"), { skip: true });
    await promises.writeFile(join(dir, "misc", "two.txt"), "x", "utf-8");
    await promises.writeFile(join(dir, "misc", "three.txt"), "x", "utf-8");
    await promises.mkdir(join(dir, "node_modules", "pkg"), { recursive: true });
    await writeJson(join(dir, "node_modules", "pkg", "skip.json"), { skip: true });
    await promises.mkdir(join(dir, ".cache"));
    await writeJson(join(dir, ".cache", "skip.json"), { skip: true });
    process.chdir(dir);
    await searchDeclarations();
    expect(await exists(join(dir, "locales", "en.d.json.ts"))).toBe(true);
    // folders that are mostly non-JSON, dependency folders and hidden folders are not picked up
    expect(await exists(join(dir, "misc", "one.d.json.ts"))).toBe(false);
    expect(await exists(join(dir, "node_modules", "pkg", "skip.d.json.ts"))).toBe(false);
    expect(await exists(join(dir, ".cache", "skip.d.json.ts"))).toBe(false);
  });

  it("finds folders where at least half of the files are JSON", async () => {
    const dir = await makeSearchDir();
    await promises.mkdir(join(dir, "data"));
    await writeJson(join(dir, "data", "a.json"), { id: "a" });
    await writeJson(join(dir, "data", "b.json"), { id: "b" });
    await promises.writeFile(join(dir, "data", "c.txt"), "x", "utf-8");
    process.chdir(dir);
    await searchDeclarations();
    expect(await exists(join(dir, "data", "a.d.json.ts"))).toBe(true);
    expect(await exists(join(dir, "data", "b.d.json.ts"))).toBe(true);
  });

  it("rejects when the search finds no translation folders", async () => {
    const dir = await makeSearchDir();
    process.chdir(dir);
    await expect(searchDeclarations()).rejects.toBe("No input files or folders specified. Use --help for usage.");
  });

  it("surfaces folder listing failures during the search", async () => {
    const dir = await makeSearchDir();
    process.chdir(dir);
    const readdirSpy = spyOn(promises, "readdir").mockImplementationOnce(() => Promise.reject<never>(new Error("denied")));
    try {
      const failed = searchDeclarations();
      await expect(failed).rejects.toMatch("Error reading directory");
      await expect(failed).rejects.toMatch("denied");
    } finally {
      readdirSpy.mockRestore();
    }
  });
});
