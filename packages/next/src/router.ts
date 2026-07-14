"use client";

import type { Locale } from "@intl-t/locales";
import { setRequestLocaleFromClient } from "@intl-t/next/actions";
import { useLocale } from "@intl-t/react/hooks";
import { resolvePath, resolveHref, ResolveConfig } from "@intl-t/utils/resolvers";
import { useRouter as ur, usePathname as up } from "next/navigation";

export interface Options<L extends Locale = Locale> {
  locale?: L;
}

declare module "next/dist/shared/lib/app-router-context.shared-runtime" {
  interface NavigateOptions extends Options {}
  interface PrefetchOptions extends Options {}
  interface AppRouterInstance extends Options {
    pathname?: string;
  }
}

export { useLocale };
export const usePathname: typeof up = function usePathname() {
  return resolvePath.call(this, up());
};

export interface RouterConfig<L extends Locale = Locale> extends ResolveConfig<L>, Options {
  useRouter?: typeof ur;
}

const state: Record<string, () => string> = {};

export function useResolvedRouter<L extends Locale>({ useRouter = ur, ...config }: RouterConfig<L> = this || {}) {
  const router = useRouter();
  let path = state.path?.();
  let locale = state.locale?.() as L;
  const handler = (method: keyof typeof router) =>
    ((href, { locale, ...options } = {}) =>
      router[method as "push"](resolveHref(href, { ...config, locale }), options as any)) as typeof router.push;
  return {
    ...router,
    push: handler("push"),
    replace: handler("replace"),
    prefetch: handler("prefetch"),
    get pathname() {
      state.path ||= usePathname.bind(config);
      return (path ||= state.path());
    },
    set pathname(pathname: string) {
      this.push(pathname);
    },
    get locale() {
      state.locale ||= () => useLocale()[0];
      return (locale ||= state.locale() as L);
    },
    set locale(locale: L) {
      setRequestLocaleFromClient(locale);
      router.refresh();
    },
  };
}

export { useResolvedRouter as useRouter };
