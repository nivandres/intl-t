// AI generated test
import { afterAll, describe, expect, it, mock } from "bun:test";

const headersSnapshot = { ...(await import("next/headers")) };

// The runtime helpers must degrade gracefully when next/headers is unavailable
// (e.g. static rendering or a non-Next runtime), so the store factories throw here.
mock.module("next/headers", () => ({
  headers: () => {
    throw new Error("headers is not available outside a request scope");
  },
  cookies: () => {
    throw new Error("cookies is not available outside a request scope");
  },
}));

const { cookies, getCookieLocale, setCookieLocale } = await import("../src/cookies");
const { headers, getHeadersLocale, getHeadersPathname } = await import("../src/headers");

afterAll(() => {
  mock.module("next/headers", () => headersSnapshot);
});

describe("next headers fallback", () => {
  it("falls back to an empty Headers store when the request headers are unavailable", async () => {
    expect(await headers()).toBeInstanceOf(Headers);
  });

  it("falls back to an empty Headers store when the request cookies are unavailable", async () => {
    expect(await cookies()).toBeInstanceOf(Headers);
  });

  it("resolves no locale or pathname from the fallback store", async () => {
    expect(await getHeadersLocale()).toBeUndefined();
    expect(await getHeadersPathname()).toBeNull();
    expect(await getCookieLocale()).toBeUndefined();
  });

  it("still resolves the written locale when setting a cookie on the fallback store", async () => {
    expect(await setCookieLocale("es")).toBe("es");
  });
});
