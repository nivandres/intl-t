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
  return __createElement(type, typeof type === "string" ? checkProps(props) : props, ...children.map(check));
}

const PATCHED = Symbol.for("intl-t.patched");

export function patch({ React, jsx, jsxDEV, forcePatch }: { React?: any; jsx?: any; jsxDEV?: any; forcePatch?: boolean }): boolean;
export function patch(React?: any, jsx?: any, jsxDEV?: any, forcePatch?: boolean): boolean;
export function patch(React = _React as any, jsx = _jsx as any, jsxDEV = _jsxDEV as any, forcePatch = false) {
  try {
    if (React?.React) return patch(React.React, React.jsx, React.jsxDEV, React.forcePatch);
    if (React?.createElement?.[PATCHED] && !forcePatch) return false;
    jsx.jsx = ___jsx;
    jsx.jsxs = ___jsxs;
    jsxDEV.jsxDEV = ___jsxDEV;
    return ((React.createElement = ___createElement as any)[PATCHED] = true);
  } catch {
    return false;
  }
}

export { ___createElement as createElement, ___jsx as jsx, ___jsxs as jsxs, ___jsxDEV as jsxDEV };

export default patch;
