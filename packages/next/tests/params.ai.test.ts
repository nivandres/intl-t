// AI generated test
import { describe, expect, it } from "bun:test";
import { createGenerateStaticParams, createStaticParams, generateStaticParams } from "../src/params";

describe("next params", () => {
  it("generates static params with the configured key", () => {
    expect(generateStaticParams.call({ locales: ["en", "es"], param: "locale" })).toEqual([{ locale: "en" }, { locale: "es" }]);
  });

  it("creates a bound static params generator", () => {
    const generate = createGenerateStaticParams({ locales: ["en", "es"], param: "lang" });
    expect(generate()).toEqual([{ lang: "en" }, { lang: "es" }]);
  });

  it("creates static params immediately and uses the default param name", () => {
    expect(createStaticParams({ locales: ["en", "es"] })).toEqual([{ locale: "en" }, { locale: "es" }]);
  });
});
