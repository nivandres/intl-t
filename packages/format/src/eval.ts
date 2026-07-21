import { globalState } from "@intl-t/format/state";

export const ev = (expr: string, enabledEval: boolean = globalState.enabledEval) => {
  if (!enabledEval || globalThis.process?.env?.INTL_T_DISABLED_EVAL) return void 0 as never;
  try {
    return globalThis.eval?.(expr);
  } catch {
    return void 0 as never;
  }
};
