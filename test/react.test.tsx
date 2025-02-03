import React from "react";
import { injectReactChunks as ir, createTranslation as ct } from "../src/react";
import * as en from "./messages.json";
import { describe, it, expect } from "bun:test";

describe("react plugin", () => {
  it("should work", () => {
    const t = ct({ locales: { en } });
    expect(t.hello.base).toBe("hello world");
    expect(t.Translation).toBeFunction();
    expect(t.useTranslation).toBeFunction();
  });
  it("hooks should work", () => {
    const t = ct({ locales: { en } });
    const fn = () => {};
    t.setLang = fn;
    expect(t("pages.landing.hero").setLang).toBeFunction();
  });
});

describe("variable injection", () => {
  it("should work with simple variables", () => {
    expect(ir("<a>test</a>", { a: "a" })).toEqual("a");
    expect(ir("<a>test</a>", { a: ({ children }) => `${children}a` })).toEqual("testa");
    expect(
      ir("<a /> <a />", {
        a: ({ children }) => children,
      }),
    ).toEqual(["", " ", ""]);
    expect(ir("hola <b/> que <a/> tal <b/> amigo <b/> como <a/>", { a: "a", b: "b" })).toEqual([
      "hola ",
      "b",
      " que ",
      "a",
      " tal ",
      "b",
      " amigo ",
      "b",
      " como ",
      "a",
    ]);
  });
  it("should work with complex variables", () => {
    expect(
      ir('hello <div className="mx-2 pl-2" ><a>a</a></div>', {
        div: ({ children }) => children,
        a: ({ children }) => children,
      }),
    ).toEqual(["hello ", "a"]);
    expect(ir("<div>hello</div>")).toEqual((<div key={0}>hello</div>) as any);
    expect(ir("<juan>hello</juan>", { juan: ({ children }) => <div>{children}</div> })).toEqual(
      (<div>hello</div>) as any,
    );
    const a = ir("icons <globe /> icon", { globe: () => "🌎" });
    expect(a).toEqual(["icons ", "🌎", " icon"]);
    expect(ir("more items <globe>content</globe> o <globe />", { globe: () => "🌍" })).toEqual([
      "more items ",
      "🌍",
      " o ",
      "🌍",
    ]);
  });
  it("should work integrated", () => {
    const t = ct({ locales: { en: { hello: `hello <div className="mx-2 pl-2" ><a>a</a></div>` } } });
    expect(t.hello.use({ a: "hola" })).toEqual([
      "hello ",
      <div key={0} className="mx-2 pl-2">
        hola
      </div>,
    ] as any);
    expect(t.hello.use({ div: ({ children }) => children, a: ({ children }) => children })).toEqual([
      "hello ",
      "a",
    ] as any);
  });
});
