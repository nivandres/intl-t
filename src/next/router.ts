"use client";

import { useRouter as ur, usePathname as up } from "next/navigation";
import { resolvePath, resolveHref, ResolveConfig } from "../tools/resolvers";
import { useLocale } from "../react/hooks";
import type { Locale } from "../locales/types";

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
