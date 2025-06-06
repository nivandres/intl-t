import { cache } from "react";
import type { Translation } from "../types";

export interface Cache {
  locale: string;
  t: Translation;
}

export const getCache = cache(() => ({} as Partial<Cache>));

export function getCachedRequestLocale() {
  const locale = getCache().locale;
  // @ts-ignore
  if (this?.settings) this.settings.locale = locale;
  return locale;
}

export function setCachedRequestLocale(locale?: string) {
  getCache().locale = locale;
  // @ts-ignore
  if (this?.settings) (this.settings.locale = locale), this?.t?.then?.();
  return locale;
}
