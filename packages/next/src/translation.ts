import { TranslationNode, type TranslationFC } from "@intl-t/react";
import { getCachedRequestLocale } from "./cache";
import "./patch";
import { setRequestLocale } from "./request";
import { TranslationProvider, getTranslation } from "./rsc";
import { isRSC } from "./state";

if (isRSC) {
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = getTranslation;
  TranslationNode.setLocale = setRequestLocale as any;
  TranslationNode.getLocale = getCachedRequestLocale;
}

export { createTranslation, Translation, TranslationNode } from "@intl-t/react";
export default TranslationNode;
export { getLocales } from "@intl-t/core/dynamic";
