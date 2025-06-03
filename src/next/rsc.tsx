import { Suspense } from "react";
import { TranslationProvider, TranslationProviderProps } from "../react/context";
import { TranslationNode } from "../core/translation";
import { isArray, SearchWays, ArrayToString } from "../types";
import { getCache, setCachedRequestLocale } from "./cache";
import { getRequestLocale } from "./request";
import { createTranslation } from "./translation";

export async function Translation<
  T extends TranslationNode,
  A extends isArray<SearchWays<T>>,
  D extends ArrayToString<A, T["settings"]["ps"]>,
  // @ts-ignore-error optional binding
>({ children, t = this, deep = Infinity, sourceDefault, preventDynamic, ...props }: TranslationProviderProps<T, A, D>) {
  const cache = getCache();
  t ||= cache.t || createTranslation(props.settings);
  props.locale ||= cache.locale;
  preventDynamic ??= t.settings.preventDynamic;
  if (!(props.locale || preventDynamic)) {
    Object.assign(props, { t, deep, sourceDefault, preventDynamic: true });
    return (
      <Suspense fallback={<Translation {...props}>{children}</Translation>}>
        <TranslationDynamicRendering {...props}>{children}</TranslationDynamicRendering>
      </Suspense>
    );
  }
  props.source instanceof TranslationNode && (props.source = props.source.getSource(deep) as any);
  if (props.settings || sourceDefault) {
    Object.assign((props.settings ||= {}), {
      locales: sourceDefault ? { [props.locale as any]: (t.settings.locales as any)[props.locale as any] } : undefined,
      allowedLocales: t?.settings.allowedLocales,
      locale: props.locale,
    } as Partial<(typeof t & object)["settings"]>);
    props.settings = JSON.stringify(props.settings) as any;
  }
  cache.locale = props.locale;
  // @ts-ignore
  return (<TranslationProvider {...props}>{children}</TranslationProvider>) as never;
}
export default Translation;

export const T = Translation;
export const Tr = T;
export const Trans = T;

export const TranslationDynamicRendering: typeof Translation = async ({ children, ...props }) => {
  props.locale ||= (await getRequestLocale.call(props.t)) as string;
  setCachedRequestLocale(props.locale);
  return <Translation {...props}>{children}</Translation>;
};

export function getTranslation(...args: any[]) {
  const cache = getCache();
  // @ts-ignore-error optional binding
  let t = this || cache.t;
  if (!t) throw new Error("Translation not found");
  if (cache.locale) return t[cache.locale];
  const locale = getRequestLocale.call(t);
  if (locale instanceof Promise) {
    t.then = (cb: Function) => (locale.then(locale => cb(t[(cache.locale = locale || t.locale)])), t);
    return t[t.settings.locale];
  }
  cache.locale = locale || t.settings.locale;
  return t[cache.locale!];
}
