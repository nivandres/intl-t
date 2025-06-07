import "../react/translation";
import { TranslationNode } from "../core/translation";
import { TranslationProvider, getTranslation } from "./rsc";
import { isRSC } from "./state";
import type { TranslationFC } from "../types";
import { getCachedRequestLocale, setCachedRequestLocale } from "./cache";

if (isRSC) {
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = getTranslation;
  TranslationNode.setLocale = setCachedRequestLocale as any;
  TranslationNode.getLocale = getCachedRequestLocale;
}

export { createTranslation, Translation, TranslationNode } from "../core/translation";
export { getLocales } from "../core/dynamic";
