import { resolveLocale } from "../tools/resolvers";
import { locale as l } from "../state";

export const LOCALE_CLIENT_KEY = "LOCALE";

"localStorage" in globalThis ? null : (globalThis.localStorage = undefined as any);

export function setClientLocale(locale: string, key = LOCALE_CLIENT_KEY) {
  // @ts-ignore-error optional binding
  const settings = this?.settings;
  locale && localStorage?.setItem(key, locale);
  if (settings) settings.locale = locale;
  return locale;
}

export function getClientLocale(key = LOCALE_CLIENT_KEY) {
  // @ts-ignore-error optional binding
  const settings = this?.settings;
  const r = resolveLocale.bind(settings);
  // @ts-expect-error location type from browser
  const locale = localStorage?.getItem(key) || r(location.pathname) || r(l);
  if (settings) settings.locale = locale;
  return locale;
}
