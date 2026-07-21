// AI generated test
import { describe, expect, it } from "bun:test";
import { ev } from "../src/eval";

describe("ev — guarded expression evaluation", () => {
  it("evaluates expressions when eval is enabled (default)", () => {
    expect(ev("1 + 2")).toBe(3);
    expect(ev("'a' + 'b'")).toBe("ab");
  });

  it("returns undefined instead of throwing for invalid expressions", () => {
    expect(ev("((")).toBeUndefined();
    expect(ev("throw new Error('nope')")).toBeUndefined();
  });

  it("returns undefined when eval is disabled through the argument", () => {
    expect(ev("1 + 2", false)).toBeUndefined();
  });

  it("returns undefined when eval is disabled through the environment", () => {
    const previous = process.env.INTL_T_DISABLED_EVAL;
    process.env.INTL_T_DISABLED_EVAL = "1";
    try {
      expect(ev("1 + 2")).toBeUndefined();
    } finally {
      if (previous === undefined) delete process.env.INTL_T_DISABLED_EVAL;
      else process.env.INTL_T_DISABLED_EVAL = previous;
    }
  });
});
