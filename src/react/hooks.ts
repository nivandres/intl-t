"use client";

import { useState, useEffect, useContext } from "react";
import { Locale } from "../locales";
import { State, hidratation as h, locale, now, timeZone } from "../state";
import { TranslationContext } from "./context";
import { getClientLocale, setClientLocale, LOCALE_CLIENT_KEY } from "./client";
import { resolveLocale } from "../tools";

export function useTimeZone(defaultTimeZone?: string, hidratation = h) {
  if (!hidratation) return timeZone;
  const [tz, setTimeZone] = useState(defaultTimeZone);
  useEffect(() => {
    setTimeZone(timeZone);
  }, []);
  return tz;
}

export interface UseLocale {
  preventHidratation?: boolean;
  hidratation?: boolean;
  noDefault?: boolean;
  path?: string;
}

export function useLocale<L extends Locale = Locale, M extends L = L>(
  // @ts-ignore
  defaultLocale: M | undefined | null = (this?.ts || this)?.defaultLocale,
  { hidratation = h, preventHidratation, path }: UseLocale = {},
) {
  path &&= `${LOCALE_CLIENT_KEY}${path}`;
  defaultLocale ??= useContext(TranslationContext)?.locale as M;
  const state = useState(defaultLocale || (!hidratation && getClientLocale(path))) as any;
  const setState = state[1];
  if (hidratation && (!preventHidratation || !defaultLocale))
    useEffect(() => {
      const locale = getClientLocale(path) || resolveLocale(location.pathname);
      if (locale) setState(locale);
    }, []);
  state[1] = (l: any) => {
    setClientLocale(l, path);
    return setState(l);
  };
  state.setLocale = state[1];
  state.locale = state[0];
  state.toString = () => state[0];
  return state as L & [L, (lang: L) => void] & { locale: L; setLocale: (lang: L) => void; t: undefined };
}

export function useNow(initialNow?: Date, hidratation: boolean = Boolean(initialNow)) {
  if (!hidratation) return now;
  const [n, setNow] = useState(initialNow);
  useEffect(() => {
    setNow(now);
  }, []);
  return n;
}

export function useClientState(defaultState: Partial<State> = {}, hidratation = h): State {
  const initialState = { now, timeZone, locale, hidratation, ...defaultState };
  if (!hidratation) return initialState;
  const [state, setState] = useState(initialState);
  useEffect(() => {
    if (now !== state.now)
      setState({
        timeZone,
        locale,
        now,
        hidratation,
      });
  }, []);
  return state;
}
