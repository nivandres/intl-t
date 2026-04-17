import { describe, it, expect } from "bun:test";
import { match as m } from "../src";

describe("match locales", () => {
  it("should match language to language", () => {
    expect(m(["es"], ["es"])).toBe("es");
    expect(m("es", ["es"])).toBe("es");
    expect(m(["es"], ["ar", "es"])).toBe("es");
    expect(m(["es"], ["es", "ar"])).toBe("es");
    expect(m(["es"], ["ar", "es", "ar"])).toBe("es");
    expect(m(["en", "es", "en"], ["ar", "es", "ar"])).toBe("es");
    expect(m(["ar", "en-US"], ["ar", "ar-US"])).toBe("ar");
  });
  it("should match language region to language region", () => {
    expect(m(["es-MX"], ["es-MX"])).toBe("es-MX");
    expect(m(["es-MX"], ["es", "es-MX"])).toBe("es-MX");
  });
  it("should match language region to language", () => {
    expect(m(["ar-CA"], ["ar", "ar-US", "es-CA"])).toBe("ar");
  });
  it("should match language region to region", () => {
    expect(m(["es-MX"], ["en", "en-MX"])).toBe("en-MX");
    expect(m(["ar-US"], ["es", "fr-US"])).toBe("fr-US");
  });
  it("should match default locale", () => {
    expect(m(["ar"], ["es"], "en")).toBe("en");
    expect(m(["en-MX"], ["es-US"], "ar")).toBe("ar");
  });
});

describe("general cases", () => {
  it("cases", () => {
    expect(m(["es-CO", "en-US"], ["en", "es"], "en")).toBe("es");
    expect(m(["es-CO", "en-US"], ["en", "es-MX"], "en")).toBe("es-MX");
  });
});
