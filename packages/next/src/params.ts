import type { Locale } from "@intl-t/locales";

export interface StaticParamsConfig<L extends Locale = Locale, S extends string = string> {
  locales?: L[];
  param?: S;
}

export function createStaticParams<L extends Locale, S extends string>(config: StaticParamsConfig<L, S>) {
  return generateStaticParams.call(config);
}

export function createGenerateStaticParams<L extends Locale, S extends string>(config: StaticParamsConfig<L, S>) {
  return generateStaticParams.bind(config);
}

export function generateStaticParams<L extends Locale, S extends string>(this: StaticParamsConfig<L, S>) {
  const { locales = [], param = "locale" } = this;
  return locales.map(locale => ({ [param]: locale })) satisfies any[];
}
