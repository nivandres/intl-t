import type { Locale } from "@intl-t/locales";
import { getCachedRequestLocale, setCachedRequestLocale } from "@intl-t/next/cache";
import { getCookieLocale, setCookieLocale } from "@intl-t/next/cookies";
import { getHeadersLocale } from "@intl-t/next/headers";
import { refresh as nextRefresh } from "next/cache";
import { getRootLocale } from "./root.js";

export * from "@intl-t/next/headers";
export * from "@intl-t/next/cookies";
export * from "@intl-t/next/cache";
export * from "./root.js";

export { getHeadersPathname as getRequestPathname } from "@intl-t/next/headers";
export { getHeadersPathname as getPathname } from "@intl-t/next/headers";

export function getDynamicRequestLocale<L extends Locale>() {
  return getHeadersLocale.call(this).then(locale => locale || getCookieLocale.call(this)) as Promise<L | undefined>;
}

export const getSyncRequestLocale = getCachedRequestLocale;

export function getAsyncRequestLocale<L extends Locale>(preventDynamic?: boolean): Promise<L | undefined> {
  return getRootLocale.call(this).then(locale => locale || (preventDynamic ? void 0 : getDynamicRequestLocale.call(this))) as Promise<
    L | undefined
  >;
}

export function getRequestLocale<L extends Locale>(preventDynamic: boolean = this?.settings?.preventDynamic ?? false) {
  return (getCachedRequestLocale.call(this) || getAsyncRequestLocale.call(this, preventDynamic)) as Promise<L | undefined> | L | undefined;
}

export function setRequestLocale<L extends Locale>(locale: L, preventDynamic = true, refresh = false) {
  if (preventDynamic) return setCachedRequestLocale.call(this, locale);
  return setCookieLocale
    .call(this, locale)
    .then(() => refresh && nextRefresh())
    .finally(() => setCachedRequestLocale.call(this, locale))
    .catch(() => void 0)
    .then(() => locale);
}
