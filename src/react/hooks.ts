"use client";

import { useState, useEffect, useContext } from "react";
import { Locale } from "../locales/types";
import { State, hidratation as h, locale as l, now, timeZone } from "../state";
import { TranslationContext } from "./context";
import { getClientLocale, setClientLocale, LOCALE_CLIENT_KEY } from "./client";
import { resolveLocale } from "../tools";
import { ReactState, ReactSetState } from "./types";

export { useTranslation } from "./context";

export interface UseLocale {
  preventHidratation?: boolean;
  hidratation?: boolean;
  stateless?: boolean;
  path?: string;
}

export function useLocale<L extends Locale = Locale>(
  // @ts-ignore-error optional binding
  defaultLocale: L | undefined | null = this?.locale,
  // @ts-ignore-error optional binding
  { hidratation = h, stateless, preventHidratation, path }: UseLocale = this?.settings,
) {
  path &&= `${LOCALE_CLIENT_KEY}${path}`;
  // @ts-ignore-error optional binding
  const settings = this?.settings || {};
  const state =
    (!defaultLocale && useContext(TranslationContext)?.localeState) ||
    (stateless ? [defaultLocale, () => {}] : (useState((!hidratation && getClientLocale(path)) || defaultLocale) as any));
  settings.locale = state[0];
  const setState = state[1];
  if (hidratation && !stateless && (!preventHidratation || !defaultLocale))
    useEffect(() => {
      const r = resolveLocale.bind(settings);
      // @ts-expect-error location type from browser
      const locale = getClientLocale(path) || r(location.pathname) || r(l);
      if (locale) setState(locale);
    }, []);
  state[1] = (l: any) => {
    setClientLocale(l, path);
    settings.locale = l;
    setState(l);
    return l;
  };
  settings.setLocale = state[1];
  state.setLocale = state[1];
  state.locale = state[0];
  state.toString = () => state[0];
  return state as L & ReactState<L> & { locale: L; setLocale: ReactSetState<L> };
}

export function useClientState(defaultState: Partial<State> = {}, hidratation = h) {
  const initialState = { now, timeZone, hidratation, ...defaultState };
  // @ts-ignore-error optional binding
  const settings = this?.settings || {};
  Object.assign(settings, initialState);
  if (!hidratation) return initialState;
  const [state, setState] = useState(initialState);
  useEffect(() => {
    if (now !== state.now) {
      const state = {
        timeZone,
        now,
        hidratation,
      };
      Object.assign(settings, state);
      setState(state);
    }
  }, []);
  return state;
}
