import { isClient } from "../state";
import type { Locale, Node, Promisable } from "../types";

export function getLocale<const N extends Node>(node: N | (() => Promisable<N>)): N {
  if (isClient) return node as N;
  if (typeof node === "function") return node() as N;
  return node as N;
}

export async function getLocales<L extends Locale, const T>(locales: T & Record<L, Node | (() => Promisable<Node>)>) {
  await Promise.all(Object.keys(locales).map(async locale => (locales[locale as L] = (await getLocale(locales[locale as L])) as any)));
  return locales as {
    [K in L & keyof T]: T[K] extends () => infer N ? Awaited<N> : T[K];
  };
}
