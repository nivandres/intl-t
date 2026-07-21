// AI generated test
import { describe, expect, it } from "bun:test";
import { createElement, isValidElement, type ReactElement } from "react";
import { TranslationProvider } from "../src/rsc";
import { createTranslation } from "../src/translation";

function asElement<P = Record<string, unknown>>(value: unknown): ReactElement<P> {
  if (!isValidElement(value)) throw new Error("expected a react element");
  return value as ReactElement<P>;
}

describe("rsc source pruning by path", () => {
  it("serializes only the subtree when the provider is scoped", async () => {
    const t: any = createTranslation({
      locales: {
        es: () => Promise.resolve({ home: { hi: "hola" }, admin: { panel: "tablero" } }),
      },
    });

    const pruned = asElement<{ source?: Record<string, unknown> }>(
      await (TranslationProvider as any).call(t, {
        locale: "es",
        path: "home",
        children: createElement("span", null, "x"),
      }),
    );
    expect(pruned.props.source).toEqual({ hi: "hola" });

    const full = asElement<{ source?: Record<string, unknown> }>(
      await (TranslationProvider as any).call(t, {
        locale: "es",
        children: createElement("span", null, "x"),
      }),
    );
    expect(Object.keys(full.props.source ?? {})).toEqual(["home", "admin"]);
  });
});

describe("namespaces: one translation per domain", () => {
  it("each namespace serializes its own tree and never loads its neighbours", async () => {
    const loads = { home: 0, admin: 0 };
    createTranslation({
      locales: { es: () => (loads.home++, Promise.resolve({ hi: "hola" })) },
    });
    const adminT: any = createTranslation({
      locales: { es: () => (loads.admin++, Promise.resolve({ panel: "tablero" })) },
    });

    const adminElement = asElement<{ source?: Record<string, unknown> }>(
      await (TranslationProvider as any).call(adminT, {
        locale: "es",
        children: createElement("span", null, "x"),
      }),
    );

    expect(adminElement.props.source).toEqual({ panel: "tablero" });
    expect(loads).toEqual({ home: 0, admin: 1 });
    expect(String(adminT.es.panel)).toBe("tablero");
  });
});
