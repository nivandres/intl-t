// AI generated test
import { afterAll, afterEach, describe, expect, it, spyOn } from "bun:test";
import { EventEmitter } from "events";
import * as fs from "fs";
import { promises } from "fs";
import { join } from "path";
import { generateDeclarations } from "../src/index";
import { createTempDir, exists, removeTempDir, waitFor, writeJson } from "./helpers";

/** In-memory stand-in for a file watcher, so change events can be replayed deterministically. */
class FakeWatcher extends EventEmitter implements fs.FSWatcher {
  close() {}
  ref() {
    return this;
  }
  unref() {
    return this;
  }
}

/** Filename that reads as a JSON file once, then fails on the next string conversion. */
class OneShotName {
  private used = false;
  toString(): string {
    if (this.used) throw new TypeError("filename is no longer available");
    this.used = true;
    return "en.json";
  }
}

// Pass-through spy used to intercept watcher creation and close anything real that slips through.
const watchSpy = spyOn(fs, "watch");
const tempDirs: string[] = [];

async function makeDir() {
  const dir = await createTempDir("decl-watch-");
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const result of watchSpy.mock.results) {
    if (result.type === "return") result.value.close();
  }
  watchSpy.mockClear();
  for (const dir of tempDirs.splice(0)) await removeTempDir(dir);
});

afterAll(() => {
  watchSpy.mockRestore();
});

describe("generateDeclarations watch mode", () => {
  it("regenerates the output when the watched file reports a change", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { version: "one" });
    const output = join(dir, "en.d.json.ts");
    const watcher = new FakeWatcher();
    watchSpy.mockImplementationOnce(() => watcher);
    await generateDeclarations(input, { watchMode: true });
    expect(watchSpy).toHaveBeenCalledTimes(1);
    expect(await promises.readFile(output, "utf-8")).toContain('"version": "one"');
    await writeJson(input, { version: "two" });
    watcher.emit("change");
    await waitFor(async () => (await promises.readFile(output, "utf-8")).includes('"version": "two"'));
  });

  it("watches folders and regenerates declarations for changed JSON files only", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { label: "start" });
    const output = join(dir, "en.d.json.ts");
    const watcher = new FakeWatcher();
    watchSpy.mockImplementationOnce(() => watcher);
    await generateDeclarations(dir, { watchMode: true });
    expect(watchSpy).toHaveBeenCalledTimes(1);
    expect(await exists(output)).toBe(true);
    await writeJson(input, { label: "changed" });
    await promises.rm(output);
    watcher.emit("change", "change", "notes.txt");
    await new Promise(resolve => setTimeout(resolve, 60));
    expect(await exists(output)).toBe(false); // events for non-JSON files are ignored
    watcher.emit("change", "change", "en.json");
    await waitFor(async () => (await exists(output)) && (await promises.readFile(output, "utf-8")).includes('"label": "changed"'));
  });

  it("logs folder change events it cannot process instead of crashing the watcher", async () => {
    const dir = await makeDir();
    await writeJson(join(dir, "en.json"), { ok: true });
    const watcher = new FakeWatcher();
    watchSpy.mockImplementationOnce(() => watcher);
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    try {
      await generateDeclarations(dir, { watchMode: true, silent: false });
      // the filename passes the JSON filter but fails while building the path, and the handler reports it
      watcher.emit("change", "change", new OneShotName());
      expect(logSpy.mock.calls.some(call => call[0] instanceof TypeError)).toBe(true);
    } finally {
      logSpy.mockRestore();
    }
  });

  it("rejects when the folder watcher cannot be created", async () => {
    const dir = await makeDir();
    await writeJson(join(dir, "en.json"), { ok: true });
    watchSpy.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    await expect(generateDeclarations(dir, { watchMode: true })).rejects.toBe(`Error watching directory "${dir}": boom`);
    // the conversion already happened before the watcher failed
    expect(await exists(join(dir, "en.d.json.ts"))).toBe(true);
  });

  it("rejects when the file watcher cannot be created", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { ok: true });
    watchSpy.mockImplementationOnce(() => {
      throw new Error("boom");
    });
    await expect(generateDeclarations(input, { watchMode: true })).rejects.toBe(`Error watching file "${input}": boom`);
    expect(await exists(join(dir, "en.d.json.ts"))).toBe(true);
  });
});
