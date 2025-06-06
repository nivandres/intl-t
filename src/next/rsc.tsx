import { Suspense } from "react";
import { TranslationProvider, TranslationProviderProps } from "../react/context";
import { TranslationNode } from "../core/translation";
import type { isArray, SearchWays, ArrayToString } from "../types";
import { getCache } from "./cache";
import { getRequestLocale } from "./request";
import { createTranslation } from "./translation";

export async function Translation<
  T extends TranslationNode,
  A extends isArray<SearchWays<T>>,
  D extends ArrayToString<A, T["settings"]["ps"]>,
  // @ts-ignore-error optional binding
>({ children, t = this, preventDynamic, ...props }: TranslationProviderProps<T, A, D>) {
  const cache = getCache();
  t ||= cache.t || createTranslation(props.settings);
  props.locale ||= cache.locale;
  preventDynamic ??= t.settings.preventDynamic;
  if (!(props.locale || preventDynamic)) {
    Object.assign(props, { t, preventDynamic: true });
    return (
      <Suspense fallback={<Translation {...props}>{children}</Translation>}>
        <TranslationDynamicRendering {...props}>{children}</TranslationDynamicRendering>
      </Suspense>
    );
  }
  cache.locale = props.locale;
  t.settings.locale = props.locale!;
  t = await t.current;
  if (!children) return t.base;
  if (props.settings)
    props.settings = JSON.stringify(
      Object.assign((props.settings ||= {}), {
        locales: { [t.locale as any]: t.node },
        allowedLocales: t?.settings.allowedLocales,
        locale: props.locale,
      } as Partial<(typeof t & object)["settings"]>),
    ) as any;
  props.source = props.source || t.node;
  // @ts-ignore
  return (<TranslationProvider {...props}>{children}</TranslationProvider>) as never;
}
export default Translation;

export const T = Translation;
export const Tr = T;
export const Trans = T;

export const TranslationDynamicRendering: typeof Translation = async ({ children, ...props }) => {
  props.locale ||= (await getRequestLocale.call(props.t)) as string;
  return <Translation {...props}>{children}</Translation>;
};

export function getTranslation(...args: any[]) {
  const cache = getCache();
  // @ts-ignore-error optional binding
  let t = this || cache.t;
  if (!t) throw new Error("Translation not found");
  t.settings.locale = cache.locale;
  if (cache.locale) return t.current(...args);
  const locale = getRequestLocale.call(t);
  if (locale instanceof Promise) {
    let tp: any, tc: any;
    return new Proxy(t, {
      get(_, p, receiver) {
        return p in Promise.prototype
          ? (cb: Function) => ((locale as any)[p](() => ((tp ||= tc = t.current(...args)), cb(tp))), tp || tc || receiver)
          : Reflect.get((tc ||= t(...args)), p, receiver);
      },
    });
  }
  return t.current(...args);
}
