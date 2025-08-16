import type { TranslationSettings } from "@intl-t/core/types";
import type { Locale } from "@intl-t/locales";
import { ResolveConfig, resolveHref, resolveLocale, resolvePath } from "@intl-t/tools/resolvers";
import { redirect as r, permanentRedirect as pr, RedirectType } from "next/navigation";
import type { FC } from "react";
import { Link, LinkConfig, NL } from "./link";
import { createMiddleware, MiddlewareConfig } from "./middleware";
import { createStaticParams, StaticParamsConfig } from "./params";
import { RouterConfig, useRouter, useLocale, usePathname } from "./router";
import { getLocale, getPathname, setLocale } from "./state";

export * from "@intl-t/tools/match";
export * from "@intl-t/tools/negotiator";
export * from "@intl-t/tools/resolvers";
export * from "./link";
export * from "./middleware";
export * from "./params";
export * from "./router";
export * from "./state";

export function resolvedRedirect(href?: string, type?: RedirectType) {
  // @ts-ignore
  return r(resolveHref.bind(this || {})(href), type);
}
export function resolvedPermanentRedirect(href?: string, type?: RedirectType) {
  // @ts-ignore
  return pr(resolveHref.bind(this || {})(href), type);
}

export const redirect: typeof r = resolvedRedirect;
export const permanentRedirect: typeof pr = resolvedPermanentRedirect;

export interface IntlConfig<L extends Locale = Locale, T extends FC<any> = NL>
  extends ResolveConfig<L>,
    StaticParamsConfig<L>,
    MiddlewareConfig<L>,
    RouterConfig<L>,
    LinkConfig<T> {
  settings?: Partial<TranslationSettings<L>>;
}

export function createNavigation<L extends Locale, LC extends FC<any>>(
  // @ts-ignore
  config: IntlConfig<L, LC> = this || {},
) {
  const { allowedLocales } = config;
  if (!allowedLocales && Array.isArray(config.locales)) config.allowedLocales = config.locales;
  config.locales ||= allowedLocales as L[];
  config.param ||= "locale";
  config.pathPrefix ||= config.strategy == "domain" ? "hidden" : "default";
  config.pathBase ||= config.pathPrefix == "hidden" ? "detect-latest" : "detect-default";
  config.defaultLocale ||= allowedLocales?.[0];
  config.redirectPath ||= "r";
  return {
    config,
    useRouter: useRouter.bind(config),
    Link: Link.bind(config)<L, L, NL>,
    redirect: redirect.bind(config),
    permanentRedirect: permanentRedirect.bind(config),
    getLocale: getLocale.bind(config)<L>,
    setLocale: setLocale.bind(config)<L>,
    resolvePath: resolvePath.bind(config),
    resolveHref: resolveHref.bind(config)<L>,
    resolveLocale: resolveLocale.bind(config)<L>,
    match: config.match!,
    middleware: createMiddleware<L>(config),
    withMiddleware: config.withMiddleware!,
    generateStaticParams: createStaticParams<L, string>(config),
    useLocale: useLocale<L>,
    usePathname,
    getPathname,
    settings: Object.assign(config, config.settings),
    allowedLocales,
    locales: allowedLocales!,
    locale: allowedLocales![0],
  };
}
