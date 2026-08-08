import * as rp from "next/root-params";
import { pickRootLocale } from "./root.js";

export * from "./root.js";

export function wireRootParams(prop?: string) {
  return pickRootLocale(rp, prop);
}
