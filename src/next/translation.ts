import "../react/translation";
import { TranslationNode } from "../core/translation";
import { Translation, getTranslation } from "./rsc";
import { isRSC } from "./state";
import type { TranslationFC } from "../types";
import { setCachedRequestLocale } from "./cache";

if (isRSC) {
  TranslationNode.Provider = Translation as TranslationFC;
  TranslationNode.hook = getTranslation;
  TranslationNode.setLocale = setCachedRequestLocale as any;
}

export { createTranslation, TranslationNode } from "../core/translation";
