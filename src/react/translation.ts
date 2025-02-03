import { createTranslation as ct, TranslationPlugin } from "../core";
import { useTranslation, TranslationProvider } from "./context";
import { useLocale } from "./hooks";
import { injectReactChunks as ir } from "./inject";
import { injectVariables as iv } from "../tools/inject";
import { hidratation } from "../state";

export const reactPlugin: TranslationPlugin = (n: any) => {
  n.useTranslation = useTranslation.bind(n);
  n.Translation = TranslationProvider.bind(n);
  n.useLocale = useLocale;
  n.Tr = n.Translation;
  return n;
};

export const createTranslation: typeof ct = settings => {
  return ct({
    hidratation,
    ...settings,
    plugins: [...(settings?.plugins ?? []), reactPlugin],
    injectVariables(text, variables) {
      return ir(iv(text, variables), variables);
    },
  });
};
