// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import React, { type ReactNode } from "react";
import { getLocale as clientGetLocale, setLocale as clientSetLocale } from "../src/client";
import { TranslationProvider, useTranslation } from "../src/context";
import { useLocale } from "../src/hooks";
import { createTranslation, TranslationNode } from "../src/translation";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
}

beforeEach(() => {
  localStorage.clear();
  TranslationNode.setLocale = clientSetLocale;
  TranslationNode.getLocale = clientGetLocale;
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  localStorage.clear();
  TranslationNode.locale = undefined as never;
  TranslationNode.source = undefined as never;
  TranslationNode.t = null as never;
});

function Reader({ id }: { id: string }) {
  const t = useTranslation();
  return <span data-testid={id}>{String(t.hi)}</span>;
}

describe("prerender environment: sloppy-mode provider calls", () => {
  it("a provider invoked with globalThis as this still applies source through settings", () => {
    const loads = { en: 0, es: 0 };
    const t: any = createTranslation({
      locales: {
        en: () => (loads.en++, Promise.resolve({ hi: "hi" })),
        es: () => (loads.es++, Promise.resolve({ hi: "hola" })),
      },
    });
    TranslationNode.t = t;

    function SloppyProvider(props: { locale: string; source: unknown; children: ReactNode }) {
      return (TranslationProvider as (props: object) => ReactNode).call(globalThis, props);
    }

    const view = render(
      <SloppyProvider locale="es" source={{ hi: "hola" }}>
        <Reader id="sloppy" />
      </SloppyProvider>,
    );

    expect(view.getByTestId("sloppy").textContent).toBe("hola");
    expect(TranslationNode.locale).toBeUndefined();
    expect(TranslationNode.source).toBeUndefined();
    expect(loads.es).toBe(0);
  });
});

describe("prerender environment: one worker renders several pages", () => {
  it("sequential pages with different locales each render their own language", () => {
    const loads = { en: 0, es: 0, ja: 0 };
    const t: any = createTranslation({
      locales: {
        en: () => (loads.en++, Promise.resolve({ hi: "hi" })),
        es: () => (loads.es++, Promise.resolve({ hi: "hola" })),
        ja: () => (loads.ja++, Promise.resolve({ hi: "こんにちは" })),
      },
    });
    TranslationNode.t = t;

    const esPage = render(
      <TranslationProvider locale="es" source={{ hi: "hola" }}>
        <Reader id="page-es" />
      </TranslationProvider>,
    );
    expect(esPage.getByTestId("page-es").textContent).toBe("hola");
    esPage.unmount();

    const jaPage = render(
      <TranslationProvider locale="ja" source={{ hi: "こんにちは" }}>
        <Reader id="page-ja" />
      </TranslationProvider>,
    );
    expect(jaPage.getByTestId("page-ja").textContent).toBe("こんにちは");
    jaPage.unmount();

    const esAgain = render(
      <TranslationProvider locale="es">
        <Reader id="page-es-again" />
      </TranslationProvider>,
    );
    expect(esAgain.getByTestId("page-es-again").textContent).toBe("hola");
    expect(loads).toEqual({ en: 0, es: 0, ja: 0 });
  });
});

describe("nested providers: a second tree inheriting the locale", () => {
  it("the inner provider keeps its own tree while following the outer locale", () => {
    const tA: any = createTranslation({
      locales: { en: { hi: "A-EN" }, es: { hi: "A-ES" } },
    });
    const tB: any = createTranslation({
      locales: { en: { hi: "B-EN" }, es: { hi: "B-ES" } },
    });

    const view = render(
      <tA.Translation locale="es">
        <Reader id="outer" />
        <tB.Translation>
          <Reader id="inner" />
        </tB.Translation>
      </tA.Translation>,
    );

    expect(view.getByTestId("outer").textContent).toBe("A-ES");
    expect(view.getByTestId("inner").textContent).toBe("B-ES");
  });
});

describe("pruned source: a provider scoped by path", () => {
  it("renders the subtree immediately while the locale lazy-loads (payload pruning only)", async () => {
    const loads = { en: 0, es: 0 };
    const t: any = createTranslation({
      locales: {
        en: () => (loads.en++, Promise.resolve({ home: { hi: "hi" }, admin: { panel: "panel" } })),
        es: () => (loads.es++, Promise.resolve({ home: { hi: "hola" }, admin: { panel: "tablero" } })),
      },
    });
    TranslationNode.t = t;

    function HomeReader() {
      const full = useTranslation();
      return <span data-testid="pruned">{String(full.home.hi)}</span>; // path scopes the source application, readers keep full paths
    }

    const view = render(
      <TranslationProvider locale="es" path="home" source={{ hi: "hola" }}>
        <HomeReader />
      </TranslationProvider>,
    );

    expect(view.getByTestId("pruned").textContent).toBe("hola");
    // Traversing to the path still opens the locale branch, so the loader fires once in the
    // background: pruning trims the serialized payload, not the client fetch. Zero-fetch
    // hydration belongs to whole-tree sources — one translation per namespace.
    expect(loads.es).toBe(1);
    await (t.settings.locales as any).es;
    expect(String(t.es.admin.panel)).toBe("tablero");
  });
});

describe("controlled useLocale", () => {
  it("keeps the given locale, notifies changes and never writes storage", () => {
    const t: any = createTranslation({ locales: { en: { hi: "hi" }, es: { hi: "hola" } } });
    TranslationNode.t = t;
    const seen: string[] = [];
    let setter: ((l: string) => void) | undefined;

    function Controlled() {
      const state: any = useLocale({ locale: "es", onLocaleChange: (l: string) => seen.push(l), t });
      setter = state.setLocale;
      return <span data-testid="controlled">{state.locale}</span>;
    }

    const view = render(<Controlled />);
    expect(view.getByTestId("controlled").textContent).toBe("es");

    setter?.("en");
    expect(seen).toEqual(["en"]);
    expect(view.getByTestId("controlled").textContent).toBe("es"); // controlled: the prop rules
    expect(localStorage.getItem("locale")).toBeNull();
  });

  it("a key-scoped locale state stays independent from the default key", () => {
    const t: any = createTranslation({ locales: { en: { hi: "hi" }, es: { hi: "hola" } } });
    TranslationNode.t = t;
    let setPreview: ((l: string) => void) | undefined;

    function Preview() {
      const state: any = useLocale({ key: "preview:locale", defaultLocale: "en", t, subscribeToContext: false });
      setPreview = state.setLocale;
      return <span data-testid="preview">{state.locale}</span>;
    }

    render(<Preview />);
    setPreview?.("es");

    expect(localStorage.getItem("preview:locale")).toBe("es");
    expect(localStorage.getItem("locale")).toBeNull();
  });
});

describe("nested provider with an explicit locale (controlled divergence)", () => {
  it("hook consumers inside the nested provider follow its locale, not the app's", () => {
    const tA: any = createTranslation({
      locales: { en: { hi: "A-EN" }, es: { hi: "A-ES" } },
    });
    const tB: any = createTranslation({
      locales: { en: { hi: "B-EN" }, es: { hi: "B-ES" } },
    });

    const view = render(
      <tA.Translation locale="es">
        <Reader id="app" />
        <tB.Translation locale="en">
          <Reader id="widget" />
        </tB.Translation>
      </tA.Translation>,
    );

    expect(view.getByTestId("app").textContent).toBe("A-ES"); // the app stays on its own locale
    expect(view.getByTestId("widget").textContent).toBe("B-EN"); // hooks see the nested controlled locale
  });
});

describe("instance identity by id (the tid bridge)", () => {
  it("resolves the serialized instance even when the singleton points elsewhere", () => {
    const firstT: any = createTranslation({ id: "first", locales: { en: { hi: "FIRST" } } });
    const adminT: any = createTranslation({ id: "admin", locales: { en: { hi: "ADMIN" } } });
    TranslationNode.t = firstT; // the first-wins singleton: exactly the wrong-instance scenario

    const view = render(
      <TranslationProvider locale="en" {...({ tid: "admin" } as object)}>
        <Reader id="by-tid" />
      </TranslationProvider>,
    );

    expect(String(adminT.hi)).toBe("ADMIN");
    expect(view.getByTestId("by-tid").textContent).toBe("ADMIN"); // tid beats the singleton guess
  });

  it("without tid the singleton fallback behaves exactly as before", () => {
    const t: any = createTranslation({ locales: { en: { hi: "SINGLETON" } } });
    TranslationNode.t = t;

    const view = render(
      <TranslationProvider locale="en">
        <Reader id="no-tid" />
      </TranslationProvider>,
    );

    expect(view.getByTestId("no-tid").textContent).toBe("SINGLETON");
  });
});

describe("element chunks: tag attributes override on top", () => {
  it("keeps the element's own props and lets tag attributes win on conflicts", () => {
    const t: any = createTranslation({
      locales: { en: { msg: 'see <icon className="from-tag">the label</icon> here' } },
    });
    TranslationNode.t = t;

    // bun test interop: transpiled JSX uses a per-importer snapshot of the runtime, so a raw
    // node child does not coerce here (bundlers share one instance and do) — createElement is patched.
    const view = render(
      React.createElement("div", { "data-testid": "chunked" }, t.msg({ icon: <span className="from-element" data-kept="yes" /> }) as never),
    );

    const span = view.getByTestId("chunked").querySelector("span");
    expect(span?.className).toBe("from-tag"); // el attr del tag sobrescribe por arriba
    expect(span?.getAttribute("data-kept")).toBe("yes"); // la prop del elemento sobrevive
    expect(span?.textContent).toBe("the label"); // children inyectados
  });
});
