import type { Locale } from "@intl-t/locales";

export function match<L extends Locale>(
  requestLocales?: Locale[] | Locale | null,
  // @ts-ignore-error optional binding
  availableLocales: L[] | readonly L[] = this?.allowedLocales || requestLocales || [],
  // @ts-ignore-error optional binding
  defaultLocale: L | null = this?.mainLocale || this?.defaultLocale || availableLocales[0],
): L {
  requestLocales = typeof requestLocales === "string" ? [requestLocales] : requestLocales || [];
  let matchedLocale: L | undefined;
  for (let i = 0; i < requestLocales.length; i++) {
    const locale = requestLocales[i];
    let [language, region] = locale.split("-");
    if ((matchedLocale = availableLocales.find(l => l.startsWith(locale)))) break;
    if ((matchedLocale = availableLocales.find(l => l.startsWith(language)))) break;
    matchedLocale = availableLocales.find(l => l.includes(region));
  }
  return matchedLocale || defaultLocale || (undefined as unknown as L);
}

export { match as matchLocale };
