// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement } from "react";
import { createTranslation, TranslationNode } from "../src/translation";
import messages from "./fixtures/messages.json";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");
// next/server relies on the runtime fetch primitives, which happy-dom would replace
const nativeFetchPrimitives = { fetch, Headers, Request, Response, URL, URLSearchParams };

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
  Object.assign(globalThis, nativeFetchPrimitives);
}

const navigationSnapshot = { ...(await import("next/navigation")) };
const headersSnapshot = { ...(await import("next/headers")) };
const cacheSnapshot = { ...(await import("next/cache")) };

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
  });
}

const calls = {
  push: [] as Array<[string, Record<string, unknown>]>,
  replace: [] as Array<[string, Record<string, unknown>]>,
  prefetch: [] as Array<[string, Record<string, unknown>]>,
  refresh: 0,
};

const cookieStore = new Map<string, string>();
const refreshCalls: string[] = [];

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
    refresh: () => {
      calls.refresh++;
    },
  }),
  usePathname: () => "/en/dashboard",
}));

mock.module("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    get(key: string) {
      const value = cookieStore.get(key);
      return value ? { name: key, value } : undefined;
    },
    set(key: string, value: string) {
      cookieStore.set(key, value);
    },
  }),
}));

mock.module("next/cache", () => ({
  refresh: () => {
    refreshCalls.push("refresh");
  },
}));

const { usePathname, useRouter } = await import("../src/router");

afterAll(() => {
  mock.module("next/navigation", () => navigationSnapshot);
  mock.module("next/headers", () => headersSnapshot);
  mock.module("next/cache", () => cacheSnapshot);
});

describe("next router", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    calls.push.length = 0;
    calls.replace.length = 0;
    calls.prefetch.length = 0;
    calls.refresh = 0;
    cookieStore.clear();
    refreshCalls.length = 0;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    Reflect.deleteProperty(TranslationNode, "locale");
    Reflect.deleteProperty(TranslationNode, "source");
    TranslationNode.t = null;
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

    router.push("/profile", { locale: "es", scroll: false });
    router.replace("/settings", { locale: "en" });
    await router.prefetch("/billing", { locale: "es" });

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

  it("navigates through push when assigning the pathname", () => {
    const router = useRouter.bind({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "default",
      getLocale: () => "es",
    })();

    router.pathname = "/profile";

    expect(calls.push).toEqual([["/es/profile", {}]]);
  });

  it("exposes the current locale getter", () => {
    const t = createNextTranslation();
    const Provider = t.TranslationProvider;

    function Probe() {
      const router = useRouter.bind({
        allowedLocales: ["en", "es"],
        defaultLocale: "en",
        pathPrefix: "default",
      })();

      return createElement("output", { "data-testid": "locale" }, String(router.locale));
    }

    const view = render(createElement(Provider, null, createElement(Probe)));

    expect(view.getByTestId("locale").textContent).toBe("en");
  });

  it("persists the locale and refreshes the router when assigning the locale", async () => {
    // once the locale getter has been memoized it calls useLocale, so the
    // resolved router has to be created during a component render
    let router: ReturnType<typeof useRouter> | undefined;

    function Probe() {
      router = useRouter.bind({
        allowedLocales: ["en", "es"],
        defaultLocale: "en",
        pathPrefix: "default",
      })();
      return null;
    }

    render(createElement(Probe));
    if (!router) throw new Error("Expected the probe render to expose the router");

    router.locale = "es";

    expect(calls.refresh).toBe(1);
    await waitFor(() => expect(cookieStore.get("locale")).toBe("es"));
    expect(refreshCalls).toEqual(["refresh"]);
  });
});
