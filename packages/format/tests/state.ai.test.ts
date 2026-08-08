// AI generated test
import { describe, expect, it } from "bun:test";
import { enabledEval, state } from "../src/state";

// Node's --disallow-code-generation-from-strings reproduces what Edge runtimes and strict CSP do:
// the `eval` binding stays defined, but compiling a string throws. Running the check in a subprocess
// is the only way to observe it — the flag cannot be toggled inside a live process.
function runNode(source: string, ...flags: string[]) {
  const proc = Bun.spawnSync(["node", ...flags, "-e", source], { cwd: new URL("../../..", import.meta.url).pathname });
  const out = proc.stdout.toString().trim();
  if (!out) throw new Error(`subprocess produced no output: ${proc.stderr.toString().slice(0, 400)}`);
  return out;
}

const NO_CODEGEN = "--disallow-code-generation-from-strings";

describe("eval capability detection", () => {
  it("reports eval as enabled where code generation is allowed", () => {
    expect(enabledEval).toBe(true);
    expect(state.enabledEval).toBe(true);
  });

  it("reports eval as disabled where compiling a string throws, even though the binding exists", () => {
    const source = `import("@intl-t/format/state").then(s => console.log(JSON.stringify({
      enabledEval: s.enabledEval,
      binding: "eval" in globalThis,
    })))`;

    expect(JSON.parse(runNode(source, NO_CODEGEN))).toEqual({ enabledEval: false, binding: true });
    expect(JSON.parse(runNode(source))).toEqual({ enabledEval: true, binding: true });
  });

  it("degrades translation nodes to object mode instead of crashing when code generation is forbidden", () => {
    const source = `import("@intl-t/core").then(m => {
      const t = m.createTranslation({ locales: { en: { hi: "hey {name}" } }, mainLocale: "en" });
      console.log(JSON.stringify({ type: typeof t, value: String(t.hi.use({ name: "Ada" })) }));
    })`;

    // the Function shell needs code generation, so the whole tree falls back to plain objects — .use() is the call form there
    expect(JSON.parse(runNode(source, NO_CODEGEN))).toEqual({ type: "object", value: "hey Ada" });
    expect(JSON.parse(runNode(source)).type).toBe("function");
  });
});
