// AI generated test
// Interpolated values are data in React too: markup or quotes inside a value render as text and
// never become elements or attributes. Tags written in the message itself keep working.
import { describe, expect, it } from "bun:test";
import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { injectReactChunks } from "../src/inject";
import { injectVariables } from "../src/translation";

const html = (node: unknown) => (isValidElement(node) ? renderToStaticMarkup(node) : String(node));

describe("react inject — values are inserted literally", () => {
  it("renders markup from a value as text", () => {
    const out = injectVariables("hi {v}" as string, { v: "<b>bold</b>" });
    expect(isValidElement(out)).toBe(false);
    expect(out).toBe("hi <b>bold</b>");
    expect(html(out)).toBe("hi <b>bold</b>");
  });

  it("escapes value markup inside a message tag", () => {
    const out = injectVariables("hi <b>{v}</b>" as string, { v: "<i>x</i>" });
    expect(html(out)).toBe("hi <b>&lt;i&gt;x&lt;/i&gt;</b>");
  });

  it("keeps quotes from a value inside the attribute they were interpolated into", () => {
    const out = injectVariables('<a title="{v}">go</a>' as string, { v: 'x" data-extra="1' });
    expect(html(out)).toBe('<a title="x&quot; data-extra=&quot;1">go</a>');
  });

  it("keeps message tags, chunk components and plain values working", () => {
    expect(html(injectVariables("hi <b>{v}</b>!" as string, { v: "Ada" }))).toBe("hi <b>Ada</b>!");
    expect(html(injectVariables("hi {v}" as string, { v: "Ada" }))).toBe("hi Ada");
    expect(html(injectVariables("{n, plural, one {<b>#</b> item} other {<b>#</b> items}}" as string, { n: 2 }))).toBe("<b>2</b> items");
  });

  it("treats an escaped `< in the message as a literal character", () => {
    const out = injectVariables("a `<b> c" as string, {});
    expect(isValidElement(out)).toBe(false);
    expect(out).toBe("a <b> c");
  });

  it("leaves injectReactChunks unchanged for unescaped content", () => {
    expect(html(injectReactChunks("x <b>y</b>"))).toBe("x <b>y</b>");
    expect(injectReactChunks("a`b")).toBe("a`b");
  });
});
