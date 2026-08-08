import type { FormatterOptions } from "@intl-t/format/formatters";
import type { Locale } from "@intl-t/format/types";

export type Intl = typeof Intl;
export type TimeZone = Intl.DateTimeFormatOptions["timeZone"];
export type LocaleOptions = Intl.LocaleOptions;
export type FormatOptions = FormatterOptions & Partial<State> & Record<string, unknown>;

export interface State<L extends Locale = Locale> {
  timeZone: TimeZone;
  locale: L;
  now: Date;
  isClient: boolean;
  hydration: boolean;
  enabledEval: boolean;
  behavior: "function" | "object" | "flexible";
  localeOptions: Intl.ResolvedDateTimeFormatOptions;
  formatOptions?: FormatOptions;
}

export const isClient = "window" in globalThis;
export const hydration = "process" in globalThis;
export const enabledEval = (() => {
  try {
    return Boolean(new Function());
  } catch {
    return false;
  }
})();

let localeOptions: Intl.ResolvedDateTimeFormatOptions;
let locale: Locale;

export const state: State = {
  isClient,
  hydration,
  enabledEval,
  behavior: "function",
  get localeOptions() {
    return (localeOptions ??= Intl.DateTimeFormat().resolvedOptions());
  },
  get timeZone() {
    return this.localeOptions.timeZone;
  },
  get locale() {
    return (locale ??= isClient ? navigator.language.split(",")[0] : this.localeOptions.locale);
  },
  get now() {
    return new Date();
  },
};

export function getStateLocale<L extends Locale>() {
  return state.locale as L;
}

export { getStateLocale as getLocale, state as globalState };
export default state;
