import { Suspense } from "react";
import { TranslationProvider as TranslationClientProvider, TranslationProviderProps } from "../react/context";
import { TranslationNode } from "../core/translation";
import type { isArray, SearchWays, ArrayToString, GlobalTranslation } from "../types";
import { getCache } from "./cache";
import { getRequestLocale } from "./request";
import { createTranslation } from "./translation";

export async function TranslationProvider<
  T extends TranslationNode,
  A extends isArray<SearchWays<T>>,
  D extends ArrayToString<A, T["settings"]["ps"]>,
  // @ts-ignore-error optional binding
>({ children, t = this, preventDynamic, hydrate, ...props }: TranslationProviderProps<T, A, D>) {
  const cache = getCache();
  t ||= cache.t ||= TranslationNode.t || (createTranslation(props.settings) as any);
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
  t.settings.locale = cache.locale = props.locale!;
  t = (await t.current) as any;
  if (!children) return t(props.path || props.id || props.i18nKey).base;
  props.source = props.source || props.messages || ((hydrate ?? t.settings.hydrate) && { ...(t.node as any) }) || void 0;
  // @ts-ignore
  return (<TranslationClientProvider {...props}>{children}</TranslationClientProvider>) as never;
}
export const T = TranslationProvider;
export { T as Tr, T as Trans };

export const TranslationDynamicRendering: typeof TranslationProvider = async ({ children, ...props }) => {
  props.locale ||= (await getRequestLocale.call(props.t)) as string;
  return <TranslationProvider {...props}>{children}</TranslationProvider>;
};

function hook(...args: any[]) {
  const cache = getCache();
  // @ts-ignore-error optional binding
  let t = this || (cache.t ||= TranslationNode.t);
  if (!t) throw new Error("Translation not found");
  const locale = cache.locale ? (t.settings.locale = cache.locale) : getRequestLocale.call(t);
  if (locale instanceof Promise || (t = t.current).promise) {
    let tp: any, tc: any;
    return new Proxy(t, {
      get(_, p, receiver) {
        return p in Promise.prototype
          ? (cb: Function) => new Promise(async r => (await locale, (tp ||= tc = (await t)(...args)), r(tp), cb(tp)))
          : Reflect.get((tc ||= t(...args)), p, receiver);
      },
    });
  }
  return t(...args);
}

// @ts-ignore
export declare const getTranslation: GlobalTranslation;
// @ts-ignore
export declare const getTranslations: GlobalTranslation;
// @ts-ignore
export { hook as getTranslation, hook as getTranslations };
