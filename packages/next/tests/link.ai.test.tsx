// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { forwardRef, type ReactNode } from "react";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");
// next/server relies on the runtime fetch primitives, which happy-dom would replace
const nativeFetchPrimitives = { fetch, Headers, Request, Response, URL, URLSearchParams };

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
  Object.assign(globalThis, nativeFetchPrimitives);
}

const happyDOM: { setURL(url: string): void } = Reflect.get(window, "happyDOM");

const navigationSnapshot = { ...(await import("next/navigation")) };
const headersSnapshot = { ...(await import("next/headers")) };

const headerStore = new Map<string, string>();

mock.module("next/navigation", () => ({
  useRouter: () => ({ push() {}, replace() {}, prefetch() {}, refresh() {} }),
  usePathname: () => "/en/dashboard",
}));

mock.module("next/headers", () => ({
  headers: async () => ({
    get(key: string) {
      return headerStore.get(key) ?? null;
    },
  }),
  cookies: async () => new Headers(),
}));

const { LC } = await import("../src/link-client");
const { LS, Link } = await import("../src/link-server");
const { default: DefaultLink } = await import("../src/link");
const { PATH_HEADERS_KEY } = await import("../src/headers");
const { TranslationNode } = await import("../src/translation");

afterAll(() => {
  mock.module("next/navigation", () => navigationSnapshot);
  mock.module("next/headers", () => headersSnapshot);
  happyDOM.setURL("about:blank");
});

// custom Link components must match next/link's forwardRef shape to satisfy the LC generics
const CustomAnchor = forwardRef<HTMLAnchorElement, { href?: string | object; children?: ReactNode }>(function CustomAnchor(
  { href, children },
  ref,
) {
  return (
    <a data-custom href={typeof href === "string" ? href : undefined} ref={ref}>
      {children}
    </a>
  );
});

function hrefOf(container: HTMLElement) {
  const anchor = container.querySelector("a");
  if (!anchor) throw new Error("Expected the link to render an anchor");
  return anchor.getAttribute("href");
}

describe("next link client component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
    headerStore.clear();
    happyDOM.setURL("https://intl-t.dev/");
    TranslationNode.t = null;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
  });

  it("localizes the href through the default next/link component", () => {
    const view = render(<LC href="/about" locale="es" config={{ allowedLocales: ["en", "es"], defaultLocale: "en" }} />);

    expect(hrefOf(view.container)).toBe("/es/about");
  });

  it("falls back to the current pathname when only a locale is given", () => {
    const view = render(<LC href="" locale="es" config={{ allowedLocales: ["en", "es"], pathPrefix: "always" }} />);

    expect(hrefOf(view.container)).toBe("/es/dashboard");
  });

  it("resolves the locale through the useLocale hook when no locale is given", async () => {
    localStorage.setItem("locale", "es");

    const view = render(
      <LC href="/about" config={{ allowedLocales: ["en", "es"], defaultLocale: "en", pathPrefix: "always", redirectPath: "r" }} />,
    );

    await waitFor(() => expect(hrefOf(view.container)).toBe("/es/about"));
  });

  it("renders through a custom Link component from the config", () => {
    const view = render(
      <LC href="/pricing" locale="es" config={{ allowedLocales: ["en", "es"], defaultLocale: "en", Link: CustomAnchor }} />,
    );

    const anchor = view.container.querySelector("a");
    expect(anchor?.hasAttribute("data-custom")).toBe(true);
    expect(anchor?.getAttribute("href")).toBe("/es/pricing");
  });
});

describe("next link server component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    headerStore.clear();
    happyDOM.setURL("https://intl-t.dev/");
    TranslationNode.t = null;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("resolves and renders the localized href", async () => {
    const element = await LS({ href: "/about", locale: "es", config: { allowedLocales: ["en", "es"], defaultLocale: "en" } });

    const view = render(element);
    expect(hrefOf(view.container)).toBe("/es/about");
  });

  it("delegates to the client link when the pathname would be dynamic", async () => {
    const element = await LS({ locale: "es", config: { allowedLocales: ["en", "es"], pathPrefix: "always" } });

    expect<unknown>(element.type).toBe(LC);

    const view = render(element);
    expect(hrefOf(view.container)).toBe("/es/dashboard");
  });

  it("reads the request pathname when dynamic rendering is allowed", async () => {
    headerStore.set(PATH_HEADERS_KEY, "/docs");

    const element = await LS({
      locale: "es",
      preventDynamic: false,
      config: { allowedLocales: ["en", "es"], defaultLocale: "en", pathPrefix: "always" },
    });

    const view = render(element);
    expect(hrefOf(view.container)).toBe("/es/docs");
  });

  it("falls back to the redirect path when no locale can be resolved statically", async () => {
    const element = await LS({
      href: "/pricing",
      config: { allowedLocales: ["en", "es"], defaultLocale: "en", pathPrefix: "default", redirectPath: "r" },
    });

    const view = render(element);
    expect(hrefOf(view.container)).toBe("/r/pricing");
  });

  it("exposes the client component as the Link binding outside RSC", () => {
    expect<unknown>(Link).toBe(LC);
    expect<unknown>(DefaultLink).toBe(LC);
  });
});
