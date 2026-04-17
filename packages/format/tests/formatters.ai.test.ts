// AI generated test
import { describe, expect, it } from "bun:test";
import { currency, date, list, number, relative } from "../src/formatters";
import { state } from "../src/state";

describe("format helpers", () => {
  it("formats lists, numbers, currency and dates with the provided locale", () => {
    const value = new Date("2024-01-02T03:04:05.000Z");

    expect(list(["a", "b", "c"], { type: "disjunction" }, { locale: "en-US" })).toBe(
      new Intl.ListFormat("en-US", { type: "disjunction" }).format(["a", "b", "c"]),
    );
    expect(number(1234.5, { maximumFractionDigits: 1 }, { locale: "en-US" })).toBe(
      new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(1234.5),
    );
    expect(currency(100, {}, { locale: "en-US" })).toBe(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(100));
    expect(date(value, { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }, { locale: "en-US" })).toBe(
      new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(value),
    );
  });

  it("formats relative values for explicit and inferred units", () => {
    const now = new Date("2024-01-01T00:00:00.000Z");

    expect(relative(new Date("2024-01-01T03:00:00.000Z"), { unit: "hour" }, { locale: "en-US", now })).toBe(
      new Intl.RelativeTimeFormat("en-US", { unit: "hour" } as Intl.RelativeTimeFormatOptions).format(3, "hour"),
    );
    expect(relative(new Date("2024-01-03T00:00:00.000Z"), {}, { locale: "en-US", now })).toBe(
      new Intl.RelativeTimeFormat("en-US").format(172800, "day"),
    );
  });
});

describe("format state", () => {
  it("exposes resolved locale options and derived defaults", () => {
    expect(state.localeOptions.locale).toBeString();
    expect(state.timeZone).toBe(state.localeOptions.timeZone);
    expect(state.locale).toBeString();
  });

  it("memoizes the current time", () => {
    const now = state.now;

    expect(now).toBeInstanceOf(Date);
    expect(state.now).toBe(now);
  });
});
