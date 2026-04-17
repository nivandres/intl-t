"use server";
import type { Locale } from "@intl-t/locales";
import { getCookieLocale, setCookieLocale } from "./cookies";
import { getHeadersLocale, getHeadersPathname } from "./headers";
import { getRequestLocale, setRequestLocale } from "./request";

export async function getCookieLocaleFromClient() {
  return getCookieLocale();
}

export async function setCookieLocaleFromClient(locale: Locale) {
  return setCookieLocale(locale);
}

export async function getHeadersPathnameFromClient() {
  return getHeadersPathname();
}

export async function getHeadersLocaleFromClient() {
  return getHeadersLocale();
}

export async function getRequestLocaleFromClient() {
  return getRequestLocale(false);
}
export async function setRequestLocaleFromClient(locale: Locale) {
  return setRequestLocale(locale);
}
