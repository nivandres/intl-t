// AI generated test
import { TranslationProvider, useTranslation } from "@intl-t/react/context";
import { createElement as patchedCreateElement, patch } from "@intl-t/react/patch";
import { createTranslation, Translation, TranslationNode } from "@intl-t/react/translation";
import { describe, expect, it } from "bun:test";
import React from "react";

describe("react translation wiring", () => {
  it("createTranslation wires the react bindings onto TranslationNode", () => {
    createTranslation({ locales: { en: { hi: "hi" } } });
    expect<unknown>(TranslationNode.Provider).toBe(TranslationProvider);
    expect<unknown>(TranslationNode.hook).toBe(useTranslation);
    expect(typeof TranslationNode.injectVariables).toBe("function");
    expect(typeof TranslationNode.setLocale).toBe("function");
    expect(typeof TranslationNode.getLocale).toBe("function");
  });

  it("new Translation wires too, so the destructuring pattern works", () => {
    const { useTranslation: hook, t } = new Translation({ locales: { en: { hi: "hi" } } });
    expect(typeof hook).toBe("function");
    expect(String(t.hi)).toBe("hi");
  });

  it("new Translation keeps the class identity through the construct wrapper", () => {
    const t = new Translation({ locales: { en: { hi: "hi" } } });
    expect<unknown>(t.translationNode).toBe(t);
    // `t instanceof Translation` itself is rejected by the compiler: TranslationType
    // intersects Content<N> (string | number), so the left-hand side is partly primitive.
    expect(t.translationNode instanceof Translation).toBe(true);
  });

  it("wiring patches this React instance and the per-instance guard holds", () => {
    createTranslation({ locales: { en: { hi: "hi" } } });
    expect<unknown>(React.createElement).toBe(patchedCreateElement); // ours is installed
    expect(patch()).toBe(false); // already ours: identity guard
  });

  it("forcePatch reapplies over an already patched instance", () => {
    createTranslation({ locales: { en: { hi: "hi" } } });
    expect(patch(undefined, undefined, undefined, true)).toBe(true);
    expect(patch()).toBe(false);
  });
});
