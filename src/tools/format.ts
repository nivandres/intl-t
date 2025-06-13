import { type State, state } from "../state";
import { inject } from "./inject";

// @ts-ignore
export function list(value: string[] = [], options?: Intl.ListFormatOptions, { locale }: State = this) {
  return new Intl.ListFormat(locale, options).format(value);
}

// @ts-ignore
export function number(value: number = 0, options?: Intl.NumberFormatOptions, { locale }: State = this) {
  return new Intl.NumberFormat(locale, options).format(value);
}

// @ts-ignore
export function currency(value: number = 0, options: Intl.NumberFormatOptions = {}, { locale }: State = this) {
  options.style = "currency";
  options.currency ??= "USD";
  return new Intl.NumberFormat(locale, options).format(value);
}

// @ts-ignore
export function date(value: Date = new Date(), options?: Intl.DateTimeFormatOptions, { locale }: State = this) {
  return new Intl.DateTimeFormat(locale, options).format(value);
}

export const re = {
  se: [1000, "conds"],
  mi: [60000, "nutes"],
  ho: [3600000, "urs"],
  da: [86400000, "ys"],
  we: [604800000, "eks"],
  mo: [2592000000, "nths"],
  qu: [7884000000, "arters"],
  ye: [31536000000, "ars"],
} as const;

export function relative(
  value: Date | number = 0,
  options: Intl.RelativeTimeFormatOptions & Record<string, any> = {},
  // @ts-ignore
  { locale, now }: State = this,
) {
  let { unit } = options;
  if (value instanceof Date) {
    value = value.getTime() - now.getTime();
    unit
      ? (value = Math.floor(value / re[`${unit[0]}${unit[1]}` as "se"][0]))
      : Object.entries(re).find(([k1, [v, k2]]) =>
          (value as number) >= v ? ((value = Math.floor((value as number) / v)), (options.unit = k1 + k2)) : false,
        );
  }
  unit ??= "day";
  return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
}

export const format = { ...state, list, number, currency, date, relative, time: date, price: currency, inject };
