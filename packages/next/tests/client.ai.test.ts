// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { LOCALE_CLIENT_KEY } from "@intl-t/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { getClientLocationLocale, getLocaleFromClient, setClientLocationLocale, setLocaleFromClient } from "../src/client";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");
// next/server relies on the runtime fetch primitives, which happy-dom would replace
const nativeFetchPrimitives = { fetch, Headers, Request, Response, URL, URLSearchParams };

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
  Object.assign(globalThis, nativeFetchPrimitives);
}

// the default happy-dom URL is about:blank, where location-based helpers cannot resolve paths
const happyDOM: { setURL(url: string): void } = Reflect.get(window, "happyDOM");

function setLocationPathname(pathname: string) {
  happyDOM.setURL(`https://intl-t.dev${pathname}`);
}

const headersSnapshot = { ...(await import("next/headers")) };

mock.module("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => new Headers(),
}));

afterAll(() => {
  mock.module("next/headers", () => headersSnapshot);
  happyDOM.setURL("about:blank");
});

describe("next client locale helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    setLocationPathname("/es/dashboard");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
  });

  it("reads the locale from the location pathname", () => {
    expect(getClientLocationLocale(["en", "es"])).toBe("es");
  });

  it("reads the location locale from the bound translation settings", () => {
    const binding = { settings: { allowedLocales: ["en", "es"] } };

    expect(getClientLocationLocale.call(binding)).toBe("es");
  });

  it("keeps the raw pathname locale when no allowed locales are configured", () => {
    expect(getClientLocationLocale()).toBe("es");
  });

  it("ignores pathname locales outside the allowed list", () => {
    setLocationPathname("/de/dashboard");

    expect(getClientLocationLocale(["en", "es"])).toBeUndefined();
  });

  it("rewrites the location pathname when setting the location locale", () => {
    setLocationPathname("/dashboard");

    expect(setClientLocationLocale("fr")).toBe("fr");
    expect(window.location.pathname).toBe("/fr/dashboard");
  });

  it("replaces an existing locale prefix instead of stacking a second one", () => {
    setLocationPathname("/es/dashboard");
    const binding = { settings: { locale: "es", allowedLocales: ["en", "es", "fr"] } };

    expect(setClientLocationLocale.call(binding, "fr")).toBe("fr");
    expect(window.location.pathname).toBe("/fr/dashboard"); // never /fr/es/dashboard
  });

  it("prefixes an unprefixed pathname when bound to a configured translation", () => {
    setLocationPathname("/dashboard");
    const binding = { settings: { locale: "en", allowedLocales: ["en", "es", "fr"] } };

    expect(setClientLocationLocale.call(binding, "fr")).toBe("fr");
    expect(window.location.pathname).toBe("/fr/dashboard");
  });

  it("keeps the pathname stable when setting the locale it already carries", () => {
    setLocationPathname("/es/dashboard");
    const binding = { settings: { locale: "es", allowedLocales: ["en", "es", "fr"] } };

    expect(setClientLocationLocale.call(binding, "es")).toBe("es");
    expect(window.location.pathname).toBe("/es/dashboard");
  });

  it("prefers the stored client locale over the request action", () => {
    const binding = { settings: { locale: "en", allowedLocales: ["en", "es"] } };
    localStorage.setItem(LOCALE_CLIENT_KEY, "es");

    expect(getLocaleFromClient.call(binding)).toBe("es");
    expect(binding.settings.locale).toBe("es");
  });

  it("falls back to the request action when no client locale is stored", async () => {
    // an empty allowed list disables client detection, and the mocked request stores are empty
    const binding = { settings: { locale: "en", allowedLocales: [] } };

    expect(await getLocaleFromClient.call(binding)).toBeUndefined();
  });

  it("stores the locale without reloading when reload is disabled", () => {
    setLocationPathname("/dashboard");
    const binding = { settings: { locale: "en", allowedLocales: ["en", "es"] } };

    expect(setLocaleFromClient.call(binding, "es", false)).toBe("es");
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBe("es");
    expect(window.location.pathname).toBe("/dashboard");
    expect(binding.settings.locale).toBe("es");
  });

  it("rewrites the location when the locale is stored with reload enabled", () => {
    setLocationPathname("/dashboard");
    const binding = { settings: { locale: "en", allowedLocales: ["en", "es"] } };

    expect(setLocaleFromClient.call(binding, "es")).toBe("es");
    expect(window.location.pathname).toBe("/es/dashboard");
  });
});
