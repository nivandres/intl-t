import { getRequestLocale, getRequestPathname } from "./request";
import { useLocale, usePathname } from "./router";
import { setClientLocale } from "src/react";
import type { Locale } from "../locales/types";
import React from "react";

export { isClient } from "../state";
export const isRSC = !("useEffect" in React);

export function getLocale<L extends Locale>(preventDynamic: true, defaultLocale?: L): L | undefined;
export function getLocale<L extends Locale>(preventDynamic?: boolean, defaultLocale?: L): Promise<L> | L | undefined;
export function getLocale<L extends Locale>(preventDynamic = false, defaultLocale?: L) {
  return isRSC ? (getRequestLocale(preventDynamic as boolean) as any) : useLocale<L>(defaultLocale);
}
export function setLocale<L extends Locale>(locale: L) {
  return isRSC ? setClientLocale(locale) : setClientLocale(locale);
}
export const getPathname = isRSC ? getRequestPathname : usePathname;
