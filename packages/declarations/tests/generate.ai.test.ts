// AI generated test
import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { promises } from "fs";
import { join } from "path";
import main, { generateDeclarations } from "../src/index";
import { createTempDir, exists, removeTempDir, writeJson } from "./helpers";

const tempDirs: string[] = [];

async function makeDir() {
  const dir = await createTempDir("decl-generate-");
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) await removeTempDir(dir);
});

describe("generateDeclarations with file inputs", () => {
  it("writes a declaration file next to the input with a symbol derived from the file name", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en-US.json"), { greeting: "hello" });
    await generateDeclarations(input, {});
    const content = await promises.readFile(join(dir, "en-US.d.json.ts"), "utf-8");
    expect(content).toBe(
      'export declare const en_US: {\n  "greeting": "hello"\n};\nexport type en_US = typeof en_US;\nexport default en_US;',
    );
  });

  it("logs progress when silent is disabled", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { ok: true });
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    try {
      await generateDeclarations(input, { silent: false });
      const logged = logSpy.mock.calls.map(call => call.join(" ")).join("\n");
      expect(logged).toContain("Processing...");
    } finally {
      logSpy.mockRestore();
    }
    expect(await exists(join(dir, "en.d.json.ts"))).toBe(true);
  });

  it("honors custom output paths and symbol names", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { title: "Home" });
    const output = join(dir, "generated.d.ts");
    await generateDeclarations(input, { output, symbolName: "data" });
    const content = await promises.readFile(output, "utf-8");
    expect(content).toStartWith("export declare const data: {");
    expect(content).toContain('"title": "Home"');
    expect(await exists(join(dir, "en.d.json.ts"))).toBe(false);
  });

  it('names the output after the "ts" format and cascades through the later format templates', async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "messages.json"), { a: 1 });
    await generateDeclarations(input, { format: "ts" });
    const content = await promises.readFile(join(dir, "messages.ts"), "utf-8");
    // the format switch has no break statements, so earlier templates end up embedded in the later ones
    expect(content).toStartWith("export declare const messages: export declare const messages = (export const messages = ({");
    expect(content).toEndWith("export default messages;");
  });

  it('names the output after the "d.ts" format and embeds its template in the default one', async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "messages.json"), { a: 1 });
    await generateDeclarations(input, { format: "d.ts" });
    const content = await promises.readFile(join(dir, "messages.d.ts"), "utf-8");
    expect(content).toStartWith("export declare const messages: export declare const messages = ({");
    expect(content).toEndWith("export default messages;");
  });

  it("accepts json-like file extensions and replaces the whole extension in the output name", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "config.json5"), { flag: true });
    await generateDeclarations(input, {});
    const content = await promises.readFile(join(dir, "config.d.json.ts"), "utf-8");
    expect(content).toStartWith("export declare const config: {");
  });

  it("processes an array of files but reuses the first file's output path and symbol for the rest", async () => {
    const dir = await makeDir();
    const first = await writeJson(join(dir, "a.json"), { from: "a" });
    const second = await writeJson(join(dir, "b.json"), { from: "b" });
    await generateDeclarations([first, second], {});
    const content = await promises.readFile(join(dir, "a.d.json.ts"), "utf-8");
    // the derived output path and symbol are remembered across the loop, so the last file wins
    expect(content).toStartWith("export declare const a: {");
    expect(content).toContain('"from": "b"');
    expect(await exists(join(dir, "b.d.json.ts"))).toBe(false);
  });

  it("deletes the original file when removal is requested", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { bye: "original" });
    await generateDeclarations(input, { removeOriginal: true });
    expect(await exists(input)).toBe(false);
    expect(await promises.readFile(join(dir, "en.d.json.ts"), "utf-8")).toContain('"bye": "original"');
  });

  it("keeps the input file when the output resolves to the same path", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "same.json"), { kept: true });
    await generateDeclarations(input, { output: input, removeOriginal: true });
    expect(await promises.readFile(input, "utf-8")).toStartWith("export declare const same: {");
  });

  it("skips inputs that do not look like JSON files", async () => {
    const dir = await makeDir();
    const input = join(dir, "notes.txt");
    await promises.writeFile(input, "plain text", "utf-8");
    await generateDeclarations(input, {});
    expect(await promises.readdir(dir)).toEqual(["notes.txt"]);
  });

  it("accepts a single options object holding the inputs", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { bundled: true });
    await generateDeclarations({ inputs: [input], symbolName: "bundle" });
    const content = await promises.readFile(join(dir, "en.d.json.ts"), "utf-8");
    expect(content).toStartWith("export declare const bundle: {");
  });
});

describe("generateDeclarations with folder inputs", () => {
  it("converts every JSON file directly inside a folder and leaves everything else alone", async () => {
    const dir = await makeDir();
    await writeJson(join(dir, "one.json"), { id: 1 });
    await writeJson(join(dir, "two.json5"), { id: 2 });
    await promises.writeFile(join(dir, "notes.txt"), "skip me", "utf-8");
    await promises.mkdir(join(dir, "nested"));
    await writeJson(join(dir, "nested", "inner.json"), { id: 3 });
    await generateDeclarations(dir, {});
    expect(await promises.readFile(join(dir, "one.d.json.ts"), "utf-8")).toStartWith("export declare const one: {");
    expect(await promises.readFile(join(dir, "two.d.json.ts"), "utf-8")).toStartWith("export declare const two: {");
    expect(await exists(join(dir, "notes.d.json.ts"))).toBe(false);
    expect(await exists(join(dir, "nested", "inner.d.json.ts"))).toBe(false);
  });

  it("reports invalid JSON files inside a folder and still converts the valid ones", async () => {
    const dir = await makeDir();
    await promises.writeFile(join(dir, "broken.json"), "{ nope", "utf-8");
    await writeJson(join(dir, "good.json"), { fine: true });
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    try {
      await generateDeclarations(dir, { silent: false });
      const logged = logSpy.mock.calls.map(call => call.join(" ")).join("\n");
      expect(logged).toContain('Error parsing JSON file "');
    } finally {
      logSpy.mockRestore();
    }
    expect(await exists(join(dir, "good.d.json.ts"))).toBe(true);
    expect(await exists(join(dir, "broken.d.json.ts"))).toBe(false);
  });

  it("stops processing after the first folder input", async () => {
    const dir = await makeDir();
    const folder = join(dir, "folder");
    await promises.mkdir(folder);
    await writeJson(join(folder, "inside.json"), { seen: true });
    const extra = await writeJson(join(dir, "extra.json"), { seen: false });
    await generateDeclarations([folder, extra], {});
    // the folder branch returns before later inputs are visited
    expect(await exists(join(folder, "inside.d.json.ts"))).toBe(true);
    expect(await exists(join(dir, "extra.d.json.ts"))).toBe(false);
  });
});

describe("generateDeclarations error handling", () => {
  it("rejects when the input path does not exist", async () => {
    const dir = await makeDir();
    const missing = join(dir, "missing.json");
    await expect(generateDeclarations(missing, {})).rejects.toBe(`File or folder not found: ${missing}`);
  });

  it("rejects when no inputs are given and searching is disabled", async () => {
    await expect(generateDeclarations({ inputs: [] })).rejects.toBe("No input files or folders specified. Use --help for usage.");
  });

  it("rejects when the input file cannot be read", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { ok: true });
    const readSpy = spyOn(promises, "readFile").mockImplementationOnce(() => Promise.reject<never>(new Error("denied")));
    try {
      await expect(generateDeclarations(input, {})).rejects.toBe(`Error reading file "${input}": denied`);
    } finally {
      readSpy.mockRestore();
    }
  });

  it("rejects on malformed JSON", async () => {
    const dir = await makeDir();
    const input = join(dir, "broken.json");
    await promises.writeFile(input, "{ nope", "utf-8");
    await expect(generateDeclarations(input, {})).rejects.toMatch(`Error parsing JSON file "${input}"`);
  });

  it("rejects when the parsed content cannot be serialized again", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { ok: true });
    const parseSpy = spyOn(JSON, "parse").mockImplementationOnce(() => {
      const circular: { self?: unknown } = {};
      circular.self = circular;
      return circular;
    });
    try {
      await expect(generateDeclarations(input, {})).rejects.toMatch(`Error stringifying JSON file "${input}"`);
    } finally {
      parseSpy.mockRestore();
    }
  });

  it("rejects when the output cannot be written", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { ok: true });
    const output = join(dir, "missing-folder", "en.d.json.ts");
    await expect(generateDeclarations(input, { output })).rejects.toMatch(`Error writing output file "${output}"`);
  });

  it("wraps deletion failures in the write error message", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { ok: true });
    const output = join(dir, "custom.d.json.ts");
    const unlinkSpy = spyOn(promises, "unlink").mockImplementationOnce(() => Promise.reject(new Error("denied")));
    try {
      // the deletion failure throws a plain string, so the outer write handler reads no message from it
      await expect(generateDeclarations(input, { output, removeOriginal: true })).rejects.toBe(
        `Error writing output file "${output}": undefined`,
      );
    } finally {
      unlinkSpy.mockRestore();
    }
    expect(await exists(output)).toBe(true);
    expect(await exists(input)).toBe(true);
  });
});

describe("main", () => {
  it("drives argument parsing and generation from the default export", async () => {
    const dir = await makeDir();
    const input = await writeJson(join(dir, "en.json"), { done: true });
    await main(["bun", "cli.js", input, "--silent"]);
    expect(await promises.readFile(join(dir, "en.d.json.ts"), "utf-8")).toContain('"done": true');
  });
});
