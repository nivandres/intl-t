import { createTranslation } from "../src/core";
import { describe, it, expect } from "bun:test";
import * as en from "./messages.json";

describe("Core", async () => {
  it("should run correctly nested", () => {
    const t = createTranslation({});
    expect(t).toBeInstanceOf(Object);
    expect(t.t).toBe(t);
    expect(t.tr).toBe(t);
    expect(t.parent).toBe(t);
    expect(t.global).toBe(t);
    expect(t.base).toBeUndefined();
  });
  it("should work with multiple languages", () => {
    const t = createTranslation({
      locales: {
        es: "es",
        en: "en",
      },
      mainLocale: "en",
    });
    expect(t.locales.includes("es")).toBeTrue();
    expect(t.main).toBe("en");
    expect(t.en.base).toBe("en");
    expect(t.es.base).toBe("es");
    expect(t.en).toBe(t);
    expect(t.es.en).toBe(t);
    expect(t.es.parent).toBe(t);
    expect(t.es.global).toBe(t.es);
    expect(t.en.global).toBe(t);
  });
  it("should work with array node", () => {
    const t = createTranslation({
      locales: {
        en: ["en"],
        es: ["es"],
      },
      mainLocale: "es",
    });
    expect(t[0].lang).toBe("es");
    expect(t.en.es.en[0].es.en.base).toBe("en");
  });
  it("should work with object node", () => {
    const t = createTranslation({
      locales: {
        en: { base: "en" },
        es: { base: "es" },
      },
      mainLocale: "es",
    });
    expect(t.en.es.en.base).toBe("en");
    expect(t.es.en.p.p.p.g.p.lang).toBe("es");
  });
  it("should work with deep nesting", () => {
    const t = createTranslation({
      locales: {
        en: {
          base: ".",
          hello: "hello",
          o1: [
            ".o1.0",
            ".o1.1",
            {
              base: ".o1.2",
              o2: ".o1.2.o2",
              o3: [".o1.2.o3.0", [{ base: ".o1.2.o3.1.0" }]],
            },
            ".o1.3",
          ],
        },
      },
    });
    expect(t.base).toBe(".");
    expect(t.o1[0].base).toBe(".o1.0");
    expect(t.o1[2].base).toBe(".o1.2");
    expect(t.o1[2].o3[0].base).toBe(".o1.2.o3.0");
    expect(t.o1[2].o3.p.o3[1][0].base).toBe(".o1.2.o3.1.0");
    expect(t("hello").base).toBe("hello");
    expect(t("o1.3").base).toBe(".o1.3");
    expect(t("o1.2.o3.0").base).toBe(".o1.2.o3.0");
  });
  it("should have all properties correctly", () => {
    const t = createTranslation({
      locales: {
        en: {
          hello: {
            base: "hello",
            o1: "o1",
            o2: ["o2"],
          },
        },
      },
    });
    expect(t.hello.settings).toBe(t.settings);
    expect(t.hello.lang).toBe("en");
    expect(t.hello.path).toEqual(["hello"]);
    expect(t.key).toBeOneOf(["en", "", undefined]);
    expect(t.hello.id).toBe("hello");
    expect(t.child).toBe("hello");
    expect(t.children);
    expect(t.hello.children).toEqual(["o1", "o2"]);
    expect(t.hello.type).toBe("tree");
    expect(t.hello.base).toBe("hello");
    expect(t.hello.raw).toBe("hello");
    expect(t.hello.o1.type).toBe("base");
    expect(t.hello.o2.type).toBe("list");
  });
  it("should support json directly imported", () => {
    const t = createTranslation({ locales: { en } });
    expect(t.pages("landing.hero").parent.hero.paragraph.toString()).toBe("content");
    expect(t.common.yes.g("common.yes").base).toBe("yes");
  });
  it("should work with diferent params", () => {
    let t = createTranslation({ locales: { en }, ps: "/" });
    expect(t.common.yes.id).toBe("common/yes");
  });
});
