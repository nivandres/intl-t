// AI generated test
import { afterEach, describe, expect, it } from "bun:test";
import { createTranslation, TranslationNode } from "../src/index";

afterEach(() => {
  TranslationNode.t = null as never;
  TranslationNode.locale = undefined as never;
  TranslationNode.source = undefined as never;
});

describe("variables never mutate shared state", () => {
  it("does not contaminate sibling keys when calling with path + variables", () => {
    const t = createTranslation({ locales: { en: { a: "A says {name}", b: "B says {name}" } } }) as any;
    expect(String(t("a", { name: "Alice" }))).toBe("A says Alice");
    expect(String(t.b)).toBe("B says {name}"); // sibling untouched: no root-level Object.assign
    expect(t.variables?.name).toBeUndefined(); // root carries no leaked call variables
  });

  it("does not mutate the user's source JSON module", () => {
    const en = { n1: { n2: "hello {name}", values: { name: "default" } } };
    const t = createTranslation({ locales: { en } }) as any;
    t.n1({ name: "REQUEST_A_SECRET" });
    expect(en.n1.values).toEqual({ name: "default" }); // source object stays pristine
  });

  it("keeps parent→child variable inheritance working after the copy-on-write set()", () => {
    const t = createTranslation({ locales: { en: { section: { greet: "hi {name}" } } } }) as any;
    t.section.set({ name: "Ivan" });
    expect(String(t.section.greet)).toBe("hi Ivan"); // child still inherits via the values getter chain
  });

  it("keeps documented sticky variables on the resolved node", () => {
    const t = createTranslation({ locales: { en: { greet: "hey {name}" } } }) as any;
    t.greet({ name: "Mia" });
    expect(String(t.greet)).toBe("hey Mia"); // node-level stickiness is the documented contract
  });
});

describe("async loading lifecycle", () => {
  it("await t rejects instead of hanging when a locale loader fails", async () => {
    const t = createTranslation({
      locales: { en: async () => ({ hello: "hello" }), es: async () => Promise.reject(new Error("boom")) },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    }) as any;
    await expect(Promise.resolve().then(() => t)).rejects.toThrow("boom");
  });

  it("touching t.current before the first await no longer destroys the preload thenable", async () => {
    let loaded = 0;
    const t = createTranslation({
      locales: { en: async () => (loaded++, { hello: "hello" }) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    }) as any;
    void t.current; // pre-await read must not delete `then` without loading
    const resolved = await t;
    expect(loaded).toBeGreaterThan(0);
    expect(String(resolved.hello)).toBe("hello");
  });

  it("self-heals a transient loader failure instead of caching the rejection", async () => {
    let attempts = 0;
    const t = createTranslation({
      locales: {
        en: async () => {
          attempts++;
          if (attempts === 1) throw new Error("transient");
          return { hello: "recovered" };
        },
      },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    }) as any;
    // getNode's failure resets node to null and the getLocale wrapper uncaches the rejected
    // promise, so the preload path retries within the same await and resolves.
    const resolved = await t;
    expect(attempts).toBe(2);
    expect(String(resolved.hello)).toBe("recovered");
  });
});

describe("preload thenable edge cases", () => {
  it("resolves instantly on a second await without re-invoking loaders", async () => {
    let loads = 0;
    const t = createTranslation({
      locales: { en: async () => (loads++, { hello: "hi" }) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    }) as any;
    await t;
    const before = loads;
    await t; // `then` was deleted on success → instant, no reload
    expect(loads).toBe(before);
  });

  it("loads ONLY that locale when awaiting a specific locale node (granular path)", async () => {
    const loads = { en: 0, es: 0 };
    const t = createTranslation({
      locales: {
        en: async () => (loads.en++, { hello: "hello" }),
        es: async () => (loads.es++, { hello: "hola" }),
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    }) as any;
    // NOTE: on the ROOT, t.current === t, so `await t.current` goes through the preload
    // thenable and loads ALL locales. The granular "just this locale" contract lives on the
    // locale sibling nodes: await t.es → only the es loader runs (plus en from construction).
    const enLoadsFromConstruction = loads.en;
    const es = await t.es;
    expect(loads.es).toBe(1);
    expect(loads.en).toBe(enLoadsFromConstruction); // en not re-loaded by the es await
    expect(String(es.hello)).toBe("hola");
  });

  it("setLocale to an unloaded locale then await t.current loads that locale", async () => {
    const loads = { en: 0, es: 0 };
    const t = createTranslation({
      locales: {
        en: async () => (loads.en++, { hello: "hello" }),
        es: async () => (loads.es++, { hello: "hola" }),
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    }) as any;
    t.setLocale("es");
    const es = await t.current;
    expect(loads.es).toBeGreaterThan(0);
    expect(String(es.hello)).toBe("hola");
  });

  it("does not expose a thenable when preload is off", () => {
    const t = createTranslation({ locales: { en: { hello: "hi" } }, preload: false }) as any;
    expect((t as any).hasOwnProperty("then")).toBe(false); // sync trees must not look promise-like
  });
});

describe("falsy leaf content", () => {
  it('renders "" and 0 leaves instead of loading the whole locale tree into them', () => {
    const t = createTranslation({ locales: { en: { empty: "", zero: 0, other: "text" } } }) as any;
    expect(String(t.empty)).toBe("");
    expect(String(t.zero)).toBe("0");
  });
});

describe("call() path resolution edges", () => {
  it("resolves array index 0 through the array-path form (filter must keep 0)", () => {
    const t = createTranslation({ locales: { en: { items: ["first", "second"] } } }) as any;
    expect(String(t(["items", 0]))).toBe("first");
    expect(String(t(["items", 1]))).toBe("second");
  });

  it("accepts a single numeric key without crashing", () => {
    const t = createTranslation({ locales: { en: { items: ["first", "second"] } } }) as any;
    expect(String(t.items(1))).toBe("second");
  });

  it("drops null/undefined path segments safely", () => {
    const t = createTranslation({ locales: { en: { hello: "hi" } } }) as any;
    expect(String(t(undefined as any) ?? t)).toBeDefined(); // no crash, resolves to the node itself
  });
});

describe("async loading race stress", () => {
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  it("resolves 20 concurrent awaits on one preload instance with a single load per locale", async () => {
    const loads: Record<string, number> = { en: 0, es: 0 };
    const t = createTranslation({
      locales: async (l: string) => {
        loads[l]++;
        await delay(1 + Math.random() * 5);
        return { hello: l === "en" ? "hello" : "hola" };
      },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    }) as any;
    const all = await Promise.all(Array.from({ length: 20 }, () => Promise.resolve(t)));
    all.forEach(r => expect(String(r.hello)).toBe("hello"));
    expect(loads).toEqual({ en: 1, es: 1 }); // getLocale caches the in-flight promise per locale
  });

  it("survives setLocale fired mid-load and renders the new locale afterwards", async () => {
    const t = createTranslation({
      locales: async (l: string) => (await delay(2 + Math.random() * 5), { hello: l === "en" ? "hello" : "hola" }),
      allowedLocales: ["en", "es"],
      mainLocale: "en",
      preload: true,
    }) as any;
    const p = Promise.all(Array.from({ length: 10 }, () => Promise.resolve(t)));
    t.setLocale("es"); // mid-load
    await p;
    const cur = await t.current;
    expect(String(cur.hello)).toBe("hola");
  });

  it("does not hang or loop when the loader resolves undefined", async () => {
    let calls = 0;
    const t = createTranslation({
      locales: { en: async () => (calls++, undefined as any) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    }) as any;
    await t; // must settle within the test timeout instead of re-invoking forever
    expect(calls).toBeLessThan(10);
  });

  it("keeps the other 4 locales usable after 1 of 5 loaders rejects", async () => {
    const t = createTranslation({
      locales: async (l: string) => {
        await delay(2);
        if (l === "de") throw new Error("de-down");
        return { hello: "hello-" + l };
      },
      allowedLocales: ["en", "es", "fr", "de", "it"],
      mainLocale: "en",
      preload: true,
    }) as any;
    await expect(Promise.resolve().then(() => t)).rejects.toThrow("de-down");
    expect(String((await t.es).hello)).toBe("hello-es");
    expect(String((await t.fr).hello)).toBe("hello-fr");
  });

  it("loads each locale exactly once under parallel awaits on 3 distinct locale nodes", async () => {
    const loads: Record<string, number> = { en: 0, es: 0, fr: 0 };
    const t = createTranslation({
      locales: async (l: string) => (loads[l]++, await delay(1 + Math.random() * 5), { hi: "hi-" + l }),
      allowedLocales: ["en", "es", "fr"],
      mainLocale: "en",
      preload: true,
    }) as any;
    const [en, es, fr] = await Promise.all([
      Promise.all(Array.from({ length: 7 }, () => Promise.resolve(t.en))).then(a => a[0]),
      Promise.all(Array.from({ length: 7 }, () => Promise.resolve(t.es))).then(a => a[0]),
      Promise.all(Array.from({ length: 7 }, () => Promise.resolve(t.fr))).then(a => a[0]),
    ]);
    expect([String(en.hi), String(es.hi), String(fr.hi)]).toEqual(["hi-en", "hi-es", "hi-fr"]);
    expect(loads).toEqual({ en: 1, es: 1, fr: 1 });
  });

  it("resolves deep children after awaiting an async locale", async () => {
    const t = createTranslation({
      locales: { en: async () => (await delay(2), { a: { b: { c: "deep {v}" } } }) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    }) as any;
    await t;
    expect(String(t.a.b.c({ v: "1" }))).toBe("deep 1");
  });
});

describe("variables stress", () => {
  it("keeps the source JSON pristine after 1000 distinct-variable calls on one node", () => {
    const en = { msg: "hi {name} #{i}", other: "plain {name}", values: { name: "seed" } } as any;
    const snapshot = JSON.stringify(en);
    const t = createTranslation({ locales: { en } }) as any;
    for (let i = 0; i < 1000; i++) expect(String(t.msg({ name: "u" + i, i }))).toBe(`hi u${i} #${i}`);
    expect(JSON.stringify(en)).toBe(snapshot);
  });

  it("renders each node's own variables across 500 interleaved rounds on 2 siblings", () => {
    const t = createTranslation({ locales: { en: { a: "A={x}", b: "B={x}" } } }) as any;
    for (let i = 0; i < 500; i++) {
      expect(String(t.a({ x: "a" + i }))).toBe("A=a" + i);
      expect(String(t.b({ x: "b" + i }))).toBe("B=b" + i);
      expect(String(t.a)).toBe("A=a" + i); // sticky value stays per-node
      expect(String(t.b)).toBe("B=b" + i);
    }
  });

  it("does not leak call variables into siblings after 1000 root path-calls", () => {
    const t = createTranslation({ locales: { en: { x: "X {p}", y: "Y {p}" } } }) as any;
    for (let i = 0; i < 1000; i++) void String(t("x", { p: i }));
    expect(String(t.y)).toBe("Y {p}");
    expect(t.variables?.p).toBeUndefined();
  });

  it("isolates variables between locale siblings of the same key", () => {
    const t = createTranslation({ locales: { en: { m: "en {x}" }, es: { m: "es {x}" } }, mainLocale: "en" }) as any;
    t.m({ x: "EN" });
    expect(String(t.m.es({ x: "ES" }))).toBe("es ES");
    expect(String(t.m)).toBe("en EN"); // en node keeps its own sticky variable
  });
});

describe("edge content", () => {
  it("resolves emoji keys via property access and call()", () => {
    const t = createTranslation({ locales: { en: { "🚀": "rocket {name}", nest: { "🐈": "cat" } } } }) as any;
    expect(String(t["🚀"]({ name: "go" }))).toBe("rocket go");
    expect(String(t.nest["🐈"])).toBe("cat");
    expect(String(t("🚀", { name: "x" }))).toBe("rocket x");
  });

  it("reaches a literal dotted key by property/array-path while call('a.b') splits on ps", () => {
    const t = createTranslation({ locales: { en: { "a.b": "dotted-literal", a: { b: "nested" } } } }) as any;
    expect(String(t["a.b"])).toBe("dotted-literal");
    expect(String(t(["a.b"]))).toBe("dotted-literal"); // array form never splits
    expect(String(t("a.b"))).toBe("nested"); // string form splits on the path separator
  });

  it("renders a 100KB leaf and reports its real length", () => {
    const big = "x".repeat(100_000) + "{name}";
    const t = createTranslation({ locales: { en: { big } } }) as any;
    const r = String(t.big({ name: "!" }));
    expect(r.length).toBe(100_001);
    expect(r.endsWith("!")).toBe(true);
  });

  it("navigates arrays of arrays by index chain and array path", () => {
    const t = createTranslation({
      locales: {
        en: {
          grid: [
            ["a", "b"],
            ["c", "d"],
          ],
          m: [[["x0", "x1"], ["y0"]], [["z0"]]],
        },
      },
    }) as any;
    expect(String(t.grid[0][1])).toBe("b");
    expect(String(t(["grid", 1, 0]))).toBe("c");
    expect(String(t.m[0][0][1])).toBe("x1");
    expect(String(t(["m", 1, 0, 0]))).toBe("z0");
  });

  it("iterates array nodes into their rendered children", () => {
    const t = createTranslation({ locales: { en: { list: ["one {n}", "two"] } } }) as any;
    expect([...t.list].map((x: any) => String(x))).toEqual(["one {n}", "two"]);
  });

  it("treats reserved keys ('values') as variables, not children", () => {
    const t = createTranslation({ locales: { en: { sec: { values: { x: "V" }, msg: "m {x}" } } } }) as any;
    expect(String(t.sec.msg)).toBe("m V");
    expect(t.sec.children).toEqual(["msg"]);
  });

  it("freezes today's false/null leaf rendering(null swallows into 'undefined')", () => {
    const t = createTranslation({ locales: { en: { no: false, nil: null, ok: "ok" } } }) as any;
    expect(String(t.no)).toBe("false");
    // KNOWN: a null leaf currently re-triggers getLocale and renders "undefined" instead of
    // falling back to its path — a known limitation, frozen deliberately. Do not "fix" silently.
    expect(String(t.nil)).toBe("undefined");
    expect(String(t.ok)).toBe("ok"); // siblings unaffected
  });
});

describe("cross-locale integrity", () => {
  it("preserves rendering across an en→es→en setLocale round-trip", () => {
    const t = createTranslation({
      locales: { en: { greet: "hello {name}", nest: { deep: "deep-en" } }, es: { greet: "hola {name}", nest: { deep: "deep-es" } } },
      mainLocale: "en",
    }) as any;
    expect(String(t.greet({ name: "A" }))).toBe("hello A");
    const es = t.setLocale("es");
    expect(String(es.greet({ name: "B" }))).toBe("hola B");
    expect(String(es.nest.deep)).toBe("deep-es");
    const en = t.setLocale("en");
    expect(String(en.greet({ name: "C" }))).toBe("hello C");
    expect(String(en.nest.deep)).toBe("deep-en");
    expect(t.currentLocale).toBe("en");
  });

  it("stays consistent through 50 setLocale alternations with per-iteration variables", () => {
    const t = createTranslation({ locales: { en: { g: "hello {n}" }, es: { g: "hola {n}" } }, mainLocale: "en" }) as any;
    for (let i = 0; i < 50; i++) {
      const loc = i % 2 === 0 ? "es" : "en";
      const cur = t.setLocale(loc);
      expect(String(cur.g({ n: i }))).toBe((loc === "es" ? "hola " : "hello ") + i);
    }
  });

  it("freezes today's missing-key rendering in a secondary locale", () => {
    const t = createTranslation({
      locales: { en: { onlyEn: "english-only", both: "both-en" }, es: { both: "both-es" } as any },
      mainLocale: "en",
    }) as any;
    const es = t.setLocale("es");
    expect(String(es.both)).toBe("both-es");
    // KNOWN limitation (roadmap): a key missing in the active locale renders "undefined" today
    // (no mainLocale fallback, no path fallback). Frozen deliberately as the current contract.
    expect(String(es.onlyEn)).toBe("undefined");
  });

  it("hops locales at the node level via the locale sibling accessor", () => {
    const t = createTranslation({ locales: { en: { sec: { msg: "en-msg" } }, es: { sec: { msg: "es-msg" } } }, mainLocale: "en" }) as any;
    expect(String(t.sec.msg.es)).toBe("es-msg");
    expect(String(t.sec.msg)).toBe("en-msg");
  });
});

describe("settings/global coupling", () => {
  it("assigns settings.t on every instance, not only the first", () => {
    const t1 = createTranslation({ locales: { en: { a: "1" } } }) as any;
    const t2 = createTranslation({ locales: { en: { a: "2" } } }) as any;
    expect(t1.settings.t).toBeDefined();
    expect(t2.settings.t).toBeDefined();
    expect(t2.settings.t).not.toBe(t1.settings.t);
  });

  it("setLocale on one instance does not mutate another instance's locale", () => {
    const t1 = createTranslation({ locales: { en: { a: "1" }, es: { a: "uno" } }, mainLocale: "en" }) as any;
    const t2 = createTranslation({ locales: { en: { a: "2" }, es: { a: "dos" } }, mainLocale: "en" }) as any;
    t2.setLocale("es");
    expect(t2.settings.locale).toBe("es");
    expect(t1.settings.locale).toBe("en"); // no cross-instance bleed through the shared global setter
  });
});
