import { cache } from "react";
import { Translation } from "../types";

export interface Cache {
  locale: string;
  t: Translation;
}

export const getCache = cache(() => ({} as Partial<Cache>));

export function getCachedRequestLocale() {
  const locale = getCache().locale;
  // @ts-ignore
  if (this?.settings) this.settings.locale = locale;
}

export function setCachedRequestLocale(locale?: string) {
  getCache().locale = locale;
  // @ts-ignore
  this?.setLocale(locale);
}
