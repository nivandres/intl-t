import type { Translation } from "@intl-t/core";
import { setLocale } from "@intl-t/core";
import type { Locale } from "@intl-t/locales";
import { cache } from "react";

export interface Cache {
  locale: Locale;
  t: Translation;
}

export const getCache = cache(() => ({}) as Partial<Cache>);

export function getCachedRequestLocale() {
  const locale = getCache().locale;
  if (locale) return setLocale.call(this, locale);
}

export function setCachedRequestLocale(locale: Locale) {
  getCache().locale = locale;
  return setLocale.call(this, locale);
}
