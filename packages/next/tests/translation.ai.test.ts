// AI generated test
import { describe, expect, it } from "bun:test";
import { getLocale, isRSC, setLocale } from "../src/state";
import nextTranslation, { TranslationNode } from "../src/translation";

describe("next translation module", () => {
  it("exports the next translation node as the default export", () => {
    expect(nextTranslation).toBe(TranslationNode);
  });

  it("binds locale helpers from next state in the current non-RSC environment", () => {
    expect(isRSC).toBe(false);
    expect(TranslationNode.getLocale).toBe(getLocale);
    expect(TranslationNode.setLocale).toBe(setLocale);
  });
});
