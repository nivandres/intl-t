import { TranslationProvider, getTranslation } from "@intl-t/next/rsc";
import { getLocale, setLocale } from "@intl-t/next/state";
import { isRSC } from "@intl-t/next/state";
import { createTranslation as ct, Translation as T, TranslationNode, wire as reactWire } from "@intl-t/react/translation";
import type { TranslationFC } from "@intl-t/react/types";

let wired = false;
export function wire() {
  if (wired) return;
  wired = true;
  reactWire();
  if (isRSC) {
    TranslationNode.Provider = TranslationProvider as TranslationFC;
    TranslationNode.hook = getTranslation;
  }
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

export { TranslationNode, injectReactChunks } from "@intl-t/react";
export default TranslationNode;
export { loadLocales as getLocales } from "@intl-t/core/dynamic";
