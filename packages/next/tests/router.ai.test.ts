// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement } from "react";
import { createTranslation, TranslationNode } from "../src/translation";
import messages from "./fixtures/messages.json";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
}

function createNextTranslation() {
  return createTranslation({
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

const calls = {
  push: [] as Array<[string, Record<string, unknown>]>,
  replace: [] as Array<[string, Record<string, unknown>]>,
  prefetch: [] as Array<[string, Record<string, unknown>]>,
};

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: (href: string, options: Record<string, unknown> = {}) => {
      calls.push.push([href, options]);
    },
    replace: (href: string, options: Record<string, unknown> = {}) => {
      calls.replace.push([href, options]);
    },
    prefetch: (href: string, options: Record<string, unknown> = {}) => {
      calls.prefetch.push([href, options]);
      return Promise.resolve();
    },
  }),
  usePathname: () => "/en/dashboard",
}));

const { usePathname, useRouter } = await import("../src/router");

describe("next router", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    calls.push.length = 0;
    calls.replace.length = 0;
    calls.prefetch.length = 0;
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

  it("resolves the pathname without the locale prefix", () => {
    expect(usePathname()).toBe("/dashboard");
  });

  it("localizes push, replace and prefetch while preserving router options", async () => {
    const router = useRouter.bind({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "default",
    })();

    router.push("/profile", { locale: "es", scroll: false } as never);
    router.replace("/settings", { locale: "en" } as never);
    await router.prefetch("/billing", { locale: "es" } as never);

    expect(calls.push).toEqual([["/es/profile", { scroll: false }]]);
    expect(calls.replace).toEqual([["/settings", {}]]);
    expect(calls.prefetch).toEqual([["/es/billing", {}]]);
  });

  it("exposes the localized pathname getter", () => {
    const router = useRouter.bind({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "default",
    })();

    expect(router.pathname).toBe("/dashboard");
  });

  it("exposes the current locale getter", () => {
    const t = createNextTranslation();
    const Provider = t.TranslationProvider as any;

    function Probe() {
      const router = useRouter.bind({
        allowedLocales: ["en", "es"],
        defaultLocale: "en",
        pathPrefix: "default",
      })();

      return createElement("output", { "data-testid": "locale" }, String(router.locale));
    }

    const view = render(createElement(Provider, { t }, createElement(Probe)));

    expect(view.getByTestId("locale").textContent).toBe("en");
  });
});
