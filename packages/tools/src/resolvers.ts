import { locale as l } from "@intl-t/global";
import { match } from "@intl-t/tools/match";
import type { Locale, Awaitable } from "@intl-t/types";

// @ts-ignore-error optional binding
export function resolveLocale<L extends Locale>(path: string = "", locales: L[] = this?.allowedLocales || []) {
  const locale = path.match(/^\/([a-z]{2}(?:-[A-Za-z]+)*)(?:$|\/)/)?.[1] as L;
  if (!locale || !locales) return locale;
  return locales.includes(locale) ? locale : undefined;
}

type LL<L extends string = string> = L | null | undefined | "" | `/${string}` | Promise<L | null | undefined>;

export interface ResolveConfig<L extends Locale = Locale> {
  pathPrefix?: "always" | "default" | "optional" | "hidden";
  allowedLocales?: L[] | readonly L[];
  redirectPath?: string;
  defaultLocale?: L;
}

export interface LocalizedHref<L extends Locale = Locale> extends ResolveConfig<L> {
  locale?: LL<L>;
  currentLocale?: L;
  config?: ResolveConfig<L>;
  getLocale?: () => LL<L>;
}

export function resolveHref<L extends Locale>(
  href = "",
  {
    locale = resolveLocale<L>(href),
    currentLocale,
    redirectPath,
    // @ts-ignore-error optional binding
    config = this || {},
    allowedLocales = config.allowedLocales,
    pathPrefix = config.pathPrefix || "always",
    defaultLocale = config.defaultLocale,
    getLocale = () => match(l, allowedLocales, undefined),
  }: // @ts-ignore-error optional binding
  LocalizedHref<L> = this || {},
): Awaitable<`/${L | ""}${string}`> {
  if (href[0] !== "/") return href as any;
  if (pathPrefix == "hidden" && locale) pathPrefix = "always";
  if (pathPrefix == "hidden") locale = "";
  else locale ||= currentLocale || getLocale() || (redirectPath as L);
  const fn = (locale: LL<L>) => {
    if (pathPrefix == "default" && locale == defaultLocale) locale = "";
    locale &&= `/${locale}`;
    return locale + href;
  };
  return locale instanceof Promise ? (new Promise(async r => r(fn(await locale) as any)) as any) : (fn(locale) as any);
}

export function resolvePath(pathname: string, locales: string[] = []) {
  const [, _, p] = pathname.match(/(\/[a-z]{2}(?:-[A-Za-z]+)*)(\/.*|$)/) || [];
  if (!locales[0] || !p) return p || "/";
  return locales.some(l => _?.includes(l)) ? p : _ + p;
}
