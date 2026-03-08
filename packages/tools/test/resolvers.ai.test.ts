import { describe, expect, it } from "bun:test";
import { resolveHref, resolveLocale, resolvePath } from "../src/resolvers";

describe("resolvers", () => {
  describe("resolveLocale", () => {
    it("extracts a locale from the pathname", () => {
      expect(resolveLocale("/en/about")).toBe("en");
      expect(resolveLocale("/es-MX/docs")).toBe("es-MX");
    });

    it("returns undefined when the extracted locale is not allowed", () => {
      expect(resolveLocale("/en/about", ["es"])).toBeUndefined();
      expect(resolveLocale.call({ allowedLocales: ["es", "fr"] }, "/en/about")).toBeUndefined();
    });

    it("uses bound allowed locales when no locales argument is passed", () => {
      expect(resolveLocale.call({ allowedLocales: ["en", "es"] }, "/es/about")).toBe("es");
    });

    it("returns undefined when the path does not start with a locale", () => {
      expect(resolveLocale("/about")).toBeUndefined();
      expect(resolveLocale("about")).toBeUndefined();
    });
  });

  describe("resolveHref", () => {
    it("keeps non-path href values unchanged", () => {
      expect(resolveHref("https://intl-t.dev/docs")).toBe("https://intl-t.dev/docs");
      expect(resolveHref("mailto:test@intl-t.dev")).toBe("mailto:test@intl-t.dev");
    });

    it("prefixes the explicit locale by default", () => {
      expect(resolveHref("/docs", { locale: "es" })).toBe("/es/docs");
      expect(resolveHref.call({ pathPrefix: "always" }, "/docs", { locale: "en" })).toBe("/en/docs");
    });

    it("omits the default locale when pathPrefix is default", () => {
      expect(
        resolveHref("/docs", {
          locale: "en",
          pathPrefix: "default",
          defaultLocale: "en",
        }),
      ).toBe("/docs");
      expect(
        resolveHref("/docs", {
          locale: "es",
          pathPrefix: "default",
          defaultLocale: "en",
        }),
      ).toBe("/es/docs");
    });

    it("resolves the locale from an async getLocale callback", async () => {
      const href = await resolveHref("/docs", {
        getLocale: async () => "es",
      });

      expect(href).toBe("/es/docs");
    });

    it("uses a bound config when called through this", () => {
      expect(
        resolveHref.call(
          {
            allowedLocales: ["en", "es"],
            defaultLocale: "en",
            pathPrefix: "default",
          },
          "/pricing",
          { locale: "es" },
        ),
      ).toBe("/es/pricing");
    });
  });

  describe("resolvePath", () => {
    it("strips the locale prefix from localized paths", () => {
      expect(resolvePath("/en/docs/getting-started")).toBe("/docs/getting-started");
      expect(resolvePath("/es-MX/docs/getting-started")).toBe("/docs/getting-started");
    });

    it("keeps non-localized paths rooted", () => {
      expect(resolvePath("/docs/getting-started")).toBe("/docs/getting-started");
      expect(resolvePath("/")).toBe("/");
    });

    it("uses the allowed locales list to decide whether to strip the prefix", () => {
      expect(resolvePath("/en/docs", ["en", "es"])).toBe("/docs");
      expect(resolvePath("/en/docs", ["es", "fr"])).toBe("/en/docs");
    });

    it("resolves the path even when there's no more segments after the locale", () => {
      expect(resolvePath("/en", ["en", "es"])).toBe("/");
      expect(resolvePath("/es", ["en"])).toBe("/es");
      expect(resolvePath("/es-MX", ["es-MX", "en"])).toBe("/");
      expect(resolvePath("/es")).toBe("/");
      expect(resolvePath("/docs")).toBe("/docs");
      expect(resolvePath("/")).toBe("/");
    });
  });
});
