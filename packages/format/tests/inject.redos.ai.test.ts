// AI generated test
// Regression coverage for CWE-1333 / GHSA-rgx2-wxxf-mhq9: catastrophic backtracking in the
// message-variable parser. Before the fix, each of these inputs drove the regex engine into
// exponential (or multi-second) backtracking. They must now complete in roughly linear time.
import { describe, expect, it } from "bun:test";
import { injectVariables, variableRegex, instructionsRegex, MAX_FRAGMENT_LENGTH } from "../src/inject";

// Generous ceiling: the vulnerable patterns took seconds-to-minutes on these sizes, the hardened
// ones take single-digit milliseconds. 1s leaves ample headroom for slow/loaded CI without letting
// a real regression (which is orders of magnitude worse) slip through.
const BUDGET_MS = 1000;

function timed(run: () => unknown) {
  const start = performance.now();
  run();
  return performance.now() - start;
}

describe("inject — ReDoS hardening (raw patterns)", () => {
  it("variableRegex resists unbalanced quote runs", () => {
    for (const n of [40, 60, 100, 250]) {
      const payload = "{" + '"'.repeat(n) + "x";
      expect(timed(() => variableRegex.test(payload))).toBeLessThan(BUDGET_MS);
    }
  });

  it("variableRegex resists unterminated paren and bracket runs", () => {
    for (const n of [40, 80, 200]) {
      expect(timed(() => variableRegex.test("{" + "(".repeat(n) + "x"))).toBeLessThan(BUDGET_MS);
      expect(timed(() => variableRegex.test("{" + "(a)".repeat(n) + " "))).toBeLessThan(BUDGET_MS);
    }
  });

  it("instructionsRegex resists long word runs (nested-quantifier blowup)", () => {
    for (const n of [30, 60, 120, 400]) {
      expect(timed(() => instructionsRegex.test("a".repeat(n)))).toBeLessThan(BUDGET_MS);
    }
  });

  it("instructionsRegex resists slash, quote and symbol runs", () => {
    for (const n of [40, 80, 200]) {
      expect(timed(() => instructionsRegex.test("/".repeat(n) + "!"))).toBeLessThan(BUDGET_MS);
      expect(timed(() => instructionsRegex.test('"'.repeat(n) + "!"))).toBeLessThan(BUDGET_MS);
      expect(timed(() => instructionsRegex.test("=".repeat(n) + "a"))).toBeLessThan(BUDGET_MS);
    }
  });
});

describe("inject — ReDoS hardening (end-to-end through injectVariables)", () => {
  it("returns promptly for the advisory's quote-run payload", () => {
    for (const n of [30, 40, 50]) {
      const payload = "{" + '"a'.repeat(n) + "'" + "}";
      expect(timed(() => injectVariables(payload as string, {}))).toBeLessThan(BUDGET_MS);
    }
  });

  it("returns promptly for a pathological plural instruction body", () => {
    for (const n of [30, 60, 120]) {
      const payload = `{c, plural, ${"a".repeat(n)}}`;
      expect(timed(() => injectVariables(payload as string, { c: 1 }))).toBeLessThan(BUDGET_MS);
    }
  });
});

describe("inject — fragment length cap", () => {
  it("leaves an over-long {…} fragment as literal text instead of parsing it", () => {
    const giant = "{" + "a".repeat(MAX_FRAGMENT_LENGTH + 50) + "}";
    let out!: string;
    expect(timed(() => (out = injectVariables(giant as string, {}) as string))).toBeLessThan(BUDGET_MS);
    // untouched: no variable resolved, returned verbatim
    expect(out).toBe(giant);
  });

  it("still parses normal-sized fragments that sit just under the cap", () => {
    expect(injectVariables("{a}" as string, { a: "ok" })).toBe("ok");
  });
});

describe("inject — hardened patterns keep existing ICU behavior", () => {
  it("still evaluates parenthesized expressions", () => {
    expect(injectVariables("{(a - 1)}" as string, { a: 2 })).toBe("1");
    expect(injectVariables("{(600 *2)}" as string)).toBe("1200");
  });

  it("still matches quoted select options by content", () => {
    expect(injectVariables("{v, select, 'yes' {si} other {no}}" as string, { v: "yes" })).toBe("si");
    expect(injectVariables("Hola {gender, select, ='male' 'señor' 'female' 'señorita'}" as string, { gender: "female" })).toBe(
      "Hola señorita",
    );
  });

  it("still resolves nested plural/select with comparison operators", () => {
    expect(injectVariables("{a, =0 {no items} =1 {one item} >1&<10 {many items} >=10 {lots of items}}" as string, { a: 10 })).toBe(
      "lots of items",
    );
  });
});
