"use client";

import { getT, Translation, TranslationNode } from "@intl-t/core";
import { hydration as h } from "@intl-t/format/state";
import { Locale } from "@intl-t/locales";
import { getClientLocale, setClientLocale, LOCALE_CLIENT_KEY } from "@intl-t/react/client";
import { TranslationContext } from "@intl-t/react/context";
import type { ReactState, ReactSetState } from "@intl-t/react/types";
import { useState, useEffect, useContext } from "react";

export type LocaleState<L extends Locale = Locale> = L & ReactState<L> & { locale: L; setLocale: ReactSetState<L>; key: string };

export interface UseLocaleOptions<L extends Locale> {
  defaultLocale?: L | null;
  locale?: L;
  key?: string;
  hydration?: boolean;
  state?: LocaleState<L>;
  saveState?: boolean;
  context?: LocaleState<L>;
  t?: Translation;
  subscribeToState?: boolean;
  subscribeToContext?: boolean;
  subscribeToTState?: boolean;
  detectLocale?: boolean;
  allowedLocales?: L[];
  onLocaleChange?: (locale: L) => void;
}

export function useLocale<L extends Locale = Locale>(options?: UseLocaleOptions<L>): LocaleState<L>;
export function useLocale<L extends Locale = Locale>(defaultLocale: L | undefined | null, options?: UseLocaleOptions<L>): LocaleState<L>;
export function useLocale<L extends Locale = Locale>(
  defaultLocaleOrOptions?: UseLocaleOptions<L> | L | undefined | null,
  {
    t = getT.call(this),
    defaultLocale = typeof defaultLocaleOrOptions == "string" ? defaultLocaleOrOptions : (t?.settings?.locale as L),
    locale,
    key = LOCALE_CLIENT_KEY,
    hydration = t?.settings?.hydration ?? h,
    state,
    saveState = true,
    subscribeToState = !!state,
    context = subscribeToState ? state : undefined,
    subscribeToContext = !!context || !defaultLocaleOrOptions,
    subscribeToTState = true,
    detectLocale = true,
    allowedLocales = (t?.settings?.allowedLocales as unknown as L[]) || (defaultLocale ? [defaultLocale] : []),
    onLocaleChange,
  }: UseLocaleOptions<L> = defaultLocaleOrOptions instanceof Object ? defaultLocaleOrOptions : this?.settings || this || {},
) {
  if (subscribeToContext) {
    context ??= useContext(TranslationContext)?.localeState as unknown as LocaleState<L>;
    if (context) return context as never;
  }
  state ||= useState(
    () => locale || (saveState && !hydration && getClientLocale.call(t, key, detectLocale, allowedLocales)) || defaultLocale,
  ) as unknown as LocaleState<L>;
  const setState = state[1];
  if (locale) state[0] = locale;
  useEffect(() => {
    if (locale || !saveState || !hydration) return;
    const clientLocale = getClientLocale.call(t, key, detectLocale, allowedLocales) as L;
    if (clientLocale) setState(clientLocale);
  }, []);
  state[1] = function setLocale(l: any) {
    onLocaleChange?.(l);
    if (TranslationNode.setLocale !== setClientLocale) TranslationNode.setLocale?.call(t, l);
    if (locale) return l;
    setClientLocale.call(t, l, key);
    setState(l);
    return l;
  };
  useEffect(() => {
    if (!subscribeToTState || !t?.settings) return;
    const { setLocale } = t.settings;
    t.settings.setLocale = (l: any) => (subscribeToTState && setState(l), setLocale.call(t.settings, l));
    return () => {
      subscribeToTState = false;
    };
  }, [t?.settings]);
  state.setLocale = state[1];
  state.locale = state[0];
  state.key = key;
  state.toString = () => state[0];
  return state as L & ReactState<L> & { locale: L; setLocale: ReactSetState<L> };
}
