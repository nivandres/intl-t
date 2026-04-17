// AI generated test
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  TranslationNode,
  createTranslation,
  createTranslationSettings,
  getT,
  getTranslation,
  setLocale as setCoreLocale,
} from "../src/translation";

function createCoreLocales() {
  return {
    en: {
      base: "Root EN",
      common: {
        base: "Common EN",
        hello: "hello {name}",
        bye: "goodbye world",
        nested: {
          base: "Nested EN",
          label: "label en",
          badge: "badge en",
        },
      },
      array: ["alpha", "beta"],
    },
    es: {
      base: "Root ES",
      common: {
        base: "Common ES",
        hello: "hola {name}",
        bye: "adios mundo",
        nested: {
          base: "Nested ES",
          label: "etiqueta es",
          badge: "insignia es",
        },
      },
      array: ["uno", "dos"],
    },
  } as const;
}

function createAsyncCoreLocales() {
  const locales = createCoreLocales();

  return {
    en: async () => locales.en,
    es: async () => locales.es,
  };
}

function coreProvider(this: any, ...args: any[]) {
  return this[this.settings.locale](...args);
}

function coreGetLocale(this: any) {
  return this.defaultLocale;
}

function coreHook(this: any, ...args: any[]) {
  return this.current(...args);
}

let previousStatics: Record<string, unknown> = {};

function createCoreExample() {
  return createTranslation({
    locales: createCoreLocales(),
    mainLocale: "en",
    variables: { name: "world" },
  }) as any;
}

beforeEach(() => {
  previousStatics = {
    Provider: TranslationNode.Provider,
    getLocale: TranslationNode.getLocale,
    hook: TranslationNode.hook,
    locale: TranslationNode.locale,
    setLocale: TranslationNode.setLocale,
    source: TranslationNode.source,
    t: TranslationNode.t,
  };

  TranslationNode.Provider = coreProvider as never;
  TranslationNode.getLocale = coreGetLocale as never;
  TranslationNode.hook = coreHook as never;
  TranslationNode.setLocale = setCoreLocale as never;
  TranslationNode.locale = undefined as never;
  TranslationNode.source = undefined as never;
  TranslationNode.t = null as never;
});

afterEach(() => {
  TranslationNode.Provider = previousStatics.Provider as never;
  TranslationNode.getLocale = previousStatics.getLocale as never;
  TranslationNode.hook = previousStatics.hook as never;
  TranslationNode.locale = previousStatics.locale as never;
  TranslationNode.setLocale = previousStatics.setLocale as never;
  TranslationNode.source = previousStatics.source as never;
  TranslationNode.t = previousStatics.t as never;
});

describe("translation behavior", () => {
  it("creates settings from locale factories, caches results, and respects static source overrides", () => {
    const loader = mock((locale: string) => createCoreLocales()[locale as "en" | "es"]);

    TranslationNode.locale = "es" as never;
    TranslationNode.source = createCoreLocales().es as never;

    const settings = createTranslationSettings({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      locales: loader as never,
    });

    expect(TranslationNode.getLocale.call({ defaultLocale: "es" })).toBe("es");
    expect(settings.currentLocale).toBe("es");
    expect(settings.locale).toBe("es");
    expect((settings.locales as any).es).toEqual(createCoreLocales().es);
    expect(settings.getLocale("es")).toEqual(createCoreLocales().es);
    expect(settings.getLocale("en")).toEqual(createCoreLocales().en);
    expect(settings.getLocale("en")).toBe((settings.locales as any).en);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledWith("en", true);
  });

  it("routes provider and hook helpers through the active translation node", () => {
    const t = createCoreExample();

    expect(getT()).toBe(t);
    expect((TranslationNode.Provider as any).call(t, "common.hello", { name: "Ivan" }).base).toBe("hello Ivan");
    expect((TranslationNode.hook as any).call(t, "common.hello", { name: "Mia" }).base).toBe("hello Mia");
    expect(t.TranslationProvider("common.bye").base).toBe("goodbye world");
    expect(t.TranslationProvider.common.bye.base).toBe("goodbye world");
    expect(t.useTranslation("common.hello", { name: "Zoe" }).base).toBe("hello Zoe");
    expect(t.useTranslation.common.bye.base).toBe("goodbye world");
    expect(getTranslation("common.bye").base).toBe("goodbye world");
  });

  it("constructs derivative nodes from the proxy and preserves the parent context", () => {
    const t = createCoreExample();

    const derived = new (t.common as any)({
      locale: "en",
      node: {
        base: "Derived",
        label: "derived label",
      },
      parent: t.common,
      path: ["common", "derived"],
    });

    expect(derived.base).toBe("Derived");
    expect(derived.parent).toBe(t.common);
    expect(derived.locale).toBe("en");
    expect(derived.global).toBe(t.global);
    expect(derived.settings.mainLocale).toBe("en");
    expect(derived.label.base).toBe("derived label");
  });

  it("supports source overrides, metadata helpers, and strict current access", () => {
    const t = createCoreExample();
    const nested = t.common.nested;
    const override = {
      base: "Override nested",
      badge: "override badge",
      label: "override label",
    };

    expect(nested.setSource(override).base).toBe("Override nested");
    expect((nested as any).setNode(nested.node)).toBe(nested.node);
    expect(nested.getChildren()).toEqual(["badge", "label"]);
    expect(nested.child).toBe("badge");
    expect(nested.keys).toBe("badge");
    expect(nested.id).toBe("common.nested");
    expect(nested.mainLocale).toBe("en");
    expect(nested.allowedLocales).toEqual(["en", "es"]);
    expect(nested.locales).toEqual(["en", "es"]);
    expect(nested[Symbol.toStringTag]()).toBe("Translation");
    expect(Object.prototype.toString.call(nested)).toBe("[object Function]");
    expect(String(nested)).toBe("Override nested");
    expect(t.common.bye.toJSON()).toBe("goodbye world");
    expect(nested.toJSON()).toEqual(override);

    const switched = t.common.nested.label.setLocale((locale: string | undefined) => (locale === "en" ? "es" : "en"));
    expect(switched.base).toBe("etiqueta es");
    expect(t.settings.locale).toBe("es");

    const current = nested.current as any;
    expect(current.label.base).toBe("etiqueta es");
    expect(current.allowedLocales).toEqual(["en", "es"]);
  });

  it("resolves async translations through then and promise helpers", async () => {
    const fromThen = createTranslation({ locales: createAsyncCoreLocales(), mainLocale: "en" }) as any;
    await fromThen.then?.((resolved: any) => {
      expect(resolved.common.hello({ name: "Tess" }).base).toBe("hello Tess");
    });
    expect(fromThen.then).toBeNull();

    const fromPromise = createTranslation({ locales: createAsyncCoreLocales(), mainLocale: "en" }) as any;
    const pending = fromPromise.promise;
    expect(pending).toBeTruthy();
    expect((await pending).common.bye.base).toBe("goodbye world");
    expect(fromPromise.promise).toBeNull();
  });

  it("updates bound settings through the exported setLocale helper", () => {
    const binding = { settings: { locale: "en" } };

    expect(setCoreLocale.call(binding, "es")).toBe("es");
    expect(binding.settings.locale).toBe("es");
  });
});
