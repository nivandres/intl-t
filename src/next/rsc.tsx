import { Suspense } from "react";
import { TranslationProvider as TranslationClientProvider, TranslationProviderProps } from "../react/context";
import { TranslationNode } from "../core/translation";
import type { isArray, SearchWays, ArrayToString } from "../types";
import { getCache } from "./cache";
import { getRequestLocale } from "./request";
import { createTranslation } from "./translation";

export async function TranslationProvider<
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
      <Suspense fallback={<TranslationProvider {...props}>{children}</TranslationProvider>}>
        <TranslationDynamicRendering {...props}>{children}</TranslationDynamicRendering>
      </Suspense>
    );
  }
  t = await (t as any)[(t.settings.locale = cache.locale = props.locale!)];
  if (!children) return t(props.path || props.id || props.i18nKey).base;
  props.settings &&= Object.assign(props.settings, {
    locales: { [t.locale as any]: t.node },
    allowedLocales: t?.settings.allowedLocales,
    locale: props.locale,
  } as Partial<(typeof t & object)["settings"]>);
  props.source = props.source || t.node;
  // @ts-ignore
  return (<TranslationClientProvider {...props}>{children}</TranslationClientProvider>) as never;
}
export default TranslationProvider;

export const T = TranslationProvider;
export const Tr = T;
export const Trans = T;

export const TranslationDynamicRendering: typeof TranslationProvider = async ({ children, ...props }) => {
  props.locale ||= (await getRequestLocale.call(props.t)) as string;
  return <TranslationProvider {...props}>{children}</TranslationProvider>;
};

export function getTranslation(...args: any[]) {
  const cache = getCache();
  // @ts-ignore-error optional binding
  let t = this || cache.t;
  if (!t) throw new Error("Translation not found");
  t.then?.();
  if (cache.locale) return (t[(t.settings.locale = cache.locale)] || t)(...args);
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
