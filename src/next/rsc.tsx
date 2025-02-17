import React, { Suspense } from "react";
import { TranslationNode, TranslationSettings } from "../types";
import { TranslationProvider, TranslationProps } from "../react";
import { createTranslation } from "./translation";
import { getCache, setCachedRequestLocale } from "./cache";
import { getRequestLocale } from "./request";

export interface TranslationRSCProps<
  S extends TranslationSettings = any,
  L_ extends string = string,
  A_ extends string[] = string[],
  D_ extends string = string,
> extends TranslationProps<S, L_, A_, D_> {
  deep?: number;
  sourceDefault?: boolean;
  sourcePath?: D_ | D_[];
  preventDynamic?: boolean;
}

export async function Translation<
  S extends TranslationSettings,
  L_ extends string,
  A_ extends string[],
  D_ extends string,
>({
  children,
  t,
  deep = Infinity,
  sourceDefault,
  sourcePath,
  preventDynamic,
  ...props
}: TranslationRSCProps<S, L_, A_, D_>) {
  const cache = getCache();
  // @ts-ignore
  t ||= this?.__obj__ || (cache.t ||= globalThis.t ||= createTranslation(props.settings));
  props.locale ||= typeof props.isolatedLocale === "string" ? props.isolatedLocale : cache.locale;
  preventDynamic ??= t?.settings.preventDynamic ?? globalThis.ts?.preventDynamic;
  if (!(props.locale || preventDynamic)) {
    Object.assign(props, { t, deep, sourceDefault, sourcePath, preventDynamic: true });
    return (
      <Suspense fallback={<Translation {...props}>{children}</Translation>}>
        <TranslationDynamicRendering {...props}>{children}</TranslationDynamicRendering>
      </Suspense>
    );
  }
  if (props.source)
    if (typeof (props.source as any).getSource === "function") props.source = (props.source as any).getSource(deep);
    else if (Array.isArray(props.source) && (props as any)[0]?.getSource)
      props.source = props.source.map(src => src.getSource?.(deep) || src);
  cache.locale = props.locale;
  if (sourcePath) {
    const sourcePaths = Array.isArray(sourcePath) ? sourcePath : [sourcePath];
    // @ts-ignore
    props.source = props.source ? (props.source[0]?.__path__ ? props.source : [props.source]) : [];
    sourcePaths.forEach(path => {
      const source = (t?.get(path) as any).getSource(deep);
      (props.source as any[]).push(source);
    });
  }
  // @ts-ignore
  sourceDefault ||= !props.source && (t?.__isGlobal__ as any);
  if (props.settings || sourceDefault) {
    Object.assign((props.settings ||= {}), {
      locales: sourceDefault ? { [props.locale as any]: (t?.settings.locales as any)[props.locale as any] } : undefined,
      allowedLocales: t?.settings.allowedLocales,
      currentLocale: props.locale,
    } as Partial<(typeof t & object)["settings"]>);
    props.settings = JSON.stringify(props.settings) as any;
  }
  return <TranslationProvider {...props}>{children}</TranslationProvider>;
}
export default Translation;

export const TranslationDynamicRendering: typeof Translation = async ({ children, ...props }) => {
  props.locale ||= (await getRequestLocale()) as string;
  setCachedRequestLocale(props.locale);
  return <Translation {...props}>{children}</Translation>;
};

export const getTranslation: TranslationNode["get"] = (...args: any[]) => {
  const cache = getCache();
  const t = (cache.t ||= ((this as any)?.__obj__ || cache.t || globalThis.t)?.get?.(...args));
  if (cache.locale) return cache.t?.[cache.locale];
  return Object.assign(new Promise(async r => r(t?.[(cache.locale ||= (await getRequestLocale()) as string)] || t)), t);
};
