"use client";

import React, { useEffect } from "react";
import { Locale } from "../locales";
import { State, locale, now, timeZone } from "../state";
import { getClientLocale, setClientLocale, LOCALE_CLIENT_KEY } from "./client";

export function useTimeZone(defaultTimeZone?: string, hidratation: boolean = Boolean(defaultTimeZone)) {
  if (!hidratation) return timeZone;
  const [tz, setTimeZone] = React.useState(defaultTimeZone);
  useEffect(() => {
    setTimeZone(timeZone);
  }, []);
  return tz;
}

export function useLocale<L extends Locale = Locale, M extends L = L>(
  defaultLocale?: M,
  hidratation: boolean = Boolean(defaultLocale),
  path?: string,
) {
  path &&= `${LOCALE_CLIENT_KEY}${path}`;
  const state = React.useState(hidratation ? defaultLocale : getClientLocale(path)) as any;
  const setState = state[1];
  if (hidratation)
    useEffect(() => {
      setState(getClientLocale(path));
    }, []);
  state[1] = (l: any) => {
    setClientLocale(l, path);
    return setState(l);
  };
  state.setLang = state[1];
  state.lang = state[0];
  return state as [L, (lang: L) => void] & { lang: L; setLang: (lang: L) => void; t: undefined };
}

export function useNow(initialNow?: Date, hidratation: boolean = Boolean(initialNow)) {
  if (!hidratation) return now;
  const [n, setNow] = React.useState(initialNow);
  useEffect(() => {
    setNow(now);
  }, []);
  return n;
}

export function useClientState(
  defaultState: Partial<State> = {},
  hidratation = Boolean(Object.keys(defaultState).length),
): State {
  const initialState = { now, timeZone, locale, hidratation, ...defaultState };
  if (!hidratation) return initialState;
  const [state, setState] = React.useState(initialState);
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
