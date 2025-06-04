import _React from "react";
import _jsx from "react/jsx-runtime";
import _jsxDEV from "react/jsx-dev-runtime";

import { TranslationNode } from "../core/translation";

const createElement_ = _React.createElement;
const jsx_ = _jsx.jsx;
const jsxs_ = _jsx.jsxs;
const jsxDEV_ = _jsxDEV.jsxDEV;

const isArray = Array.isArray;
const check = child => (typeof child === "function" && child instanceof TranslationNode ? child.base : child);

export function createElement(type, props, ...children) {
  return createElement_(type, props, ...children.map(check));
}
export function jsx(type, props, key) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return jsx_(type, props, key);
}
export function jsxs(type, props, key) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return jsxs_(type, props, key);
}
export function jsxDEV(type, props, key, isStatic, source) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return jsxDEV_(type, props, key, isStatic, source);
}

export function patch({
  React = _React,
  jsx = _jsx,
  jsxDEV = _jsxDEV,
} = {}) {
  try {
    React.createElement = createElement;
    jsx.jsx = jsx;
    jsx.jsxs = jsxs;
    jsxDEV.jsxDEV = jsxDEV;
  } catch { }
}

patch();
