import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createTranslation as ct, useLocale } from "../src";
import { TranslationProvider, TranslationContext, useTranslation } from "../src/context";
import messages from "./messages.json";

function render(node: any) {
  return renderToStaticMarkup(node);
}

describe("react context", () => {
  const originalLocation = globalThis.location;
  const originalStorage = globalThis.localStorage;

  beforeEach(() => {
    globalThis.location = { pathname: "/en/dashboard" } as never;
    globalThis.localStorage = {
      getItem: mock(() => null),
      setItem: mock(() => undefined),
    } as never;
  });

  afterEach(() => {
    globalThis.location = originalLocation;
    globalThis.localStorage = originalStorage;
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

    const markup = render(
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

    const markup = render(createElement(TranslationProvider as any, { t, locale: "en" }, createElement(Greeting)));

    expect(markup).toBe("hi Ada. This is Feature 2");
  });

  it("prefers the locale state provided by context", () => {
    let state: any;
    const setLocale = ((locale: any) => locale) as any;

    function Probe() {
      state = useLocale();
      return null;
    }

    render(
      <TranslationContext.Provider value={{ localeState: ["es", setLocale] as never }}>
        <Probe />
      </TranslationContext.Provider>,
    );

    expect(state?.[0]).toBe("es");
    expect(state?.[1]).toBe(setLocale);
  });

  it("reads persisted locale when hydration is disabled", () => {
    const getItem = mock((key: string) => (key === "LOCALE/admin" ? "es" : null));
    globalThis.localStorage = {
      getItem,
      setItem: mock(() => undefined),
    } as never;

    const t = ct({ locales: { en: messages, es: messages }, mainLocale: "en" }) as any;
    let state: any;

    function Probe() {
      state = useLocale.call(t, undefined, { hydration: false, path: "/admin" });
      return null;
    }

    render(<Probe />);

    expect(getItem).toHaveBeenCalledWith("LOCALE/admin");
    expect(state?.locale).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  it("falls back to the provided default locale when no persisted locale exists", () => {
    let state: any;

    function Probe() {
      state = useLocale("en", { hydration: false });
      return null;
    }

    render(<Probe />);

    expect(state?.locale).toBe("en");
  });
});
