import { MiddlewareConfig as MG, NextMiddleware, NextRequest, NextResponse } from "next/server";
import { negotiator } from "../tools/negotiator";
import { I18NDomains } from "next/dist/server/config-shared";
import { match } from "../tools/match";
import { ResolveConfig } from "../tools/resolvers";
import { LOCALE_HEADERS_KEY, PATH_HEADERS_KEY } from "./headers";
import type { Locale } from "../locales/types";

export const LOCALE_COOKIE_KEY = "locale";

export interface MiddlewareConfig<L extends Locale> extends MG, ResolveConfig<L> {
  pathBase?: "always-default" | "detect-default" | "detect-latest" | "always-detect";
  strategy?: "domain" | "param" | "headers";
  detect?: false | string | string[] | ((req: NextRequest) => string[] | string);
  domains?: I18NDomains;
  config?: MG;
  middleware?: (req: NextRequest, res: NextResponse) => NextResponse | Promise<NextResponse> | void;
  mw?: any;
}

export const middlewareConfig: MG = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};

// @ts-ignore
export function detect(req: NextRequest, domains: I18NDomains = this?.domains || []) {
  const { hostname } = req.nextUrl;
  const domain = domains.find(d => hostname.includes(d.domain));
  return [domain?.defaultLocale || "", ...(domain?.locales || [])];
}

export function createMiddleware<L extends Locale>(settings: MiddlewareConfig<L>) {
  settings.config = middlewareConfig;
  settings.mw ??= settings.middleware;
  settings.middleware = middleware.bind(settings);
  settings.domains && (settings.detect ??= detect.bind(settings));
  return Object.assign(settings.middleware, settings, middlewareConfig);
}

export function middleware<L extends Locale>(req: NextRequest) {
  // @ts-ignore
  const config: MiddlewareConfig<L> = this;
  let {
    allowedLocales = [],
    defaultLocale = allowedLocales[0],
    strategy = "param",
    pathPrefix = strategy == "domain" ? "hidden" : "default",
    pathBase = pathPrefix == "hidden" ? "detect-latest" : "detect-default",
    detect = req => negotiator(req),
    redirectPath = "r",
  } = config;
  let res: NextResponse | undefined = NextResponse.next();
  const { nextUrl, cookies } = req;
  let url = nextUrl.clone();
  let [, locale, ...path] = nextUrl.pathname.split("/") as string[];
  if (!allowedLocales.includes(locale as L)) {
    if (locale == redirectPath) (pathBase = "detect-latest"), (pathPrefix = "always"), (strategy = "param"), (res = undefined);
    else path.unshift(locale);
    if (pathBase == "always-default") locale = defaultLocale;
    else if (pathBase == "always-detect" || !(locale = cookies.get(LOCALE_COOKIE_KEY)?.value as string))
      locale = match.bind(config)(typeof detect != "function" ? detect || null : detect(req));
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
  return config.mw?.(req, res) ?? res;
}

export default middleware;
