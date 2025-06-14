import "./patch";
import { TranslationNode } from "../core/translation";
import { injectVariables as iv } from "../tools/inject";
import { injectReactChunks as ir } from "./inject";
import { TranslationProvider, useTranslation } from "./context";
import { TranslationFC } from "./types";
import { getClientLocale } from "./client";
import { hydration } from "../state";

export const injectVariables = ((str: string, ...args: any[]) => ir(iv(str, ...args), ...args)) as typeof iv;

TranslationNode.injectVariables = injectVariables;
TranslationNode.Provider = TranslationProvider as TranslationFC;
TranslationNode.hook = useTranslation;
!hydration && (TranslationNode.getLocale = getClientLocale);

export { createTranslation, Translation, TranslationNode } from "../core/translation";
export { default } from "../core/translation";
export { getLocales } from "../core/dynamic";
