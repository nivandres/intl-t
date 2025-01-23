import { createTranslation as ct, TranslationPlugin } from "../core";
import { useTranslation, TranslationProvider } from "./context";
import { injectVariables as iv } from "../tools/inject";
import { injectReactChunks as ir } from "./inject";

export const reactPlugin: TranslationPlugin = (n: any) => {
  n.useTranslation = useTranslation.bind(n);
  n.Translation = TranslationProvider.bind(n);
  n.T = n.Translation;
  n.setLang = (...args: any[]) => n.p.setLang(...args);
  return n;
};

export const createTranslation: typeof ct = settings => {
  const t = ct({
    ...settings,
    plugins: [...(settings.plugins ?? []), reactPlugin],
    injectVariables(text, variables) {
      return ir(iv(text, variables), variables);
    },
  });
  return t;
};
