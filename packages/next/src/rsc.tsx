import { TranslationNode } from "@intl-t/core";
import type { isArray, SearchWays, ArrayToString, Translation } from "@intl-t/core/types";
import { TranslationProvider as TranslationClientProvider, TranslationProviderProps } from "@intl-t/react";
import { Suspense, ReactNode } from "react";
import { getCache } from "./cache";
import { getRequestLocale } from "./request";
import { createTranslation } from "./translation";

export async function TranslationProvider<
  T extends TranslationNode,
  A extends isArray<SearchWays<T>>,
  D extends ArrayToString<A, T["settings"]["ps"]>,
>({ children, t = this, preventDynamic, hydrate, ...props }: TranslationProviderProps<T, A, D>) {
  const cache = getCache();
  t ||= cache.t ||= TranslationNode.t || (createTranslation(props.settings) as any);
  props.locale ||= cache.locale;
  preventDynamic ??= t.settings.preventDynamic;
  if (!(props.locale || preventDynamic)) {
    Object.assign(props, { t, preventDynamic: true });
    return (
      <Suspense fallback={<TranslationProvider {...props}>{children}</TranslationProvider>}>
        <TranslationDynamic {...props}>{children}</TranslationDynamic>
      </Suspense>
    );
  }
  t.settings.locale = cache.locale = props.locale!;
  t = (await t.current) as any;
  if (!children) return t.call(props.path || props.id || props.i18nKey).base;
  props.source = props.source || props.messages || ((hydrate ?? t.settings.hydrate) && { ...(t.node as any) }) || void 0;
  // @ts-ignore deep nested type
  return (<TranslationClientProvider {...props}>{children}</TranslationClientProvider>) as never;
}
export const T = TranslationProvider;
export { T as Tr, T as Trans };

export const TranslationDynamic: typeof TranslationProvider = async ({ children, ...props }) => {
  props.locale ||= (await getRequestLocale.call(props.t)) as string;
  return <TranslationProvider {...props}>{children as ReactNode}</TranslationProvider>;
};

export function hook(...args: any[]) {
  const cache = getCache();
  let t = this || (cache.t ||= TranslationNode.t);
  if (!t) throw new Error("Translation not found");
  const locale = cache.locale ? (t.settings.locale = cache.locale) : getRequestLocale.call(t);
  if (locale instanceof Promise || (t = t.current).promise) {
    let tp: any, tc: any;
    return new Proxy(t, {
      get(_, p, receiver) {
        return p in Promise.prototype
          ? (cb: Function) => new Promise(async r => (await locale, (tp ||= tc = (await t.current)(...args)), r(tp), cb(tp)))
          : Reflect.get((tc ||= t(...args)), p, receiver);
      },
    });
  }
  return t(...args);
}

// @ts-ignore translation
export declare const getTranslation: Translation;
// @ts-ignore translation
export declare const getTranslations: Translation;
// @ts-ignore translation
export { hook as getTranslation, hook as getTranslations };
