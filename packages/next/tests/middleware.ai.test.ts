// AI generated test
import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { LOCALE_COOKIE_KEY } from "../src/cookies";
import { LOCALE_HEADERS_KEY, PATH_HEADERS_KEY } from "../src/headers";
import { createMiddleware, detect, middlewareConfig, middleware } from "../src/middleware";
import { createGenerateStaticParams, generateStaticParams } from "../src/params";

function createRequest(pathname: string, headers?: Record<string, string>) {
  const normalizedHeaders = new Headers();

  for (const [key, value] of Object.entries(headers || {})) {
    normalizedHeaders.set(key, value);
    if (key.toLowerCase() === "cookie") normalizedHeaders.set("Cookie", value);
  }

  return new NextRequest(`https://intl-t.dev${pathname}`, { headers: normalizedHeaders });
}

describe("next params", () => {
  it("generates static params with the configured key", () => {
    expect(generateStaticParams.call({ locales: ["en", "es"], param: "locale" })).toEqual([{ locale: "en" }, { locale: "es" }]);
  });

  it("creates a bound static params generator", () => {
    const generate = createGenerateStaticParams({ locales: ["en", "es"], param: "lang" });
    expect(generate()).toEqual([{ lang: "en" }, { lang: "es" }]);
  });
});

describe("next middleware", () => {
  it("detects locale candidates from configured domains", () => {
    const request = createRequest("/docs");
    Object.defineProperty(request.nextUrl, "hostname", {
      configurable: true,
      value: "es.intl-t.dev",
    });

    expect(
      detect.call(
        {
          domains: [
            {
              domain: "es.intl-t.dev",
              defaultLocale: "es",
              locales: ["es-MX"],
            },
          ],
        },
        request,
      ),
    ).toEqual(["es", "es-MX"]);
  });

  it("binds domain detection automatically when domains are configured", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es", "es-MX"],
      defaultLocale: "en",
      domains: [
        {
          domain: "es.intl-t.dev",
          defaultLocale: "es",
          locales: ["es-MX"],
        },
      ],
    } as any);
    const request = createRequest("/docs");

    Object.defineProperty(request.nextUrl, "hostname", {
      configurable: true,
      value: "es.intl-t.dev",
    });

    expect((middleware.detectLocale as typeof detect | undefined)?.(request)).toEqual(["es", "es-MX"]);
  });

  it("creates a configured middleware function with helpers attached", () => {
    const middleware = createMiddleware({ allowedLocales: ["en", "es"], defaultLocale: "en" });

    expect(middleware).toBeFunction();
    expect(middleware.matcher).toEqual(middlewareConfig.matcher);
    expect(middleware.withMiddleware).toBeFunction();
    expect(middleware.match).toBeFunction();
  });

  it("redirects unknown paths to the detected locale and sets i18n headers", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      pathPrefix: "always",
    });

    const response = middleware(createRequest("/docs"));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/es/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
    expect(response.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es");
  });

  it("uses accept-language negotiation when detect is omitted", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "always",
    });

    const response = middleware(createRequest("/docs", { "Accept-Language": "es,en;q=0.8" }));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/es/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("treats the redirect path as a forced detection entrypoint", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      redirectPath: "r",
    });

    const response = middleware(createRequest("/r/docs"));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/es/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("prefers the default locale over a cookie in detect-default mode", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "always",
    });

    const response = middleware(createRequest("/docs", { cookie: "locale=es" }));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/en/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(response.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("en");
  });

  it("forces the default locale in always-default mode", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "always",
      pathBase: "always-default",
      detectLocale: ["es"],
    });

    const response = middleware(createRequest("/docs", { cookie: "locale=es" }));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/en/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(response.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("en");
  });

  it("removes the default locale prefix when pathPrefix is default", () => {
    const middleware = createMiddleware({ allowedLocales: ["en", "es"], defaultLocale: "en" });

    const response = middleware(createRequest("/en/docs"));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("keeps unprefixed paths canonical when using request strategy", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      strategy: "request",
    });

    const response = middleware(createRequest("/docs"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
    expect(response.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es");
  });

  it("rewrites to the localized path when the param strategy uses optional prefixes", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      pathPrefix: "optional",
    });

    const response = middleware(createRequest("/docs"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://intl-t.dev/es/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("keeps unprefixed paths canonical for the default locale in request default mode", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["en"],
      strategy: "request",
      pathPrefix: "default",
    });

    const response = middleware(createRequest("/docs"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("redirects to a visible locale prefix when request strategy requires it", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      strategy: "request",
      pathPrefix: "always",
    });

    const response = middleware(createRequest("/docs"));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/es/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("redirects only once from a default-locale prefix back to the unprefixed canonical request path", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["en"],
      strategy: "request",
      pathPrefix: "default",
    });

    const prefixedResponse = middleware(createRequest("/en/docs"));

    expect(prefixedResponse.headers.get("location")).toBe("https://intl-t.dev/docs");
    expect(prefixedResponse.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(prefixedResponse.headers.get(PATH_HEADERS_KEY)).toBe("/docs");

    const canonicalResponse = middleware(createRequest("/docs"));

    expect(canonicalResponse.headers.get("location")).toBeNull();
    expect(canonicalResponse.headers.get("x-middleware-rewrite")).toBeNull();
    expect(canonicalResponse.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(canonicalResponse.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("redirects locale-prefixed paths to the hidden canonical path when using request strategy", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      strategy: "request",
    });

    const response = middleware(createRequest("/es/docs"));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("rewrites locale-prefixed request paths internally when the prefix must stay visible", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      strategy: "request",
      pathPrefix: "always",
    });

    const response = middleware(createRequest("/es/docs"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://intl-t.dev/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("redirects request default mode to a non-default visible prefix and then stabilizes", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      strategy: "request",
      pathPrefix: "default",
    });

    const unprefixedResponse = middleware(createRequest("/docs"));

    expect(unprefixedResponse.headers.get("location")).toBe("https://intl-t.dev/es/docs");
    expect(unprefixedResponse.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(unprefixedResponse.headers.get(PATH_HEADERS_KEY)).toBe("/docs");

    const prefixedResponse = middleware(createRequest("/es/docs"));

    expect(prefixedResponse.headers.get("location")).toBeNull();
    expect(prefixedResponse.headers.get("x-middleware-rewrite")).toBe("https://intl-t.dev/docs");
    expect(prefixedResponse.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(prefixedResponse.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("composes custom middleware on top of the i18n response", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detectLocale: ["es"],
      pathPrefix: "always",
    });
    const composed = middleware.withMiddleware!((_req, _ev, response) => {
      response?.headers.set("x-composed", "1");
      return response;
    });

    const responsePromise = composed(createRequest("/docs"), void 0 as any, void 0 as any);

    return Promise.resolve(responsePromise).then(response => {
      expect(response).toBeDefined();
      if (!response) throw new Error("Expected middleware response");

      expect(response.headers.get("location")).toBe("https://intl-t.dev/es/docs");
      expect(response.headers.get("x-composed")).toBe("1");
    });
  });

  it("falls back to the raw middleware defaults when called without bound helpers", () => {
    const response = middleware.call(
      {
        allowedLocales: ["en", "es"],
        defaultLocale: "en",
        pathPrefix: "always",
        pathBase: "always-detect",
        detect: false,
      },
      createRequest("/docs"),
    );

    expect(response.headers.get("location")).toBe("https://intl-t.dev/docs");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY) ?? "").toBe("");
  });
});

// Matrix regression tests — freezes the routing semantics (strategy × pathPrefix × cookie ×
// detection) : unprefixed + non-default detection redirects
// (no more [locale]="about" fall-through), root "/" resolves in a single hop without a trailing
// slash, and every response carries the x-locale/x-path headers and locale cookie contract.
function matrixRequest(pathname: string, { cookie, lang }: { cookie?: string; lang?: string } = {}) {
  const headers = new Headers();
  if (lang) headers.set("Accept-Language", lang);
  if (cookie) headers.set("Cookie", `${LOCALE_COOKIE_KEY}=${cookie}`);
  return new NextRequest(`https://intl-t.dev${pathname}`, { headers });
}

const rewriteOf = (res: Response) => res.headers.get("x-middleware-rewrite");
const locationOf = (res: Response) => res.headers.get("location");

const matrixBase = { allowedLocales: ["en", "es"], defaultLocale: "en" };

describe("middleware matrix — strategy param + pathPrefix default", () => {
  const mw = () => createMiddleware<string>({ ...matrixBase });

  it("rewrites unprefixed paths when detection matches the default", () => {
    const res = mw()(matrixRequest("/about", { lang: "en" }));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/en/about");
    expect(locationOf(res)).toBeNull();
  });

  it("redirects a first visit with non-default detection to the prefixed URL", () => {
    const res = mw()(matrixRequest("/about", { lang: "es,en;q=0.8" }));
    expect(locationOf(res)).toBe("https://intl-t.dev/es/about");
  });

  it("serves the default on unprefixed paths for returning visitors (cookie ignored under detect-default)", () => {
    const res = mw()(matrixRequest("/about", { cookie: "es" }));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/en/about");
    expect(locationOf(res)).toBeNull();
  });

  it("redirects the prefixed default locale back to the clean URL", () => {
    const res = mw()(matrixRequest("/en/about"));
    expect(locationOf(res)).toBe("https://intl-t.dev/about");
  });

  it("passes through prefixed non-default locales with i18n headers", () => {
    const res = mw()(matrixRequest("/es/about"));
    expect(locationOf(res)).toBeNull();
    expect(rewriteOf(res)).toBeNull();
    expect(res.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(res.headers.get(PATH_HEADERS_KEY)).toBe("/about");
    expect(res.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es");
  });

  it("redirects the root path in a single hop without a trailing slash", () => {
    const res = mw()(matrixRequest("/", { lang: "es" }));
    expect(locationOf(res)).toBe("https://intl-t.dev/es");
  });

  it("rewrites the root path for default detection without a trailing slash", () => {
    const res = mw()(matrixRequest("/", { lang: "en" }));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/en");
  });

  it("falls back to the default locale for unsupported detected languages", () => {
    const res = mw()(matrixRequest("/about", { lang: "fr" }));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/en/about");
  });

  it("falls back to detection when the locale cookie holds a value outside allowedLocales", () => {
    // Stale/poisoned cookie (e.g. a locale removed from allowedLocales) must be ignored,
    // otherwise it redirects to /zz/about and accumulates segments forever.
    const res = mw()(matrixRequest("/about", { cookie: "zz", lang: "es,en;q=0.8" }));
    expect(locationOf(res)).toBe("https://intl-t.dev/es/about");
    expect(res.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es"); // self-heals the stale cookie
  });
});

describe("middleware matrix — strategy param + other prefixes", () => {
  it("always: redirects unprefixed paths to the detected locale", () => {
    const mw = createMiddleware<string>({ ...matrixBase, pathPrefix: "always" });
    const res = mw(matrixRequest("/docs", { lang: "es" }));
    expect(locationOf(res)).toBe("https://intl-t.dev/es/docs");
  });

  it("always: passes through correctly prefixed paths", () => {
    const mw = createMiddleware<string>({ ...matrixBase, pathPrefix: "always" });
    const res = mw(matrixRequest("/es/docs"));
    expect(locationOf(res)).toBeNull();
    expect(rewriteOf(res)).toBeNull();
  });

  it("optional: rewrites unprefixed paths keeping the clean URL", () => {
    const mw = createMiddleware<string>({ ...matrixBase, pathPrefix: "optional" });
    const res = mw(matrixRequest("/docs", { lang: "es" }));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/es/docs");
    expect(locationOf(res)).toBeNull();
  });

  it("optional: passes through prefixed paths untouched", () => {
    const mw = createMiddleware<string>({ ...matrixBase, pathPrefix: "optional" });
    const res = mw(matrixRequest("/es/docs"));
    expect(locationOf(res)).toBeNull();
    expect(rewriteOf(res)).toBeNull();
  });

  it("hidden: rewrites unprefixed paths so the param route still receives the locale", () => {
    const mw = createMiddleware<string>({ ...matrixBase, pathPrefix: "hidden" });
    const res = mw(matrixRequest("/docs", { cookie: "es" }));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/es/docs");
  });

  it("redirect path entrypoint forces detection and always redirects", () => {
    const mw = createMiddleware<string>({ ...matrixBase });
    const res = mw(matrixRequest("/r/docs", { cookie: "es" }));
    expect(locationOf(res)).toBe("https://intl-t.dev/es/docs");
  });
});

describe("middleware matrix — strategy request", () => {
  it("passes through unprefixed paths exposing locale via headers, skipping the redundant Set-Cookie", () => {
    const mw = createMiddleware<string>({ ...matrixBase, strategy: "request" });
    const res = mw(matrixRequest("/dashboard", { cookie: "es" }));
    expect(locationOf(res)).toBeNull();
    expect(rewriteOf(res)).toBeNull();
    expect(res.headers.get(LOCALE_HEADERS_KEY)).toBe("es"); // metadata: always present
    expect(res.headers.get(PATH_HEADERS_KEY)).toBe("/dashboard");
    expect(res.cookies.get(LOCALE_COOKIE_KEY)).toBeUndefined(); // unchanged cookie → cacheable response
  });

  it("hidden: redirects prefixed URLs to their clean form persisting the locale switch", () => {
    const mw = createMiddleware<string>({ ...matrixBase, strategy: "request" });
    const res = mw(matrixRequest("/es/dashboard"));
    expect(locationOf(res)).toBe("https://intl-t.dev/dashboard");
    expect(res.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es");
  });

  it("always: rewrites prefixed URLs to the unprefixed route keeping the URL", () => {
    const mw = createMiddleware<string>({ ...matrixBase, strategy: "request", pathPrefix: "always" });
    const res = mw(matrixRequest("/es/dashboard"));
    expect(rewriteOf(res)).toBe("https://intl-t.dev/dashboard");
    expect(res.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
  });

  // Mirrors the production curl verification on the pages-router example (Next 16.2.9).
  it("always: ignores a stale cookie and redirects to the detected locale (self-healing)", () => {
    const mw = createMiddleware<string>({ ...matrixBase, strategy: "request", pathPrefix: "always" });
    const res = mw(matrixRequest("/about", { cookie: "zz", lang: "es" }));
    expect(locationOf(res)).toBe("https://intl-t.dev/es/about");
    expect(res.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es");
  });

  it("hidden: passes through the root path exposing x-path '/'", () => {
    const mw = createMiddleware<string>({ ...matrixBase, strategy: "request" });
    const res = mw(matrixRequest("/", { cookie: "es" }));
    expect(locationOf(res)).toBeNull();
    expect(rewriteOf(res)).toBeNull();
    expect(res.headers.get(PATH_HEADERS_KEY)).toBe("/");
    expect(res.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
  });
});
