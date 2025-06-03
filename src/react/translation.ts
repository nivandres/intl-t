import "./patch";
import { TranslationNode } from "../core/translation";
import { injectVariables as iv } from "../tools/inject";
import { injectReactChunks as ir } from "./inject";
import { TranslationProvider, useTranslation } from "./context";
import { TranslationFC } from "./types";

export const injectVariables = ((str: string, ...args: any[]) => ir(iv(str, ...args), ...args)) as typeof iv;

TranslationNode.injectVariables = injectVariables;
TranslationNode.Provider = TranslationProvider as TranslationFC;
TranslationNode.hook = useTranslation;

export { createTranslation, Translation, TranslationNode } from "../core/translation";
