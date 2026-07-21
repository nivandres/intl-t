// AI generated test
import { describe, expect, it } from "bun:test";
import { createTranslation } from "../src/translation";

describe("serverless environment: one fresh process per request", () => {
  it("each fresh module instance loads only its request locale", async () => {
    const reqA = await import("@intl-t/core?serverless-req-a");
    const reqB = await import("@intl-t/core?serverless-req-b");

    const loadsA = { en: 0, es: 0 };
    const tA: any = reqA.createTranslation({
      locales: {
        en: () => (loadsA.en++, Promise.resolve({ hi: "hi" })),
        es: () => (loadsA.es++, Promise.resolve({ hi: "hola" })),
      },
    });
    await tA.es;
    expect(loadsA).toEqual({ en: 0, es: 1 });
    expect(String(tA.es.hi)).toBe("hola");

    const loadsB = { en: 0, es: 0 };
    const tB: any = reqB.createTranslation({
      locales: {
        en: () => (loadsB.en++, Promise.resolve({ hi: "hi" })),
        es: () => (loadsB.es++, Promise.resolve({ hi: "hola" })),
      },
    });
    await tB;
    expect(loadsB).toEqual({ en: 1, es: 0 });
    expect(String(tB.hi)).toBe("hi");
  });
});

describe("long-running server: lazy convergence across requests", () => {
  it("alternating request locales invoke every loader exactly once", async () => {
    const loads = { en: 0, es: 0, ja: 0 };
    const t: any = createTranslation({
      locales: {
        en: () => (loads.en++, Promise.resolve({ hi: "hi" })),
        es: () => (loads.es++, Promise.resolve({ hi: "hola" })),
        ja: () => (loads.ja++, Promise.resolve({ hi: "こんにちは" })),
      },
    });

    for (const locale of ["en", "es", "ja", "en", "es", "ja", "en"]) {
      const branch = await t[locale];
      expect(String(branch.hi)).not.toBe("hi undefined");
    }
    expect(loads).toEqual({ en: 1, es: 1, ja: 1 });
  });
});

describe("sticky variables contract", () => {
  it("a call with variables returns the node itself under the default", () => {
    const t: any = createTranslation({ locales: { en: { greet: "Hi {u}!" } } });
    const result = t("greet", { u: "Ada" });

    expect<unknown>(result).toBe(t.greet);
    expect(String(t.greet)).toBe("Hi Ada!");
  });
});

describe("request-scoped helpers: fork, with, load", () => {
  it("fork isolates variables and locale without touching the shared tree", () => {
    const t: any = createTranslation({ locales: { en: { greet: "Hi {u}!" }, es: { greet: "¡Hola {u}!" } } });

    const reqA = t.fork();
    const reqB = t.fork("es");
    reqA.greet.set({ u: "Ada" });
    reqB.greet.set({ u: "Bob" });

    expect(String(reqA.greet)).toBe("Hi Ada!");
    expect(String(reqB.greet)).toBe("¡Hola Bob!");
    expect(String(t.greet)).toBe("Hi {u}!");
    expect(t.greet.variables).toEqual({});
  });

  it("fork does not register itself as the shared locale branch", () => {
    const t: any = createTranslation({ locales: { en: { greet: "Hi {u}!" }, es: { greet: "¡Hola {u}!" } } });

    const forked = t.fork("es");
    expect(String(forked.greet)).toBe("¡Hola {u}!");
    expect(t.es).not.toBe(forked);
    expect(String(t.es.greet)).toBe("¡Hola {u}!");
  });

  it("fork keeps the node position when called from a branch", () => {
    const t: any = createTranslation({ locales: { en: { deep: { greet: "Hi {u}!" } } } });

    const scoped = t.deep.fork();
    expect(String(scoped.greet.with({ u: "Zoe" }))).toBe("Hi Zoe!");
    expect(String(t.deep.greet)).toBe("Hi {u}!");
  });

  it("with is fork().set(): request variables that never leak", () => {
    const t: any = createTranslation({ locales: { en: { greet: "Hi {u}!" } } });

    const a = t.greet.with({ u: "Ada" });
    const b = t.greet.with({ u: "Bob" });

    expect(String(a)).toBe("Hi Ada!");
    expect(String(b)).toBe("Hi Bob!");
    expect(String(t.greet)).toBe("Hi {u}!");
  });

  it("load resolves only the requested locale and dedupes", async () => {
    const loads = { en: 0, es: 0 };
    const t: any = createTranslation({
      locales: {
        en: () => (loads.en++, Promise.resolve({ greet: "Hi" })),
        es: () => (loads.es++, Promise.resolve({ greet: "Hola" })),
      },
    });

    const es = await t.load("es");
    expect(String(es.greet)).toBe("Hola");
    expect(loads).toEqual({ en: 0, es: 1 });

    const again = await t.load("es");
    expect(String(again.greet)).toBe("Hola");
    expect(loads).toEqual({ en: 0, es: 1 });

    const current = await t.load();
    expect(String(current.greet)).toBe("Hi");
    expect(loads).toEqual({ en: 1, es: 1 });
  });
});
