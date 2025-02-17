import { createTranslation as ct, TranslationPlugin } from "../core";
import { useTranslation, TranslationProvider } from "./context";
import { injectVariables as iv } from "../tools/inject";
import { injectReactChunks as ir } from "./inject";
import { getClientLocale } from "./client";
import { hidratation } from "../state";
import { useLocale } from "./hooks";

export const reactPlugin: TranslationPlugin = (n: any) => {
  n.Translation = TranslationProvider.bind(n);
  n.Tr = n.Translation;
  n.useTranslation = useTranslation.bind(n);
  n.getTranslation = n.useTranslation;
  n.useLocale = useLocale.bind(n);
  n.getLocale = getClientLocale;
  return n;
};

export const injectVariables = (str: string, ...args: any[]) => ir(iv(str, ...args), ...args);

export const createTranslation: typeof ct = settings => {
  return ct({
    hidratation,
    injectVariables,
    ...settings,
    plugins: [reactPlugin, ...(settings?.plugins ?? [])],
  });
};
