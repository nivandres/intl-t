import { Locale } from "@intl-t/locales";

export type Intl = typeof Intl;
export type TimeZone = Intl.DateTimeFormatOptions["timeZone"];
export type LocaleOptions = Intl.LocaleOptions;
export type FormatOptions =
  | Intl.CollatorOptions
  | Intl.DateTimeFormatOptions
  | Intl.DisplayNamesOptions
  | Intl.ListFormatOptions
  | Intl.NumberFormatOptions
  | Intl.PluralRulesOptions
  | Intl.RelativeTimeFormatOptions
  | Intl.SegmenterOptions;

export interface State<L extends Locale = Locale> {
  timeZone: TimeZone;
  locale: L;
  now: Date;
  isClient: boolean;
  hydration: boolean;
  enabledEval: boolean;
  disabledEval: boolean;
  behavior: "function" | "object" | "flexible";
  localeOptions: Intl.ResolvedDateTimeFormatOptions;
  formatOptions?: FormatOptions;
  formatFallback?: string;
}

export const isClient = "window" in globalThis;
export const hydration = "process" in globalThis;
export const enabledEval = "eval" in globalThis;
export const disabledEval = !enabledEval;

let localeOptions: Intl.ResolvedDateTimeFormatOptions;
let locale: Locale;
let now: Date;

export const state: State = {
  isClient,
  hydration,
  enabledEval,
  disabledEval,
  behavior: "function",
  get localeOptions() {
    return (localeOptions ??= Intl.DateTimeFormat().resolvedOptions());
  },
  get timeZone() {
    return this.localeOptions.timeZone;
  },
  get locale() {
    return (locale ??= isClient ? (navigator["language" as keyof typeof navigator] as string)?.split(",")[0] : this.localeOptions.locale);
  },
  get now() {
    return (now ??= new Date());
  },
};

export default state;
