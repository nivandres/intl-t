"use client";

import type { Locale } from "@intl-t/locales";
import type { LinkProps } from "@intl-t/next/link-server";
import { useLocale, usePathname } from "@intl-t/next/router";
import { resolveHref } from "@intl-t/utils/resolvers";
import NL from "next/link";
import type { ComponentProps } from "react";

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
