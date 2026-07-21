import type { Values, Base } from "@intl-t/core/types";
import type { ReactChunk, ReactChunkProps } from "@intl-t/react/types";
import { cloneElement, createElement, Fragment, isValidElement, type ReactNode } from "react";

const regex = /<(\w+)((?:"[^"]*"|'[^']*'|[^<>"'])*?)\s*(?:\/\s*>|>(?:(.*)<\s*\/\s*\1\s*>)?)/gm;
const attributesRegex = /(\w+)(?:=(\w+|".*?"|'.*?'|{(.+?)}))?/g;

export const Chunk: ReactChunk = ({ children, tagName, value, key, tagProps }) => {
  if (value) return String(value);
  return createElement(tagName, { key, ...tagProps }, children);
};

export function injectReactChunks(content: string = "", variables: Values = {}) {
  if (!content || !content.includes("<")) return content;
  const matches = [...content.matchAll(regex)];
  if (!matches.length) return content;
  const elements = [] as ReactNode[];
  matches.forEach(match => {
    const [tag, tagName, tagAttributes, tagContent] = match;
    const tagProps = {} as Record<string, unknown>;
    if (tagAttributes?.trim())
      [...tagAttributes.matchAll(attributesRegex)].forEach(match => {
        let [, key, value, json = value] = match;
        try {
          tagProps[key] = JSON.parse(json);
        } catch {
          tagProps[key] = value;
        }
      });
    const props = {
      tagName,
      tagContent,
      tagAttributes,
      tagProps,
      key: elements.length,
      children: tagContent == null ? undefined : injectReactChunks(tagContent, variables),
      ...tagProps,
    } as ReactChunkProps;
    let element: ReactNode;
    const chunk = variables[tagName] as ReactChunk;
    try {
      if (isValidElement(chunk)) element = cloneElement(chunk, props.tagProps, props.children);
      else element = (chunk || Chunk)(props) ?? null;
    } catch {
      props.value = chunk as unknown as Base;
      element = Chunk(props) ?? null;
    }
    const [start, ...end] = content.split(tag);
    if (start) elements.push(start);
    elements.push(element);
    content = end.length > 1 ? end.join(tag) : end[0];
  });
  if (content) elements.push(content);
  return elements.length > 1 ? createElement(Fragment, null, ...elements) : elements[0];
}

export { injectReactChunks as injectReactChunk };
