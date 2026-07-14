import type { Locale } from "@intl-t/locales";
import { getCachedRequestLocale, setCachedRequestLocale } from "@intl-t/next/cache";
import { getCookieLocale, setCookieLocale } from "@intl-t/next/cookies";
import { getHeadersLocale } from "@intl-t/next/headers";
import { refresh as nextRefresh } from "next/cache";

export * from "@intl-t/next/headers";
export * from "@intl-t/next/cookies";
export * from "@intl-t/next/cache";

export { getHeadersPathname as getRequestPathname } from "@intl-t/next/headers";
export { getHeadersPathname as getPathname } from "@intl-t/next/headers";

export function getDynamicRequestLocale<L extends Locale>() {
  return getHeadersLocale.call(this).then(locale => locale || getCookieLocale.call(this)) as Promise<L | undefined>;
}

export function getRequestLocale<L extends Locale>(preventDynamic: true): L | undefined;
export function getRequestLocale<L extends Locale>(preventDynamic?: boolean): Promise<L | undefined> | L | undefined;
export function getRequestLocale<L extends Locale>(
  preventDynamic: boolean = this?.settings?.preventDynamic ?? false,
): Promise<L | undefined> | L | undefined {
  return (getCachedRequestLocale.call(this) || (preventDynamic ? undefined : getDynamicRequestLocale.call(this))) as L;
}

export function setRequestLocale<L extends Locale>(locale: L, refresh = false) {
  return setCookieLocale
    .call(this, locale)
    .then(() => refresh && nextRefresh())
    .finally(() => setCachedRequestLocale.call(this, locale))
    .catch(() => void 0)
    .then(() => locale);
}
