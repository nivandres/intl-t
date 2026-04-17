// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { jsxDEV } from "../src/jsx-dev-runtime";
import { jsxs } from "../src/jsx-runtime";
import { jsx as patchedJsx } from "../src/jsx-runtime";
import { createElement as patchedCreateElement } from "../src/patch";
import { createTranslation as ct, TranslationNode } from "../src/translation";
import messages from "./fixtures/messages.json";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
}

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
  }) as any;
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
  TranslationNode.locale = undefined as never;
  TranslationNode.source = undefined as never;
  TranslationNode.t = null as never;
});

describe("react jsx patch", () => {
  it("renders translation nodes passed through JSX children and props", () => {
    const t = createReactTranslation();

    const view = render(
      patchedJsx(
        "div",
        {
          "data-testid": "patched",
          title: t.hello as any,
          children: t.hello,
        },
        undefined,
      ) as any,
    );

    expect(view.getByTestId("patched").textContent).toBe("hello world");
    expect(view.getByTestId("patched").getAttribute("title")).toBe("hello world");
  });

  it("renders translation nodes passed through React.createElement", () => {
    const t = createReactTranslation();

    const view = render(patchedCreateElement("div", { "data-testid": "create-element", title: t.bye as any } as any, t.hello) as any);

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
          title: t.bye as any,
          children: [t.hello, " / ", t.bye],
        },
        undefined,
      ) as any,
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
          title: t.hello as any,
          children: t.bye,
        },
        undefined,
        false,
        undefined,
      ) as any,
    );

    expect(view.getByTestId("runtime-jsxdev").textContent).toBe("goodbye world");
    expect(view.getByTestId("runtime-jsxdev").getAttribute("title")).toBe("hello world");
  });
});
