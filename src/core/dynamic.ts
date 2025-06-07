import { isClient } from "../state";
import type { Locale, Node, Promisable } from "../types";

export function getLocale<const N extends Node>(node: N | (() => Promisable<N>)) {
  if (isClient) return node as N;
  if (typeof node === "function") return node() as N;
  return node as N;
}

export async function getLocales<L extends Locale, const T>(locales: T & Record<L, Node | (() => Promisable<Node>)>) {
  await Promise.all(Object.keys(locales).map(async locale => (locales[locale as keyof T] = (await getLocale(locale)) as any)));
  return locales as {
    [K in L & keyof T]: T[K] extends () => infer N ? N : T[K];
  };
}
