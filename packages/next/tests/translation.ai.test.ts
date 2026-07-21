// AI generated test
import { getLocale as getNextLocale, setLocale as setNextLocale } from "@intl-t/next/state";
import { createTranslation, Translation, TranslationNode as WiredNode } from "@intl-t/next/translation";
import { TranslationProvider as ReactProvider, useTranslation as reactUseTranslation } from "@intl-t/react/context";
import { afterAll, describe, expect, it, mock } from "bun:test";
import { getTranslation as rscGetTranslation, TranslationProvider as RscProvider } from "../src/rsc";
import nextTranslation, { TranslationNode } from "../src/translation";

const stateSnapshot = { ...(await import("../src/state")) };

afterAll(() => {
  mock.module("@intl-t/next/state", () => stateSnapshot);
});

describe("next translation module", () => {
  it("exports the next translation node as the default export", () => {
    expect(nextTranslation).toBe(TranslationNode);
  });
});

describe("next translation wiring", () => {
  it("createTranslation keeps the next locale bindings after chaining the react wire", () => {
    createTranslation({ locales: { en: { hi: "hi" } } });
    // the react wire runs first as the base; the next bindings must win
    expect(WiredNode.setLocale).toBe(setNextLocale);
    expect(WiredNode.getLocale).toBe(getNextLocale);
  });

  it("keeps the react rendering bindings on the client environment", () => {
    createTranslation({ locales: { en: { hi: "hi" } } });
    expect<unknown>(WiredNode.Provider).toBe(ReactProvider);
    expect(WiredNode.hook).toBe(reactUseTranslation);
    expect(typeof WiredNode.injectVariables).toBe("function");
  });

  it("new Translation wires the full chain, so the destructuring pattern works", () => {
    const { useTranslation, t } = new Translation({ locales: { en: { hi: "hi" } } });
    expect(typeof useTranslation).toBe("function");
    expect(String(t.hi)).toBe("hi");
    expect(WiredNode.setLocale).toBe(setNextLocale);
  });

  it("binds the RSC provider and hook when wiring in a server components environment", async () => {
    const previousProvider = WiredNode.Provider;
    const previousHook = WiredNode.hook;

    // isRSC is computed at module load, so wire a fresh translation module against
    // a react runtime without client hooks
    mock.module("@intl-t/next/state", () => ({ ...stateSnapshot, isRSC: true }));

    try {
      const fresh = await import("@intl-t/next/translation?rsc-environment");
      fresh.createTranslation({ locales: { en: { hi: "hi" } } });

      expect<unknown>(WiredNode.Provider).toBe(RscProvider);
      expect(WiredNode.hook).toBe(rscGetTranslation);
      expect(WiredNode.setLocale).toBe(setNextLocale);
      expect(WiredNode.getLocale).toBe(getNextLocale);

      // constructing through the proxy re-wires on demand as well
      const { t } = new fresh.Translation({ locales: { en: { hi: "hi" } } });
      expect(String(t.hi)).toBe("hi");
    } finally {
      WiredNode.Provider = previousProvider;
      WiredNode.hook = previousHook;
      mock.module("@intl-t/next/state", () => stateSnapshot);
    }
  });
});
