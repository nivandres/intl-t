import { createTranslation as ct, getChildren as gc, getSource as gs } from "../src/core";
import { injectVariables as iv, match as m } from "../src/tools";
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
    expect(t.node).toBeUndefined();
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
    const plugin = (n: any) => {
      type T = typeof n & { test: string } & { [key in (typeof n)["child"]]: (typeof n)[key] & { test: string } };
      const t_ = n as T;
      t_.test = "test2";
      return t_;
    };
    let t = ct({ locales: { en }, plugins: [plugin] });
    expect(t["test" as any]).toBe("test2");
    expect(t.hello["test" as any]).toBe("test2");
  });
  it("should work with dynamic get locale", () => {
    let t = ct({
      allowedLocales: ["en", "es"],
      getSource(locale) {
        return { hello: locale === "es" ? "hola mundo" : "hello world" };
      },
    });
    expect(t.hello).toBeUndefined();
    expect(t.en.hello.base).toBe("hello world");
    expect(t.es.hello.base).toBe("hola mundo");
    t = ct({
      locales: {
        en: {
          hello: "hello world",
        },
      } as any,
      allowedLocales: ["en", "es"],
      getSource() {
        return { hello: "hola mundo" };
      },
    });
    expect(t.hello.base).toBe("hello world");
    expect(t.hello.es.base).toBe("hola mundo");
  });
});

describe("source node utilities", () => {
  it("get children should work", () => {
    expect(gc({ a: "b" })).toEqual(["a"]);
    expect(gc([{ a: "b" }])).toEqual(["0"]);
    expect(gc({ a: { b: "c" } })).toEqual(["a"]);
    expect(gc(3)).toEqual([]);
    expect(gc([])).toEqual([]);
    expect(gc({})).toEqual([]);
    expect(gc("hola")).toEqual([]);
    expect(gc({ __children__: [] })).toEqual([]);
    expect(gc({ __children__: ["hola"] })).toEqual(["hola"]);
    expect(gc({ base: "hola", values: { a: "b" } })).toEqual([]);
  });
  it("get source should work", () => {
    expect(gs({ a: "b" })).toEqual({ a: "b", __children__: ["a"], __path__: "" });
    expect(gs("a")).toEqual("a");
    expect(gs(2)).toEqual(2);
    expect(gs([])).toEqual([]);
    expect(gs([1])["__children__" as any]).toEqual(["0"]);
    expect(gs({ a: { a: "hi" } }, 1).a.a).toBeUndefined();
    expect(gs({ a: { a: "hi" } }).a.a).toBe("hi");
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
      "1 item, Yes",
    );
    expect(iv("{a, plural, =0 {no items} =1 {# item} >1 {# items}}", { a: 0 })).toBe("no items");
    expect(iv("{a, plural, =0 {no items} =1 {# item} =7 {exactly seven items #} >1 {# items}}", { a: 7 })).toBe(
      "exactly seven items 7",
    );
    expect(iv("{a, =0 {no items} =1 {one item} >1&<10 {many items} >=10 {lots of items}}", { a: 10 })).toBe(
      "lots of items",
    );
    expect(iv("Hola {gender, select, ='male' 'señor' 'female' 'señorita'}", { gender: "female" })).toBe(
      "Hola señorita",
    );
    expect(iv("{name, juan juanito sofia sofi laura lau other #}", { name: "laura" })).toBe("lau");
    expect(iv("{name, juan juanito sofia sofi laura lau other #}", { name: "alex" })).toBe("alex");
    expect(iv("{o, debt = 'negative'}", { o: -1 })).toBe("negative");
    expect(iv("{o, 1 = 'one'}", { o: 1 })).toBe("one");
  });
  it("should work with actions", () => {
    expect(iv("{a, list, type:disjunction}", { a: ["a", "b", "c"] })).toBe("a, b, or c");
    expect(iv("{a, currency}", { a: 100 })).toBe(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(100),
    );
    expect(iv("{a, price, currency:COP}", { a: 100 })).toBe(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "COP" }).format(100),
    );
  });
  it("should work integrated", () => {
    const t = ct({ locales: { en: { hello: "hello {name}", age: "you are {age} year{age, =1 '' other s} old" } } });
    expect(String(t.hello.use({ name: "ivan" }))).toBe("hello ivan");
    expect(String(t.age.use({ age: 1 }))).toBe("you are 1 year old");
    expect(String(t.age.use({ age: 2 }))).toBe("you are 2 years old");
  });
  it("should work nested", () => {
    expect(
      iv(
        "{a, plural, one {# item} !=1 {# items}}, {b, select, a>40 {a lot} Boolean(#)&&{a}>3 {Absolutely yes there is {a, =1 '1 item' >10 '# ITEMS' other {# items}}.} yes {Yes} no {No}}",
        { a: 11, b: 1 },
      ),
    ).toBe("11 items, Absolutely yes there is 11 ITEMS.");
  });
  it("should work with operations", () => {
    expect(iv("{(a - 1)}", { a: 2 })).toBe("1");
    expect(iv("{(2 - 1)}")).toBe("1");
    expect(iv("{(600 *2)}")).toBe("1200");
  });
  it("examples", () => {
    expect(
      iv(
        "{guestCount, <=1 {{host} went alone} 2 {{host} and {guest} went to the party} other {{host}, {guest} and {(guestCount - 1), =1 'one person' other {# people}} went to the party}}",
        {
          guestCount: 4,
          host: "Ivan",
          guest: "Juan",
        },
      ),
    ).toBe("Ivan, Juan and 3 people went to the party");
    expect(
      iv(
        `{gender_of_host, select,   
    female {{num_guests, plural, offset:1 
        =0 {{host} does not give a party.} 
        =1 {{host} invites {guest} to her party.}      
        =2 {{host} invites {guest} and one other person to her party.}    
        other {{host} invites {guest} and # other people to her party.}
      }}
    male {{num_guests, plural, offset:1  
        =0 {{host} does not give a party.}  
        =1 {{host} invites {guest} to his party.}
        =2 {{host} invites {guest} and one other person to his party.}      
        other {{host} invites {guest} and # other people to his party.}
      }}
    other {{num_guests, plural, offset:1 
        =0 {{host} does not give a party.} 
        =1 {{host} invites {guest} to their party.}
        =2 {{host} invites {guest} and one other person to their party.} 
        other {{host} invites {guest} and # other people to their party.}
      }}}`,
        {
          gender_of_host: "male",
          num_guests: 4,
          host: "Ivan",
          guest: "Juan",
        },
      ),
    ).toBe("Ivan invites Juan and 3 other people to his party.");
    expect(
      iv(
        `On {takenDate, date, short} {name} took {numPhotos, plural, =0 {no photos} =1 {one photo} other {# photos}}.`,
        {
          name: "John",
          takenDate: new Date(0),
          numPhotos: 0,
        },
      ),
    ).toBe(`On ${new Intl.DateTimeFormat("en", { dateStyle: "short" }).format(new Date(0))} John took no photos.`);
    expect(
      iv(
        `{count, plural,
      =0 {No followers yer}
      =1 {One follower}
      other {# followers}
      }`,
        { count: 1 },
      ),
    ).toBe("One follower");
  });
});

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
