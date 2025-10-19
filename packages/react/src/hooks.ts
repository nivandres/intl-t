"use client";

import { hydration as h } from "@intl-t/global";
import { Locale } from "@intl-t/locales";
import { getClientLocale, setClientLocale, LOCALE_CLIENT_KEY } from "@intl-t/react/client";
import { TranslationContext } from "@intl-t/react/context";
import { ReactState, ReactSetState } from "@intl-t/react/types";
import { useState, useEffect, useContext, useMemo } from "react";

export function useLocale<L extends Locale = Locale>(
  // @ts-ignore-error optional binding
  defaultLocale: L | undefined | null = this?.locale,
  {
    hydration = h,
    path,
  }: {
    hydration?: boolean;
    path?: string;
    // @ts-ignore-error optional binding
  } = this?.settings || {},
) {
  path &&= `${LOCALE_CLIENT_KEY}${path}`;
  // @ts-ignore-error optional binding
  const t = this;
  const context = !defaultLocale && useContext(TranslationContext)?.localeState;
  if (context) return context as never;
  const state = useState((!hydration && getClientLocale.call(t, path)) || defaultLocale) as any;
  const setState = state[1];
  if (hydration && !defaultLocale)
    useEffect(() => {
      const locale = getClientLocale.call(t, path);
      if (locale) setState(locale);
    }, []);
  state[1] = (l: any) => {
    setClientLocale.call(t, l, path);
    setState(l);
    return l;
  };
  t &&
    useMemo(() => {
      const { settings } = t;
      if (settings.setLocale) {
        const { setLocale } = settings;
        settings.setLocale = (l: any) => (setState(l), setLocale(l));
      } else settings.setLocale = state[1];
    }, [t.settings]);
  state.setLocale = state[1];
  state.locale = state[0];
  state.toString = () => state[0];
  return state as L & ReactState<L> & { locale: L; setLocale: ReactSetState<L> };
}
