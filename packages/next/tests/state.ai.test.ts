// AI generated test
import { LOCALE_CLIENT_KEY } from "@intl-t/react";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getLocale, isRSC, setLocale } from "../src/state";
import { useDom } from "./dom";

useDom();

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
