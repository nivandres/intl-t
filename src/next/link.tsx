import { default as NL, LinkProps as LP } from "next/link";
import { LC } from "./link_client";
import { getPathname, isRSC } from "./state";
import { ResolveConfig, resolveHref } from "../tools/resolvers";
import { Locale } from "../locales";
import { getRequestLocale } from "./request";
import React from "react";

export type NL = typeof NL;

export interface LinkConfig<LC extends React.FC<any> = NL> {
  Link?: LC;
  preventDynamic?: boolean;
}

export interface LinkProps<L extends Locale = Locale, LC extends React.FC<any> = NL>
  extends LinkConfig<LC>,
    Omit<LP, "href"> {
  href?: string;
  locale?: L;
  currentLocale?: L;
  config?: ResolveConfig<L> & LinkConfig<LC>;
  children?: React.ReactNode;
}

export { LC };

export async function LS<L extends Locale, L_ extends string, LC extends React.FC<any>>({
  href = "",
  locale,
  currentLocale,
  // @ts-ignore
  config = this || {},
  Link = config.Link || (NL as unknown as LC),
  preventDynamic = config.preventDynamic ?? true,
  ...props
}: LinkProps<L | L_, LC> & Omit<React.ComponentProps<LC>, keyof LinkProps>) {
  if (!href && locale)
    if (preventDynamic) {
      const { allowedLocales, defaultLocale, pathPrefix, redirectPath } = config;
      config = { allowedLocales, defaultLocale, pathPrefix, redirectPath } as any;
      return <LC href={href} locale={locale} currentLocale={currentLocale} config={config} {...(props as any)} />;
    } else href = (await getPathname()) || "";
  // @ts-ignore
  config.getLocale ||= getRequestLocale.bind(null, preventDynamic);
  href = await resolveHref(href, { ...config, locale, currentLocale });
  return <Link href={href} {...(props as any)} />;
}

export const Link: typeof LS = isRSC ? LS : (LC as any);
export default Link;
