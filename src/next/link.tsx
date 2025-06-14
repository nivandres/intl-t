import { default as NL, LinkProps as LP } from "next/link";
import { LC } from "./link_client";
import { getPathname, isRSC } from "./state";
import { ResolveConfig, resolveHref } from "../tools/resolvers";
import type { Locale } from "../locales/types";
import { getRequestLocale } from "./request";
import type { FC, ReactNode, ComponentProps } from "react";

export type NL = typeof NL;

export interface LinkConfig<LC extends FC<any> = NL> {
  Link?: LC;
  preventDynamic?: boolean;
}

export interface LinkProps<L extends Locale = Locale, LC extends FC<any> = NL> extends LinkConfig<LC>, Omit<LP, "href"> {
  href?: string;
  locale?: L;
  currentLocale?: L;
  config?: ResolveConfig<L> & LinkConfig<LC>;
  children?: ReactNode;
}

export { LC };

export async function LS<L extends Locale, L_ extends string, LC extends FC<any>>({
  href = "",
  locale,
  currentLocale,
  // @ts-ignore
  config = this || {},
  Link = config.Link || (NL as unknown as LC),
  preventDynamic = config.preventDynamic ?? true,
  ...props
}: LinkProps<L | L_, LC> & Omit<ComponentProps<LC>, keyof LinkProps>) {
  if (!href && locale)
    if (preventDynamic) {
      const { allowedLocales, defaultLocale, pathPrefix, redirectPath } = config;
      config = { allowedLocales, defaultLocale, pathPrefix, redirectPath } as any;
      return <LC href={href} locale={locale} currentLocale={currentLocale} config={config} {...(props as any)} />;
    } else href = (await getPathname()) || "";
  // @ts-ignore
  config.getLocale ||= getRequestLocale.bind(null, preventDynamic);
  href = await resolveHref.call(config, href, { ...config, locale, currentLocale });
  return <Link href={href} {...(props as any)} />;
}

export const Link: typeof LS = isRSC ? LS : (LC as any);
