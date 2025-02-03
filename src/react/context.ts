"use client";

import React from "react";
import { TranslationNode } from "../core";
import { TranslationProps as TP } from "../types";
import { createTranslation } from "./translation";
import { useClientState, useLocale } from "./hooks";
import { Locale } from "../locales";

type TranslationContext = null | {
  t: any;
  lang: Locale;
  setLang: React.Dispatch<React.SetStateAction<Locale>>;
};

export const TranslationContext = React.createContext<TranslationContext>(null);

export interface TranslationProps<
  T extends TranslationNode = TranslationNode,
  L_ extends string = string,
  A_ extends string[] = string[],
  D_ extends string = string,
> extends TP<T["settings"], T["node"], T["values"], T["locale"], T["parent"], T["path"], L_, A_, D_> {}

export function TranslationProvider<
  T extends TranslationNode,
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
}: TranslationProps<T, L_, A_, D_>) {
  const context = React.useContext(TranslationContext);
  t ||= context?.t || (globalThis.t ||= createTranslation({ ...globalThis.ts, ...settings }) as any);
  hidratation ??= t.settings.hidratation;
  const { now, timeZone } = useClientState(state, hidratation && t.settings.fullHidratation);
  t.settings.now = now;
  t.settings.timeZone = timeZone;
  const [lang, setLang] =
    (context && !isolatedLocale) || (locale && onLangChange)
      ? ([locale || context?.lang, onLangChange || context?.setLang] as any)
      : (t.useLocale ||= useLocale.bind(t))(locale || t.lang, hidratation, isolatedLocale ? t.id : undefined);
  t.setLang = setLang;
  t = t[lang as keyof typeof t] || (t as any);
  source && t.addSource(source);
  (variables || path) && t.get(path || [], (variables as any) || undefined);
  if (!children) return t.base;
  return React.createElement(TranslationContext.Provider, { value: { t, lang, setLang } }, children);
}
export const Translation = TranslationProvider;
export const T = TranslationProvider;

export const useTranslation: TranslationNode["get"] = (...args: any[]) => {
  let context = React.useContext(TranslationContext);
  let t = (context?.t || (this as any)?.__obj__ || globalThis.t)?.get?.(...args);
  if (!t) throw new Error("Translation not found");
  if (!context) (context = useLocale() as TranslationContext), (t = t[context?.lang as string] || t);
  t.setLang = context?.setLang ?? t.setLang;
  return t;
};
export const useTranslations: TranslationNode["get"] = useTranslation;
