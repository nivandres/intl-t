import { inject, type InjectOptions } from "@intl-t/format/inject";
import { state } from "@intl-t/format/state";

export type FormatterOptions =
  | Intl.CollatorOptions
  | Intl.DateTimeFormatOptions
  | Intl.DisplayNamesOptions
  | Intl.ListFormatOptions
  | Intl.NumberFormatOptions
  | Intl.PluralRulesOptions
  | (Intl.RelativeTimeFormatOptions & RelativeTimeFormatOptions)
  | Intl.SegmenterOptions
  | InjectOptions;

export function list(value: string[] = [], options?: Intl.ListFormatOptions, locale = state.locale) {
  return new Intl.ListFormat(locale, options).format(value);
}

export function number(value: number = 0, options?: Intl.NumberFormatOptions, locale = state.locale) {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function currency(value: number = 0, options: Intl.NumberFormatOptions = {}, locale = state.locale) {
  options.style = "currency";
  options.currency ??= "USD";
  return new Intl.NumberFormat(locale, options).format(value);
}

export const price = currency;

export function date(value: Date = new Date(), options?: Intl.DateTimeFormatOptions, locale = state.locale) {
  return new Intl.DateTimeFormat(locale, options).format(value);
}

export const time = date;

export const unitMap = {
  seconds: 1000,
  minutes: 60000,
  hours: 3600000,
  days: 86400000,
  weeks: 604800000,
  months: 2592000000,
  quarters: 7884000000,
  years: 31536000000,
} as const;

export interface RelativeTimeFormatOptions extends Intl.RelativeTimeFormatOptions {
  unit?: keyof typeof unitMap;
  now?: Date;
}
export function relative(value: Date | number = 0, options: RelativeTimeFormatOptions = {}, locale = state.locale) {
  let { unit, now = state.now } = options;
  if (value instanceof Date) {
    value = value.getTime() - now.getTime();
    if (unit) value = Math.trunc(value / unitMap[unit]);
    else
      Object.entries(unitMap)
        .reverse()
        .find(
          ([k, v]) => Math.abs(value as number) >= v && ((value = Math.trunc((value as number) / v)), (unit = k as keyof typeof unitMap)),
        ) || (unit = "seconds");
  } else unit ??= "days";
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit!);
}

export const format = { list, number, currency, date, relative, time, price, inject };
