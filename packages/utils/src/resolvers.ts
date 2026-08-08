import { state } from "@intl-t/format/state";
import type { Locale } from "@intl-t/locales";
import { match } from "@intl-t/utils/match";

type Awaitable<T> = (T & Promise<T>) | T;

export function resolveLocale<L extends Locale>(path: string = "", locales: L[] = this?.allowedLocales) {
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

export interface ResolveHrefConfig<L extends Locale = Locale> extends ResolveConfig<L> {
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
    config = this || {},
    allowedLocales = config.allowedLocales,
    pathPrefix = config.pathPrefix || "always",
    defaultLocale = config.defaultLocale,
    getLocale = () => match(state.locale, allowedLocales, undefined),
  }: ResolveHrefConfig<L> = this || {},
): Awaitable<`${`/${L}` | ""}${string}`> {
  if (href[0] !== "/") return href as any;
  if (pathPrefix == "hidden" && locale) pathPrefix = "always";
  if (pathPrefix == "hidden") locale = "";
  else locale ||= currentLocale || getLocale() || (redirectPath as L);
  const fn = (locale: LL<L> = redirectPath as L) => {
    if (pathPrefix == "default" && locale == defaultLocale) locale = "";
    locale &&= `/${locale}`;
    return locale + href;
  };
  return locale instanceof Promise ? (new Promise(async r => r(fn(await locale) as any)) as any) : (fn(locale) as any);
}

export function resolvePath(pathname: string, locales: string[] = this?.allowedLocales) {
  let [, l, p] = pathname.match(/(\/[a-z]{2}(?:-[A-Za-z]+)*)(\/.*|$)/) || [];
  return !locales || locales?.some(locale => l?.includes(locale)) ? p || (l ? "/" : pathname) : pathname;
}
