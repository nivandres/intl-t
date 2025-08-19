import type { Values, Base } from "@intl-t/core/types";
import type { ReactChunk, ReactChunkProps } from "@intl-t/react/types";
import { createElement, type ReactNode } from "react";

const regex = /<(\w+)([^<>/]+)?(?:\/\s*>|>(?:(.*)<\s*\/\s*\1\s*>)?)/gm;
const attributesRegex = /(\w+)(?:=(\w+|".*?"|'.*?'|{(.+?)}))?/g;

export const Chunk: ReactChunk = ({ children, tagName, value, key, tagAttributes: _a, tagContent: _c, ...props }) => {
  if (value) return String(value);
  return createElement(tagName, { key, ...props }, children);
};

export function injectReactChunks(content: string = "", variables: Values = {}) {
  if (!content || !content.includes("<")) return content;
  const matches = [...content.matchAll(regex)];
  if (!matches.length) return content;
  const elements = [] as ReactNode[];
  matches.forEach(match => {
    const [tag, tagName, tagAttributes, tagContent] = match;
    const props = {
      tagName,
      tagContent,
      tagAttributes,
      key: elements.length,
      children: injectReactChunks(tagContent, variables),
    } as ReactChunkProps;
    if (tagAttributes?.trim())
      [...tagAttributes.matchAll(attributesRegex)].forEach(match => {
        let [, key, value, json = value] = match;
        try {
          props[key] = JSON.parse(json);
        } catch {
          props[key] = value;
        }
      });
    let element: ReactNode;
    try {
      element = ((variables[tagName] as ReactChunk) || Chunk)(props) ?? null;
    } catch {
      props.value = variables[tagName] as Base;
      element = Chunk(props) ?? null;
    }
    const [start, ...end] = content.split(tag);
    if (start) elements.push(start);
    elements.push(element);
    content = end.length > 1 ? end.join(tag) : end[0];
  });
  if (content) elements.push(content);
  return elements.length > 1 ? elements : elements[0];
}

export { injectReactChunks as injectReactChunk };
