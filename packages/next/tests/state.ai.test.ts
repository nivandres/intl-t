// AI generated test
import { beforeEach, describe, expect, it } from "bun:test";
import { getLocale, isRSC, setLocale } from "../src/state";

describe("next state client", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/es/dashboard");
  });

  it("reads and writes the locale through the client helpers in the current environment", () => {
    const binding = { settings: { locale: "en" } };

    localStorage.setItem("LOCALE", "es");

    expect(isRSC).toBe(false);
    expect(getLocale.call(binding, false)).toBe("es");
    expect(binding.settings.locale).toBe("es");

    expect(setLocale.call(binding, "fr")).toBe("fr");
    expect(localStorage.getItem("LOCALE")).toBe("fr");
    expect(binding.settings.locale).toBe("fr");
  });
});
