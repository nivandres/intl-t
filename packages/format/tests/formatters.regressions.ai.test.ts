// AI generated test
// relative() auto-unit inference and the un-frozen state.now. Expectations mirror
// and the un-frozen state.now. Expectations mirror Intl.RelativeTimeFormat directly
// so they stay locale-database agnostic.
import { describe, expect, it } from "bun:test";
import { relative } from "../src/formatters";
import { state } from "../src/state";

const en = (value: number, unit: Intl.RelativeTimeFormatUnit) => new Intl.RelativeTimeFormat("en").format(value, unit);
const NOW = new Date("2026-07-11T12:00:00Z");
const at = (ms: number) => new Date(NOW.getTime() + ms);
const L = "en";

describe("relative — auto unit inference", () => {
  it("picks hours for a 2-hour delta", () => {
    expect(relative(at(-2 * 3600_000), { now: NOW }, L)).toBe(en(-2, "hours"));
  });

  it("picks days for a 3-day delta", () => {
    expect(relative(at(-3 * 86400_000), { now: NOW }, L)).toBe(en(-3, "days"));
  });

  it("picks minutes for a future 45-minute delta", () => {
    expect(relative(at(45 * 60_000), { now: NOW }, L)).toBe(en(45, "minutes"));
  });

  it("picks years for a 2-year delta", () => {
    expect(relative(at(-2 * 31536000_000), { now: NOW }, L)).toBe(en(-2, "years"));
  });

  it("falls back to seconds for sub-minute deltas", () => {
    expect(relative(at(30_000), { now: NOW }, L)).toBe(en(30, "seconds"));
  });

  it("honors an explicit unit instead of inferring", () => {
    expect(relative(at(-90 * 60_000), { unit: "minutes", now: NOW }, L)).toBe(en(-90, "minutes"));
  });

  it("passes plain numbers through with the given unit", () => {
    expect(relative(-3, { unit: "days" }, L)).toBe(en(-3, "days"));
  });

  it("handles unit boundaries exactly (59s → seconds, 60s → minutes)", () => {
    expect(relative(at(59_000), { now: NOW }, L)).toBe(en(59, "seconds"));
    expect(relative(at(60_000), { now: NOW }, L)).toBe(en(1, "minutes"));
  });

  it("is symmetric for past and future deltas", () => {
    expect(relative(at(-6 * 86400_000), { now: NOW }, L)).toBe(en(-6, "days"));
    expect(relative(at(6 * 86400_000), { now: NOW }, L)).toBe(en(6, "days"));
  });

  it("picks weeks and months at their thresholds", () => {
    expect(relative(at(-2 * 604800_000), { now: NOW }, L)).toBe(en(-2, "weeks"));
    expect(relative(at(3 * 2592000_000), { now: NOW }, L)).toBe(en(3, "months"));
  });

  it("forwards Intl options like numeric:auto", () => {
    const expected = new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "days");
    expect(relative(at(-1 * 86400_000), { numeric: "auto", now: NOW }, L)).toBe(expected); // "yesterday"
  });

  it("truncates fractional deltas toward zero", () => {
    expect(relative(at(-90 * 60_000), { now: NOW }, L)).toBe(en(-1, "hours")); // 1.5h → 1 hour, not 2
  });
});

describe("state.now — not frozen at process start", () => {
  it("returns a fresh Date on every read", async () => {
    const first = state.now.getTime();
    await new Promise(r => setTimeout(r, 10));
    expect(state.now.getTime()).toBeGreaterThan(first);
  });
});
