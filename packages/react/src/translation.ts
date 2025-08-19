import { TranslationNode } from "@intl-t/core";
import { injectVariables as iv } from "@intl-t/format";
import { hydration } from "@intl-t/global";
import { getClientLocale } from "@intl-t/react/client";
import { TranslationProvider, useTranslation } from "@intl-t/react/context";
import { injectReactChunks as ir } from "@intl-t/react/inject";
import "@intl-t/react/patch";
import { TranslationFC } from "@intl-t/react/types";

export const injectVariables = ((str: string, ...args: any[]) => ir(iv(str, ...args), ...args)) as typeof iv;

TranslationNode.injectVariables = injectVariables;
TranslationNode.Provider = TranslationProvider as TranslationFC;
TranslationNode.hook = useTranslation;
!hydration && (TranslationNode.getLocale = getClientLocale);

export { createTranslation, Translation, TranslationNode } from "@intl-t/core";
export default TranslationNode;
export { getLocales } from "@intl-t/core/dynamic";
