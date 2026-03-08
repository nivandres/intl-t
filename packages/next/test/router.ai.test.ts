import { beforeEach, describe, expect, it, mock } from "bun:test";

const calls = {
  push: [] as Array<[string, Record<string, unknown>]>,
  replace: [] as Array<[string, Record<string, unknown>]>,
  prefetch: [] as Array<[string, Record<string, unknown>]>,
};

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: (href: string, options: Record<string, unknown> = {}) => {
      calls.push.push([href, options]);
    },
    replace: (href: string, options: Record<string, unknown> = {}) => {
      calls.replace.push([href, options]);
    },
    prefetch: (href: string, options: Record<string, unknown> = {}) => {
      calls.prefetch.push([href, options]);
      return Promise.resolve();
    },
  }),
  usePathname: () => "/en/dashboard",
}));

const { usePathname, useRouter } = await import("../src/router");

describe("next router", () => {
  beforeEach(() => {
    calls.push.length = 0;
    calls.replace.length = 0;
    calls.prefetch.length = 0;
  });

  it("resolves the pathname without the locale prefix", () => {
    expect(usePathname()).toBe("/dashboard");
  });

  it("localizes push, replace and prefetch while preserving router options", async () => {
    const router = useRouter.bind({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "default",
    })();

    router.push("/profile", { locale: "es", scroll: false } as never);
    router.replace("/settings", { locale: "en" } as never);
    await router.prefetch("/billing", { locale: "es" } as never);

    expect(calls.push).toEqual([["/es/profile", { scroll: false }]]);
    expect(calls.replace).toEqual([["/settings", {}]]);
    expect(calls.prefetch).toEqual([["/es/billing", {}]]);
  });

  it("exposes the localized pathname getter", () => {
    const router = useRouter.bind({
      allowedLocales: ["en", "es"],
      defaultLocale: "en",
      pathPrefix: "default",
    })();

    expect(router.pathname).toBe("/dashboard");
  });
});
