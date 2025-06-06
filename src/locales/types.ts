export type { Locale } from "./list";

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
