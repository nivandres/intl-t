// AI generated test
// check() is the jsx/patch coercion helper: it must unwrap ONLY translation nodes (to their
// base string) and pass every other child through untouched — including undefined/null
// (pages-router /404 prerender regression) and nodes whose base is falsy ("").
import { describe, expect, it } from "bun:test";
import { createTranslation } from "../src/translation";
import { check } from "../src/utils";

describe("check — child coercion safety", () => {
  it("passes undefined and null through without crashing", () => {
    expect(check(undefined)).toBeUndefined();
    expect(check(null)).toBeNull();
  });

  it("passes plain strings, numbers and elements through untouched", () => {
    expect(check("hola")).toBe("hola");
    expect(check(0)).toBe(0);
    const element = { type: "div", props: {} };
    expect(check(element)).toBe(element);
  });

  it("does not coerce arbitrary objects that happen to have a base property", () => {
    const impostor = { base: "not a node" };
    expect(check(impostor)).toBe(impostor);
  });

  it("unwraps translation nodes to their base", () => {
    const t = createTranslation({ locales: { en: { hello: "hi there" } } });
    expect(String(check(t.hello))).toBe("hi there");
  });

  it("unwraps a node whose base is an empty string (falsy) to the string, not the node", () => {
    const t = createTranslation({ locales: { en: { empty: "" } } });
    expect(check(t.empty)).toBe("");
  });
});
