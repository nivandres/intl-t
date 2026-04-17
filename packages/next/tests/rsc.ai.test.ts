// AI generated test
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { createElement, isValidElement, Suspense } from "react";
import { getCache } from "../src/cache";
import { LOCALE_HEADERS_KEY } from "../src/headers";
import { TranslationDynamic, TranslationProvider, getTranslation } from "../src/rsc";
import { createTranslation, TranslationNode } from "../src/translation";

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

function createMessages(): Record<string, any> {
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

function createNextTranslation() {
  return createTranslation({
    locales: createMessages(),
    mainLocale: "en",
  }) as any;
}

describe("next rsc helpers", () => {
  beforeEach(() => {
    headerStore.clear();
    cookieStore.clear();
    getCache().locale = undefined as never;
    getCache().t = undefined as never;
    TranslationNode.t = null as never;
  });

  it("returns a suspense boundary when locale resolution stays dynamic", async () => {
    const t = createNextTranslation();

    const element = await (TranslationProvider as any)({
      t: t as any,
      children: createElement("span", { "data-testid": "child" }, "child"),
    } as never);

    expect(isValidElement(element)).toBe(true);
    expect((element as any).type).toBe(Suspense);
    expect((element as any).props.fallback.type).toBe(TranslationProvider);
    expect((element as any).props.children.type).toBe(TranslationDynamic);
  });

  it("returns the translated base when rendered without children", async () => {
    const t = createNextTranslation();

    const value = await (TranslationProvider as any)({
      t: t as any,
      locale: "es",
      path: "common.bye",
    } as never);

    expect(value).toBe("Adios");
  });

  it("returns a client provider element when children are present", async () => {
    const t = createNextTranslation();

    const element = await (TranslationProvider as any)({
      t: t as any,
      locale: "es",
      children: createElement("span", { "data-testid": "child" }, "child"),
    } as never);

    expect(isValidElement(element)).toBe(true);
    expect((element as any).props.locale).toBe("es");
    expect((element as any).props.children.props["data-testid"]).toBe("child");
  });

  it("hydrates the locale through request headers in dynamic rendering", async () => {
    const t = createNextTranslation();
    headerStore.set(LOCALE_HEADERS_KEY, "es");

    const element = await (TranslationDynamic as any)({
      t: t as any,
      children: createElement("span", { "data-testid": "child" }, "child"),
    } as never);

    expect(isValidElement(element)).toBe(true);
    expect((element as any).type).toBe(TranslationProvider);
    expect((element as any).props.locale).toBe("es");
  });

  it("throws when hook access is attempted without a translation", () => {
    expect(() => getTranslation.call(undefined, "common.bye")).toThrow("Translation not found");
  });
});
