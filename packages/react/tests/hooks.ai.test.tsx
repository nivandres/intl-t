// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { getT, setLocale as setCoreLocale, type Locale, type Translation } from "@intl-t/core";
import "@testing-library/jest-dom";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement } from "react";
import { getClientLocale, setClientLocale, LOCALE_CLIENT_KEY } from "../src/client";
import { useLocale, type LocaleState } from "../src/hooks";
import { createTranslation as ct, TranslationNode } from "../src/translation";
import messages from "./fixtures/messages.json";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
}

function createReactTranslation() {
  return ct({
    locales: {
      en: messages,
      es: {
        ...messages,
        common: {
          ...messages.common,
          hello: "Hola {name}",
        },
      },
    },
    mainLocale: "en",
  });
}

function makeT() {
  return ct({ locales: { en: messages, es: messages }, mainLocale: "en" });
}

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  TranslationNode.t = null;
  TranslationNode.setLocale = setClientLocale; // pin the react setter: sibling test files (next) share this global
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  Object.assign(TranslationNode, { locale: undefined, source: undefined, t: null });
});

describe("react hooks DOM", () => {
  it("reads a path-scoped persisted locale when hydration is disabled", () => {
    const t = createReactTranslation();

    window.history.replaceState({}, "", "/en/dashboard");
    localStorage.setItem(`${LOCALE_CLIENT_KEY}/admin`, "es");

    function Probe() {
      const locale = useLocale.call(t, undefined, { hydration: false, key: `${LOCALE_CLIENT_KEY}/admin` });
      return <output data-testid="locale">{String(locale.locale)}</output>;
    }

    const view = render(<Probe />);

    expect(view.container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  it("writes the locale to storage and syncs translation settings", () => {
    const t = createReactTranslation();

    function Probe() {
      const locale = useLocale.call(t, "en", { hydration: false });

      return (
        <>
          <output data-testid="locale">{String(locale.locale)}</output>
          <button type="button" onClick={() => locale.setLocale("es")}>
            change
          </button>
        </>
      );
    }

    const view = render(<Probe />);

    fireEvent.click(view.container.querySelector("button")!);

    expect(view.container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  it("syncs external settings.setLocale calls back into hook state", () => {
    const t = createReactTranslation();
    const originalSetLocale = mock((locale: string) => locale);

    t.settings.setLocale = originalSetLocale;

    function Probe() {
      const locale = useLocale.call(t, "en", { hydration: false });
      return <output data-testid="locale">{String(locale.locale)}</output>;
    }

    const view = render(<Probe />);

    act(() => {
      t.settings.setLocale("es");
    });

    expect(view.container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
    expect(originalSetLocale).toHaveBeenCalledWith("es");
  });

  it("exposes the locale state through its string conversion", () => {
    const t = createReactTranslation();

    localStorage.setItem(LOCALE_CLIENT_KEY, "en");

    function Probe() {
      const locale = useLocale.call(t, "en", { hydration: false });
      return <output data-testid="locale">{String(locale)}</output>;
    }

    const view = render(<Probe />);

    expect(view.container.querySelector('[data-testid="locale"]')?.textContent).toBe("en");
  });

  it("hydrates from persisted storage when no default locale is provided", async () => {
    const t = createReactTranslation();

    localStorage.setItem(LOCALE_CLIENT_KEY, "es");

    function Probe() {
      const locale = useLocale.call(t, null, { hydration: true });
      return <output data-testid="locale">{String(locale.locale)}</output>;
    }

    const view = render(<Probe />);

    await waitFor(() => {
      expect(view.container.querySelector('[data-testid="locale"]')?.textContent).toBe("es");
    });
    expect(t.settings.locale).toBe("es");
  });
});

// Unified suite: DOM/harness tests + behavioral robustness tests for getT, setLocale/setTLocale,
// getClientLocale/setClientLocale and the *average* usage of useLocale. Each behavioral test
// asserts the sane expected contract, so a failure documents a genuine behavioral bug.
describe("getT — resolution order", () => {
  it("returns the explicit translation argument over everything else", () => {
    const a = makeT();
    const b = makeT();
    // `getT(a)` does not typecheck with a concrete translation (its `Translation`
    // constraint rejects concrete instances), so route the argument through the
    // library's `any`-typed static slot to obtain a constraint-compatible handle.
    TranslationNode.t = a;
    const explicit: Translation = TranslationNode.t;
    TranslationNode.t = b;
    expect<unknown>(getT(explicit)).toBe(a);
  });

  it("prefers this.t over the global TranslationNode.t", () => {
    const global = makeT();
    const local = makeT();
    TranslationNode.t = global;
    expect<unknown>(getT.call({ t: local })).toBe(local);
  });

  it("falls back to the global when the binding carries no translation", () => {
    const global = makeT();
    TranslationNode.t = global;
    expect<unknown>(getT.call({})).toBe(global);
  });

  it("does not return a settings object masquerading as a Translation", () => {
    // getT.call({settings}) currently returns the settings object itself, which is NOT a
    // Translation (has no .current). Anyone doing getT.call(x).current(...) would blow up.
    const binding = { settings: { locale: "en", allowedLocales: ["en"] } };
    const resolved = getT.call(binding);
    expect(typeof resolved?.current === "function" || resolved == null).toBe(true);
  });
});

describe("setLocale / setTLocale — target selection", () => {
  it("updates the binding's own settings, not the global, when both exist", () => {
    const global = makeT();
    global.settings.locale = "en";
    TranslationNode.t = global;

    const binding: { settings: { locale: Locale } } = { settings: { locale: "en" } };
    setCoreLocale.call(binding, "es");

    expect(binding.settings.locale).toBe("es");
    expect(global.settings.locale).toBe("en"); // global must stay untouched
  });

  it("returns the locale even when there is no settings target at all", () => {
    expect(setCoreLocale.call({}, "es")).toBe("es");
  });
});

describe("getClientLocale — detection edge cases", () => {
  it("does not leak an unsupported URL locale when called with no binding/allowedLocales", () => {
    // pathname carries a locale the app never declared; with no allow-list we must not adopt it.
    window.history.replaceState({}, "", "/zz/dashboard");
    const l = getClientLocale();
    expect(l).not.toBe("zz");
  });

  it("does not silently persist an unsupported detected locale to storage", () => {
    window.history.replaceState({}, "", "/zz/dashboard");
    getClientLocale();
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).not.toBe("zz");
  });

  it("prefers the stored value over URL detection", () => {
    const t = makeT();
    window.history.replaceState({}, "", "/en/dashboard");
    localStorage.setItem(LOCALE_CLIENT_KEY, "es");
    expect(getClientLocale.call(t)).toBe("es");
  });

  it("reads without persisting the detected locale to storage", () => {
    // A read may sync settings in-memory, but it must never write localStorage; only an
    // explicit setClientLocale change persists. Storage empty + a detectable URL locale:
    const t = makeT();
    window.history.replaceState({}, "", "/es/dashboard");
    getClientLocale.call(t);
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBeNull();
  });

  it("ignores an uppercase / malformed URL locale segment", () => {
    const t = makeT();
    window.history.replaceState({}, "", "/EN/dashboard");
    const l = getClientLocale.call(t, LOCALE_CLIENT_KEY, true, ["en", "es"]);
    expect(["en", "es", undefined]).toContain(l);
  });
});

describe("useLocale — average usage", () => {
  it("persists to storage, syncs t.settings and updates the view on setLocale", () => {
    const t = makeT();
    let api!: LocaleState<Locale>;
    function Probe() {
      api = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "l" }, String(api.locale));
    }
    const view = render(createElement(Probe));
    act(() => api.setLocale("es"));

    expect(view.getByTestId("l").textContent).toBe("es");
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  // hook.setLocale is the LOCAL setter: it changes only its own component. Isolation by design.
  it("keeps hook.setLocale local — a consumer's change does not move its siblings", () => {
    const t = makeT();
    let a!: LocaleState<Locale>;
    function A() {
      a = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "a" }, String(a.locale));
    }
    function B() {
      const b = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "b" }, String(b.locale));
    }
    const view = render(createElement("div", null, createElement(A), createElement(B)));

    act(() => a.setLocale("es"));

    expect(view.getByTestId("a").textContent).toBe("es");
    expect(view.getByTestId("b").textContent).toBe("en"); // isolated: sibling keeps its own locale
  });

  // t.settings.setLocale is the GLOBAL setter: it fans out to every subscribed consumer.
  it("fans out to every subscribed consumer through t.settings.setLocale", () => {
    const t = makeT();
    function A() {
      const a = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "a" }, String(a.locale));
    }
    function B() {
      const b = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "b" }, String(b.locale));
    }
    const view = render(createElement("div", null, createElement(A), createElement(B)));

    act(() => t.settings.setLocale("es"));

    expect(view.getByTestId("a").textContent).toBe("es");
    expect(view.getByTestId("b").textContent).toBe("es"); // global setter reaches all subscribers
  });

  // subscribeToTState:false opts a component out of the shared t-locale fan-out (isolated language).
  it("isolates a consumer with subscribeToTState:false from the global fan-out", () => {
    const t = makeT();
    function Isolated() {
      const l = useLocale.call(t, "en", { hydration: false, subscribeToTState: false });
      return createElement("output", { "data-testid": "iso" }, String(l.locale));
    }
    function Shared() {
      const l = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "shared" }, String(l.locale));
    }
    const view = render(createElement("div", null, createElement(Isolated), createElement(Shared)));

    act(() => t.settings.setLocale("es"));

    expect(view.getByTestId("iso").textContent).toBe("en"); // opted out of the fan-out
    expect(view.getByTestId("shared").textContent).toBe("es"); // still subscribed
  });

  // Controlled mode: when `locale` is provided the value reflects the prop reactively.
  it("reflects the `locale` option reactively (controlled)", () => {
    const t = makeT();
    function Probe({ locale }: { locale: Locale }) {
      const l = useLocale.call(t, undefined, { hydration: false, locale });
      return createElement("output", { "data-testid": "l" }, String(l.locale));
    }
    const view = render(createElement(Probe, { locale: "es" }));
    expect(view.getByTestId("l").textContent).toBe("es");
    view.rerender(createElement(Probe, { locale: "en" }));
    expect(view.getByTestId("l").textContent).toBe("en"); // controlled: value follows the prop
  });

  // Controlled setter is pure delegation: it fires onLocaleChange but does NOT own state or persist.
  it("delegates setLocale to onLocaleChange in controlled mode (no state/storage mutation)", () => {
    const t = makeT();
    const onLocaleChange = mock((_: Locale) => {});
    let api!: LocaleState<Locale>;
    function Probe() {
      api = useLocale.call(t, undefined, { hydration: false, locale: "es", onLocaleChange });
      return createElement("output", { "data-testid": "l" }, String(api.locale));
    }
    const view = render(createElement(Probe));

    act(() => api.setLocale("en"));

    expect(onLocaleChange).toHaveBeenCalledWith("en"); // parent is notified
    expect(view.getByTestId("l").textContent).toBe("es"); // value stays = prop (parent owns it)
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBeNull(); // controlled: no persistence
  });

  it("calls onLocaleChange exactly once with the new locale", () => {
    const t = makeT();
    const onLocaleChange = mock((_: Locale) => {});
    let api!: LocaleState<Locale>;
    function Probe() {
      api = useLocale.call(t, "en", { hydration: false, onLocaleChange });
      return null;
    }
    render(createElement(Probe));
    act(() => api.setLocale("es"));

    expect(onLocaleChange).toHaveBeenCalledTimes(1);
    expect(onLocaleChange).toHaveBeenCalledWith("es");
  });

  it("scopes storage writes to the provided key", () => {
    const t = makeT();
    let api!: LocaleState<Locale>;
    function Probe() {
      api = useLocale.call(t, "en", { hydration: false, key: `${LOCALE_CLIENT_KEY}/admin` });
      return null;
    }
    render(createElement(Probe));
    act(() => api.setLocale("es"));

    expect(localStorage.getItem(`${LOCALE_CLIENT_KEY}/admin`)).toBe("es");
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBeNull(); // must not touch the default key
  });
});

describe("useLocale — mount/unmount subscription rigor", () => {
  it("stops re-rendering an unmounted consumer when settings.setLocale fires", () => {
    const t = makeT();
    let renders = 0;
    function Probe() {
      renders++;
      const l = useLocale.call(t, "en", { hydration: false });
      return createElement("output", null, String(l.locale));
    }
    const view = render(createElement(Probe));
    const before = renders;
    view.unmount();

    act(() => t.settings.setLocale("es")); // dead subscriber must be inert subscribed flag

    expect(renders).toBe(before);
  });

  it("keeps notifying consumers mounted after another consumer unmounted", () => {
    const t = makeT();
    function A() {
      const l = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "a" }, String(l.locale));
    }
    const first = render(createElement(A));
    first.unmount();

    function B() {
      const l = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "b" }, String(l.locale));
    }
    const second = render(createElement(B));

    act(() => t.settings.setLocale("es"));

    expect(second.getByTestId("b").textContent).toBe("es"); // fan-out survives prior unmounts
  });

  it("survives repeated mount/unmount cycles without breaking the fan-out chain", () => {
    const t = makeT();
    function Probe() {
      const l = useLocale.call(t, "en", { hydration: false });
      return createElement("output", { "data-testid": "p" }, String(l.locale));
    }
    for (let i = 0; i < 5; i++) render(createElement(Probe)).unmount();

    const view = render(createElement(Probe));
    act(() => t.settings.setLocale("es"));

    expect(view.getByTestId("p").textContent).toBe("es"); // chain still delivers after 5 dead links
  });
});
