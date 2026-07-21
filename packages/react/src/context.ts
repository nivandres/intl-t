"use client";

import type { Locale, Content } from "@intl-t/core/types";
import { LocaleState, useLocale } from "@intl-t/react/hooks";
import { TranslationNode } from "@intl-t/react/translation";
import type { ReactSetState, ReactNode, TranslationProps as TP } from "@intl-t/react/types";
import { createElement, createContext, useContext, useMemo, useState, useEffect } from "react";

export type TranslationContext<L extends Locale> = null | {
  reRender?: ReactSetState<number>;
  localeState?: LocaleState<L>;
  t?: TranslationNode;
};

export const TranslationContext = createContext<TranslationContext<Locale>>(null);

interface TranslationProps<T extends TranslationNode, A extends string[] = string[], D extends string = string> extends TP<
  T["settings"],
  T["node"],
  T["values"],
  A,
  D
> {
  t?: TranslationNode;
}

export { TranslationProps as TranslationProviderProps };

export function TranslationProvider<T extends TranslationNode, A extends string[], D extends string>({
  t = this?.settings ? this : void 0,
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
}: TranslationProps<T, A, D>): ReactNode | Content<T["node"]> {
  const parent = useContext(TranslationContext);
  const context: TranslationContext<Locale> & {} = { ...parent };
  t ??= (state as any).tid ? (TranslationNode as any).instances?.[(state as any).tid] : (void 0 as never);
  context.t = t ??= context.t ??= TranslationNode.t as any;
  context.reRender ??= useState(0)[1];
  const localeState = useLocale({ t, locale, onLocaleChange, state: locale ? undefined : context.localeState } as any);
  context.localeState = locale != null ? localeState : (context.localeState ?? localeState);
  locale = localeState[0];
  children &&= createElement(TranslationContext.Provider, { value: context }, children as any);
  if (!t?.settings) (Object.assign(TranslationNode, { locale, source }), children);
  else ((t.settings.locale = locale!), source && !path && ((t.settings.locales as any)[locale] = source));
  useMemo(() => t?.settings && Object.assign(t.settings, settings, state), [settings, t as any, state]);
  t = ((t?.current as any)?.(path) as T) || t;
  useMemo(() => {
    source && t?.setSource?.(source);
  }, [t as any, source]);
  useEffect(() => {
    t?.then?.(() => context.reRender?.(p => p + 1));
  }, [t as any, t?.currentLocale]);
  variables && t?.set?.(variables);
  return children || t?.base;
}
export const T = TranslationProvider;
export { T as Trans, T as Tr };

export function hook(...args: any[]) {
  const context = useContext(TranslationContext) || {};
  let t = this || (context.t ||= TranslationNode.t);
  if (!t) throw new Error("Translation not found");
  context.t ||= t;
  t.settings.locale = (context.localeState ||= useLocale({ t }))[0];
  t = t.current;
  context.reRender ||= useState(0)[1];
  useEffect(() => {
    t.then?.(() => context.reRender?.(p => p + 1));
  }, [t]);
  return t(...args);
}

export const useTranslation = hook;
export const useTranslations = hook;
