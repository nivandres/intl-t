// AI generated test
// Compile-time behavior assertions for the public typing surface: these lines must simply
// typecheck (bun run typecheck) — runtime expectations are minimal on purpose.
import { describe, expect, it } from "bun:test";
import { createTranslation } from "../src/index";

const t = createTranslation({
  locales: {
    en: { hello: "hi {name}", nested: { deep: "value" }, items: ["a", "b"] },
    es: { hello: "hola {name}", nested: { deep: "valor" }, items: ["x", "y"] },
  },
  mainLocale: "en",
});

describe("public typing surface", () => {
  it("types base as a string-compatible value", () => {
    const base: string = t.hello.base;
    expect(typeof base).toBe("string");
  });

  it("types the locale union on settings", () => {
    const locale: "en" | "es" = t.settings.locale;
    expect(["en", "es"]).toContain(locale);
  });

  it("autocompletes nested paths through property access", () => {
    const deep: string = String(t.nested.deep);
    expect(deep).toBe("value");
  });

  it("accepts variables in the call form and keeps the result stringable", () => {
    const out: string = String(t("hello", { name: "Ada" }));
    expect(out).toBe("hi Ada");
  });

  it("types setLocale's return as the switched tree", () => {
    const es = t.setLocale("es");
    const hola: string = String(es.hello({ name: "Ada" }));
    expect(hola).toBe("hola Ada");
    t.setLocale("en");
  });

  it("exposes allowedLocales as the readonly union array", () => {
    const locales: readonly ("en" | "es")[] = t.allowedLocales;
    expect(locales).toContain("en");
  });
});
