import type { Locale } from "@intl-t/locales";
import { getRequestLocaleFromClient, setRequestLocaleFromClient } from "@intl-t/next/actions";
import { getClientLocale, setClientLocale } from "@intl-t/react/client";
import { resolveHref, resolveLocale, resolvePath } from "@intl-t/utils/resolvers";

export function getClientLocationLocale<L extends Locale>(locales: L[] = this?.settings?.allowedLocales) {
  return resolveLocale.call(this, window.location.pathname, locales) as L | undefined;
}

export function setClientLocationLocale<L extends Locale>(locale: L) {
  window.location.pathname = resolveHref.call(this, resolvePath(window.location.pathname), { locale });
  return locale;
}

export function getLocaleFromClient<L extends Locale>(preventDynamic = false) {
  return (getClientLocale.call(this) as L) || (getRequestLocaleFromClient(preventDynamic) as Promise<L | undefined>);
}

export function setLocaleFromClient<L extends Locale>(locale: L, reload = true, refresh = reload, key?: string) {
  setClientLocale.call(this, locale, key);
  setRequestLocaleFromClient(locale, refresh);
  if (reload) setClientLocationLocale.call(this, locale);
  return locale;
}
