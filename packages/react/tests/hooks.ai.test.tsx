// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
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

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
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

describe("react hooks DOM", () => {
  it("reads a path-scoped persisted locale when hydration is disabled", () => {
    const t = createReactTranslation();

    window.history.replaceState({}, "", "/en/dashboard");
    localStorage.setItem("LOCALE/admin", "es");

    function Probe() {
      const locale = useLocale.call(t, undefined, { hydration: false, path: "/admin" });
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
    expect(localStorage.getItem("LOCALE")).toBe("es");
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

    localStorage.setItem("LOCALE", "en");

    function Probe() {
      const locale = useLocale.call(t, "en", { hydration: false });
      return <output data-testid="locale">{String(locale)}</output>;
    }

    const view = render(<Probe />);

    expect(view.container.querySelector('[data-testid="locale"]')?.textContent).toBe("en");
  });

  it("hydrates from persisted storage when no default locale is provided", async () => {
    const t = createReactTranslation();

    localStorage.setItem("LOCALE", "es");

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
