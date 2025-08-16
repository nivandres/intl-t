import type { Translation } from "@intl-t/core";
import type { Locale } from "@intl-t/locales";

export type Intl = typeof Intl;
export type TimeZone = Intl.DateTimeFormatOptions["timeZone"];
export type LocaleOptions = Intl.LocaleOptions;
export type FormatOptions =
  | Intl.DateTimeFormatOptions
  | Intl.CollatorOptions
  | Intl.NumberFormatOptions
  | Intl.PluralRulesOptions
  | Intl.ListFormatOptions
  | Intl.RelativeTimeFormatOptions
  | Intl.SegmenterOptions
  | Intl.DisplayNamesOptions;

export default interface Global {
  Translation: Translation;
}

export type GlobalTranslation = Global extends { Translation: infer T } ? T : Translation;
export type GlobalSettings = GlobalTranslation["settings"];
export type GlobalPathSeparator = string extends GlobalSettings["ps"] ? "." : GlobalSettings["ps"];
export type GlobalLocale = GlobalSettings["allowedLocale"];
export type GlobalNode = GlobalSettings["tree"];

export interface State<L extends Locale = Locale> {
  timeZone: TimeZone;
  locale: L;
  now: Date;
  hydration?: boolean;
  formatOptions?: FormatOptions;
  formatFallback?: string;
  enableEval?: boolean;
}

export const isClient = "window" in globalThis;
export const options = Intl.DateTimeFormat().resolvedOptions();
export const locale = isClient ? (navigator["language" as keyof typeof navigator] as string)?.split(",")[0] : options.locale;
export const timeZone = options.timeZone;
export const now = new Date();
export let hydration: boolean;
export let isEdge: boolean;

try {
  hydration = Boolean(process);
} catch {
  isEdge = !("window" in globalThis);
}

export const state: State = {
  timeZone,
  locale,
  now,
};
