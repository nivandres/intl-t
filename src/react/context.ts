"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { createElement } from "./patch";
import { isArray, SearchWays, ArrayToString, ReactState, Locale, TranslationProps as TP } from "../types";
import { useLocale } from "./hooks";
import { createTranslation, TranslationNode } from "./translation";

export type TranslationContext = null | {
  localeState?: ReactState<Locale>;
  t?: TranslationNode;
};

export const TranslationContext = createContext<TranslationContext>(null);

interface TranslationProps<T extends TranslationNode, A extends string[] = string[], D extends string = string>
  extends TP<T["settings"], T["node"], T["values"], A, D> {
  t?: T;
}

export { TranslationProps as TranslationProviderProps };

export function TranslationProvider<
  T extends TranslationNode,
  A extends isArray<SearchWays<T>>,
  D extends ArrayToString<A, T["settings"]["ps"]>,
>({
  // @ts-ignore-error optional binding
  t = this,
  onLocaleChange,
  locale,
  children,
  i18nKey,
  id = i18nKey,
  path = id,
  variables,
  source,
  deep,
  settings,
  ...state
}: TranslationProps<T, A, D>) {
  const context = useContext(TranslationContext) || {};
  settings = useMemo(() => (typeof settings === "string" ? JSON.parse(settings) : settings), [settings]);
  context.t ??= t || useMemo(() => createTranslation(settings), [settings]);
  t ??= context.t as T;
  useMemo(() => Object.assign(t.settings, settings, state), [settings, t, state]);
  useMemo(
    () => source && (source instanceof TranslationNode && (source = source.getSource(deep) as any), t.addSource(source)),
    [source, t, deep],
  );
  if (locale && onLocaleChange) return (context.localeState = [locale, onLocaleChange]), locale;
  context.localeState ??= useLocale.call(t, locale);
  variables && t.set(variables);
  t = t[context.localeState[0] as any](path);
  return children ? createElement(TranslationContext, { value: context }, children) : t.base;
}

export default TranslationProvider;

export const T = TranslationProvider;

export const Trans = T;
export const Tr = T;

export function useTranslation(...args: any[]) {
  const context = useContext(TranslationContext);
  // @ts-ignore-error optional binding
  const t = this || context.t;
  if (!t) throw new Error("Translation not found");
  const locale = (context?.localeState || useLocale.call(t))[0];
  return t[locale](...args);
}
