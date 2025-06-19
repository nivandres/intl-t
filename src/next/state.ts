import { getRequestLocale, getRequestPathname } from "./request";
import { useLocale, usePathname } from "./router";
import { setClientLocale } from "../react/client";
import { setRequestLocale } from "./request";
import type { Locale } from "../locales/types";
import React from "react";

export { isClient } from "../state";
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
