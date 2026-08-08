import type { Locale } from "@intl-t/locales";
import { setCachedRequestLocale } from "@intl-t/next/cache";

export type RootLocale<L extends Locale = Locale> = () => Promise<L | undefined> | L | undefined;

let wired: RootLocale | undefined;

export function pickRootLocale(mod: Record<string, unknown>, key = "locale") {
  const keys = Object.keys(mod);
  return (wired = (mod[key] ?? (keys.length === 1 ? mod[keys[0]] : void 0)) as RootLocale | undefined);
}

export function getRootLocale<L extends Locale>() {
  return Promise.resolve()
    .then(wired as RootLocale<L>)
    .then(locale => {
      if (locale) return setCachedRequestLocale.call(this, locale);
    })
    .catch(() => void 0);
}

export function wireRootParams(_prop?: string) {
  return void 0 as RootLocale | undefined;
}
