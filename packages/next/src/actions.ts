"use server";
import type { Locale } from "@intl-t/locales";
import { getCachedRequestLocale, setCachedRequestLocale } from "@intl-t/next/cache";
import { getCookieLocale, setCookieLocale } from "@intl-t/next/cookies";
import { getHeadersLocale, getHeadersPathname } from "@intl-t/next/headers";
import { getRequestLocale, setRequestLocale } from "@intl-t/next/request";

export async function getCachedRequestLocaleFromClient<L extends Locale>() {
  return getCachedRequestLocale<L>();
}

export async function setCachedRequestLocaleFromClient<L extends Locale>(locale: L) {
  return setCachedRequestLocale<L>(locale);
}

export async function getCookieLocaleFromClient<L extends Locale>() {
  return getCookieLocale<L>();
}

export async function setCookieLocaleFromClient<L extends Locale>(locale: L) {
  return setCookieLocale<L>(locale);
}

export async function getHeadersPathnameFromClient() {
  return getHeadersPathname();
}

export async function getHeadersLocaleFromClient<L extends Locale>() {
  return getHeadersLocale<L>();
}

export async function getRequestLocaleFromClient<L extends Locale>(preventDynamic = false) {
  return getRequestLocale<L>(preventDynamic);
}

export async function setRequestLocaleFromClient<L extends Locale>(locale: L, refresh = true) {
  return setRequestLocale<L>(locale, false, refresh);
}

export { getCachedRequestLocaleFromClient as getCacheLocaleFromClient, setCachedRequestLocaleFromClient as setCacheLocaleFromClient };
