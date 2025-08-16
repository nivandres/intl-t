import type { Locale } from "@intl-t/locales";
import { match } from "@intl-t/tools/match";
import { negotiator } from "@intl-t/tools/negotiator";
import { ResolveConfig } from "@intl-t/tools/resolvers";
import { I18NDomains } from "next/dist/server/config-shared";
import { MiddlewareConfig as MG, NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { LOCALE_HEADERS_KEY, PATH_HEADERS_KEY } from "./headers";

export const LOCALE_COOKIE_KEY = "locale";

export type Middleware = (req: NextRequest, ev: NextFetchEvent, res?: NextResponse) => NextResponse | Promise<NextResponse> | undefined;
export type MiddlewareFactory = (middleware: Middleware) => Middleware;

export interface MiddlewareConfig<L extends Locale> extends MG, ResolveConfig<L> {
  pathBase?: "always-default" | "detect-default" | "detect-latest" | "always-detect";
  strategy?: "domain" | "param" | "headers";
  detect?: false | string | string[] | ((req: NextRequest) => string[] | string);
  domains?: I18NDomains;
  config?: MG;
  middleware?: Middleware;
  withMiddleware?: MiddlewareFactory;
  match?: typeof match;
}

export const middlewareConfig: MG = {
  matcher: ["/((?!api|.*\\..*|_next).*)"],
};

// @ts-ignore
export function detect(req: NextRequest, domains: I18NDomains = this?.domains || []) {
  const { hostname } = req.nextUrl;
  const domain = domains.find(d => hostname.includes(d.domain));
  return [domain?.defaultLocale || "", ...(domain?.locales || [])];
}

export function createMiddleware<L extends Locale>(settings: MiddlewareConfig<L>) {
  settings.config = middlewareConfig;
  settings.middleware = middleware.bind(settings);
  settings.withMiddleware = withMiddleware.bind(settings);
  settings.match = match.bind(settings);
  settings.domains && (settings.detect ??= detect.bind(settings));
  return Object.assign(settings.middleware, settings, middlewareConfig);
}

export function middleware<L extends Locale>(req: NextRequest, ev: NextFetchEvent, res?: NextResponse) {
  let {
    allowedLocales = [],
    defaultLocale = allowedLocales[0],
    strategy = "param",
    pathPrefix = strategy == "domain" ? "hidden" : "default",
    pathBase = pathPrefix == "hidden" ? "detect-latest" : "detect-default",
    detect = req => negotiator(req),
    redirectPath = "r",
    match = () => "",
    // @ts-ignore
  } = this as MiddlewareConfig<L>;
  res ||= NextResponse.next();
  const { nextUrl, cookies } = req;
  let url = nextUrl.clone();
  let [, locale, ...path] = nextUrl.pathname.split("/") as string[];
  if (!allowedLocales.includes(locale as L)) {
    if (locale == redirectPath) (pathBase = "detect-latest"), (pathPrefix = "always"), (strategy = "param"), (res = undefined);
    else path.unshift(locale);
    if (pathBase == "always-default") locale = defaultLocale;
    else if (pathBase == "always-detect" || !(locale = cookies.get(LOCALE_COOKIE_KEY)?.value as string))
      locale = match(typeof detect != "function" ? detect || null : detect(req));
    else if (pathBase == "detect-default") locale = defaultLocale;
    else locale ||= defaultLocale;
    url.pathname = [locale, ...path].join("/");
    if (strategy != "headers") {
      if (pathPrefix != "always" && (pathPrefix == "default" ? locale == defaultLocale : true))
        res = res ? NextResponse.rewrite(url) : NextResponse.redirect(((url.pathname = path.join("/")), url));
      else if (pathPrefix == "always") res = NextResponse.redirect(url);
    }
    res ||= NextResponse.redirect(url);
  } else if ((pathPrefix == "default" && locale == defaultLocale) || pathPrefix == "hidden") {
    url.pathname = path.join("/");
    res = NextResponse.redirect(url);
  } else if (strategy == "headers") res = NextResponse.rewrite(((url.pathname = path.join("/")), url));
  res.headers.set(PATH_HEADERS_KEY, (path.unshift(""), path.join("/")));
  res.headers.set(LOCALE_HEADERS_KEY, locale);
  res.cookies.set(LOCALE_COOKIE_KEY, locale);
  return res;
}

export const i18nMiddleware = middleware;

export function withMiddleware(middleware: Middleware) {
  // @ts-ignore
  const i18nMiddlewareBound = i18nMiddleware.bind(this);
  return (req: NextRequest, ev: NextFetchEvent, res?: NextResponse) => {
    res = i18nMiddlewareBound(req, ev, res);
    return middleware(req, ev, res);
  };
}

export { withMiddleware as withI18nMiddleware };
