"use client";

import { createElement, createContext, useContext, useMemo, useState, useEffect } from "react";
import { isArray, SearchWays, ArrayToString, ReactState, Locale, TranslationProps as TP } from "../types";
import { useLocale } from "./hooks";
import { createTranslation, TranslationNode } from "./translation";

export type TranslationContext = null | {
  reRender?: (arg: any) => void;
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
  source,
  variables,
  settings,
  ...state
}: TranslationProps<T, A, D>) {
  const context = useContext(TranslationContext) || {};
  settings = useMemo(() => (typeof settings === "string" ? JSON.parse(settings) : settings), [settings]);
  context.t ??= t || useMemo(() => createTranslation(settings), [settings]);
  t ??= context.t as T;
  context.reRender ??= useState(0)[1];
  useMemo(() => Object.assign(t.settings, settings, state), [settings, t, state]);
  if (locale || onLocaleChange) context.localeState = [locale!, onLocaleChange!];
  else context.localeState ??= useLocale.call(t, locale);
  t.settings.locale = context.localeState[0];
  t = t.current(path);
  useMemo(() => {
    t.setSource(source);
  }, [source]);
  useEffect(() => {
    t.then?.(context.reRender);
  }, []);
  variables && t.set(variables);
  return children ? createElement(TranslationContext, { value: context }, children) : t.base;
}

export default TranslationProvider;

export const T = TranslationProvider;

export const Trans = T;
export const Tr = T;

export function useTranslation(...args: any[]) {
  const context = useContext(TranslationContext);
  // @ts-ignore-error optional binding
  let t = this || context.t;
  if (!t) throw new Error("Translation not found");
  t.settings.locale = (context?.localeState || useLocale.call(t))[0];
  t = t.current;
  const reRender = context?.reRender || useState(0)[1];
  useEffect(() => {
    t.then?.(reRender);
  }, [t]);
  return t(...args);
}
