import React from "react";
import jsx from "react/jsx-runtime";
import jsxDEV from "react/jsx-dev-runtime";
import { isArray } from "../misc";

import { TranslationNode } from "../core/translation";

const createElement_ = React.createElement;
const jsx_ = jsx.jsx;
const jsxs_ = jsx.jsxs;
const jsxDEV_ = jsxDEV.jsxDEV;

export { createElement_ as createElement, jsx_ as jsx, jsxs_ as jsxs, jsxDEV_ as jsxDEV };

const check = (child: any) => (typeof child === "function" && child instanceof TranslationNode ? child.base : child);

React.createElement = function createElement(type: any, props: any, ...children: any[]) {
  return createElement_(type, props, ...children.map(check));
} as typeof createElement_;
jsx.jsx = function jsx(type, props: any, key) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return jsx_(type, props, key);
};
jsx.jsxs = function jsxs(type, props: any, key) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return jsxs_(type, props, key);
};
jsxDEV.jsxDEV = function jsxDEV(type, props: any, key, isStatic, source) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return jsxDEV_(type, props, key, isStatic, source);
};
