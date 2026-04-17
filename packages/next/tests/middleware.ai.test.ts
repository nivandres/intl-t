// AI generated test
import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { LOCALE_COOKIE_KEY } from "../src/cookies";
import { LOCALE_HEADERS_KEY, PATH_HEADERS_KEY } from "../src/headers";
import { createMiddleware, detect, middlewareConfig, middleware } from "../src/middleware";
import { createGenerateStaticParams, generateStaticParams } from "../src/params";

function createRequest(pathname: string, headers?: Record<string, string>) {
  return new NextRequest(`https://intl-t.dev${pathname}`, { headers });
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

    expect((middleware.detect as typeof detect | undefined)?.(request)).toEqual(["es", "es-MX"]);
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
      detect: ["es"],
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
      detect: ["es"],
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
      detect: ["es"],
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
      detect: ["es"],
      strategy: "request",
    });

    const response = middleware(createRequest("/docs"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
    expect(response.cookies.get(LOCALE_COOKIE_KEY)?.value).toBe("es");
  });

  it("prefers the latest cookie locale in request strategy detect-latest mode", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detect: ["en"],
      strategy: "request",
    });

    const response = middleware(createRequest("/docs", { cookie: "locale=es" }));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("rewrites to the localized path when the param strategy uses optional prefixes", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      detect: ["es"],
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
      detect: ["en"],
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
      detect: ["es"],
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
      detect: ["en"],
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
      detect: ["es"],
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
      detect: ["es"],
      pathPrefix: "always",
    });
    const composed = middleware.withMiddleware!((_req, _ev, response) => {
      response?.headers.set("x-composed", "1");
      return response;
    });

    const responsePromise = composed(createRequest("/docs"));

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
