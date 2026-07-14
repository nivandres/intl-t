import type { Locale } from "@intl-t/locales";
import { getLocaleFromClient, setLocaleFromClient } from "@intl-t/next/client";
import { getRequestLocale, setRequestLocale } from "@intl-t/next/request";
import React from "react";

export { isClient } from "@intl-t/core/state";
export const isRSC = !("useEffect" in React);

export function getLocale<L extends Locale>(preventDynamic: true): L | undefined;
export function getLocale<L extends Locale>(preventDynamic?: boolean): Promise<L | undefined> | L | undefined;
export function getLocale<L extends Locale>(preventDynamic = false): Promise<L | undefined> | L | undefined {
  return (isRSC ? getRequestLocale.call(this, preventDynamic as boolean) : getLocaleFromClient.call(this, preventDynamic)) as L;
}

export function setLocale<L extends Locale>(locale: L, ...args: any[]) {
  return (isRSC ? setRequestLocale.call(this, locale, ...args) : setLocaleFromClient.call(this, locale, ...args)) as L;
}
