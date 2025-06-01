import "../react/translation";
import { TranslationNode } from "../core/translation";
import { Translation, getTranslation } from "./rsc";
import { isRSC } from "./state";
import { TranslationFC } from "../types";

if (isRSC) {
  TranslationNode.Provider = Translation as TranslationFC;
  TranslationNode.hook = getTranslation;
}

export { createTranslation, TranslationNode } from "../core/translation";
