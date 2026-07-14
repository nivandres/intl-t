import type { Translation } from "@intl-t/core";
import { setLocale } from "@intl-t/core";
import type { Locale } from "@intl-t/locales";
import { cache } from "react";

export interface Cache {
  locale: Locale;
  t: Translation;
}

export const getCache = cache(() => ({}) as Partial<Cache>);

export function getCachedRequestLocale<L extends Locale>() {
  const locale = getCache().locale as L | undefined;
  if (locale) return setLocale.call(this, locale) as L;
}

export function setCachedRequestLocale<L extends Locale>(locale: L) {
  getCache().locale = locale;
  return setLocale.call(this, locale) as L;
}

export { getCachedRequestLocale as getCacheLocale, setCachedRequestLocale as setCacheLocale };
