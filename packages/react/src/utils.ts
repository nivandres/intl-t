import { TranslationNode } from "@intl-t/core";

export const isArray = Array.isArray;
export const check = (child: unknown) => (typeof child === "function" && child instanceof TranslationNode ? child.base : child);
export const checkProps = (props: any) => (Object.entries(props || {}).forEach(([key, value]) => (props[key] = check(value))), props);
