// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { LOCALE_CLIENT_KEY } from "@intl-t/react";
import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getClientLocale, setClientLocale } from "../src/client";
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
  document.body.innerHTML = "";
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  TranslationNode.locale = undefined as never;
  TranslationNode.source = undefined as never;
  TranslationNode.t = null as never;
});

describe("react client helpers", () => {
  it("resolves the locale from storage and syncs translation settings", () => {
    const t = createReactTranslation();

    localStorage.setItem(LOCALE_CLIENT_KEY, "es");

    expect(getClientLocale.call(t)).toBe("es");
    expect(t.settings.locale).toBe("es");
  });

  it("stores the locale under the provided key", () => {
    const t = createReactTranslation();

    expect(setClientLocale.call(t, "es", "LOCALE/admin")).toBe("es");
    expect(localStorage.getItem("LOCALE/admin")).toBe("es");
    expect(t.settings.locale).toBe("es");
  });
});
