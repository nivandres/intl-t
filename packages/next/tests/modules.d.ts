// Query-suffixed module specifiers re-evaluate a module in bun without touching
// the cached instance; mirror the module types so the tests stay fully typed.
declare module "@intl-t/next/translation?*" {
  export * from "@intl-t/next/translation";
}
