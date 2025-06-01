import { getHeadersRequestLocale, getHeadersRequestPathname } from "./headers";
import { getCachedRequestLocale } from "./cache";
import { Locale } from "../locales/types";

export { setCachedRequestLocale as setRequestLocale } from "./cache";

export function getRequestLocale<L extends Locale>(preventDynamic: true): L | undefined;
export function getRequestLocale<L extends Locale>(preventDynamic?: boolean): Promise<L | null> | L | undefined;
// @ts-ignore
export function getRequestLocale(preventDynamic: boolean = this?.settings.preventDynamic || false) {
  // @ts-ignore
  return getCachedRequestLocale.call(this) || (!preventDynamic && getHeadersRequestLocale.call(this)) || (undefined as any);
}

export const getRequestPathname = getHeadersRequestPathname;
