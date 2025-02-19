import { createMiddleware, MiddlewareConfig } from "./middleware";
import { redirect as r, permanentRedirect as pr, RedirectType } from "next/navigation";
import { ResolveConfig, resolveHref, resolveLocale, resolvePath } from "../tools/resolvers";
import { RouterConfig, useRouter, useLocale, usePathname } from "./router";
import { Locale, TranslationSettings } from "../types";
import { Link, LinkConfig, NL } from "./link";
import { getLocale, getPathname } from "./state";
import { createStaticParams, StaticParamsConfig } from "./params";
import React from "react";

export * from "../tools/resolvers";
export * from "./router";

export function resolvedRedirect(href?: string, type?: RedirectType) {
  // @ts-ignore
  return r(resolveHref.bind(this?.ts || this || {})({ href }), type);
}
export function resolvedPermanentRedirect(href?: string, type?: RedirectType) {
  // @ts-ignore
  return pr(resolveHref.bind(this?.ts || this || {})({ href }), type);
}

export const redirect: typeof r = resolvedRedirect;
export const permanentRedirect: typeof pr = resolvedPermanentRedirect;

export interface intlConfig<L extends Locale = Locale, T extends React.FC<any> = NL>
  extends ResolveConfig<L>,
    StaticParamsConfig<L>,
    MiddlewareConfig<L>,
    RouterConfig<L>,
    LinkConfig<T> {
  settings?: Partial<TranslationSettings<L>>;
}

export function createNavigation<L extends Locale, LC extends React.FC<any>>(
  // @ts-ignore
  config: intlConfig<L, LC> = this?.ts || this || {},
) {
  if (!config.allowedLocales && Array.isArray(config.locales)) config.allowedLocales = config.locales;
  config.pathPrefix ||= config.strategy == "domain" ? "hidden" : "default";
  config.pathBase ||= config.pathPrefix == "hidden" ? "detect-latest" : "detect-default";
  config.defaultLocale ||= config.allowedLocales?.[0];
  config.redirectPath ||= "r";
  globalThis.ts = config as any;
  return {
    config,
    useRouter: useRouter.bind(config),
    Link: Link.bind(config)<L, L, NL>,
    redirect: redirect.bind(config),
    permanentRedirect: permanentRedirect.bind(config),
    getLocale: getLocale.bind(config)<L>,
    resolvePath: resolvePath.bind(config),
    resolveHref: resolveHref.bind(config)<L>,
    resolveLocale: resolveLocale.bind(config)<L>,
    middleware: createMiddleware<L>(config),
    generateStaticParams: createStaticParams<L, string>(config),
    useLocale: useLocale<L>,
    usePathname,
    getPathname,
    settings: Object.assign(config, config.settings),
  };
}
