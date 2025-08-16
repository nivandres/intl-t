import type { Locale } from "@intl-t/locales";
import { setClientLocale } from "@intl-t/react";
import React from "react";
import { getRequestLocale, getRequestPathname } from "./request";
import { setRequestLocale } from "./request";
import { useLocale, usePathname } from "./router";

export { isClient } from "@intl-t/global";
export const isRSC = !("useEffect" in React);

export function getLocale<L extends Locale>(preventDynamic: true, defaultLocale?: L): L | undefined;
export function getLocale<L extends Locale>(preventDynamic?: boolean, defaultLocale?: L): Promise<L> | L | undefined;
export function getLocale<L extends Locale>(preventDynamic = false, defaultLocale?: L) {
  // @ts-ignore-error optional binding
  return isRSC ? (getRequestLocale.call(this, preventDynamic as boolean) as any) : useLocale.call(this, defaultLocale);
}
export function setLocale<L extends Locale>(locale: L) {
  // @ts-ignore-error optional binding
  return isRSC ? setRequestLocale.call(this, locale) : setClientLocale.call(this, locale);
}
export const getPathname = isRSC ? getRequestPathname : usePathname;
