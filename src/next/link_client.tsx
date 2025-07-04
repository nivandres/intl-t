"use client";

import NL from "next/link";
import type { Locale } from "../locales/types";
import { resolveHref } from "../tools/resolvers";
import { LinkProps } from "./link";
import { useLocale, usePathname } from "./router";
import type { ComponentProps } from "react";

type NL = typeof NL;

export function LC<L extends Locale, L_ extends string, LC extends NL>({
  href = "",
  locale,
  currentLocale,
  // @ts-ignore
  config = this || {},
  Link = config.Link || (NL as LC),
  ...props
}: LinkProps<L | L_, LC> & ComponentProps<LC>) {
  if (!href && locale) href = usePathname();
  // @ts-ignore
  config.getLocale ||= () => useLocale()[0];
  href = resolveHref(href, { ...config, locale, currentLocale });
  return <Link href={href} {...(props as any)} />;
}
