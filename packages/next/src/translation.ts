import { TranslationProvider, getTranslation } from "@intl-t/next/rsc";
import { getLocale, setLocale } from "@intl-t/next/state";
import { isRSC } from "@intl-t/next/state";
import { TranslationNode, type TranslationFC } from "@intl-t/react";
import "./patch";

if (isRSC) {
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = getTranslation;
}
TranslationNode.setLocale = setLocale;
TranslationNode.getLocale = getLocale;

export { createTranslation, Translation, TranslationNode } from "@intl-t/react";
export default TranslationNode;
export { loadLocales as getLocales } from "@intl-t/core/dynamic";
