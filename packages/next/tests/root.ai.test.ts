// AI generated test
import { beforeEach, describe, expect, it, mock } from "bun:test";

const headersMock = mock(() => new Headers());
const cookiesMock = mock(() => ({ get: (_key: string) => undefined as { value?: string } | undefined }));

mock.module("next/headers", () => ({
  headers: headersMock,
  cookies: cookiesMock,
}));

mock.module("next/root-params", () => ({
  locale: async () => "es",
  other: async () => "nope",
}));

const root = await import("../src/root");
const rootParams = await import("../src/root-params");
const request = await import("../src/request");

function createBinding(locale = "en") {
  return { settings: { locale } };
}

beforeEach(() => {
  root.pickRootLocale({}); // unwire: no keys, no locale getter
  headersMock.mockClear();
  headersMock.mockImplementation(() => new Headers());
  cookiesMock.mockImplementation(() => ({ get: () => undefined }));
});

describe("next root params architecture", () => {
  it("picks the named locale getter and wires it in one move", async () => {
    const getter = async () => "fr";
    const picked = root.pickRootLocale({ locale: getter });

    expect(picked).toBe(getter);
    const binding = createBinding();
    expect(await root.getRootLocale.call(binding)).toBe("fr"); // wired by the pick itself
  });

  it("supports key override, single-export fallback, and ambiguity as undefined", async () => {
    const lang = async () => "de";
    expect(root.pickRootLocale({ lang, locale: async () => "xx" }, "lang")).toBe(lang);

    const only = async () => "pt";
    expect(root.pickRootLocale({ tenant: only })).toBe(only); // single root param, any name

    expect(root.pickRootLocale({ a: async () => "a", b: async () => "b" })).toBeUndefined(); // ambiguous → no pick
    expect(await root.getRootLocale.call(createBinding())).toBeUndefined(); // and the ambiguous pick unwires
  });

  it("getRootLocale resolves the wired value and caches it into the bound settings", async () => {
    root.pickRootLocale({ locale: async () => "es" });
    const binding = createBinding("en");

    const locale = await root.getRootLocale.call(binding);

    expect(locale).toBe("es");
    expect(binding.settings.locale).toBe("es"); // root.ts caches on resolution, like headers/cookies do
  });

  it("getRootLocale is inert when unwired or when the getter has no value for this context", async () => {
    const binding = createBinding("en");
    expect(await root.getRootLocale.call(binding)).toBeUndefined();
    expect(binding.settings.locale).toBe("en"); // no cache write without a locale

    root.pickRootLocale({ locale: async () => undefined }); // wired, but e.g. a route handler context
    expect(await root.getRootLocale.call(binding)).toBeUndefined();
    expect(binding.settings.locale).toBe("en");
  });

  it("keeps the base surface inert: wireRootParams is a no-op outside the react-server graph", async () => {
    expect(root.wireRootParams()).toBeUndefined();
    expect(root.wireRootParams("locale")).toBeUndefined();
    expect(await root.getRootLocale.call(createBinding())).toBeUndefined(); // the no-op never wires
  });

  it("wires next/root-params through the server variant, with prop re-wire", async () => {
    const binding = createBinding();

    const picked = rootParams.wireRootParams();
    expect(typeof picked).toBe("function"); // auto-detected the `locale` root param
    expect(await root.getRootLocale.call(binding)).toBe("es");

    rootParams.wireRootParams("other");
    expect(await root.getRootLocale.call(binding)).toBe("nope");
  });

  it("re-exports the whole base surface from the server variant", () => {
    expect(rootParams.pickRootLocale).toBe(root.pickRootLocale);
    expect(rootParams.getRootLocale).toBe(root.getRootLocale);
    expect(rootParams.wireRootParams).not.toBe(root.wireRootParams); // the real wire shadows the no-op
  });

  it("root wins over request headers in the request locale chain", async () => {
    rootParams.wireRootParams();
    headersMock.mockImplementation(() => new Headers({ "x-locale": "fr" }));
    const binding = createBinding();

    expect(await request.getRequestLocale.call(binding)).toBe("es");
    expect(headersMock).not.toHaveBeenCalled(); // static source short-circuits — no dynamic opt-in
  });

  it("getDynamicRequestLocale falls from headers to cookies and caches at the source", async () => {
    headersMock.mockImplementation(() => new Headers({ "x-locale": "fr" }));
    const binding = createBinding("en");
    expect(await request.getDynamicRequestLocale.call(binding)).toBe("fr");
    expect(binding.settings.locale).toBe("fr");

    headersMock.mockImplementation(() => new Headers());
    cookiesMock.mockImplementation(() => ({ get: (key: string) => (key === "locale" ? { value: "de" } : undefined) }));
    const cookieBinding = createBinding("en");
    expect(await request.getDynamicRequestLocale.call(cookieBinding)).toBe("de");
    expect(cookieBinding.settings.locale).toBe("de");
  });
});
