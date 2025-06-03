import { getHeadersRequestLocale, getHeadersRequestPathname } from "./headers";
import { getCachedRequestLocale, setCachedRequestLocale } from "./cache";
import { Locale } from "../locales/types";

export { setCachedRequestLocale as setRequestLocale } from "./cache";

export function getRequestLocale<L extends Locale>(preventDynamic: true): L | undefined;
export function getRequestLocale<L extends Locale>(preventDynamic?: boolean): Promise<L | null> | L | undefined;
// @ts-ignore
export function getRequestLocale(preventDynamic: boolean = this?.settings.preventDynamic || false) {
  return (
    // @ts-ignore
    getCachedRequestLocale.call(this) ||
    // @ts-ignore
    (!preventDynamic && getHeadersRequestLocale.call(this).then(setCachedRequestLocale)) ||
    undefined
  );
}

export const getRequestPathname = getHeadersRequestPathname;
