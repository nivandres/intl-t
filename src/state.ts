import { FormatOptions, Locale, TimeZone } from "./locales/types";

export interface State<L extends Locale = Locale> {
  timeZone: TimeZone;
  locale?: L[] | L;
  now: Date;
  hidratation?: boolean;
  formatOptions?: FormatOptions;
  formatFallback?: string;
}

export const isClient = "window" in globalThis;
export const options = Intl.DateTimeFormat().resolvedOptions();
export const locale = isClient && "language" in navigator ? (navigator.language as string)?.split(",") : [options.locale];
export const timeZone = options.timeZone;
export const now = new Date();
export let hidratation: boolean;

try {
  hidratation = Boolean(process);
} catch {
  hidratation = false;
}

export const state: State = {
  timeZone,
  locale,
  now,
  hidratation,
};
