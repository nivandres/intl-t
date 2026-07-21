// AI generated test
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

const headersSnapshot = { ...(await import("next/headers")) };
const cacheSnapshot = { ...(await import("next/cache")) };

const headerStore = new Map<string, string>();
const cookieStore = new Map<string, string>();
const refreshCalls: string[] = [];

mock.module("next/headers", () => ({
  headers: async () => ({
    get(key: string) {
      return headerStore.get(key) ?? null;
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

mock.module("next/cache", () => ({
  refresh: () => {
    refreshCalls.push("refresh");
  },
}));

const actions = await import("../src/actions");
const { LOCALE_COOKIE_KEY } = await import("../src/cookies");
const { LOCALE_HEADERS_KEY, PATH_HEADERS_KEY } = await import("../src/headers");

afterAll(() => {
  mock.module("next/headers", () => headersSnapshot);
  mock.module("next/cache", () => cacheSnapshot);
});

describe("next server actions", () => {
  beforeEach(() => {
    headerStore.clear();
    cookieStore.clear();
    refreshCalls.length = 0;
  });

  it("returns the locale it stores in the request cache", async () => {
    expect(await actions.setCachedRequestLocaleFromClient("es")).toBe("es");
  });

  it("reads no cached locale outside a request scope", async () => {
    // react cache() does not memoize outside an RSC request, so the per-request store is empty
    expect(await actions.getCachedRequestLocaleFromClient()).toBeUndefined();
  });

  it("exposes the cache wrappers under their aliased action names", () => {
    expect(actions.getCacheLocaleFromClient).toBe(actions.getCachedRequestLocaleFromClient);
    expect(actions.setCacheLocaleFromClient).toBe(actions.setCachedRequestLocaleFromClient);
  });

  it("writes and reads the locale cookie", async () => {
    expect(await actions.setCookieLocaleFromClient("fr")).toBe("fr");
    expect(cookieStore.get(LOCALE_COOKIE_KEY)).toBe("fr");
    expect(await actions.getCookieLocaleFromClient()).toBe("fr");
  });

  it("returns undefined when the locale cookie is missing", async () => {
    expect(await actions.getCookieLocaleFromClient()).toBeUndefined();
  });

  it("reads the middleware pathname and locale headers", async () => {
    headerStore.set(PATH_HEADERS_KEY, "/docs/getting-started");
    headerStore.set(LOCALE_HEADERS_KEY, "es");

    expect(await actions.getHeadersPathnameFromClient()).toBe("/docs/getting-started");
    expect(await actions.getHeadersLocaleFromClient()).toBe("es");
  });

  it("resolves the request locale dynamically by default", async () => {
    headerStore.set(LOCALE_HEADERS_KEY, "es");

    expect(await actions.getRequestLocaleFromClient()).toBe("es");
  });

  it("returns undefined when dynamic resolution is prevented and nothing is cached", async () => {
    headerStore.set(LOCALE_HEADERS_KEY, "es");

    expect(await actions.getRequestLocaleFromClient(true)).toBeUndefined();
  });

  it("persists the locale and refreshes the router cache by default", async () => {
    expect(await actions.setRequestLocaleFromClient("en")).toBe("en");

    expect(cookieStore.get(LOCALE_COOKIE_KEY)).toBe("en");
    expect(refreshCalls).toEqual(["refresh"]);
  });

  it("skips the router refresh when disabled", async () => {
    expect(await actions.setRequestLocaleFromClient("fr", false)).toBe("fr");

    expect(cookieStore.get(LOCALE_COOKIE_KEY)).toBe("fr");
    expect(refreshCalls).toEqual([]);
  });
});
