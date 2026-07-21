// AI generated test
import { afterEach, describe, expect, it } from "bun:test";
import { promises } from "fs";
import { join } from "path";
import { usage } from "../src/index";
import { createTempDir, exists, removeTempDir, waitFor, writeJson } from "./helpers";

const binPath = join(import.meta.dir, "..", "src", "bin.ts");
const tempDirs: string[] = [];

async function makeDir() {
  const dir = await createTempDir("decl-bin-");
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) await removeTempDir(dir);
});

describe("bin entrypoint", () => {
  it("runs the CLI against process.argv when the module is imported", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { from: "import" });
    const originalArgv = process.argv;
    process.argv = ["bun", binPath, input, "--silent"];
    try {
      await import("../src/bin");
      await waitFor(() => exists(join(dir, "en.d.json.ts")));
    } finally {
      process.argv = originalArgv;
    }
    expect(await promises.readFile(join(dir, "en.d.json.ts"), "utf-8")).toContain('"from": "import"');
  });

  it("converts files when spawned as a command line tool", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { from: "cli" });
    const result = Bun.spawnSync([process.execPath, binPath, input], { cwd: dir, stdout: "pipe", stderr: "pipe" });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("Processing...");
    expect(await promises.readFile(join(dir, "en.d.json.ts"), "utf-8")).toContain('"from": "cli"');
  });

  it("prints usage when asked for help", async () => {
    const dir = await makeDir();
    const result = Bun.spawnSync([process.execPath, binPath, "--help"], { cwd: dir, stdout: "pipe", stderr: "pipe" });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain(usage.trim());
  });

  it("reports missing inputs on the error stream without crashing", async () => {
    const dir = await makeDir();
    const missing = join(dir, "missing.json");
    const result = Bun.spawnSync([process.execPath, binPath, missing], { cwd: dir, stdout: "pipe", stderr: "pipe" });
    // the CLI routes rejections to console.error instead of exiting with a failure code
    expect(result.exitCode).toBe(0);
    expect(result.stderr.toString()).toContain(`File or folder not found: ${missing}`);
  });
});
