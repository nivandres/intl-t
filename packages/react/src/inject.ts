import type { Values, Base } from "@intl-t/core/types";
import type { ReactChunk, ReactChunkProps } from "@intl-t/react/types";
import { cloneElement, createElement, Fragment, isValidElement, type ReactNode } from "react";

const regex = /<(\w+)((?:"[^"]*"|'[^']*'|[^<>"'])*?)\s*(?:\/\s*>|>(?:(.*)<\s*\/\s*\1\s*>)?)/gm;
const attributesRegex = /(\w+)(?:=(\w+|".*?"|'.*?'|{(.+?)}))?/g;

// Escaped characters (`<, `>, `", `') are swapped for Unicode noncharacters while parsing, so markup
// and quotes coming from interpolated values never form tags or break out of attributes.
const sentinels: Record<string, string> = { "<": "﷐", ">": "﷑", '"': "﷒", "'": "﷓" };
const originals = Object.fromEntries(Object.entries(sentinels).map(([char, sentinel]) => [sentinel, char]));
const protect = (content: string) => content.replace(/`([\s\S])/g, (_, char: string) => sentinels[char] ?? char);
const restore = (content: string) => content.replace(/[﷐-﷓]/g, sentinel => originals[sentinel]);
const keep = (content: string) => content;

export const Chunk: ReactChunk = ({ children, tagName, value, key, tagProps }) => {
  if (value) return String(value);
  return createElement(tagName, { key, ...tagProps }, children);
};

function parse(content: string, variables: Values, text: (content: string) => string): ReactNode {
  if (!content || !content.includes("<")) return text(content);
  const matches = [...content.matchAll(regex)];
  if (!matches.length) return text(content);
  const elements = [] as ReactNode[];
  matches.forEach(match => {
    const [tag, tagName, tagAttributes, tagContent] = match;
    const tagProps = {} as Record<string, unknown>;
    if (tagAttributes?.trim())
      [...tagAttributes.matchAll(attributesRegex)].forEach(match => {
        let [, key, value, json = value] = match;
        try {
          tagProps[key] = JSON.parse(json, (_, parsed) => (typeof parsed === "string" ? text(parsed) : parsed));
        } catch {
          tagProps[key] = value === undefined ? value : text(value);
        }
      });
    const props = {
      tagName,
      tagContent: tagContent == null ? tagContent : text(tagContent),
      tagAttributes: tagAttributes == null ? tagAttributes : text(tagAttributes),
      tagProps,
      key: elements.length,
      children: tagContent == null ? undefined : parse(tagContent, variables, text),
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
    if (start) elements.push(text(start));
    elements.push(element);
    content = end.length > 1 ? end.join(tag) : end[0];
  });
  if (content) elements.push(text(content));
  return elements.length > 1 ? createElement(Fragment, null, ...elements) : elements[0];
}

export function injectReactChunks(content: string = "", variables: Values = {}) {
  return parse(content, variables, keep);
}

/**
 * Like injectReactChunks, for content that still carries template escapes (`x), as produced by
 * injectVariables with KEEP_ESCAPES. Escaped markup stays text; every escape is removed.
 */
export function injectEscapedReactChunks(content: string = "", variables: Values = {}) {
  return parse(protect(content), variables, restore);
}

export { injectReactChunks as injectReactChunk };
