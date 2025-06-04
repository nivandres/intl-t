import { getRequestLocale, getRequestPathname } from "./request";
import { useLocale, usePathname } from "./router";
import type { Locale } from "../locales/types";
import React from "react";

export { isClient } from "../state";
export const isRSC = !("useEffect" in React);

export function getLocale<L extends Locale>(preventDynamic: true, defaultLocale?: L): L | undefined;
export function getLocale<L extends Locale>(preventDynamic?: boolean, defaultLocale?: L): Promise<L | null> | L | undefined;
export function getLocale<L extends Locale>(preventDynamic = false, defaultLocale?: L) {
  return isRSC ? (getRequestLocale(preventDynamic as boolean) as any) : useLocale<L>(defaultLocale);
}
export const getPathname = isRSC ? getRequestPathname : usePathname;
