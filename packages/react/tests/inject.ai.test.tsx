// AI generated test
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import "@testing-library/jest-dom";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Fragment } from "react";
import { Chunk, injectReactChunk, injectReactChunks } from "../src/inject";
import { TranslationNode } from "../src/translation";

const domSetupKey = Symbol.for("intl-t.react.test.dom-setup");

if (!(globalThis as Record<PropertyKey, unknown>)[domSetupKey]) {
  GlobalRegistrator.register();
  (globalThis as Record<PropertyKey, unknown>)[domSetupKey] = true;
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

describe("react chunk injection", () => {
  it("returns non-tag content unchanged", () => {
    expect(injectReactChunks("")).toBe("");
    expect(injectReactChunks("plain text")).toBe("plain text");
    expect(injectReactChunks("2 < 3")).toBe("2 < 3");
  });

  it("renders nested React chunks with parsed attributes", () => {
    const content = injectReactChunks('Start <card className="hero" count={2}><label>Hi</label></card> End', {
      card: ({ children, className, count, key }) => (
        <section key={key} data-testid="card" data-count={String(count)} className={String(className)}>
          {children}
        </section>
      ),
      label: ({ children, key }) => <Fragment key={key}>{children}</Fragment>,
    });

    const view = render(<div data-testid="content">{content}</div>);

    expect(view.getByTestId("card").classList.contains("hero")).toBe(true);
    expect(view.getByTestId("card").getAttribute("data-count")).toBe("2");
    expect(view.getByTestId("card").textContent).toBe("Hi");
    expect(view.container.querySelector('[data-testid="content"]')?.textContent).toBe("Start Hi End");
  });

  it("falls back to plain values and the default Chunk renderer", () => {
    const content = injectReactChunks("Click <span>here</span> or <icon />", {
      icon: "*",
    });

    const view = render(<div data-testid="content">{content}</div>);

    expect(view.container.querySelector('[data-testid="content"]')?.textContent).toBe("Click here or *");
    expect(document.querySelector("span")?.textContent).toBe("here");
    expect(
      Chunk({
        children: "ignored",
        key: 0,
        tagAttributes: "",
        tagContent: "",
        tagName: "span",
        tagProps: {},
        value: "plain",
      }),
    ).toBe("plain");
  });

  it("creates a React element through Chunk when no plain value is provided", () => {
    const element = Chunk({
      children: "strong text",
      key: 1,
      tagAttributes: "",
      tagContent: "strong text",
      tagProps: {},
      tagName: "strong",
    });

    // Chunk is typed to possibly return nothing, so narrow before rendering.
    if (!element) throw new Error("Chunk should build an element from tag content");

    const view = render(element);

    expect(view.container.querySelector("strong")?.textContent).toBe("strong text");
  });

  it("preserves raw attribute values when JSON parsing fails", () => {
    const content = injectReactChunks("Before <pill tone=primary>One</pill> After", {
      pill: ({ children, tone, key }) => (
        <span key={key} data-testid={`pill-${String(tone)}`}>
          {children}
        </span>
      ),
    });

    const view = render(<div data-testid="content">{content}</div>);

    expect(view.getByTestId("pill-primary").textContent).toBe("One");
    expect(view.container.querySelector('[data-testid="content"]')?.textContent).toBe("Before One After");
  });

  it("exposes injectReactChunk as an alias of injectReactChunks", () => {
    const content = injectReactChunk("<mark>highlight</mark>");
    const view = render(<div data-testid="content">{content}</div>);

    expect(view.container.querySelector("mark")?.textContent).toBe("highlight");
  });
});
