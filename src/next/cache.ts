import { cache } from "react";
import { Translation } from "../types";

export interface Cache {
  locale: string;
  t: Translation;
}

export const getCache = cache(() => ({}) as Partial<Cache>);

export function getCachedRequestLocale() {
  return getCache().locale;
}

export function setCachedRequestLocale(locale?: string) {
  getCache().locale = locale;
}
