"use client";

import type { Locale } from "@intl-t/locales";
import { useLocale } from "@intl-t/react";
import { resolvePath, resolveHref, ResolveConfig } from "@intl-t/tools/resolvers";
import { useRouter as ur, usePathname as up } from "next/navigation";

export interface Options {
  locale?: Locale;
}

declare module "next/dist/shared/lib/app-router-context.shared-runtime" {
  interface NavigateOptions extends Options {}
  interface PrefetchOptions extends Options {}
  interface AppRouterInstance extends Options {
    pathname?: string;
  }
}

export { useLocale };
export const usePathname: typeof up = () => resolvePath(up());

export interface RouterConfig<L extends Locale = Locale> extends ResolveConfig<L> {
  useRouter?: typeof ur;
}

const state: Record<string, () => string> = {};

// @ts-ignore
function useResolvedRouter({ useRouter = ur, ...config }: RouterConfig = this || {}) {
  const router = useRouter();
  let path = state.path?.();
  let locale = state.locale?.();
  const handler = (method: keyof typeof router) =>
    ((href, { locale, ...options } = {}) =>
      router[method as "push"](resolveHref(href, { ...config, locale }), options as any)) as typeof router.push;
  return {
    ...router,
    push: handler("push"),
    replace: handler("replace"),
    prefetch: handler("prefetch"),
    get pathname() {
      state.path ||= usePathname;
      return (path ||= state.path());
    },
    get locale() {
      state.locale ||= () => useLocale()[0];
      return (locale ||= state.locale());
    },
  };
}

export const useRouter: typeof ur = useResolvedRouter;
