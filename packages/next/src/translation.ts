import { TranslationNode, type TranslationFC } from "@intl-t/react";
import "./patch";
import { TranslationProvider, getTranslation } from "./rsc";
import { getLocale, setLocale } from "./state";
import { isRSC } from "./state";

if (isRSC) {
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = getTranslation;
}
TranslationNode.setLocale = setLocale;
TranslationNode.getLocale = getLocale;

export { createTranslation, Translation, TranslationNode } from "@intl-t/react";
export default TranslationNode;
export { getLocales } from "@intl-t/core/dynamic";
