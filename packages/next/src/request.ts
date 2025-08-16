// import { getRootParamsLocale } from "./root";
import type { Locale } from "@intl-t/locales";
import { getCachedRequestLocale, setCachedRequestLocale } from "./cache";
import { getHeadersRequestLocale, getHeadersRequestPathname } from "./headers";

export { setCachedRequestLocale as setRequestLocale } from "./cache";

export function getRequestLocale<L extends Locale>(preventDynamic: true): L | undefined;
export function getRequestLocale<L extends Locale>(preventDynamic?: boolean): Promise<L> | L | undefined;
// @ts-ignore
export function getRequestLocale(preventDynamic: boolean = this?.settings?.preventDynamic || false) {
  return (
    // @ts-ignore
    getCachedRequestLocale.call(this) ||
    // Missing workStore in unstable_rootParams.
    // getRootParamsLocale.call(this) ||
    // @ts-ignore
    (!preventDynamic && getHeadersRequestLocale.call(this).then(setCachedRequestLocale)) ||
    undefined
  );
}

export const getRequestPathname = getHeadersRequestPathname;
