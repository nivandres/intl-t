"use client";

import type { Locale } from "@intl-t/locales";
import { resolveHref } from "@intl-t/utils/resolvers";
import NL from "next/link";
import type { ComponentProps } from "react";
import { LinkProps } from "./link";
import { useLocale, usePathname } from "./router";

type NL = typeof NL;

export function LC<L extends Locale, L_ extends string, LC extends NL>({
  href = "",
  locale,
  currentLocale,
  config = this || {},
  Link = config.Link || (NL as LC),
  ...props
}: LinkProps<L | L_, LC> & ComponentProps<LC>) {
  if (!href && locale) href = usePathname();
  config.getLocale ||= () => useLocale()[0] as L;
  href = resolveHref(href, { ...config, locale, currentLocale });
  return <Link href={href} {...(props as any)} />;
}
