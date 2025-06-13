"use client";

import { createElement, createContext, useContext, useMemo, useState, useEffect } from "react";
import type { isArray, SearchWays, ArrayToString, ReactState, ReactSetState, Locale, TranslationProps as TP } from "../types";
import type { GlobalTranslation } from "../global";
import { useLocale } from "./hooks";
import { TranslationNode } from "./translation";

export type TranslationContext = null | {
  reRender?: ReactSetState<number>;
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
  messages,
  source = messages,
  variables,
  settings,
  ...state
}: TranslationProps<T, A, D>) {
  const context = useContext(TranslationContext) || {};
  context.t = t ??= context.t ??= TranslationNode.t as any;
  context.reRender ??= useState(0)[1];
  if (locale || onLocaleChange) context.localeState = [locale!, onLocaleChange!];
  else (context.localeState ??= useLocale.call(t, locale)), (locale = context.localeState[0]!);
  children &&= createElement(TranslationContext, { value: context }, children as any);
  if (!t) return (TranslationNode.context = { locale, source }), children;
  t.settings.locale = locale!;
  useMemo(() => Object.assign(t.settings, settings, state), [settings, t, state]);
  t = t.current(path as any) as any;
  useMemo(() => {
    t.setSource(source);
  }, [t, source]);
  useEffect(() => {
    t.then?.(() => context.reRender?.(p => p + 1));
  }, [t, t.currentLocale]);
  variables && t.set(variables);
  return children || t.base;
}
export default TranslationProvider;
export const T = TranslationProvider;
export { T as Trans, T as Tr };

export const useTranslation = function (...args: any[]) {
  const context = useContext(TranslationContext) || {};
  // @ts-ignore-error optional binding
  let t = this || (context.t ||= TranslationNode.t);
  if (!t) throw new Error("Translation not found");
  context.t ||= t;
  t.settings.locale = (context.localeState ||= useLocale.call(t))[0];
  t = t.current;
  context.reRender ||= useState(0)[1];
  useEffect(() => {
    t.then?.(() => context.reRender?.(p => p + 1));
  }, [t]);
  return t(...args);
} as GlobalTranslation;

export { useTranslation as useTranslations };
