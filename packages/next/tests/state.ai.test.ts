// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { LOCALE_CLIENT_KEY } from "@intl-t/react";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getLocale, isRSC, setLocale } from "../src/state";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");
// next/server relies on the runtime fetch primitives, which happy-dom would replace
const nativeFetchPrimitives = { fetch, Headers, Request, Response, URL, URLSearchParams };

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
  Object.assign(globalThis, nativeFetchPrimitives);
}

describe("next state client", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/es/dashboard");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("reads and writes the locale through the client helpers in the current environment", () => {
    const binding = { settings: { locale: "en" } };

    localStorage.setItem(LOCALE_CLIENT_KEY, "es");

    expect(isRSC).toBe(false);
    expect(getLocale.call(binding, false)).toBe("es");
    expect(binding.settings.locale).toBe("es");

    expect(setLocale.call(binding, "fr")).toBe("fr");
    expect(localStorage.getItem(LOCALE_CLIENT_KEY)).toBe("fr");
    expect(binding.settings.locale).toBe("fr");
  });
});
