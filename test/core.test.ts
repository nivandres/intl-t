import { createTranslation as ct } from "../src/core";
import { injectVariables as iv } from "../src/tools/inject";
import { describe, it, expect } from "bun:test";
import * as en from "./messages.json";

describe("Translation object", async () => {
  it("should run correctly nested", () => {
    const t = ct({});
    expect(t).toBeInstanceOf(Object);
    expect(t.t).toBe(t);
    expect(t.tr).toBe(t);
    expect(t.parent).toBe(t);
    expect(t.global).toBe(t);
    expect(t.base).toBeUndefined();
  });
  it("should work with multiple languages", () => {
    const t = ct({
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
    const t = ct({
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
    const t = ct({
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
    expect(t.o1[2].o3.p.o3[1][0].base).toBe(".o1.2.o3.1.0");
    expect(t("hello").base).toBe("hello");
    expect(t("o1.3").base).toBe(".o1.3");
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
    const t = ct({ locales: { en } });
    expect(t.pages("landing.hero").parent.hero.paragraph.toString()).toBe("content");
    expect(t.common.yes.g("common.yes").base).toBe("yes");
  });
  it("should work with diferent params", () => {
    const t = ct({ locales: { en }, ps: "/" });
    expect(t.common.yes.id).toBe("common/yes");
  });
  it("should have consistent variables", () => {
    const t = ct({ locales: { en }, variables: { test: "test" } });
    const node = t.common.yes;
    expect(node.use({ a: "a" }).values.a).toBe("a");
    expect(t.common.yes.g("common.yes").values.test).toBe("test");
    expect(t.common({ a: "a" }).g("common").yes.values.a).toBe("a");
    expect(t("common.yes", { b: "b" }).values.b).toBe("b");
  });
  it("should work with plugins", () => {
    let t = ct({ locales: { en } });
    let content = "test";
    const plugin = (n: any) => {
      type T = typeof n & { test: string } & { [key in (typeof n)["child"]]: (typeof n)[key] & { test: string } };
      const t_ = n as T;
      t_.test = content;
      return t_;
    };
    let tp = t.with(plugin, false);
    expect(tp.test).toBe("test");
    expect(tp.hello.test).toBeUndefined();
    content = "test2";
    tp = t.with(plugin, true);
    expect(tp.test).toBe("test2");
    expect(tp.hello.test).toBe("test2");
    t = ct({ locales: { en }, plugins: [plugin] });
    expect(t["test" as any]).toBe("test2");
    expect(t.hello["test" as any]).toBe("test2");
  });
});

describe("variable injection", () => {
  it("should work with simple variables", () => {
    expect(iv("{a}", { a: "b" })).toBe("b");
    expect(iv("start {a} end", { a: "b" })).toBe("start b end");
    expect(iv("start {a} mid {b} end", { a: "b", b: "c" })).toBe("start b mid c end");
    expect(iv("start {a} mid {b} end", { a: "b" })).toBe("start b mid {b} end");
    expect(iv("{a}a{a}y", { a: "b" })).toBe("baby");
  });
  it("should work with plurals", () => {
    expect(iv("{a, plural, one {# item} other {# items}}", { a: 1 })).toBe("1 item");
    expect(iv("{a, plural, one {# item} other {# items}}", { a: 8 })).toBe("8 items");
    expect(iv("{a, plural, one {# item} other {# items}}", { a: 0 })).toBe("0 items");
  });
  it("should work with selection ", () => {
    expect(iv("{a, select, yes {Yes} no {No}}, sir", { a: true })).toBe("Yes, sir");
    expect(iv("{a, select, yes {Yes} no {No}}, sir", { a: 0 })).toBe("No, sir");
  });
  it("should work with complex conditions", () => {
    expect(iv("{a, plural, one {# item} other {# items}}, {b, select, yes {Yes} no {No}}", { a: 1, b: true })).toBe(
      "1 item, Yes"
    );
    expect(iv("{a, plural, =0 {no items} =1 {# item} >1 {# items}}", { a: 0 })).toBe("no items");
    expect(iv("{a, plural, =0 {no items} =1 {# item} =7 {exactly seven items #} >1 {# items}}", { a: 7 })).toBe(
      "exactly seven items 7"
    );
    expect(iv("{a, =0 {no items} =1 {one item} >1&<10 {many items} >=10 {lots of items}}", { a: 10 })).toBe(
      "lots of items"
    );
    expect(iv("Hola {gender, select, ='male' 'señor' 'female' 'señorita'}", { gender: "female" })).toBe(
      "Hola señorita"
    );
    expect(iv("{name, juan juanito sofia sofi laura lau other #}", { name: "laura" })).toBe("lau");
    expect(iv("{name, juan juanito sofia sofi laura lau other #}", { name: "alex" })).toBe("alex");
    expect(iv("{o, debt = `negative`}", { o: -1 })).toBe("negative");
  });
  it("should work integrated", () => {
    const t = ct({ locales: { en: { hello: "hello {name}", age: "you are {age} year{age, =1 '' other s} old" } } });
    expect(t.hello.use({ name: "ivan" }).base).toBe("hello ivan");
    expect(t.age.use({ age: 1 }).base).toBe("you are 1 year old");
    expect(t.age.use({ age: 2 }).base).toBe("you are 2 years old");
  });
});
