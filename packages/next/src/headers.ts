import { headers } from "next/headers";
import { setCachedRequestLocale } from "./cache";

export const LOCALE_HEADERS_KEY = "x-locale";
export const PATH_HEADERS_KEY = "x-path";

export function getHeadersPathname(key = PATH_HEADERS_KEY) {
  return headers().then(headers => headers.get(key));
}

export function getHeadersLocale(key = LOCALE_HEADERS_KEY) {
  return headers().then(headers => {
    const locale = headers.get(key);
    if (locale) return setCachedRequestLocale.call(this, locale);
  });
}
