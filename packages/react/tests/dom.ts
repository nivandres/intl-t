// AI generated test helper
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Captured before any test file registers Happy DOM.
const nativeFetchPrimitives = { fetch, Headers, Request, Response, URL, URLSearchParams };

/**
 * Registers Happy DOM once per process, keeping the runtime's native fetch primitives.
 *
 * Bun runs every test file in one process, so the DOM outlives the file that registered it. Happy
 * DOM's `Headers` drops the `Cookie` request header like a browser does, which made server-side
 * suites (e.g. `@intl-t/next` middleware) read requests without cookies. Tests never need the
 * browser flavour of these primitives, so the native ones always stay in place.
 */
export function useDom() {
  if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register();
  Object.assign(globalThis, nativeFetchPrimitives);
}
