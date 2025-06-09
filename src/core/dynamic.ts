import { isClient } from "../state";
import type { Locale, Node, Promisable } from "../types";

export function getLocale<const N extends Node>(node: N | (() => Promisable<N>)): N {
  if (isClient) return node as N;
  if (typeof node === "function") return node() as N;
  return node as N;
}

export async function getLocales<L extends Locale, const T>(
  node: T | ((locale: L) => Promisable<T>),
  allowedLocales: L[],
): Promise<{
  [K in L]: T extends (locale: K) => infer N ? Awaited<N> : T;
}>;
export async function getLocales<L extends Locale, const T>(
  locales: T & Record<L, Node | (() => Promisable<Node>)>,
): Promise<{
  [K in L & keyof T]: T[K] extends () => infer N ? Awaited<N> : T[K];
}>;
export async function getLocales(node: any, list?: any[]) {
  let locales = typeof node === "object" ? node : list?.reduce((acc, locale) => ({ ...acc, [locale]: node }), {});
  await Promise.all(Object.keys(locales).map(async locale => (locales[locale] = await getLocale(locales[locale]))));
  return locales as any;
}
