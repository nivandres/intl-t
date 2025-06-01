"use client";

import { createContext, useContext } from "react";
import { createElement } from "./patch";
import { TranslationNode, TranslationProps as TP, isArray, SearchWays, ArrayToString, TranslationType, State, ReactState } from "../types";
import { useClientState, useLocale } from "./hooks";
import { Locale } from "../locales/types";
import { createTranslation } from "./translation";

type TranslationContext = null | {
  t?: TranslationType;
  localeState?: ReactState<Locale>;
  clientState?: State;
};

export const TranslationContext = createContext<TranslationContext>(null);

export interface TranslationProps<T extends TranslationNode, A extends string[] = string[], D extends string = string>
  extends TP<T["settings"], T["node"], T["values"], A, D> {
  t?: T;
}

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
  path,
  variables,
  source,
  settings,
  stateless,
  hidratation,
  ...state
}: TranslationProps<T, A, D>) {
  const context = useContext(TranslationContext) || {};
  typeof settings === "string" && (settings = JSON.parse(settings));
  context.t ??= t || createTranslation(settings);
  t ??= context.t;
  if (settings && t.settings !== settings) Object.assign(t.settings, settings, state);
  source && t.addSource(source);
  hidratation ??= t.settings.hidratation;
  context.clientState ??= useClientState.call(t, state, hidratation && !stateless);
  if (locale && onLocaleChange) context.localeState = [locale, onLocaleChange];
  context.localeState ??= useLocale.call(t, locale, { hidratation, stateless });
  t = t[context.localeState[0] as any](path, variables);
  return children ? createElement(TranslationContext, { value: context }, children) : t.base;
}

export default TranslationProvider;

export const T = TranslationProvider;

export const Translation = T;
export const Trans = T;
export const Tr = T;

export function useTranslation(...args: any[]) {
  const context = useContext(TranslationContext) || {};
  // @ts-ignore-error optional binding
  const t = this || context.t;
  if (!t) throw new Error("Translation not found");
  context.t ??= t;
  context.localeState ??= useLocale.call(t);
  context.clientState ??= useClientState.call(t);
  return t[context.localeState[0]](...args);
}
