// @ts-nocheck
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
const checkProps = props => (Object.entries(props || {}).forEach(([key, value]) => (props[key] = check(value))), props);

export function patch({ React, jsx, jsxDEV }: { React?: any; jsx?: any; jsxDEV?: any } = {});
export function patch(React?: any, jsx?: any, jsxDEV?: any);
export function patch(React = _React as any, jsx = _jsx as any, jsxDEV = _jsxDEV as any) {
  if (React.React) return patch(React.React, React.jsx, React.jsxDEV);
  try {
    React.createElement = function createElement(type, props, ...children) {
      return createElement_(type, checkProps(props), ...children.map(check));
    };
    jsx.jsx = function jsx(type, props, key) {
      props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
      return jsx_(type, typeof type === "string" ? checkProps(props) : props, key);
    };
    jsx.jsxs = function jsxs(type, props, key) {
      props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
      return jsxs_(type, typeof type === "string" ? checkProps(props) : props, key);
    };
    jsxDEV.jsxDEV = function jsxDEV(type, props, key, isStatic, source) {
      props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
      return jsxDEV_(type, typeof type === "string" ? checkProps(props) : props, key, isStatic, source);
    };
  } catch {}
}
export default patch;

patch();
