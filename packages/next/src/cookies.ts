import type { Locale } from "@intl-t/locales";
import { setCachedRequestLocale } from "@intl-t/next/cache";

export const LOCALE_COOKIE_KEY = "locale";

export function cookies() {
  return import("next/headers").then(({ cookies }) => cookies()).catch(() => new Headers() as never);
}

export function getCookieLocale<L extends Locale>(key = LOCALE_COOKIE_KEY) {
  return cookies().then(cookies => {
    const locale = cookies.get(key)?.value as L | undefined;
    if (locale) return setCachedRequestLocale.call(this, locale);
  });
}

export function setCookieLocale<L extends Locale>(locale: L, key = LOCALE_COOKIE_KEY) {
  return cookies().then(cookies => {
    cookies.set(key, locale);
    return setCachedRequestLocale.call(this, locale) as L;
  });
}
