// AI generated test
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement, isValidElement, Suspense, type ReactElement } from "react";
import { getCache } from "../src/cache";
import { LOCALE_HEADERS_KEY } from "../src/headers";
import { TranslationDynamic, TranslationProvider, getTranslation } from "../src/rsc";
import { createTranslation, TranslationNode } from "../src/translation";

// Direct generic invocation of the RSC providers exceeds the compiler's depth budget (TS2589) — invoke type-erased.
const renderProvider: Function = TranslationProvider;
const renderDynamic: Function = TranslationDynamic;

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

afterAll(() => {
  mock.module("next/headers", () => headersSnapshot);
});

function createMessages(): Record<string, { common: { hello: string; bye: string } }> {
  return {
    en: {
      common: {
        hello: "Hello {name}",
        bye: "Goodbye",
      },
    },
    es: {
      common: {
        hello: "Hola {name}",
        bye: "Adios",
      },
    },
  };
}

// the provider generics only accept the global translation node, so the tests
// register the translation the same way applications do
function createNextTranslation() {
  const t = createTranslation({
    locales: createMessages(),
    mainLocale: "en",
  });
  TranslationNode.t = t;
  return t;
}

interface ProviderElementProps {
  locale?: string;
  fallback?: ReactElement;
  children?: ReactElement;
}

function asElement<P = ProviderElementProps>(value: {} | null | undefined): ReactElement<P> {
  if (!isValidElement<P>(value)) throw new Error("Expected a react element");
  return value;
}

describe("next rsc helpers", () => {
  beforeEach(() => {
    headerStore.clear();
    cookieStore.clear();
    getCache().locale = undefined;
    getCache().t = undefined;
    TranslationNode.t = null;
  });

  it("returns a suspense boundary when locale resolution stays dynamic", async () => {
    createNextTranslation();

    const element = asElement(
      await renderProvider({
        children: createElement("span", { "data-testid": "child" }, "child"),
      }),
    );

    expect<unknown>(element.type).toBe(Suspense);
    expect<unknown>(asElement(element.props.fallback).type).toBe(TranslationProvider);
    expect<unknown>(asElement(element.props.children).type).toBe(TranslationDynamic);
  });

  it("returns the translated base when rendered without children", async () => {
    createNextTranslation();

    const value = await renderProvider({
      locale: "es",
      path: "common.bye",
    });

    expect(value).toBe("Adios");
  });

  it("returns a client provider element when children are present", async () => {
    createNextTranslation();

    const element = asElement(
      await renderProvider({
        locale: "es",
        children: createElement("span", { "data-testid": "child" }, "child"),
      }),
    );

    expect(element.props.locale).toBe("es");
    expect(asElement<Record<string, string>>(element.props.children).props["data-testid"]).toBe("child");
  });

  it("hydrates the locale through request headers in dynamic rendering", async () => {
    createNextTranslation();
    headerStore.set(LOCALE_HEADERS_KEY, "es");

    const element = asElement(
      await renderDynamic({
        children: createElement("span", { "data-testid": "child" }, "child"),
      }),
    );

    expect<unknown>(element.type).toBe(TranslationProvider);
    expect(element.props.locale).toBe("es");
  });

  it("throws when hook access is attempted without a translation", () => {
    expect(() => getTranslation.call(undefined, "common.bye")).toThrow("Translation not found");
  });

  it("resolves the translation through the async proxy when the locale is dynamic", async () => {
    const t = createNextTranslation();
    headerStore.set(LOCALE_HEADERS_KEY, "es");

    const proxied = getTranslation.call(t, "common.bye");

    // property access resolves synchronously against the currently loaded locale
    expect(String(proxied.base)).toBe("Goodbye");

    // awaiting resolves once the request locale has been read from the headers
    const resolved = await proxied;
    expect(String(resolved.base)).toBe("Adios");
  });

  it("returns the translation synchronously when dynamic resolution is prevented", () => {
    const t = createNextTranslation();
    t.settings.preventDynamic = true;

    const node = getTranslation.call(t, "common.bye");

    expect(String(node.base)).toBe("Goodbye");
  });
});
