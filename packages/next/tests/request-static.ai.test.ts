// AI generated test
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

const headersSnapshot = { ...(await import("next/headers")) };
const cacheSnapshot = { ...(await import("next/cache")) };

const headerStore = new Map<string, string>();
const cookieStore = new Map<string, string>();
// invocation counters guard the static rendering contract: reaching cookies() or
// headers() during static generation opts the whole route into dynamic rendering
const calls = { cookies: 0, headers: 0, refresh: 0 };

mock.module("next/headers", () => ({
  headers: async () => {
    calls.headers++;
    return {
      get(key: string) {
        return headerStore.get(key) ?? null;
      },
    };
  },
  cookies: async () => {
    calls.cookies++;
    return {
      get(key: string) {
        const value = cookieStore.get(key);
        return value ? { name: key, value } : undefined;
      },
      set(key: string, value: string) {
        cookieStore.set(key, value);
      },
    };
  },
}));

mock.module("next/cache", () => ({
  refresh: () => {
    calls.refresh++;
  },
}));

const { getCache } = await import("../src/cache");
const { LOCALE_COOKIE_KEY } = await import("../src/cookies");
const { getRequestLocale, setRequestLocale } = await import("../src/request");

afterAll(() => {
  mock.module("next/headers", () => headersSnapshot);
  mock.module("next/cache", () => cacheSnapshot);
});

// the dynamic accessors resolve through promise chains, so a macrotask flush must pass
// before asserting that no dynamic request API was reached
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function createBinding() {
  return { settings: { locale: "en" as string } };
}

describe("static rendering contract", () => {
  beforeEach(() => {
    headerStore.clear();
    cookieStore.clear();
    calls.cookies = 0;
    calls.headers = 0;
    calls.refresh = 0;
    getCache().locale = undefined;
  });

  it("setRequestLocale with defaults never invokes cookies() or headers()", async () => {
    const binding = createBinding();

    // the default form must resolve synchronously: an SSG page cannot await request APIs
    expect(setRequestLocale.call(binding, "es")).toBe("es");
    expect(binding.settings.locale).toBe("es");

    await flush();
    expect(calls.cookies).toBe(0);
    expect(calls.headers).toBe(0);
    expect(calls.refresh).toBe(0);
    expect(cookieStore.size).toBe(0);
  });

  it("getRequestLocale with preventDynamic never invokes cookies() or headers()", async () => {
    const binding = createBinding();

    // the static sources (cache, root params) still run — what preventDynamic blocks is everything
    // that would opt the render into dynamic rendering
    expect(await getRequestLocale.call(binding, true)).toBeUndefined();

    await flush();
    expect(calls.cookies).toBe(0);
    expect(calls.headers).toBe(0);
  });

  it("writes the locale cookie in the explicit dynamic form", async () => {
    const binding = createBinding();

    expect(await setRequestLocale.call(binding, "fr", false)).toBe("fr");

    expect(cookieStore.get(LOCALE_COOKIE_KEY)).toBe("fr");
    expect(calls.cookies).toBeGreaterThan(0);
    expect(calls.refresh).toBe(0); // refresh stays opt-in
    expect(binding.settings.locale).toBe("fr");
  });

  it("refreshes the router cache only when the dynamic form requests it", async () => {
    const binding = createBinding();

    expect(await setRequestLocale.call(binding, "de", false, true)).toBe("de");

    expect(cookieStore.get(LOCALE_COOKIE_KEY)).toBe("de");
    expect(calls.refresh).toBe(1);
  });
});
