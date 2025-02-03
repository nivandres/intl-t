export type Intl = typeof Intl;
export type Locale = Intl.UnicodeBCP47LocaleIdentifier;
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
