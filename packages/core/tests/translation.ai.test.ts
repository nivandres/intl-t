// AI generated test
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  TranslationNode,
  createTranslation,
  createTranslationSettings,
  getSettings,
  getT,
  getTranslation,
  setLocale as setCoreLocale,
} from "../src/translation";
import type { TranslationSettings } from "../src/types";

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

function coreProvider(this: TranslationNode, ...args: any[]) {
  const [{ id, variables } = {}] = args;
  return this.call(id, variables);
}

function coreGetLocale(this: any) {
  return this.defaultLocale;
}

function coreHook(this: any, ...args: any[]) {
  return this.current(...args);
}

function captureNodeStatics() {
  return {
    Provider: TranslationNode.Provider,
    getLocale: TranslationNode.getLocale,
    hook: TranslationNode.hook,
    locale: TranslationNode.locale,
    setLocale: TranslationNode.setLocale,
    source: TranslationNode.source,
    t: TranslationNode.t,
  };
}

// Captured before any test in this file replaces them. When the whole repository test
// suite runs in a single process, framework packages may have wired their own static
// helpers already; the pristine flag gates the assertions that need the core defaults.
const initialStatics = captureNodeStatics();
let previousStatics = initialStatics;

class NonCallableTranslationNode<S extends TranslationSettings = TranslationSettings> extends TranslationNode<S> {
  protected override __callable__ = false;
}

function createCoreExample(name: string = "world") {
  return createTranslation({
    locales: createCoreLocales(),
    mainLocale: "en",
    variables: { name },
  });
}

beforeEach(() => {
  previousStatics = captureNodeStatics();

  TranslationNode.Provider = coreProvider;
  TranslationNode.getLocale = coreGetLocale;
  TranslationNode.hook = coreHook;
  TranslationNode.setLocale = setCoreLocale;
  TranslationNode.locale = initialStatics.locale;
  TranslationNode.source = initialStatics.source;
  TranslationNode.t = null;
});

afterEach(() => {
  TranslationNode.Provider = previousStatics.Provider;
  TranslationNode.getLocale = previousStatics.getLocale;
  TranslationNode.hook = previousStatics.hook;
  TranslationNode.locale = previousStatics.locale;
  TranslationNode.setLocale = previousStatics.setLocale;
  TranslationNode.source = previousStatics.source;
  TranslationNode.t = previousStatics.t;
});

describe("translation behavior", () => {
  it("creates settings from locale factories, caches results, and respects static source overrides", () => {
    const trees = createCoreLocales();
    const loader = mock((locale: string, _hydrate?: boolean) => (locale === "es" ? trees.es : trees.en));

    TranslationNode.locale = "es";
    TranslationNode.source = trees.es;

    const settings = createTranslationSettings({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      locales: loader,
    });

    expect(TranslationNode.getLocale.call({ defaultLocale: "es" })).toBe("es");
    expect(settings.currentLocale).toBe("es");
    expect(settings.locale).toBe("es");
    expect(settings.tree.es).toBe<unknown>(trees.es);
    expect(settings.getLocale("es")).toEqual<unknown>(trees.es);
    expect(settings.getLocale("en")).toEqual<unknown>(trees.en);
    expect(settings.getLocale("en")).toBe<unknown>(settings.tree.en);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledWith("en", true);
  });

  it("routes provider and hook helpers through the active translation node", () => {
    const t = createCoreExample();

    expect(getT()).toBe<unknown>(t);
    expect(String(t.common.hello.TranslationProvider({ variables: { name: "Ivan" } }))).toBe("hello Ivan");
    expect(String(t.TranslationProvider.common.bye.node)).toBe("goodbye world");
    expect(t.useTranslation("common.hello", { name: "Zoe" }).base).toBe("hello Zoe");
    expect(String(t.useTranslation.common.bye)).toBe("goodbye world");
    expect(String(getTranslation("common.bye"))).toBe("goodbye world");
    expect(getSettings()).toBe<unknown>(t.settings);
  });

  it("drives the default static provider, hook and locale helpers", async () => {
    // A fresh module instance carries pristine statics regardless of which package's
    // tests wired the shared class first in this process.
    const fresh = await import("@intl-t/core?pristine-statics");
    const t: any = fresh.createTranslation({
      locales: { en: { base: "Root EN", common: { bye: "goodbye world" } } },
      mainLocale: "en",
    });

    expect(fresh.TranslationNode.getLocale.call(t.settings)).toBe("en");
    expect(String(t.TranslationProvider({}))).toBe("Root EN");
    expect(String(t.useTranslation("common.bye"))).toBe("goodbye world");
    expect(String(t.useTranslation())).toBe("Root EN");
  });

  it("constructs derivative nodes from the proxy and merges the source settings", () => {
    const t = createCoreExample();
    const path: string[] = ["common", "derived"];

    // TranslationData.parent is declared with the loose default TranslationNode type, which a
    // fully typed node is not assignable to, so the derivative relies on the settings fallback.
    const derived = new t.common({
      settings: t.settings,
      locale: "en",
      node: {
        base: "Derived",
        label: "derived label",
      },
      path,
    });

    expect(String(derived)).toBe("Derived");
    expect(derived.locale).toBe("en");
    expect(derived.settings.mainLocale).toBe("en");
    expect(derived.parent).toBe<unknown>(derived.settings);
    expect(String(derived.label)).toBe("derived label");
  });

  it("serves current through a callable proxy when the runtime node is not callable", () => {
    const settings = createTranslationSettings({
      locales: { en: { hello: "hi {name}", farewell: "bye" } },
      mainLocale: "en",
    });
    const node = new NonCallableTranslationNode({ settings });
    const current = node.current;

    expect(String(current.farewell)).toBe("bye");
    expect(String(current("hello", { name: "Ada" }))).toBe("hi Ada");
    expect(current.locale).toBe("en");
  });

  it("supports source overrides, metadata helpers, and strict current access", () => {
    const t = createCoreExample();
    const nested = t.common.nested;
    const override = {
      base: "Override nested",
      badge: "override badge",
      label: "override label",
    };

    nested.setSource(override);
    expect(String(nested)).toBe("Override nested");
    expect(nested.getNode()).toBe<unknown>(override);
    expect(nested.getChildren()).toEqual(["badge", "label"]);
    expect(nested.child).toBe("badge");
    expect<unknown>(nested.keys).toEqual(["badge", "label"]);
    expect(nested.id).toBe("common.nested");
    expect(nested.mainLocale).toBe("en");
    expect(nested.dir).toBe("ltr");
    expect(nested.allowedLocales).toEqual(["en", "es"]);
    expect(nested.locales).toEqual(["en", "es"]);
    expect(nested[Symbol.toStringTag]()).toBe("Translation");
    expect(Object.prototype.toString.call(nested)).toBe("[object Function]");
    expect(t.common.bye.toJSON()).toBe("goodbye world");
    expect(nested.toJSON()).toEqual<unknown>(override);

    const switched = t.common.nested.label.setLocale(locale => (locale === "en" ? "es" : "en"));
    expect(String(switched)).toBe("etiqueta es");
    expect(t.settings.locale).toBe("es");

    const current = nested.current;
    expect(String(current.label)).toBe("etiqueta es");
    expect(current.allowedLocales).toEqual(["en", "es"]);
  });

  it("resolves async translations through then and promise helpers", async () => {
    const fromThen = createTranslation({ locales: createAsyncCoreLocales(), mainLocale: "en" });
    await fromThen.then?.(resolved => {
      expect(resolved.common.hello({ name: "Tess" }).base).toBe("hello Tess");
    });
    expect(fromThen.then).toBeNull();

    const fromPromise = createTranslation({ locales: createAsyncCoreLocales(), mainLocale: "en" });
    const pending = fromPromise.promise;
    if (!pending) throw new Error("expected a pending translation promise");
    expect((await pending).common.bye.base).toBe("goodbye world");
    expect(fromPromise.promise).toBeNull();
  });

  it("updates bound settings through the exported setLocale helper", () => {
    const binding = { settings: { locale: "en" } };

    expect(setCoreLocale.call(binding, "es")).toBe("es");
    expect(binding.settings.locale).toBe("es");
  });
});
