import { getLocale, setLocale, getSettings } from "@intl-t/core";
import { match } from "@intl-t/utils/match";
import { resolveLocale } from "@intl-t/utils/resolvers";

export const LOCALE_CLIENT_KEY = "locale";

export function getClientLocale<L extends string>(
  key = LOCALE_CLIENT_KEY,
  detectLocale = true,
  allowedLocales = (getSettings.call(this) as any)?.allowedLocales as L[],
) {
  try {
    const locale =
      globalThis.localStorage?.getItem(key) ||
      (detectLocale ? resolveLocale(globalThis.location?.pathname, allowedLocales) || match(getLocale(), allowedLocales) : undefined);
    if (locale) return setLocale.call(this, locale) as L;
  } catch {}
}

export function setClientLocale<L extends string>(locale: L, key = LOCALE_CLIENT_KEY) {
  try {
    globalThis.localStorage?.setItem(key, locale);
  } catch {}
  return setLocale.call(this, locale) as L;
}

export { getClientLocale as getLocale, setClientLocale as setLocale };
