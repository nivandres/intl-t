import { state } from "@intl-t/core/global";
import { resolveLocale } from "@intl-t/utils/resolvers";

export const LOCALE_CLIENT_KEY = "LOCALE";

"localStorage" in globalThis ? null : (globalThis.localStorage = undefined as any);

export function setClientLocale(locale: string, key = LOCALE_CLIENT_KEY) {
  if (this?.settings) this.settings.locale = locale;
  locale && localStorage?.setItem(key, locale);
  return locale;
}

export function getClientLocale(key = LOCALE_CLIENT_KEY) {
  const settings = this?.settings;
  const r = resolveLocale.bind(settings);
  // @ts-expect-error location type from browser
  const locale = localStorage?.getItem(key) || r(location.pathname) || r(state.locale);
  if (settings) settings.locale = locale;
  return locale;
}
