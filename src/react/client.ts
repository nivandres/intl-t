export const LOCALE_CLIENT_KEY = "LOCALE";

"localStorage" in globalThis ? null : (globalThis.localStorage = undefined as any);

export function setClientLocale(locale: string, key = LOCALE_CLIENT_KEY) {
  if (locale) localStorage?.setItem(key, locale);
  return locale;
}

export function getClientLocale(key = LOCALE_CLIENT_KEY) {
  return localStorage?.getItem(key);
}
