import { Translation, getTranslation } from "./rsc";
import { createTranslation as ct } from "../core";
import { injectVariables, reactPlugin } from "../react";
import { getRequestLocale } from "./request";
import { isClient, isRSC } from "./state";

export { getTranslation };

export function nextPlugin(n: any) {
  if (isRSC) {
    n.Translation = Translation.bind(n);
    n.Tr = n.Translation;
    n.getTranslation = getTranslation.bind(n);
    n.useTranslation = n.getTranslation;
    n.getLocale = getRequestLocale;
    n.useLocale = n.getLocale;
  } else reactPlugin(n);
  return n;
}

export const createTranslation: typeof ct = settings => {
  return ct({
    hidratation: true,
    injectVariables,
    origin: isClient ? globalThis.t?.settings.origin : undefined,
    ...settings,
    plugins: [nextPlugin, ...(settings?.plugins ?? [])],
  });
};
