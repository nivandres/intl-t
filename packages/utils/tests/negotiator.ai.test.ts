// AI generated test
import { describe, expect, it } from "bun:test";
import { negotiator } from "../src/negotiator";

describe("negotiator", () => {
  it("reads accept-language values from Headers, sorted by quality", () => {
    const headers = new Headers({ "Accept-Language": "es-CO,es;q=0.9,en;q=0.8" });

    expect(negotiator({ headers })).toEqual(["es-CO", "es", "en"]);
  });

  it("reads accept-language values from a header record", () => {
    expect(negotiator({ headers: { "Accept-Language": "fr-CA,fr;q=0.9" } })).toEqual(["fr-CA", "fr"]);
  });

  it("honors quality weights over declaration order", () => {
    expect(negotiator({ headers: { "accept-language": "en;q=0.8,es;q=0.9" } })).toEqual(["es", "en"]);
  });

  it("trims spaced entries and drops wildcards", () => {
    expect(negotiator({ headers: { "accept-language": "fr, ja, *;q=0.1" } })).toEqual(["fr", "ja"]);
  });

  it("returns undefined when the header is missing", () => {
    expect(negotiator({ headers: {} })).toBeUndefined();
  });
});
