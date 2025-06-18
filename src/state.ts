import type { FormatOptions, Locale, TimeZone } from "./locales";

export interface State<L extends Locale = Locale> {
  timeZone: TimeZone;
  locale: L;
  now: Date;
  hydration?: boolean;
  formatOptions?: FormatOptions;
  formatFallback?: string;
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
