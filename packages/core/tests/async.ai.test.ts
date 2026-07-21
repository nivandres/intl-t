// AI generated test
import { afterEach, describe, expect, it } from "bun:test";
import { createTranslation, TranslationNode } from "../src/index";

// Captured at module load so the statics can be restored to their pre-file values.
const initialStaticLocale = TranslationNode.locale;
const initialStaticSource = TranslationNode.source;

afterEach(() => {
  TranslationNode.t = null;
  TranslationNode.locale = initialStaticLocale;
  TranslationNode.source = initialStaticSource;
});

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

describe("load/preload contract with per-locale loaders", () => {
  it("await t with preload loads every allowed locale and repeated awaits stay settled", async () => {
    const loads = { en: 0, es: 0, fr: 0 };
    const t = createTranslation({
      locales: {
        en: async () => (loads.en++, { hello: "hello" }),
        es: async () => (loads.es++, { hello: "hola" }),
        fr: async () => (loads.fr++, { hello: "bonjour" }),
      },
      allowedLocales: ["en", "es", "fr"],
      mainLocale: "en",
      preload: true,
    });
    // construction eagerly starts the current locale only
    expect(loads.en).toBe(1);
    expect(loads.es).toBe(0);
    expect(loads.fr).toBe(0);

    const resolved = await t;
    expect(String(resolved.hello)).toBe("hello");
    // the preload sweep fetched each sibling locale exactly once
    expect(loads.es).toBe(1);
    expect(loads.fr).toBe(1);
    expect(loads.en).toBe(1); // per-locale loaders dedupe through the settings cache, same as the function form
    expect(String((await t.es).hello)).toBe("hola");

    const settledLoads = { ...loads };
    await t;
    await t;
    expect(loads).toEqual(settledLoads); // repeated awaits never re-invoke loaders
  });

  it("await t without preload loads only the current locale", async () => {
    const loads = { en: 0, es: 0 };
    const t = createTranslation({
      locales: {
        en: async () => (loads.en++, { hello: "hello" }),
        es: async () => (loads.es++, { hello: "hola" }),
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: false,
    });
    expect(loads).toEqual({ en: 0, es: 0 }); // nothing loads eagerly without preload

    const resolved = await t;
    expect(String(resolved.hello)).toBe("hello");
    expect(loads).toEqual({ en: 1, es: 0 }); // the sibling locale stays untouched

    await t;
    await t;
    expect(loads).toEqual({ en: 1, es: 0 }); // repeated awaits reuse the loaded tree
  });

  it("await t.es without preload loads only the es branch", async () => {
    const loads = { en: 0, es: 0 };
    const t = createTranslation({
      locales: {
        en: async () => (loads.en++, { hello: "hello" }),
        es: async () => (loads.es++, { hello: "hola" }),
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: false,
    });

    const es = await t.es;
    expect(String(es.hello)).toBe("hola");
    expect(loads).toEqual({ en: 0, es: 1 }); // the current locale is not dragged in

    await t.es;
    expect(loads).toEqual({ en: 0, es: 1 }); // the branch load happens exactly once
  });

  it("surfaces a loader rejection and retries on the next await", async () => {
    let attempts = 0;
    const t = createTranslation({
      // the rejecting loader declares the tree shape it would have resolved, so the
      // locale node keeps its typing across the failure
      locales: {
        en: async () => ({ hello: "hi" }),
        es: async (): Promise<{ hello: string }> => {
          attempts++;
          if (attempts === 1) throw new Error("es-transient");
          return { hello: "hola-recovered" };
        },
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: false,
    });

    await expect((async () => t.es)()).rejects.toThrow("es-transient");
    expect(attempts).toBe(1); // the failure surfaced without a hidden retry

    const es = await t.es;
    expect(attempts).toBe(2); // the next await retried instead of caching the rejection
    expect(String(es.hello)).toBe("hola-recovered");
  });

  it("keeps concurrent branch loads isolated when they resolve out of order", async () => {
    const t = createTranslation({
      locales: {
        en: async () => ({ msg: "en-msg" }),
        es: async () => (await delay(30), { msg: "es-msg" }),
        fr: async () => (await delay(5), { msg: "fr-msg" }),
      },
      allowedLocales: ["en", "es", "fr"],
      mainLocale: "en",
      preload: false,
    });

    // es starts first but resolves last: the slower branch must not adopt fr's payload
    const [es, fr] = await Promise.all([t.es, t.fr]);
    expect(String(es.msg)).toBe("es-msg");
    expect(String(fr.msg)).toBe("fr-msg");

    expect(t.currentLocale).toBe("en");
    expect(String((await t).msg)).toBe("en-msg"); // the current branch stayed out of the race
  });
});

describe("settings fork with async loaders", () => {
  it("shares loaded messages with a settings fork without re-invoking loaders", async () => {
    const loads: Record<string, number> = { en: 0, es: 0 };
    const t = createTranslation({
      locales: async (locale: string) => {
        loads[locale]++;
        await delay(3);
        return { greet: "hi {name} (" + locale + ")" };
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    });
    await t;
    expect(loads).toEqual({ en: 1, es: 1 });

    const fork = new TranslationNode({ settings: t.settings });
    // oxlint-disable-next-line unicorn/no-single-promise-in-promise-methods -- the tuple assimilates the nullable `then`; direct awaits fail to typecheck (TS1320)
    await Promise.all([fork]);
    expect(loads).toEqual({ en: 1, es: 1 }); // the fork reuses the settings-level message cache
    expect<unknown>(fork.node).toBe(t.node); // same loaded tree instance, no per-fork copy
    expect<unknown>(fork.settings).toBe(t.settings);

    // the fork resolves content while keeping its variables away from the origin node
    expect(String(fork.call("greet", { name: "Ada" }))).toBe("hi Ada (en)");
    expect(String(t.call("greet"))).toBe("hi {name} (en)");
  });

  it("keeps per-fork locale and variables isolated under interleaved loads", async () => {
    const loads: Record<string, number> = { en: 0, es: 0 };
    const t = createTranslation({
      locales: async (locale: string) => {
        loads[locale]++;
        // the current locale resolves last so the forks finish out of construction order
        await delay(locale === "en" ? 12 : 3);
        return { greet: "hi {name} (" + locale + ")" };
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    });

    // two request-scoped forks over the same settings, loading concurrently
    const requestA = new TranslationNode({ settings: t.settings });
    const requestB = new TranslationNode({ settings: t.settings, locale: "es" });
    await Promise.all([requestA, requestB]);

    expect(loads).toEqual({ en: 1, es: 1 }); // interleaved forks share the in-flight loads
    expect(requestA.locale).toBe("en");
    expect(requestB.locale).toBe("es");

    expect(String(requestA.call("greet", { name: "A" }))).toBe("hi A (en)");
    expect(String(requestB.call("greet", { name: "B" }))).toBe("hi B (es)");
    // repeated reads keep each fork's own variables: nothing bled across requests
    expect(String(requestA.call("greet"))).toBe("hi A (en)");
    expect(String(requestB.call("greet"))).toBe("hi B (es)");
  });
});

describe("late-arriving trees through setNode", () => {
  it("merges root values defaults when the tree arrives through a loader", async () => {
    const t = createTranslation({
      locales: {
        en: async () => ({ hero: "Welcome to {brand}", values: { brand: "ACME" } }),
        es: async () => ({ hero: "Bienvenido a {brand}", values: { brand: "ACME-ES" } }),
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: false,
    });

    const resolved = await t;
    expect(String(resolved.hero)).toBe("Welcome to ACME"); // defaults declared inside the loaded tree apply late
    expect(String((await t.es).hero)).toBe("Bienvenido a ACME-ES"); // each locale root merges its own defaults
  });

  it("keeps user-set variables above late loader defaults", async () => {
    const t = createTranslation({
      locales: {
        en: async () => ({ hero: "Welcome to {brand}", values: { brand: "ACME" } }),
      },
      mainLocale: "en",
    });

    t.set({ brand: "User" }); // set before the tree arrives: the late merge must fill under, not override
    const resolved = await t;
    expect(String(resolved.hero)).toBe("Welcome to User");
  });

  it("unwraps loaders that resolve a module record", async () => {
    const t = createTranslation({
      locales: {
        en: async () => ({ default: { hi: "hi from module" }, [Symbol.toStringTag]: "Module" }),
      },
      mainLocale: "en",
    });

    const resolved = await t;
    expect(String(resolved.hi)).toBe("hi from module"); // the namespace record never becomes the tree
    expect(resolved.getChildren()).toEqual(["hi"]);
  });
});
