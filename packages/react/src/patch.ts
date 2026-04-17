import { check, checkProps, isArray } from "@intl-t/react/utils";
import _React from "react";
import _jsxDEV from "react/jsx-dev-runtime";
import _jsx from "react/jsx-runtime";

export type { Fragment, JSX } from "react/jsx-runtime";
export type { JSXSource } from "react/jsx-dev-runtime";

export const __createElement = _React.createElement;
export const __jsxDEV = _jsxDEV.jsxDEV;
export const __jsx = _jsx.jsx;
export const __jsxs = _jsx.jsxs;

export function ___jsx(...[type, props, key]: Parameters<typeof __jsx> & { 1: any }) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return __jsx(type, typeof type === "string" ? checkProps(props) : props, key);
}

export function ___jsxs(...[type, props, key]: Parameters<typeof __jsxs> & { 1: any }) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return __jsxs(type, typeof type === "string" ? checkProps(props) : props, key);
}

export function ___jsxDEV(...[type, props, key, isStatic, source]: Parameters<typeof __jsxDEV> & { 1: any }) {
  props.children = isArray(props.children) ? props.children.map(check) : check(props.children);
  return __jsxDEV(type, typeof type === "string" ? checkProps(props) : props, key, isStatic, source);
}

export function ___createElement(...[type, props, ...children]: Parameters<typeof __createElement>) {
  return __createElement(type, checkProps(props), ...children.map(check));
}

export function patch({ React, jsx, jsxDEV }: { React?: any; jsx?: any; jsxDEV?: any }): void;
export function patch(React?: any, jsx?: any, jsxDEV?: any): void;
export function patch(React = _React as any, jsx = _jsx as any, jsxDEV = _jsxDEV as any) {
  if (React.React) return patch(React.React, React.jsx, React.jsxDEV);
  try {
    React.createElement = ___createElement;
    jsx.jsx = ___jsx;
    jsx.jsxs = ___jsxs;
    jsxDEV.jsxDEV = ___jsxDEV;
  } catch {}
}

export { ___createElement as createElement, ___jsx as jsx, ___jsxs as jsxs, ___jsxDEV as jsxDEV };

export default patch;

process.env.INTL_T_REACT_PATCH !== "false" && patch();
