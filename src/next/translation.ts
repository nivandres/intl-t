import "./patch";
import { TranslationNode } from "../react/translation";
import { TranslationProvider, getTranslation } from "./rsc";
import { isRSC } from "./state";
import type { TranslationFC } from "../types";
import { getCachedRequestLocale } from "./cache";
import { setRequestLocale } from "./request";

if (isRSC) {
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = getTranslation;
  TranslationNode.setLocale = setRequestLocale as any;
  TranslationNode.getLocale = getCachedRequestLocale;
}

export { createTranslation, Translation, TranslationNode } from "../react/translation";
export default TranslationNode;
export { getLocales } from "../core/dynamic";
