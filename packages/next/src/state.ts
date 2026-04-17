import type { Locale } from "@intl-t/locales";
import { getClientLocale, setClientLocale } from "@intl-t/react";
import React from "react";
import { getRequestLocale, setRequestLocale } from "./request";

export { isClient } from "@intl-t/core/state";
export const isRSC = !("useEffect" in React);

export function getLocale<L extends Locale>(preventDynamic: true, defaultLocale?: L): L | undefined;
export function getLocale<L extends Locale>(preventDynamic?: boolean, defaultLocale?: L): Promise<L> | L | undefined;
export function getLocale<L extends Locale>(preventDynamic = false, defaultLocale?: L) {
  // @ts-ignore optional binding
  return isRSC ? getRequestLocale.call(this, preventDynamic as boolean) : getClientLocale.call(this, defaultLocale);
}

export function setLocale<L extends Locale>(locale: L) {
  return isRSC ? setRequestLocale.call(this, locale) : setClientLocale.call(this, locale);
}
