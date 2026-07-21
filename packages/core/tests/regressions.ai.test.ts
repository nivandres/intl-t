// AI generated test
import { afterEach, describe, expect, it } from "bun:test";
import { createTranslation, TranslationNode } from "../src/index";

// Captured at module load so the statics can be restored to their pre-file values
// without forcing types: they are undefined at runtime until something assigns them.
const initialStaticLocale = TranslationNode.locale;
const initialStaticSource = TranslationNode.source;

afterEach(() => {
  TranslationNode.t = null;
  TranslationNode.locale = initialStaticLocale;
  TranslationNode.source = initialStaticSource;
});

describe("variables never mutate shared state", () => {
  it("does not contaminate sibling keys when calling with path + variables", () => {
    const t = createTranslation({ locales: { en: { a: "A says {name}", b: "B says {name}" } } });
    expect(String(t("a", { name: "Alice" }))).toBe("A says Alice");
    expect(String(t.b)).toBe("B says {name}"); // sibling untouched: no root-level Object.assign
    expect(t.variables?.name).toBeUndefined(); // root carries no leaked call variables
  });

  it("does not mutate the user's source JSON module", () => {
    const en = { n1: { n2: "hello {name}", values: { name: "default" } } };
    const t = createTranslation({ locales: { en } });
    t.n1({ name: "REQUEST_A_SECRET" });
    expect(en.n1.values).toEqual({ name: "default" }); // source object stays pristine
  });

  it("keeps parent→child variable inheritance working after the copy-on-write set()", () => {
    const t = createTranslation({ locales: { en: { section: { greet: "hi {name}" } } } });
    t.section.set({ name: "Ivan" });
    expect(String(t.section.greet)).toBe("hi Ivan"); // child still inherits via the values getter chain
  });

  it("keeps documented sticky variables on the resolved node", () => {
    const t = createTranslation({ locales: { en: { greet: "hey {name}" } } });
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
    });
    await expect(Promise.resolve().then<unknown>(() => t)).rejects.toThrow("boom");
  });

  it("touching t.current before the first await no longer destroys the preload thenable", async () => {
    let loaded = 0;
    const t = createTranslation({
      locales: { en: async () => (loaded++, { hello: "hello" }) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    });
    void t.current; // pre-await read must not delete `then` without loading
    const resolved = await t;
    expect(loaded).toBeGreaterThan(0);
    expect(String(resolved.hello)).toBe("hello");
  });

  it("rejects awaiting a locale node whose loader fails without preload", async () => {
    const t = createTranslation({
      // the rejecting loader declares the tree shape it would have resolved, otherwise the
      // inferred es tree collapses to never and the locale node loses its typing
      locales: { en: async () => ({ hello: "hi" }), es: async (): Promise<{ hello: string }> => Promise.reject(new Error("es-down")) },
      allowedLocales: ["en", "es"],
      mainLocale: "en",
    });
    // the node thenable itself surfaces the loader failure instead of hanging
    await expect((async () => t.es)()).rejects.toThrow("es-down");
    expect(t.es.node).toBeNull(); // the failed payload resets instead of caching a rejection
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
    });
    await expect(Promise.resolve(t)).rejects.toThrow("transient");
    expect(attempts).toBe(1);
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
    });
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
    });
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
    });
    t.setLocale("es");
    const es = await t.current;
    expect(loads.es).toBeGreaterThan(0);
    expect(String(es.hello)).toBe("hola");
  });

  it("does not expose a thenable when preload is off", () => {
    const t = createTranslation({ locales: { en: { hello: "hi" } }, preload: false });
    expect(t.hasOwnProperty("then")).toBe(false); // sync trees must not look promise-like
  });
});

describe("falsy leaf content", () => {
  it('renders "" and 0 leaves instead of loading the whole locale tree into them', () => {
    const t = createTranslation({ locales: { en: { empty: "", zero: 0, other: "text" } } });
    expect(String(t.empty)).toBe("");
    expect(String(t.zero)).toBe("0");
  });
});

describe("call() path resolution edges", () => {
  it("resolves array index 0 through the array-path form (filter must keep 0)", () => {
    const t = createTranslation({ locales: { en: { items: ["first", "second"] } } });
    // numeric segments are runtime-supported but not part of the typed path surface,
    // so the public call method (typed with any[] rest parameters) drives them.
    expect(String(t.call(["items", 0]))).toBe("first");
    expect(String(t.call(["items", 1]))).toBe("second");
  });

  it("accepts a single numeric key without crashing", () => {
    const t = createTranslation({ locales: { en: { items: ["first", "second"] } } });
    expect(String(t.items.call(1))).toBe("second");
  });

  it("drops null/undefined path segments safely", () => {
    const t = createTranslation({ locales: { en: { hello: "hi" } } });
    expect(String(t(undefined) ?? t)).toBeDefined(); // no crash, resolves to the node itself
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
    });
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
    });
    const p = Promise.all(Array.from({ length: 10 }, () => Promise.resolve(t)));
    t.setLocale("es"); // mid-load
    await p;
    const cur = await t.current;
    expect(String(cur.hello)).toBe("hola");
  });

  it("does not hang or loop when the loader resolves an empty payload", async () => {
    let calls = 0;
    // JSON.parse keeps the empty payload untyped naturally: loaders resolving nothing are a
    // runtime resilience path that the typed locales surface does not model.
    const t = createTranslation({
      locales: { en: async () => (calls++, JSON.parse("null")) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    });
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
    });
    await expect(Promise.resolve().then<unknown>(() => t)).rejects.toThrow("de-down");
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
    });
    const groups = await Promise.all([
      Promise.all(Array.from({ length: 7 }, () => Promise.resolve(t.en))),
      Promise.all(Array.from({ length: 7 }, () => Promise.resolve(t.es))),
      Promise.all(Array.from({ length: 7 }, () => Promise.resolve(t.fr))),
    ]);
    const [en] = groups[0];
    const [es] = groups[1];
    const [fr] = groups[2];
    expect([String(en.hi), String(es.hi), String(fr.hi)]).toEqual(["hi-en", "hi-es", "hi-fr"]);
    expect(loads).toEqual({ en: 1, es: 1, fr: 1 });
  });

  it("resolves deep children after awaiting an async locale", async () => {
    const t = createTranslation({
      locales: { en: async () => (await delay(2), { a: { b: { c: "deep {v}" } } }) },
      allowedLocales: ["en"],
      mainLocale: "en",
      preload: true,
    });
    await t;
    expect(String(t.a.b.c({ v: "1" }))).toBe("deep 1");
  });
});

describe("variables stress", () => {
  it("keeps the source JSON pristine after 1000 distinct-variable calls on one node", () => {
    const en = { msg: "hi {name} #{i}", other: "plain {name}", values: { name: "seed" } };
    const snapshot = JSON.stringify(en);
    const t = createTranslation({ locales: { en } });
    for (let i = 0; i < 1000; i++) expect(String(t.msg({ name: "u" + i, i }))).toBe(`hi u${i} #${i}`);
    expect(JSON.stringify(en)).toBe(snapshot);
  });

  it("renders each node's own variables across 500 interleaved rounds on 2 siblings", () => {
    const t = createTranslation({ locales: { en: { a: "A={x}", b: "B={x}" } } });
    for (let i = 0; i < 500; i++) {
      expect(String(t.a({ x: "a" + i }))).toBe("A=a" + i);
      expect(String(t.b({ x: "b" + i }))).toBe("B=b" + i);
      expect(String(t.a)).toBe("A=a" + i); // sticky value stays per-node
      expect(String(t.b)).toBe("B=b" + i);
    }
  });

  it("does not leak call variables into siblings after 1000 root path-calls", () => {
    const t = createTranslation({ locales: { en: { x: "X {p}", y: "Y {p}" } } });
    for (let i = 0; i < 1000; i++) void String(t("x", { p: i }));
    expect(String(t.y)).toBe("Y {p}");
    expect(t.variables?.p).toBeUndefined();
  });

  it("isolates variables between locale siblings of the same key", () => {
    const t = createTranslation({ locales: { en: { m: "en {x}" }, es: { m: "es {x}" } }, mainLocale: "en" });
    t.m({ x: "EN" });
    expect(String(t.m.es({ x: "ES" }))).toBe("es ES");
    expect(String(t.m)).toBe("en EN"); // en node keeps its own sticky variable
  });
});

describe("edge content", () => {
  it("resolves emoji keys via property access and call()", () => {
    const t = createTranslation({ locales: { en: { "🚀": "rocket {name}", nest: { "🐈": "cat" } } } });
    expect(String(t["🚀"]({ name: "go" }))).toBe("rocket go");
    expect(String(t.nest["🐈"])).toBe("cat");
    expect(String(t("🚀", { name: "x" }))).toBe("rocket x");
  });

  it("reaches a literal dotted key by property/array-path while call('a.b') splits on ps", () => {
    const t = createTranslation({ locales: { en: { "a.b": "dotted-literal", a: { b: "nested" } } } });
    expect(String(t["a.b"])).toBe("dotted-literal");
    expect(String(t(["a.b"]))).toBe("dotted-literal"); // array form never splits
    expect(String(t("a.b"))).toBe("nested"); // string form splits on the path separator
  });

  it("renders a 100KB leaf and reports its real length", () => {
    const big = "x".repeat(100_000) + "{name}";
    const t = createTranslation({ locales: { en: { big } } });
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
    });
    expect(String(t.grid[0][1])).toBe("b");
    expect(String(t.call(["grid", 1, 0]))).toBe("c");
    expect(String(t.m[0][0][1])).toBe("x1");
    expect(String(t.call(["m", 1, 0, 0]))).toBe("z0");
  });

  it("iterates array nodes into their rendered children", () => {
    const t = createTranslation({ locales: { en: { list: ["one {n}", "two"] } } });
    expect([...t.list].map(x => String(x))).toEqual(["one {n}", "two"]);
  });

  it("treats reserved keys ('values') as variables, not children", () => {
    const t = createTranslation({ locales: { en: { sec: { values: { x: "V" }, msg: "m {x}" } } } });
    expect(String(t.sec.msg)).toBe("m V");
    expect(t.sec.children).toEqual(["msg"]);
  });

  it("freezes today's false/null leaf rendering(null swallows into 'undefined')", () => {
    // boolean and null leaves are tolerated at runtime but not part of the typed Node
    // surface, so the tree arrives as parsed JSON.
    const en = JSON.parse('{ "no": false, "nil": null, "ok": "ok" }');
    const t = createTranslation({ locales: { en } });
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
    });
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
    // the key is named msg on purpose: a tree key named g would collide with the node's own
    // g/global alias at the type level even though the runtime resolves the child.
    const t = createTranslation({ locales: { en: { msg: "hello {n}" }, es: { msg: "hola {n}" } }, mainLocale: "en" });
    // each branch switches with a literal locale: a union locale argument would produce a
    // union of generic call signatures that TypeScript cannot invoke.
    for (let i = 0; i < 50; i++) {
      if (i % 2 === 0) expect(String(t.setLocale("es").msg({ n: i }))).toBe("hola " + i);
      else expect(String(t.setLocale("en").msg({ n: i }))).toBe("hello " + i);
    }
  });

  it("freezes today's missing-key rendering in a secondary locale", () => {
    // the typed locales surface correctly requires every locale to share the tree shape, so
    // the deliberately incomplete es tree arrives as parsed JSON to break that contract.
    const t = createTranslation({
      locales: { en: { onlyEn: "english-only", both: "both-en" }, es: JSON.parse('{ "both": "both-es" }') },
      mainLocale: "en",
    });
    const es = t.setLocale("es");
    expect(String(es.both)).toBe("both-es");
    // KNOWN limitation (roadmap): a key missing in the active locale renders "undefined" today
    // (no mainLocale fallback, no path fallback). Frozen deliberately as the current contract.
    expect(String(es.onlyEn)).toBe("undefined");
  });

  it("hops locales at the node level via the locale sibling accessor", () => {
    const t = createTranslation({ locales: { en: { sec: { msg: "en-msg" } }, es: { sec: { msg: "es-msg" } } }, mainLocale: "en" });
    expect(String(t.sec.msg.es)).toBe("es-msg");
    expect(String(t.sec.msg)).toBe("en-msg");
  });
});

describe("settings/global coupling", () => {
  it("assigns settings.t on every instance, not only the first", () => {
    const t1 = createTranslation({ locales: { en: { a: "1" } } });
    const t2 = createTranslation({ locales: { en: { a: "2" } } });
    expect(t1.settings.t).toBeDefined();
    expect(t2.settings.t).toBeDefined();
    expect(t2.settings.t).not.toBe(t1.settings.t);
  });

  it("setLocale on one instance does not mutate another instance's locale", () => {
    const t1 = createTranslation({ locales: { en: { a: "1" }, es: { a: "uno" } }, mainLocale: "en" });
    const t2 = createTranslation({ locales: { en: { a: "2" }, es: { a: "dos" } }, mainLocale: "en" });
    t2.setLocale("es");
    expect(t2.settings.locale).toBe("es");
    expect(t1.settings.locale).toBe("en"); // no cross-instance bleed through the shared global setter
  });
});
