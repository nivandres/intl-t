// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { cleanup, render } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement } from "react";
import { createNavigation } from "../src/navigation";
import { TranslationNode } from "../src/translation";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");
// next/server relies on the runtime fetch primitives, which happy-dom would replace
const nativeFetchPrimitives = { fetch, Headers, Request, Response, URL, URLSearchParams };

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
  Object.assign(globalThis, nativeFetchPrimitives);
}

const navigationSnapshot = { ...(await import("next/navigation")) };

const calls = {
  push: [] as Array<[string, Record<string, unknown>]>,
  redirect: [] as Array<[string, string | undefined]>,
  permanentRedirect: [] as Array<[string, string | undefined]>,
};

mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: (href: string, options: Record<string, unknown> = {}) => {
      calls.push.push([href, options]);
    },
    replace() {},
    prefetch() {},
    refresh() {},
  }),
  usePathname: () => "/en/dashboard",
  redirect: (href: string, type?: string) => {
    calls.redirect.push([href, type]);
  },
  permanentRedirect: (href: string, type?: string) => {
    calls.permanentRedirect.push([href, type]);
  },
}));

afterAll(() => {
  mock.module("next/navigation", () => navigationSnapshot);
});

describe("createNavigation", () => {
  beforeEach(() => {
    calls.push.length = 0;
    calls.redirect.length = 0;
    calls.permanentRedirect.length = 0;
    TranslationNode.t = null;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
  });

  it("accepts a locales-only config without crashing (allowedLocales derived)", () => {
    const nav = createNavigation({ locales: ["en", "fr"] });
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
    });
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
    const request = createNavigation({ locales: ["en"], strategy: "request" });
    expect(request.config.pathPrefix).toBe("hidden");
    expect(request.config.pathBase).toBe("detect-latest");

    const param = createNavigation({ locales: ["en"] });
    expect(param.config.pathPrefix).toBe("default");
    expect(param.config.pathBase).toBe("detect-default");
  });

  it("exposes working hook wrappers bound to the navigation config", () => {
    const nav = createNavigation({ locales: ["en", "es"] });
    let pathname = "";
    let locale = "";
    let pushHref = "";

    function Probe() {
      pathname = nav.usePathname();
      locale = String(nav.useLocale(nav.locale)[0]);
      const router = nav.useRouter();
      pushHref = typeof router.push == "function" ? "ready" : "missing";
      return null;
    }

    render(createElement(Probe));

    expect(pathname).toBe("/dashboard");
    expect(locale).toBe("en");
    expect(pushHref).toBe("ready");
  });

  it("renders the Link wrapper against the navigation config", () => {
    const nav = createNavigation({ locales: ["en", "es"] });

    const view = render(createElement(nav.Link, { href: "/about", locale: "es" }));

    const anchor = view.container.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("/es/about");
  });

  it("redirects through the locale-resolved href", () => {
    const config = { locales: ["en", "es"] as string[], getLocale: () => "es" };
    const nav = createNavigation(config);

    nav.redirect("/about");
    expect(calls.redirect).toEqual([["/es/about", undefined]]);

    nav.permanentRedirect("/about");
    expect(calls.permanentRedirect).toEqual([["/es/about", undefined]]);
  });

  it("hides the default locale prefix when redirecting with the default path prefix", () => {
    const config = { locales: ["en", "es"] as string[], getLocale: () => "en" };
    const nav = createNavigation(config);

    nav.redirect("/about");
    expect(calls.redirect).toEqual([["/about", undefined]]);
  });
});
