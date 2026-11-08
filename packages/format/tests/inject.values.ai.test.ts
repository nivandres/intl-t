// AI generated test
// Interpolated values are data: whatever they contain, they are inserted literally and never
// parsed as placeholders, ICU options, `#` markers or expressions.
import { describe, expect, it } from "bun:test";
import { injectVariables } from "../src/inject";

describe("inject — values are inserted literally", () => {
  it("does not parse placeholder or ICU syntax coming from a value", () => {
    expect(injectVariables("hi {v}" as string, { v: "{n, plural, one {a} other {b}}", n: 1 })).toBe("hi {n, plural, one {a} other {b}}");
    expect(injectVariables("hi {v}" as string, { v: "{x}", x: "nope" })).toBe("hi {x}");
  });

  it("does not evaluate expression syntax coming from a value", () => {
    expect(injectVariables("sum {v}" as string, { v: "{(1+1)}" })).toBe("sum {(1+1)}");
  });

  it("keeps `#` and backticks from a value", () => {
    expect(injectVariables("{n, plural, other {# by {who}}}" as string, { n: 3, who: "#1 fan" })).toBe("3 by #1 fan");
    expect(injectVariables("{v}" as string, { v: "a`{b`}" })).toBe("a`{b`}");
    expect(injectVariables("{v}" as string, { v: "it`s" })).toBe("it`s");
  });

  it("keeps values literal inside option branches", () => {
    expect(injectVariables("{n, plural, other {# messages for {name}}}" as string, { n: 2, name: "{n}" })).toBe("2 messages for {n}");
  });

  it("keeps list items literal", () => {
    expect(injectVariables("{l, list}" as string, { l: ["{x}", "y"], x: "nope" }, { locale: "en" })).toBe("{x} and y");
  });

  it("treats values in expressions as data, whatever they contain", () => {
    expect(injectVariables("{(a + b)}" as string, { a: "b", b: "c" })).toBe("bc");
    expect(injectVariables("{(a + 1)}" as string, { a: 2 })).toBe("3");
  });

  it("compares option guards against values as data", () => {
    const msg = "{name, =={expected} {match} other {no match}}" as string;
    expect(injectVariables(msg, { name: "x", expected: "x" })).toBe("match");
    expect(injectVariables(msg, { name: "{expected}", expected: "x" })).toBe("no match");
  });

  it("ignores inherited object keys when resolving expression identifiers", () => {
    expect(injectVariables("{(a + 1)}" as string, { a: 1 })).toBe("2");
    expect(injectVariables("{(String(1))}" as string, { a: 1 })).toBe("1");
  });
});
