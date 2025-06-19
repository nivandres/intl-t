import "./patch";
import { TranslationNode } from "../react/translation";
import { TranslationProvider, getTranslation } from "./rsc";
import { isRSC } from "./state";
import type { TranslationFC } from "../types";
import { getRequestLocale, setRequestLocale } from "./request";

export { getRequestLocale as getLocale };
export { setRequestLocale as setLocale };

if (isRSC) {
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = getTranslation;
  TranslationNode.setLocale = setRequestLocale as any;
  TranslationNode.getLocale = getRequestLocale;
}

export { createTranslation, Translation, TranslationNode } from "../react/translation";
export default TranslationNode;
export { getLocales } from "../core/dynamic";
