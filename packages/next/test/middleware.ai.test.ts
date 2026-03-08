import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { LOCALE_HEADERS_KEY, PATH_HEADERS_KEY } from "../src/headers";
import { createMiddleware, detect, LOCALE_COOKIE_KEY, middlewareConfig } from "../src/middleware";
import { createStaticParams, generateStaticParams } from "../src/params";

function createRequest(pathname: string, headers?: Record<string, string>) {
  return new NextRequest(`https://intl-t.dev${pathname}`, { headers });
}

describe("next params", () => {
  it("generates static params with the configured key", () => {
    expect(generateStaticParams.call({ locales: ["en", "es"], param: "locale" })).toEqual([{ locale: "en" }, { locale: "es" }]);
  });

  it("creates a bound static params generator", () => {
    const generate = createStaticParams({ locales: ["en", "es"], param: "lang" });
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

  it("removes the default locale prefix when pathPrefix is default", () => {
    const middleware = createMiddleware({ allowedLocales: ["en", "es"], defaultLocale: "en" });

    const response = middleware(createRequest("/en/docs"));

    expect(response.headers.get("location")).toBe("https://intl-t.dev/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("en");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
  });

  it("rewrites locale-prefixed paths when using header strategy", () => {
    const middleware = createMiddleware({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      strategy: "headers",
    });

    const response = middleware(createRequest("/es/docs"));

    expect(response.headers.get("x-middleware-rewrite")).toBe("https://intl-t.dev/docs");
    expect(response.headers.get(LOCALE_HEADERS_KEY)).toBe("es");
    expect(response.headers.get(PATH_HEADERS_KEY)).toBe("/docs");
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
});
