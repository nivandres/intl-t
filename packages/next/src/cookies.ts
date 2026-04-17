import type { Locale } from "@intl-t/locales";
import { cookies } from "next/headers";
import { setCachedRequestLocale } from "./cache";

export const LOCALE_COOKIE_KEY = "locale";

export function getCookieLocale(key = LOCALE_COOKIE_KEY) {
  return cookies().then(cookies => {
    const locale = cookies.get(key)?.value as Locale;
    if (locale) return setCachedRequestLocale.call(this, locale);
  });
}

export function setCookieLocale(locale: Locale, key = LOCALE_COOKIE_KEY) {
  return cookies().then(cookies => {
    cookies.set(key, locale);
    return setCachedRequestLocale.call(this, locale);
  });
}
