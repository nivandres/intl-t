// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { LOCALE_CLIENT_KEY } from "@intl-t/react";
import "@testing-library/jest-dom";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { setClientLocale } from "../src/client";
import { TranslationProvider, TranslationContext, useTranslation } from "../src/context";
import { useLocale } from "../src/hooks";
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
  }) as any;
}

function renderStatic(node: any) {
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
    TranslationNode.locale = undefined as never;
    TranslationNode.source = undefined as never;
    TranslationNode.t = null as never;
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
    }) as any;

    const markup = renderStatic(
      createElement(TranslationProvider as any, {
        t,
        locale: "es",
        i18nKey: "common.hello",
        variables: { name: "Ivan" },
      }),
    );

    expect(markup).toBe("Hola Ivan");
  });

  it("supports useTranslation inside the provider context", () => {
    const t = ct({ locales: { en: messages } }) as any;

    function Greeting() {
      return <>{String(useTranslation("pages.landing.hero.features.1", { name: "Ada" }))}</>;
    }

    const markup = renderStatic(createElement(TranslationProvider as any, { t, locale: "en" }, createElement(Greeting)));

    expect(markup).toBe("hi Ada. This is Feature 2");
  });

  it("prefers the locale state provided by context", () => {
    let state: any;
    const setLocale = ((locale: any) => locale) as any;

    function Probe() {
      state = useLocale();
      return null;
    }

    renderStatic(
      <TranslationContext.Provider value={{ localeState: ["es", setLocale] as never }}>
        <Probe />
      </TranslationContext.Provider>,
    );

    expect(state?.[0]).toBe("es");
    expect(state?.[1]).toBe(setLocale);
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

    const t = ct({ locales: { en: messages, es: messages }, mainLocale: "en" }) as any;
    let state: any;

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
    let state: any;

    function Probe() {
      state = useLocale("en", { hydration: false });
      return null;
    }

    renderStatic(<Probe />);

    expect(state?.locale).toBe("en");
  });
});

describe("react context DOM", () => {
  it("renders translated content and updates when the locale changes", () => {
    const t = createReactTranslation();
    const Provider = TranslationProvider as any;

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

    const view = render(createElement(Provider, { t }, createElement(Greeting)));

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
    const Provider = TranslationProvider as any;

    function Greeting() {
      return <output data-testid="message">{String(useTranslation("common.hello", { name: "Ivan" }))}</output>;
    }

    const first = render(
      <Provider t={tEn} locale="en">
        <Greeting />
      </Provider>,
    );

    expect(first.container.querySelector('[data-testid="message"]')?.textContent).toBe("Hello Ivan");
    expect(tEn.settings.locale).toBe("en");

    first.unmount();

    const second = render(
      <Provider t={tEs} locale="es">
        <Greeting />
      </Provider>,
    );

    expect(second.container.querySelector('[data-testid="message"]')?.textContent).toBe("Hola Ivan");
    expect(tEs.settings.locale).toBe("es");
  });

  it("provides translation context to nested consumers", () => {
    const t = createReactTranslation();
    const Provider = TranslationProvider as any;

    function NestedGreeting() {
      return <span data-testid="nested-greeting">{String(useTranslation("pages.landing.hero.features.0", { name: "Ada" }))}</span>;
    }

    const view = render(createElement(Provider, { t }, createElement("section", null, createElement(NestedGreeting))));

    expect(view.getByTestId("nested-greeting").textContent).toBe("hi Ada. This is Feature 1");
  });

  it("rerenders provider consumers after async messages resolve", async () => {
    const t = ct({
      locales: {
        en: async () => messages,
      },
      mainLocale: "en",
    }) as any;
    const Provider = TranslationProvider as any;

    function AsyncGreeting() {
      return <output data-testid="async-message">{String(useTranslation("common.hello", { name: "Ivan" }))}</output>;
    }

    const view = render(createElement(Provider, { t, locale: "en" }, createElement(AsyncGreeting)));

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
    }) as any;
  }

  const Provider = TranslationProvider as any;

  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    TranslationNode.t = null as never;
    TranslationNode.setLocale = setClientLocale; // pin the react setter: sibling test files (next) share this global
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    TranslationNode.locale = undefined as never;
    TranslationNode.source = undefined as never;
    TranslationNode.t = null as never;
  });

  // The provider renders with the locale it is given on mount.
  it("renders children in the locale given by the `locale` prop", () => {
    const t = makeT();
    function Msg() {
      return createElement("output", { "data-testid": "m" }, String(useTranslation.call(t, "common.hello", { name: "Ada" })));
    }
    const view = render(createElement(Provider, { t, locale: "es" }, createElement(Msg)));
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
    function App({ locale }: { locale: string }) {
      return createElement(Provider, { t, locale }, createElement(Msg));
    }
    const view = render(createElement(App, { locale: "en" }));
    expect(view.getByTestId("m").textContent).toBe("Hello Ada");

    view.rerender(createElement(App, { locale: "es" }));
    expect(view.getByTestId("m").textContent).toBe("Hola Ada");
  });

  // A consumer inside the provider drives the locale, provider + siblings follow.
  it("updates all consumers when one changes the locale through the provider", () => {
    const t = makeT();
    let api: any;
    function Driver() {
      api = useLocale();
      return createElement("output", { "data-testid": "d" }, String(api.locale));
    }
    function Watcher() {
      const l = useLocale();
      return createElement("output", { "data-testid": "w" }, String(l.locale));
    }
    const view = render(createElement(Provider, { t }, createElement(Driver), createElement(Watcher)));

    act(() => api.setLocale("es"));

    expect(view.getByTestId("d").textContent).toBe("es");
    expect(view.getByTestId("w").textContent).toBe("es"); // shared through context
  });

  // ATTACK: onLocaleChange passed to the provider should fire when the locale changes.
  it("calls the provider's onLocaleChange when a consumer changes the locale", () => {
    const t = makeT();
    const onLocaleChange = mock((_: string) => {});
    let api: any;
    function Child() {
      api = useLocale();
      return null;
    }
    render(createElement(Provider, { t, onLocaleChange }, createElement(Child)));

    act(() => api.setLocale("es"));

    expect(onLocaleChange).toHaveBeenCalledWith("es");
  });

  // A nested provider without its own locale should share the outer provider's locale state.
  it("shares locale state with a nested provider that has no locale of its own", () => {
    const t = makeT();
    let outer: any;
    function Inner() {
      const l = useLocale();
      return createElement("output", { "data-testid": "inner" }, String(l.locale));
    }
    function Outer() {
      outer = useLocale();
      return createElement(Provider, { t }, createElement(Inner));
    }
    const view = render(createElement(Provider, { t }, createElement(Outer)));

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
    const view = render(createElement(Provider, { t }, createElement(UI)));
    expect(view.getByTestId("msg").textContent).toBe("Hello Ivan");

    fireEvent.click(view.getByRole("button", { name: "switch" }));
    expect(view.getByTestId("msg").textContent).toBe("Hola Ivan");
  });
});
