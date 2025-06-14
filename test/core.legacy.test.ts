import { createTranslation as ct, getChildren as gc, getSource as gs, getLocales } from "../src";
import { describe, it, expect } from "bun:test";
import en from "./messages.json";

describe("Translation object", () => {
  it("should run correctly nested", () => {
    const t = ct({});
    expect(t).toBeInstanceOf(Object);
    expect(t.t).toBe(t);
    expect(t.translation).toBe(t);
    expect(t.global).toBe(t);
  });
  it("should work with multiple languages", () => {
    const t = ct({
      locales: {
        es: "es",
        en: "en",
      },
      mainLocale: "en",
    });
    expect(t.allowedLocales.includes("es")).toBeTrue();
    expect(t.mainLocale).toBe("en");
    expect(t.en.base).toBe("en");
    expect(t.es.base).toBe("es");
    expect(t.en === t).toBe(true);
    expect(t.es.en as typeof t).toBe(t);
    expect(t.es.global).toBe(t.es);
    expect(t.global).toBe(t);
    expect(t("en").locale).toBe("en");
  });
  it("should work with array node", () => {
    const t = ct({
      locales: {
        en: ["en"],
        es: ["es"],
        fr: ["fr"],
      },
      mainLocale: "es",
    });
    expect(t[0].locale).toBe("es");
    expect(t.es.en.fr[0].base).toBe("fr");
    expect(t.en.es.en[0].es.en.base).toBe("en");
    expect(t.es[0].en.base).toBe("en");
    expect(t[0].en).toBe(t.en[0]);
  });
  it("should work with object node", () => {
    const t = ct({
      locales: {
        en: { base: "en" },
        es: { base: "es" },
      },
      mainLocale: "es",
    });
    expect(t.en.es.en.base).toBe("en");
    expect(t.es.en.es.locale).toBe("es");
  });
  it("should work with deep nesting", () => {
    const t = ct({
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
    expect(t.o1[2].o3[1][0].base).toBe(".o1.2.o3.1.0");
    expect(t("hello").base).toBe("hello");
    expect(t("o1.3").base).toBe(".o1.3");
    expect(t("o1.2.o3.1").id).toBe("o1.2.o3.1");
    expect(t("o1.2.o3")[0].base).toBe(".o1.2.o3.0");
    expect(t("o1.2").o3[0].base).toBe(".o1.2.o3.0");
    expect(t("o1", "2").o3[0].base).toBe(".o1.2.o3.0");
    expect(t(["o1", "2"]).o3[0].base).toBe(".o1.2.o3.0");
    expect(t(["o1", "2", "o3"]).id).toBe("o1.2.o3");
    expect(t(["o1", "2", "o3", "1", "0"]).id).toBe("o1.2.o3.1.0");
    expect(t(["o1", "2"]).id).toBe("o1.2");
    expect(t(["o1"]).id).toBe("o1");
  });
  it("should have all properties correctly", () => {
    const t = ct({
      locales: {
        en: {
          greeting: "hello {name}",
          hello: {
            base: "hello",
            o1: "o1",
            o2: ["o2"],
          },
        },
      },
    });
    expect(t.hello.settings).toBe(t.settings);
    expect(t.hello.locale).toBe("en");
    expect(t.hello.path).toEqual(["hello"]);
    expect(t.key).toBeOneOf(["en", "", undefined]);
    expect(t.hello.key).toBe("hello");
    expect(t.child).toBe("greeting");
    expect(t.children);
    expect(t.hello.children).toEqual(["o1", "o2"]);
    expect(t.hello.base).toBe("hello");
    expect(typeof t.hello.o1.node).toBe("string");
    expect(typeof t.hello.o2.node).toBe("object");
    expect(t.greeting({ name: "John" }).base).toBe("hello John");
  });
  it("should support json directly imported", () => {
    const t = ct({ locales: { en } });
    expect(t.pages("landing.hero").paragraph.toString()).toBe("content");
    expect(t.common.yes.g("common.yes").base).toBe("yes");
  });
  it("should work with diferent params", () => {
    const t = ct({ locales: { en }, ps: "/" });
    expect(t.common.yes.path.join(t.settings.ps)).toBe("common/yes");
  });
  it("should have consistent variables", () => {
    const t = ct({ locales: { en }, variables: { test: "test" } });
    const node = t.common.yes;
    expect(node.use({ a: "a" }).values.a).toBe("a");
    expect(t.common.yes.g("common.yes").values.test).toBe("test");
    expect(t.common({ a: "a" }).g("common").yes.values.a).toBe("a");
    expect(t("common.yes", { b: "b" }).values.b).toBe("b");
  });
  it("should preserve input when no keys are found", async () => {
    const t = ct({ locales: { en: { title: "This is the title" } } });
    expect(t("Hello world. How are you?").base).toBe("Hello world. How are you?");
  });
  it("should work with translation arrays", () => {
    const t = ct({
      locales: {
        en: ["hello", "world"],
        es: ["hola", "mundo"],
      },
    });
    expect(t.map(t => t.base)).toEqual(["hello", "world"]);
    expect(t.join(" ")).toBe("hello world");
    expect([...t][0].base).toBe("hello");
  });
  it("should work with overrided values", () => {
    const t = ct({
      locales: {
        en: {
          n1: {
            n2: {
              base: "hello {name}",
            },
            values: {
              name: "2",
            },
          },
          values: {
            name: "1",
          },
        },
      },
    });
    expect(t.n1.n2.base).toBe("hello 2");
  });
});

describe("source node utilities", () => {
  it("get children should work", () => {
    expect(gc({ a: "b" })).toEqual(["a"]);
    expect(gc([{ a: "b" }])).toEqual(["0"] as any);
    expect(gc({ a: { b: "c" } })).toEqual(["a"]);
    expect(gc(3)).toEqual([]);
    expect(gc([])).toEqual([]);
    expect(gc({})).toEqual([]);
    expect(gc("hola")).toEqual([]);
    expect(gc({ children: [] })).toEqual([]);
    expect(gc({ children: ["hola"] })).toEqual(["hola"] as any);
    expect(gc({ base: "hola", values: { a: "b" } })).toEqual([]);
  });
  it("get source should work", () => {
    expect(gs({ a: "b" })).toEqual({ a: "b", children: ["a"] });
    expect(gs("a")).toEqual("a");
    expect(gs(2)).toEqual(2);
    expect(gs([])).toEqual({ children: [] });
    expect(gs([1])["children" as any]).toEqual(["0"]);
    expect(gs({ a: { a: "hi" } }, 1).a!.a).toBeUndefined();
    expect(gs({ a: { a: "hi" } }).a!.a).toBe("hi");
  });
});

describe("variable injection", () => {
  it("should work integrated", () => {
    const t = ct({ locales: { en: { hello: "hello {name}", age: "you are {age} year{age, =1 '' other s} old" } } });
    expect(String(t.hello.use({ name: "ivan" }).base)).toBe("hello ivan");
    expect(String(t.age.use({ age: 1 }).base)).toBe("you are 1 year old");
    expect(String(t.age.use({ age: 2 }).base)).toBe("you are 2 years old");
  });
});

describe("dynamic import", () => {
  it("should work with dynamic get locale", () => {
    let t = ct({
      allowedLocales: ["en", "es"],
      getLocale(locale) {
        return { hello: locale === "es" ? "hola mundo" : "hello world" };
      },
    });
    expect(t.en.hello.base).toBe("hello world");
    expect(t.es.hello.base).toBe("hola mundo");
    t = ct({
      locales: {
        en: {
          hello: "hello world",
        },
      },
      allowedLocales: ["en", "es"],
      getLocale() {
        return { hello: "hola mundo" };
      },
    });
    expect(t.hello.base).toBe("hello world");
    expect(t.hello.es.base).toBe("hola mundo");
  });
  it("should work", async () => {
    const t = await ct({
      locales: { en },
    });
    expect(t.en.common.base).toBeString();
  });
  it("should work with mapped getLocales", async () => {
    const locales = await getLocales({
      en: { hello: "Hello" },
      es: () => ({ hello: "Hola" }),
    });
    expect(locales.en.hello).toBe("Hello");
    expect(locales.es.hello).toBe("Hola");
  });
  it("should work with mapped getLocales, with t async", async () => {
    const t = await ct({
      locales: {
        en: async () => {
          return { hello: "Hello" };
        },
        es: async () => {
          return { hello: "Hola" };
        },
        fr: { hello: "Bonjour" },
      },
    });
    expect(t.fr.hello.base).toBe("Bonjour");
    expect((await t.es).hello.base).toBe("Hola");
    expect(t.hello.base).toBe("Hello");
  });
  it("should work with fn getLocales", async () => {
    const locales = await getLocales(
      async locale => {
        if (locale === "en") return { hello: "Hello" };
        if (locale === "es") return { hello: "Hola" };
        else throw new Error("Locale not supported");
      },
      ["en", "es"],
    );
    expect(locales.en.hello).toBe("Hello");
    expect(locales.es.hello).toBe("Hola");
  });
  it("should work with integrated getlocale and preload", async () => {
    const t = await ct({
      allowedLocales: ["en", "es"],
      async locales(l) {
        return en;
      },
    });
    expect(t.en.common.yes.base).toBeString();
    expect(t.es.common.yes.base).toBeString();
  });
});
