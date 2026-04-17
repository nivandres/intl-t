import { setLocale } from "@intl-t/core";
import { state } from "@intl-t/format/state";
import { resolveLocale } from "@intl-t/utils/resolvers";

export const LOCALE_CLIENT_KEY = "LOCALE";

export function getClientLocale(key = LOCALE_CLIENT_KEY) {
  const settings = this?.settings;
  const r = resolveLocale.bind(settings);
  const locale = localStorage?.getItem(key) || r(location?.pathname) || r(state.locale);
  if (locale) return setLocale.call(this, locale);
}

export function setClientLocale(locale: string, key = LOCALE_CLIENT_KEY) {
  localStorage?.setItem(key, locale);
  return setLocale.call(this, locale);
}

export { getClientLocale as getLocale, setClientLocale as setLocale };
