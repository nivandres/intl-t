// AI generated test
import { describe, expect, it, spyOn } from "bun:test";
import { cmdName, parseArgs, usage, type Options } from "../src/index";

describe("parseArgs", () => {
  it("collects positional arguments as inputs and applies defaults", () => {
    const options = parseArgs(["node", "script.js", "a.json", "b.json"]);
    expect(options.inputs).toEqual(["a.json", "b.json"]);
    expect(options.disableSearch).toBe(false);
    expect(options.silent).toBe(false);
    expect(options.output).toBeUndefined();
    expect(options.watchMode).toBeUndefined();
  });

  it("skips the command name when it appears as the first argument", () => {
    const options = parseArgs(["node", "script.js", cmdName, "a.json"]);
    expect(options.inputs).toEqual(["a.json"]);
  });

  it("parses every long option", () => {
    const options = parseArgs([
      "node",
      "script.js",
      "in.json",
      "--out=out.d.ts",
      "--watch",
      "--no-search",
      "--format=ts",
      "--symbol=data",
      "--del",
      "--silent",
    ]);
    expect(options.inputs).toEqual(["in.json"]);
    expect(options.output).toBe("out.d.ts");
    expect(options.watchMode).toBe(true);
    expect(options.disableSearch).toBe(true);
    expect(options.format).toBe("ts");
    expect(options.symbolName).toBe("data");
    expect(options.removeOriginal).toBe(true);
    expect(options.silent).toBe(true);
  });

  it("supports option aliases", () => {
    const output = parseArgs(["node", "script.js", "--output=alias.d.ts", "--remove"]);
    expect(output.output).toBe("alias.d.ts");
    expect(output.removeOriginal).toBe(true);
    const deleted = parseArgs(["node", "script.js", "--delete"]);
    expect(deleted.removeOriginal).toBe(true);
  });

  it("merges parsed arguments into a provided options object and returns it", () => {
    const seed: Partial<Options> = { inputs: ["seed.json"] };
    const options = parseArgs(["node", "script.js", "extra.json"], seed);
    expect(options).toBe(seed);
    expect(options.inputs).toEqual(["seed.json", "extra.json"]);
  });

  it("throws on unknown options", () => {
    expect(() => parseArgs(["node", "script.js", "--bogus"])).toThrow("Unknown option --bogus. Use --help for usage.");
    expect(() => parseArgs(["node", "script.js", "-x"])).toThrow("Unknown option -x");
  });

  it("prints usage and exits for --help and -h", () => {
    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit(0)");
    });
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(() => parseArgs(["node", "script.js", "--help"])).toThrow("process.exit(0)");
      expect(() => parseArgs(["node", "script.js", "-h"])).toThrow("process.exit(0)");
      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(logSpy).toHaveBeenCalledWith(usage);
      expect(usage).toContain(`Usage: ${cmdName}`);
    } finally {
      exitSpy.mockRestore();
      logSpy.mockRestore();
    }
  });
});
