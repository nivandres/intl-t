import type { Locale } from "@intl-t/locales";
import { getCachedRequestLocale, setCachedRequestLocale } from "./cache";
import { getCookieLocale } from "./cookies";
import { getHeadersLocale } from "./headers";

export { getHeadersPathname as getRequestPathname } from "./headers";
export { getHeadersPathname as getPathname } from "./headers";

export function getDynamicRequestLocale() {
  return getHeadersLocale.call(this).then(locale => locale || getCookieLocale.call(this));
}

export function getRequestLocale<L extends Locale>(preventDynamic: true): L | undefined;
export function getRequestLocale<L extends Locale>(preventDynamic?: boolean): Promise<L> | L | undefined;
export function getRequestLocale(preventDynamic: boolean = this?.settings?.preventDynamic ?? false) {
  return getCachedRequestLocale.call(this) || (!preventDynamic && getDynamicRequestLocale.call(this));
}

export function setRequestLocale(locale: Locale) {
  return setCachedRequestLocale.call(this, locale);
}
