// AI generated test
import { describe, expect, it } from "bun:test";
import { injectVariables } from "../src/inject";

describe("inject — missing variables", () => {
  it("keeps interpolating later placeholders when an earlier variable is missing", () => {
    expect(injectVariables("{a} and {b}", { b: "B" })).toBe("{a} and B");
  });

  it("skips an already-visited missing placeholder on later passes", () => {
    expect(injectVariables("{a} {b} {a}", { b: "B" })).toBe("{a} B {a}");
  });
});

describe("inject — ICU plural/select", () => {
  it("replaces every # occurrence inside the matched plural option", () => {
    const out = injectVariables("{n, plural, other {# of #}}" as string, { n: 3 });
    expect(out).toBe("3 of 3");
  });

  it("matches quoted select options against their content, not the quote character", () => {
    const out = injectVariables("{v, select, 'yes' {si} other {no}}" as string, { v: "yes" });
    expect(out).toBe("si");
  });
});

describe("inject — replacement safety", () => {
  it("keeps $-patterns in variable values literal", () => {
    expect(injectVariables("{v}", { v: "$&" })).toBe("$&");
    expect(injectVariables("pre {v} post", { v: "$'" })).toBe("pre $' post");
  });
});

describe("inject — plural/select matrix (volume)", () => {
  it("resolves exact and category plural branches", () => {
    const msg = "{n, plural, =0 {none} one {one item} other {# items}}" as string;
    expect(injectVariables(msg, { n: 0 })).toBe("none");
    expect(injectVariables(msg, { n: 1 })).toBe("one item");
    expect(injectVariables(msg, { n: 7 })).toBe("7 items");
  });

  it("resolves select with fallback to other", () => {
    const msg = "{g, select, male {él} female {ella} other {elle}}" as string;
    expect(injectVariables(msg, { g: "female" })).toBe("ella");
    expect(injectVariables(msg, { g: "unknown" })).toBe("elle");
  });

  it("interpolates sibling variables inside a matched option", () => {
    const msg = "{n, plural, other {# messages for {name}}}" as string;
    expect(injectVariables(msg, { n: 2, name: "Ivan" })).toBe("2 messages for Ivan");
  });

  it("handles multiple independent placeholders in one string", () => {
    expect(injectVariables("{a}-{b}-{c}" as string, { a: 1, b: 2, c: 3 })).toBe("1-2-3");
  });

  it("keeps siblings interpolated when a plural variable is missing (continue semantics)", () => {
    const out = injectVariables("{n, plural, other {# items}} & {name}" as string, { name: "ok" });
    expect(out).toContain("ok");
  });
});

describe("inject — escaped braces", () => {
  it("unescapes every escaped brace, not only the first", () => {
    // input widened to string: the type-level Display doesn't model backtick escapes
    const out = injectVariables("`{a`} and `{b`}" as string, {});
    expect(out).toBe("{a} and {b}");
  });
});
describe("inject — falsy and nullish variable values", () => {
  it("injects 0, '' and false literally instead of dropping them", () => {
    expect(injectVariables("n={n}", { n: 0 })).toBe("n=0");
    expect(injectVariables("s=[{s}]", { s: "" })).toBe("s=[]");
    expect(injectVariables("b={b}", { b: false })).toBe("b=false");
  });

  it("stringifies null but leaves the placeholder for undefined", () => {
    expect(injectVariables("v={v}", { v: null })).toBe("v=null");
    expect(injectVariables("v={v}", { v: undefined })).toBe("v={v}");
  });
});

describe("inject — emoji and brace-bearing content", () => {
  it("injects emoji values", () => {
    expect(injectVariables("go {v}!", { v: "🚀" })).toBe("go 🚀!");
  });

  it("does not match emoji placeholder NAMES (word-character names only, frozen limitation)", () => {
    expect(injectVariables("go {🚀}!", { "🚀": "up" })).toBe("go {🚀}!");
  });

  it("keeps braces from a value literal when no matching variable exists, but cascades when one does", () => {
    expect(injectVariables("v={v}", { v: "{x}" })).toBe("v={x}");
    // KNOWN: sequential replacement re-interpolates placeholders introduced by earlier values.
    // Frozen as-is; user-provided values naming another variable will cascade (see roadmap).
    expect(injectVariables("v={v}", { v: "{x}", x: "cascaded" })).toBe("v=cascaded");
  });
});

describe("inject — purity and scale", () => {
  it("stays correct across 1000 sequential injections with distinct values", () => {
    for (let i = 0; i < 1000; i++) {
      expect(injectVariables("hi {name} #{i}", { name: "u" + i, i })).toBe(`hi u${i} #${i}`);
    }
  });

  it("replaces 10k occurrences of the same placeholder in one ~80KB template", () => {
    const template = "word {v} ".repeat(10_000);
    const out = injectVariables(template, { v: "X" });
    expect(out.includes("{v}")).toBe(false);
    expect(out).toBe("word X ".repeat(10_000));
  });

  it("resolves ICU plural branches at numeric extremes", () => {
    expect(injectVariables("{n, plural, =0 {none} one {one} other {# items}}" as string, { n: 0 })).toBe("none");
    expect(injectVariables("{n, plural, one {one} other {# items}}" as string, { n: 1000 })).toBe("1000 items");
  });
});

describe("inject — onMissingVariable policies", () => {
  it("keeps the placeholder by default", () => {
    expect(injectVariables("hi {name}", {})).toBe("hi {name}");
  });

  it("clears the placeholder with the empty policy", () => {
    expect(injectVariables("hi {name}!", {}, { onMissingVariable: "empty" })).toBe("hi !");
  });

  it("uses the function policy's return as the value", () => {
    expect(injectVariables("hi {name}", {}, { onMissingVariable: (k: string) => `[${k}?]` })).toBe("hi [name?]");
  });

  it("supports a throwing function policy (formatjs-style strictness)", () => {
    expect(() =>
      injectVariables(
        "hi {name}",
        {},
        {
          onMissingVariable: (k: string) => {
            throw new Error(`missing ${k}`);
          },
        },
      ),
    ).toThrow("missing name");
  });
});

describe("inject — numeric strings stay literal (plain interpolation)", () => {
  it('preserves "007" and hex-like strings', () => {
    expect(injectVariables("code {v}", { v: "007" })).toBe("code 007");
    expect(injectVariables("id {v}", { v: "0x1F" })).toBe("id 0x1F");
  });
});

describe("inject — date/time heuristic matrix (supported surface under control)", () => {
  const d = new Date("2024-05-15T14:30:00.000Z");
  const en = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", o).format(d);
  const ctx = { locale: "en-US" };

  it("formats explicit date styles (short/md/long/full)", () => {
    expect(injectVariables("{d, date, short}" as string, { d }, ctx)).toBe(en({ dateStyle: "short" }));
    expect(injectVariables("{d, date, md}" as string, { d }, ctx)).toBe(en({ dateStyle: "medium" }));
    expect(injectVariables("{d, date, long}" as string, { d }, ctx)).toBe(en({ dateStyle: "long" }));
    expect(injectVariables("{d, date, xl}" as string, { d }, ctx)).toBe(en({ dateStyle: "full" }));
  });

  it("routes time-named tokens to timeStyle", () => {
    expect(injectVariables("{d, time}" as string, { d }, ctx)).toBe(en({ timeStyle: "short" }));
  });

  it("verbose combines date and time styles", () => {
    // verbose matches the long style group
    expect(injectVariables("{d, date, verbose}" as string, { d }, ctx)).toBe(en({ dateStyle: "long", timeStyle: "long" }));
  });

  it("keeps two date tokens isolated (no style leak between placeholders)", () => {
    const out = injectVariables("{a, time} | {b, date, short}" as string, { a: d, b: d }, ctx);
    expect(out).toBe(`${en({ timeStyle: "short" })} | ${en({ dateStyle: "short" })}`);
  });
});
