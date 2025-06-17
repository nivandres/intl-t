import { isClient } from "../state";
import type { Locale, Node, Promisable, ResolveNode } from "../types";

export function getLocale<const N extends Node>(
  node: N | Promisable<N> | ((locale?: Locale) => Promisable<N>),
  locale?: Locale,
  preload = !isClient,
): N {
  if (preload && typeof node === "function") return getLocale(node(locale), locale, preload) as N;
  return node as N;
}

export async function getLocales<const T, L extends Locale = Locale>(
  node: T | ((locale: L) => Promisable<T>),
  allowedLocales: readonly L[],
  preload?: boolean,
): Promise<{
  [K in L]: T extends (locale: K) => infer N ? ResolveNode<N> : ResolveNode<T>;
}>;
export async function getLocales<const T, L extends Locale = Locale>(
  locales: T & Record<L, unknown>,
  preload?: boolean,
): Promise<{
  [K in L & keyof T]: ResolveNode<T[K]>;
}>;
export async function getLocales(
  node: any,
  list?: readonly any[] | boolean,
  preload: boolean | undefined = typeof list === "boolean" ? list : void 0,
) {
  let locales =
    typeof node === "object" ? node : typeof list !== "object" ? {} : list.reduce((acc, locale) => ({ ...acc, [locale]: node }), {});
  await Promise.all(Object.keys(locales).map(async locale => (locales[locale] = await getLocale(locales[locale], locale, preload))));
  return locales as any;
}
