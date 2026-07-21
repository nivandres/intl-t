import { createTranslation as ct, Translation as T, TranslationNode } from "@intl-t/core";
import { injectVariables as iv } from "@intl-t/format/inject";
import { getLocale, setLocale } from "@intl-t/react/client";
import { TranslationProvider, useTranslation } from "@intl-t/react/context";
import { injectReactChunks as ir } from "@intl-t/react/inject";
import { patch } from "@intl-t/react/patch";
import type { TranslationFC } from "@intl-t/react/types";

export const injectVariables = ((str: string, ...args: any[]) => ir(iv(str, ...args), ...args)) as typeof iv;

let wired = false;
export function wire() {
  if (wired) return;
  wired = true;
  patch();
  TranslationNode.injectVariables = injectVariables;
  TranslationNode.Provider = TranslationProvider as TranslationFC;
  TranslationNode.hook = useTranslation;
  TranslationNode.setLocale = setLocale;
  TranslationNode.getLocale = getLocale;
}

export const createTranslation = ((settings: any) => {
  wire();
  return ct(settings);
}) as typeof ct;

export const Translation = new Proxy(TranslationNode, {
  construct: (...args) => (wire(), Reflect.construct(...args)),
}) as typeof T;

export { TranslationNode };
export { injectReactChunks } from "@intl-t/react/inject";
export default TranslationNode;
export { loadLocales as getLocales } from "@intl-t/core/dynamic";
