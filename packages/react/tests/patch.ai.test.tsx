// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { jsxDEV } from "../src/jsx-dev-runtime";
import { jsxs } from "../src/jsx-runtime";
import { jsx as patchedJsx } from "../src/jsx-runtime";
import { createElement as patchedCreateElement, patch } from "../src/patch";
import { createTranslation as ct, TranslationNode } from "../src/translation";
import messages from "./fixtures/messages.json";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
}

const PATCHED = Symbol.for("intl-t.patched");

function createReactTranslation() {
  return ct({
    locales: {
      en: messages,
      es: {
        ...messages,
        common: {
          ...messages.common,
          hello: "Hola {name}",
        },
      },
    },
    mainLocale: "en",
  });
}

beforeEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  Object.assign(TranslationNode, { locale: undefined, source: undefined, t: null });
});

describe("react jsx patch", () => {
  it("renders translation nodes passed through JSX children and props", () => {
    const t = createReactTranslation();

    const view = render(
      patchedJsx(
        "div",
        {
          "data-testid": "patched",
          title: t.hello,
          children: t.hello,
        },
        undefined,
      ),
    );

    expect(view.getByTestId("patched").textContent).toBe("hello world");
    expect(view.getByTestId("patched").getAttribute("title")).toBe("hello world");
  });

  it("renders translation nodes passed through React.createElement", () => {
    const t = createReactTranslation();
    // The patched createElement publicly types its props as React's bare `Attributes`
    // (the overload set collapses to `P = {}`), so the props object needs a `key`
    // member in common with `Attributes` to satisfy the weak-type check.
    const props = { key: "create-element", "data-testid": "create-element", title: t.bye };

    const view = render(patchedCreateElement("div", props, t.hello));

    expect(view.getByTestId("create-element").textContent).toBe("hello world");
    expect(view.getByTestId("create-element").getAttribute("title")).toBe("goodbye world");
  });

  it("maps array children through the patched jsxs runtime", () => {
    const t = createReactTranslation();

    const view = render(
      jsxs(
        "div",
        {
          "data-testid": "runtime-jsxs",
          title: t.bye,
          children: [t.hello, " / ", t.bye],
        },
        undefined,
      ),
    );

    expect(view.getByTestId("runtime-jsxs").textContent).toBe("hello world / goodbye world");
    expect(view.getByTestId("runtime-jsxs").getAttribute("title")).toBe("goodbye world");
  });

  it("maps children and props through the patched jsxDEV runtime", () => {
    const t = createReactTranslation();

    const view = render(
      jsxDEV(
        "div",
        {
          "data-testid": "runtime-jsxdev",
          title: t.hello,
          children: t.bye,
        },
        undefined,
        false,
        undefined,
      ),
    );

    expect(view.getByTestId("runtime-jsxdev").textContent).toBe("goodbye world");
    expect(view.getByTestId("runtime-jsxdev").getAttribute("title")).toBe("hello world");
  });
});

describe("patch application and failure handling", () => {
  it("patches a custom runtime through the single-object form", () => {
    const reactLike = { createElement: (): null => null };
    const jsxLike = { jsx: (): null => null, jsxs: (): null => null };
    const jsxDEVLike = { jsxDEV: (): null => null };

    expect(patch({ React: reactLike, jsx: jsxLike, jsxDEV: jsxDEVLike, forcePatch: true })).toBe(true);
    expect<unknown>(reactLike.createElement).toBe(patchedCreateElement);
    expect<unknown>(jsxLike.jsx).toBe(patchedJsx);
    expect<unknown>(jsxLike.jsxs).toBe(jsxs);
    expect<unknown>(jsxDEVLike.jsxDEV).toBe(jsxDEV);
    expect(patch(reactLike, jsxLike, jsxDEVLike)).toBe(false); // this instance is already ours
  });

  it("patches every React instance independently, as the server runs two graphs", () => {
    const graphA = { React: { createElement: (): null => null }, jsx: { jsx: (): null => null, jsxs: (): null => null }, jsxDEV: {} };
    const graphB = { React: { createElement: (): null => null }, jsx: { jsx: (): null => null, jsxs: (): null => null }, jsxDEV: {} };

    expect(patch(graphA.React, graphA.jsx, graphA.jsxDEV)).toBe(true);
    expect(patch(graphB.React, graphB.jsx, graphB.jsxDEV)).toBe(true); // the second graph must patch too
    expect<unknown>(graphA.React.createElement).toBe(patchedCreateElement);
    expect<unknown>(graphB.React.createElement).toBe(patchedCreateElement);
    expect(patch(graphA.React, graphA.jsx, graphA.jsxDEV)).toBe(false);
    expect(patch(graphB.React, graphB.jsx, graphB.jsxDEV)).toBe(false);
  });

  it("returns false when the runtime rejects the reassignment", () => {
    // A frozen host object makes the createElement assignment throw, driving patch()
    // into its catch branch; the target React stays untouched and unmarked, so a
    // later patch attempt remains possible.
    const original = (): null => null;
    const reactLike = Object.freeze({ createElement: original });
    const jsxLike = { jsx: (): null => null, jsxs: (): null => null };
    const jsxDEVLike = { jsxDEV: (): null => null };

    expect(patch(reactLike, jsxLike, jsxDEVLike, true)).toBe(false);
    expect<unknown>(reactLike.createElement).toBe(original);
    expect(Reflect.get(reactLike.createElement, PATCHED)).toBeUndefined();
  });
});

describe("patch production runtime guard", () => {
  // Production react builds do not expose jsxDEV on the dev runtime export object.
  // These tests specify the guarded contract: patch() reports a boolean instead of
  // crashing module evaluation when runtime members are absent.
  it("returns a boolean instead of throwing when the dev runtime lacks jsxDEV", () => {
    const previous = (globalThis as Record<PropertyKey, unknown>)[PATCHED];

    try {
      let objectForm: unknown;
      expect(() => {
        objectForm = patch({
          React: { createElement: (): null => null },
          jsx: { jsx: (): null => null, jsxs: (): null => null },
          jsxDEV: {},
          forcePatch: true,
        });
      }).not.toThrow();
      expect(typeof objectForm).toBe("boolean");

      let positionalForm: unknown;
      expect(() => {
        positionalForm = patch({ createElement: (): null => null }, { jsx: (): null => null, jsxs: (): null => null }, {}, true);
      }).not.toThrow();
      expect(typeof positionalForm).toBe("boolean");
    } finally {
      (globalThis as Record<PropertyKey, unknown>)[PATCHED] = previous;
    }
  });

  it("returns a boolean instead of throwing when other runtime members are missing", () => {
    const previous = (globalThis as Record<PropertyKey, unknown>)[PATCHED];

    try {
      let bareRuntimes: unknown;
      expect(() => {
        bareRuntimes = patch({ React: {}, jsx: {}, jsxDEV: {}, forcePatch: true });
      }).not.toThrow();
      expect(typeof bareRuntimes).toBe("boolean");

      let partialJsxRuntime: unknown;
      expect(() => {
        partialJsxRuntime = patch({
          React: { createElement: (): null => null },
          jsx: {},
          jsxDEV: { jsxDEV: (): null => null },
          forcePatch: true,
        });
      }).not.toThrow();
      expect(typeof partialJsxRuntime).toBe("boolean");
    } finally {
      (globalThis as Record<PropertyKey, unknown>)[PATCHED] = previous;
    }
  });
});
