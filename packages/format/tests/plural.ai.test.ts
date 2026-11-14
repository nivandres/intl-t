// AI generated test
// ICU `plural` / `selectordinal` follow CLDR through Intl.PluralRules (issue #11).
import { describe, expect, it } from "bun:test";
import { relative } from "../src/formatters";
import { injectVariables } from "../src/inject";
import type { Values } from "../src/types";

const iv = (message: string, values: Values, locale = "en") => injectVariables(message as string, values, { locale });
const categories = "zero {zero} one {one} two {two} few {few} many {many} other {other}";
const locales = ["en", "ru", "pl", "uk", "cs", "ar", "cy", "fr", "lv", "ja"];

describe("plural — CLDR categories", () => {
  it("matches Intl.PluralRules for cardinal plurals across locales", () => {
    for (const locale of locales) {
      const rules = new Intl.PluralRules(locale);
      // n = 0 is left out: `zero` also matches 0 in every locale (intl-t extension, tested below)
      for (let n = 1; n <= 200; n++)
        expect([locale, n, iv(`{n, plural, ${categories}}`, { n }, locale)]).toEqual([locale, n, rules.select(n)]);
    }
  });

  it("matches Intl.PluralRules for selectordinal across locales", () => {
    for (const locale of locales) {
      const rules = new Intl.PluralRules(locale, { type: "ordinal" });
      for (let n = 1; n <= 200; n++)
        expect([locale, n, iv(`{n, selectordinal, ${categories}}`, { n }, locale)]).toEqual([locale, n, rules.select(n)]);
    }
  });

  it("formats the cases from the report", () => {
    const ord = "{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}";
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111, 112].map(n => iv(ord, { n }))).toEqual([
      "1st",
      "2nd",
      "3rd",
      "4th",
      "11th",
      "12th",
      "13th",
      "21st",
      "22nd",
      "23rd",
      "101st",
      "111th",
      "112th",
    ]);
    const ru = "{n, plural, one {# товар} few {# товара} many {# товаров} other {# товара}}";
    expect([1, 2, 5, 21, 22, 101, 111].map(n => iv(ru, { n }, "ru"))).toEqual([
      "1 товар",
      "2 товара",
      "5 товаров",
      "21 товар",
      "22 товара",
      "101 товар",
      "111 товаров",
    ]);
    expect(iv("{n, plural, one {# plik} few {# pliki} many {# plików} other {# pliku}}", { n: 22 }, "pl")).toBe("22 pliki");
  });

  it("keeps extended ordinal words off the teens", () => {
    const msg = "{n, selectordinal, one {#st} two {#nd} three {#rd} other {#th}}";
    expect([3, 11, 12, 13, 23].map(n => iv(msg, { n }))).toEqual(["3rd", "11th", "12th", "13th", "23rd"]);
  });

  it("uses n - offset for the category and #, and n for exact matches", () => {
    const msg = "{n, plural, offset:1 =0 {nobody} =1 {only you} one {you and # other} other {you and # others}}";
    expect([0, 1, 2, 3].map(n => iv(msg, { n }))).toEqual(["nobody", "only you", "you and 1 other", "you and 2 others"]);
  });

  it("prefers an exact match over the category, whatever the order", () => {
    expect(iv("{n, plural, one {category} =1 {exact} other {other}}", { n: 1 })).toBe("exact");
  });

  it("keeps `zero` for 0 as an intl-t extension", () => {
    expect(iv("{n, plural, zero {none} one {# item} other {# items}}", { n: 0 })).toBe("none");
    expect(iv("{n, plural, one {# item} other {# items}}", { n: 0 })).toBe("0 items");
  });

  it("still applies extended guards inside a typed plural", () => {
    expect(iv("{n, plural, =0 {none} >1&<10 {some} one {one} other {lots}}", { n: 5 })).toBe("some");
    expect(iv("{n, plural, =0 {none} >1&<10 {some} one {one} other {lots}}", { n: 1 })).toBe("one");
    expect(iv("{n, plural, =0 {none} >1&<10 {some} one {one} other {lots}}", { n: 50 })).toBe("lots");
  });

  it("accepts numeric strings", () => {
    expect(iv("{n, plural, one {# товар} few {# товара} many {# товаров} other {# товара}}", { n: "21" }, "ru")).toBe("21 товар");
  });
});

describe("enabledEval option", () => {
  it("stops evaluating option guards, while exact matches keep working", () => {
    expect(injectVariables("{n, >5 {big} other {small}}" as string, { n: 10 }, { enabledEval: false })).toBe("small");
    expect(injectVariables("{n, =0 {none} other {some}}" as string, { n: 0 }, { enabledEval: false })).toBe("none");
  });
});

describe("relative — sub-second deltas", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  it("formats deltas under one second in seconds", () => {
    expect(relative(new Date("2026-01-01T00:00:00.500Z"), { now }, "en")).toBe("in 0 seconds");
    expect(relative(new Date("2025-12-31T23:59:59.750Z"), { now, numeric: "auto" }, "en")).toBe("now");
    expect(relative(new Date("2026-01-01T00:00:05.000Z"), { now }, "en")).toBe("in 5 seconds");
  });
});
