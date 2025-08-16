import { LocaleMapping } from "./generated/locales";

export type LocaleMapper<T> = T extends [infer L extends string, ...infer R extends string[]] ? L | `${L}-${R[number]}` : never;

export type Locale = (Intl.UnicodeBCP47LocaleIdentifier & {}) | LocaleMapper<LocaleMapping[number]>;
