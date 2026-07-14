export type { Middleware as Proxy, MiddlewareFactory as ProxyFactory, MiddlewareConfig as ProxyConfig } from "@intl-t/next/middleware";

export {
  middlewareConfig as proxyConfig,
  createMiddleware as createProxy,
  middleware as proxy,
  i18nMiddleware as i18nProxy,
  withMiddleware as withProxy,
  withMiddleware as withI18nProxy,
} from "@intl-t/next/middleware";
