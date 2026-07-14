import { Locale } from "@intl-t/locales";
import { setCachedRequestLocale } from "@intl-t/next/cache";

export * from "@intl-t/next/cookies";
export * from "@intl-t/next/request";

export const LOCALE_HEADERS_KEY = "x-locale";
export const PATH_HEADERS_KEY = "x-path";

export function headers() {
  return import("next/headers").then(({ headers }) => headers()).catch(() => new Headers() as never);
}

export function getHeadersPathname(key = PATH_HEADERS_KEY) {
  return headers().then(headers => headers.get(key));
}

export function getHeadersLocale<L extends Locale>(key = LOCALE_HEADERS_KEY) {
  return headers().then(headers => {
    const locale = headers.get(key) as L | undefined;
    if (locale) return setCachedRequestLocale.call(this, locale);
  });
}
