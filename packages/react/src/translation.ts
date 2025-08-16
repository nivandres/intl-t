import { TranslationNode } from "@intl-t/core";
import { injectVariables as iv } from "@intl-t/format";
import { hydration } from "@intl-t/global";
import { getClientLocale } from "./client";
import { TranslationProvider, useTranslation } from "./context";
import { injectReactChunks as ir } from "./inject";
import "./patch";
import { TranslationFC } from "./types";

export const injectVariables = ((str: string, ...args: any[]) => ir(iv(str, ...args), ...args)) as typeof iv;

TranslationNode.injectVariables = injectVariables;
TranslationNode.Provider = TranslationProvider as TranslationFC;
TranslationNode.hook = useTranslation;
!hydration && (TranslationNode.getLocale = getClientLocale);

export { createTranslation, Translation, TranslationNode } from "@intl-t/core";
export default TranslationNode;
export { getLocales } from "@intl-t/core/dynamic";
