// AI generated test
import { describe, expect, it } from "bun:test";
import { createNavigation } from "../src/navigation";

describe("createNavigation", () => {
  it("accepts a locales-only config without crashing (allowedLocales derived)", () => {
    const nav = createNavigation({ locales: ["en", "fr"] } as any);
    expect(nav.allowedLocales).toEqual(["en", "fr"]);
    expect(nav.locales).toEqual(["en", "fr"]);
    expect(nav.locale).toBe("en");
    expect(nav.config.defaultLocale).toBe("en");
    expect(nav.config.param).toBe("locale");
  });

  it("supports the destructure-everything pattern without touching client exports", () => {
    // The client hook/component members are call-time wrappers: destructuring them (as apps
    // commonly do at module scope in proxy-imported files) must never dereference the
    // underlying "use client" exports — eager access crashes the Next >=16.2 proxy environment
    // with "Using Client Components is not allowed in this environment".
    const { proxy, withProxy, useRouter, Link, useLocale, usePathname, setLocale, getLocale } = createNavigation({
      locales: ["en", "es"],
      strategy: "request",
    } as any);
    expect(proxy).toBeFunction();
    expect(withProxy).toBeFunction();
    expect(useRouter).toBeFunction();
    expect(Link).toBeFunction();
    expect(useLocale).toBeFunction();
    expect(usePathname).toBeFunction();
    expect(setLocale).toBeFunction();
    expect(getLocale).toBeFunction();
  });

  it("defaults pathPrefix/pathBase from the strategy", () => {
    const request = createNavigation({ locales: ["en"], strategy: "request" } as any);
    expect(request.config.pathPrefix).toBe("hidden");
    expect(request.config.pathBase).toBe("detect-latest");

    const param = createNavigation({ locales: ["en"] } as any);
    expect(param.config.pathPrefix).toBe("default");
    expect(param.config.pathBase).toBe("detect-default");
  });
});
