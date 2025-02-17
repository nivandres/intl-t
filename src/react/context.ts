"use client";

import React from "react";
import { TranslationNode, TranslationProps as TP, TranslationSettings } from "../types";
import { createTranslation } from "./translation";
import { useClientState, useLocale } from "./hooks";
import { Locale } from "../locales";
import { setClientLocale } from "./client";

type TranslationContext = null | {
  t: any;
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
};

export const TranslationContext = React.createContext<TranslationContext>(null);

export interface TranslationProps<
  S extends TranslationSettings = TranslationSettings,
  L_ extends string = string,
  A_ extends string[] = string[],
  D_ extends string = string,
> extends TP<S, S["tree"], S["variables"], S["allowedLocale"], any, L_, A_, D_> {}

export function TranslationProvider<
  S extends TranslationSettings,
  L_ extends string,
  A_ extends string[],
  D_ extends string,
>({
  // @ts-ignore
  t = this?.__obj__,
  isolatedLocale,
  lang: _lang,
  setLang: _setLang,
  onLangChange = _setLang,
  locale = typeof isolatedLocale === "string" ? isolatedLocale : _lang,
  children,
  path,
  variables,
  source,
  settings,
  hidratation,
  ...state
}: TranslationProps<S, L_, A_, D_>) {
  const context = React.useContext(TranslationContext);
  typeof settings === "string" && (settings = JSON.parse(settings));
  t ||= context?.t || globalThis.t || createTranslation(settings);
  if (settings && t.settings !== settings) Object.assign(t.settings, settings, state);
  hidratation ??= t.settings.hidratation;
  const { now, timeZone } = useClientState(state, hidratation && t.settings.fullHidratation);
  t.settings.now = now;
  t.settings.timeZone = timeZone;
  const [lang, setLocale] =
    (context && !isolatedLocale) || (locale && onLangChange)
      ? ([locale || context?.locale, onLangChange || context?.setLocale || t.setLocale] as any)
      : useLocale(locale, {
          hidratation,
          preventHidratation: !t.settings.fullHidratation,
          path: isolatedLocale ? t.id : undefined,
        });
  t.setLocale = setLocale;
  t = t[lang as keyof typeof t] || (t as any);
  source && t.addSource(source);
  (variables || path) && t.get(path || [], (variables as any) || undefined);
  if (!children) return t.base;
  return React.createElement(
    TranslationContext.Provider,
    { value: { t, locale: setClientLocale(lang), setLocale } },
    children,
  );
}
export const Translation = TranslationProvider;
export const T = TranslationProvider;

export const useTranslation: TranslationNode["get"] = (...args: any[]) => {
  let context = React.useContext(TranslationContext);
  if (!context) context = useLocale() as TranslationContext;
  let t = (this as any)?.__obj__ || context?.t || globalThis.t;
  return (t[context?.locale as string] || t).get?.(...args);
};
