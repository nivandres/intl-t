import React, { useContext, useEffect } from "react";
import { TranslationNode, Values, SearchWays, ArrayToString, isArray, FollowWayWithValues } from "../core";
import "./types";

type TranslationContext<T extends TranslationNode = TranslationNode> = null | {
  t: T;
  node: T["node"];
  lang: T["locale"];
  setLang: React.Dispatch<React.SetStateAction<T["settings"]["allowedLocale"]>>;
  variables: Values;
};

export const TranslationContext = React.createContext<TranslationContext>(null);

export interface TranslationProps<
  T extends TranslationNode = TranslationNode,
  A extends isArray<SearchWays<T["node"]>> = isArray<SearchWays<T["node"]>>
> {
  t?: T;
  locale?: T["locale"];
  path?: A | ArrayToString<A, T["settings"]["ps"]>;
  children?: React.ReactNode;
  variables?: Partial<FollowWayWithValues<T["node"], A>> & Values;
  source?: T["node"];
  isolatedLocale?: T["locale"] | boolean;
}

export function TranslationProvider<T extends TranslationNode>({
  // @ts-expect-error no this type declaration
  t = this,
  isolatedLocale,
  locale = typeof isolatedLocale === "string" ? isolatedLocale : undefined,
  children,
  path,
  variables,
}: TranslationProps<T>) {
  const context = useContext(TranslationContext);
  t ??= context?.t as any;
  const [lang, setLang] =
    context && !isolatedLocale ? [locale ?? context.lang, context.setLang] : React.useState(locale ?? t.lang);
  t.setLang = setLang;
  t = t[lang] as any;
  if (path) t = t.get(path as any) as any;
  if (variables) t = t.use(variables) as any;
  if (!children) return t.base;
  return React.createElement(
    TranslationContext.Provider,
    { value: { t, node: t.node, lang, setLang, variables: variables as any } },
    children
  );
}
export const Translation = TranslationProvider;
export const T = TranslationProvider;

export const useTranslation: TranslationNode["get"] = (...args: any[]) => {
  const context = useContext(TranslationContext);
  // @ts-expect-error no this type declaration
  const t = this?.t ?? context?.t;
  if (!t) throw new Error("Translation not found");
  return t.get(...args);
};
export const useTranslations = useTranslation as TranslationNode["get"];
