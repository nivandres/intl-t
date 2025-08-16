import type { Locale } from "@intl-t/locales";

export interface StaticParamsConfig<L extends Locale = Locale, S extends string = string> {
  locales?: L[];
  param?: S;
}

export function createStaticParams<L extends Locale, S extends string>(config: StaticParamsConfig<L, S>) {
  return generateStaticParams.bind(config);
}

export async function generateStaticParams<L extends Locale, S extends string>(this: StaticParamsConfig<L, S>) {
  const { locales = [], param } = this;
  return locales.map(locale => ({ [param as string]: locale })) satisfies any[];
}
