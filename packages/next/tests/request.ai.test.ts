// AI generated test
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

const headersSnapshot = { ...(await import("next/headers")) };

const headerStore = new Map<string, string>();
const cookieStore = new Map<string, string>();

mock.module("next/headers", () => ({
  headers: async () => ({
    get(key: string) {
      return headerStore.get(key) ?? null;
    },
    set(key: string, value: string) {
      headerStore.set(key, value);
    },
  }),
  cookies: async () => ({
    get(key: string) {
      const value = cookieStore.get(key);
      return value ? { name: key, value } : undefined;
    },
    set(key: string, value: string) {
      cookieStore.set(key, value);
    },
  }),
}));

const cacheModule = await import("../src/cache");
const cookiesModule = await import("../src/cookies");
const headersModule = await import("../src/headers");
const requestModule = await import("../src/request");

afterAll(() => {
  mock.module("next/headers", () => headersSnapshot);
});

function createBinding() {
  return {
    settings: {
      locale: "en" as string,
    },
  };
}

describe("next request state", () => {
  beforeEach(() => {
    headerStore.clear();
    cookieStore.clear();
    cacheModule.getCache().locale = undefined;
  });

  it("sets the cached request locale", () => {
    const binding = createBinding();

    expect(cacheModule.setCachedRequestLocale.call(binding, "es")).toBe("es");
  });

  it("reads the locale header", async () => {
    const binding = createBinding();

    headerStore.set(headersModule.LOCALE_HEADERS_KEY, "es");
    expect(await headersModule.getHeadersLocale.call(binding)).toBe("es");
  });

  it("reads pathname state from request headers", async () => {
    headerStore.set(headersModule.PATH_HEADERS_KEY, "/docs/getting-started");

    expect(await headersModule.getHeadersPathname()).toBe("/docs/getting-started");
    expect(await requestModule.getPathname()).toBe("/docs/getting-started");
    expect(await requestModule.getRequestPathname()).toBe("/docs/getting-started");
  });

  it("reads and writes the locale cookie", async () => {
    const binding = createBinding();

    cookieStore.set(cookiesModule.LOCALE_COOKIE_KEY, "es");
    expect(await cookiesModule.getCookieLocale.call(binding)).toBe("es");

    expect(await cookiesModule.setCookieLocale("fr")).toBe("fr");
    expect(cookieStore.get(cookiesModule.LOCALE_COOKIE_KEY)).toBe("fr");
  });

  it("falls back from headers to cookies when resolving request locale", async () => {
    const binding = createBinding();

    cookieStore.set(cookiesModule.LOCALE_COOKIE_KEY, "fr");
    expect(await requestModule.getRequestLocale.call(binding, false)).toBe("fr");

    headerStore.set(headersModule.LOCALE_HEADERS_KEY, "es");
    cacheModule.getCache().locale = undefined;
    expect(await requestModule.getRequestLocale.call(binding, false)).toBe("es");
  });

  it("applies the request locale without touching the cookie by default", async () => {
    const binding = createBinding();

    expect(await requestModule.setRequestLocale.call(binding, "es")).toBe("es");
    expect(binding.settings.locale).toBe("es"); // reached the bound settings through the cache setter
    expect(cookieStore.get(cookiesModule.LOCALE_COOKIE_KEY)).toBeUndefined(); // static rendering stays safe
  });

  it("returns undefined (not false) when dynamic resolution is prevented and the cache is empty", () => {
    expect(requestModule.getRequestLocale(true)).toBeUndefined(); // `?? defaultLocale` fallbacks depend on this
  });

  it("resolves the request locale from headers and cookies", async () => {
    headerStore.set(headersModule.LOCALE_HEADERS_KEY, "es");

    expect(await requestModule.getRequestLocale(false)).toBe("es");

    cacheModule.getCache().locale = undefined;
    headerStore.clear();
    cookieStore.set(cookiesModule.LOCALE_COOKIE_KEY, "fr");
    expect(await requestModule.getRequestLocale(false)).toBe("fr");
  });
});
