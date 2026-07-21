// AI generated test
// The provider is exercised through the documented `t.Translation` binding (the proxy that
// invokes the wired react TranslationProvider — identity is asserted in translation.ai.test.tsx).
// Rendering the raw exported TranslationProvider with a `t` prop is not expressible in the type
// system today: generic inference over the whole translation instance explodes (TS2589).
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { type Locale } from "@intl-t/core";
import { LOCALE_CLIENT_KEY } from "@intl-t/react";
import "@testing-library/jest-dom";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement, type ReactNode, type SetStateAction } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { setClientLocale } from "../src/client";
import { TranslationContext, useTranslation } from "../src/context";
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

function renderStatic(node: ReactNode) {
  return renderToStaticMarkup(node);
}

describe("react context", () => {
  const originalGetItem = globalThis.localStorage.getItem.bind(globalThis.localStorage);
  const originalSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);

  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/en/dashboard");
    Object.defineProperty(globalThis.localStorage, "getItem", {
      configurable: true,
      value: mock(() => null),
    });
    Object.defineProperty(globalThis.localStorage, "setItem", {
      configurable: true,
      value: mock(() => undefined),
    });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/");
    localStorage.clear();
    sessionStorage.clear();
    Object.defineProperty(globalThis.localStorage, "getItem", {
      configurable: true,
      value: originalGetItem,
    });
    Object.defineProperty(globalThis.localStorage, "setItem", {
      configurable: true,
      value: originalSetItem,
    });
    Object.assign(TranslationNode, { locale: undefined, source: undefined, t: null });
  });

  it("renders translated content with variables through the provider", () => {
    const t = ct({
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

    const markup = renderStatic(
      createElement(t.Translation, {
        locale: "es",
        i18nKey: "common.hello",
        variables: { name: "Ivan" },
      }),
    );

    expect(markup).toBe("Hola Ivan");
  });

  it("supports useTranslation inside the provider context", () => {
    const t = ct({ locales: { en: messages } });

    function Greeting() {
      return <>{String(useTranslation("pages.landing.hero.features.1", { name: "Ada" }))}</>;
    }

    const markup = renderStatic(createElement(t.Translation, { locale: "en" }, createElement(Greeting)));

    expect(markup).toBe("hi Ada. This is Feature 2");
  });

  it("prefers the locale state provided by context", () => {
    let provided: LocaleState<Locale> | undefined;
    let received: LocaleState<Locale> | undefined;

    function Probe() {
      received = useLocale();
      return null;
    }

    function Outer() {
      const state = useLocale<Locale>("es", { hydration: false, saveState: false });
      provided = state;
      return (
        <TranslationContext.Provider value={{ localeState: state }}>
          <Probe />
        </TranslationContext.Provider>
      );
    }

    renderStatic(<Outer />);

    expect(provided).toBeDefined();
    expect(received).toBe(provided!);
    expect(received?.[0]).toBe("es");
  });

  it("reads persisted locale when hydration is disabled", () => {
    const getItem = mock((key: string) => (key === `${LOCALE_CLIENT_KEY}/admin` ? "es" : null));
    Object.defineProperty(globalThis.localStorage, "getItem", {
      configurable: true,
      value: getItem,
    });
    Object.defineProperty(globalThis.localStorage, "setItem", {
      configurable: true,
      value: mock(() => undefined),
    });

    const t = ct({ locales: { en: messages, es: messages }, mainLocale: "en" });
    let state: LocaleState<Locale> | undefined;

    function Probe() {
      state = useLocale.call(t, undefined, { hydration: false, key: `${LOCALE_CLIENT_KEY}/admin` });
      return null;
    }

    renderStatic(<Probe />);

    expect(getItem).toHaveBeenCalledWith(`${LOCALE_CLIENT_KEY}/admin`);
    expect(state?.locale).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  it("falls back to the provided default locale when no persisted locale exists", () => {
    let state: LocaleState<Locale> | undefined;

    function Probe() {
      state = useLocale<Locale>("en", { hydration: false });
      return null;
    }

    renderStatic(<Probe />);

    expect(state?.locale).toBe("en");
  });
});

describe("react context DOM", () => {
  it("renders translated content and updates when the locale changes", () => {
    const t = createReactTranslation();

    function Greeting() {
      const locale = useLocale();

      return (
        <>
          <output data-testid="locale">{String(locale.locale)}</output>
          <output data-testid="message">{String(useTranslation("common.hello", { name: "Ivan" }))}</output>
          <button type="button" onClick={() => locale.setLocale("es")}>
            switch
          </button>
        </>
      );
    }

    const view = render(createElement(t.Translation, null, createElement(Greeting)));

    expect(view.getByTestId("locale").textContent).toBe("en");
    expect(view.getByTestId("message").textContent).toBe("Hello Ivan");

    fireEvent.click(view.getByRole("button", { name: "switch" }));

    expect(view.getByTestId("locale").textContent).toBe("es");
    expect(view.getByTestId("message").textContent).toBe("Hola Ivan");
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  it("keeps separate translation instances independent across renders", () => {
    const tEn = createReactTranslation();
    const tEs = createReactTranslation();

    function Greeting() {
      return <output data-testid="message">{String(useTranslation("common.hello", { name: "Ivan" }))}</output>;
    }

    const first = render(
      <tEn.Translation locale="en">
        <Greeting />
      </tEn.Translation>,
    );

    expect(first.container.querySelector('[data-testid="message"]')?.textContent).toBe("Hello Ivan");
    expect(tEn.settings.locale).toBe("en");

    first.unmount();

    const second = render(
      <tEs.Translation locale="es">
        <Greeting />
      </tEs.Translation>,
    );

    expect(second.container.querySelector('[data-testid="message"]')?.textContent).toBe("Hola Ivan");
    expect(tEs.settings.locale).toBe("es");
  });

  it("provides translation context to nested consumers", () => {
    const t = createReactTranslation();

    function NestedGreeting() {
      return <span data-testid="nested-greeting">{String(useTranslation("pages.landing.hero.features.0", { name: "Ada" }))}</span>;
    }

    const view = render(createElement(t.Translation, null, createElement("section", null, createElement(NestedGreeting))));

    expect(view.getByTestId("nested-greeting").textContent).toBe("hi Ada. This is Feature 1");
  });

  it("rerenders provider consumers after async messages resolve", async () => {
    const t = ct({
      locales: {
        en: async () => messages,
      },
      mainLocale: "en",
    });

    function AsyncGreeting() {
      return <output data-testid="async-message">{String(useTranslation("common.hello", { name: "Ivan" }))}</output>;
    }

    const view = render(createElement(t.Translation, { locale: "en" }, createElement(AsyncGreeting)));

    await waitFor(() => {
      expect(view.getByTestId("async-message").textContent).toBe("Hello Ivan");
    });
  });
});

// Robustness tests for the TranslationProvider's use of useLocale — targeting behaviors the
// reimplementation could have shifted vs. the previous version (controlled `locale` prop,
// onLocaleChange wiring, nested-provider locale sharing, mount settings sync).
describe("TranslationProvider — locale wiring", () => {
  function makeT() {
    return ct({
      locales: { en: messages, es: { ...messages, common: { ...messages.common, hello: "Hola {name}" } } },
      mainLocale: "en",
    });
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

  // The provider renders with the locale it is given on mount.
  it("renders children in the locale given by the `locale` prop", () => {
    const t = makeT();
    function Msg() {
      return createElement("output", { "data-testid": "m" }, String(useTranslation.call(t, "common.hello", { name: "Ada" })));
    }
    const view = render(createElement(t.Translation, { locale: "es" }, createElement(Msg)));
    expect(view.getByTestId("m").textContent).toBe("Hola Ada");
    expect(t.settings.locale).toBe("es");
  });

  // ATTACK: change the controlled `locale` prop after mount. The old provider rebuilt localeState
  // every render, so the prop was reactive; check whether that still holds.
  it("reflects a changed `locale` prop after mount (controlled provider)", () => {
    const t = makeT();
    function Msg() {
      return createElement("output", { "data-testid": "m" }, String(useTranslation.call(t, "common.hello", { name: "Ada" })));
    }
    function App({ locale }: { locale: "en" | "es" }) {
      return createElement(t.Translation, { locale }, createElement(Msg));
    }
    const view = render(createElement(App, { locale: "en" }));
    expect(view.getByTestId("m").textContent).toBe("Hello Ada");

    view.rerender(createElement(App, { locale: "es" }));
    expect(view.getByTestId("m").textContent).toBe("Hola Ada");
  });

  // A consumer inside the provider drives the locale, provider + siblings follow.
  it("updates all consumers when one changes the locale through the provider", () => {
    const t = makeT();
    let api!: LocaleState<Locale>;
    function Driver() {
      api = useLocale();
      return createElement("output", { "data-testid": "d" }, String(api.locale));
    }
    function Watcher() {
      const l = useLocale();
      return createElement("output", { "data-testid": "w" }, String(l.locale));
    }
    const view = render(createElement(t.Translation, null, createElement(Driver), createElement(Watcher)));

    act(() => api.setLocale("es"));

    expect(view.getByTestId("d").textContent).toBe("es");
    expect(view.getByTestId("w").textContent).toBe("es"); // shared through context
  });

  // ATTACK: onLocaleChange passed to the provider should fire when the locale changes.
  it("calls the provider's onLocaleChange when a consumer changes the locale", () => {
    const t = makeT();
    const onLocaleChange = mock((_: SetStateAction<"en" | "es">) => {});
    let api!: LocaleState<Locale>;
    function Child() {
      api = useLocale();
      return null;
    }
    render(createElement(t.Translation, { onLocaleChange }, createElement(Child)));

    act(() => api.setLocale("es"));

    expect(onLocaleChange).toHaveBeenCalledWith("es");
  });

  // A nested provider without its own locale should share the outer provider's locale state.
  it("shares locale state with a nested provider that has no locale of its own", () => {
    const t = makeT();
    let outer!: LocaleState<Locale>;
    function Inner() {
      const l = useLocale();
      return createElement("output", { "data-testid": "inner" }, String(l.locale));
    }
    function Outer() {
      outer = useLocale();
      return createElement(t.Translation, null, createElement(Inner));
    }
    const view = render(createElement(t.Translation, null, createElement(Outer)));

    act(() => outer.setLocale("es"));

    expect(view.getByTestId("inner").textContent).toBe("es");
  });

  // Clicking a switch inside the provider updates the rendered translation (integration smoke).
  it("re-renders translated content when a consumer switches the locale", () => {
    const t = makeT();
    function UI() {
      const l = useLocale();
      return createElement(
        "div",
        null,
        createElement("output", { "data-testid": "msg" }, String(useTranslation("common.hello", { name: "Ivan" }))),
        createElement("button", { type: "button", onClick: () => l.setLocale("es") }, "switch"),
      );
    }
    const view = render(createElement(t.Translation, null, createElement(UI)));
    expect(view.getByTestId("msg").textContent).toBe("Hello Ivan");

    fireEvent.click(view.getByRole("button", { name: "switch" }));
    expect(view.getByTestId("msg").textContent).toBe("Hola Ivan");
  });
});
