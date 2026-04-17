---
name: intl-t-migration
description: "Migrate from another i18n library or older intl-t setup. Use for flatten-to-tree JSON conversion, async locale loading, navigation setup, React patching, compatibility aliases, declarations, Next.js migration, and incremental adoption with current intl-t docs."
argument-hint: "What are you migrating from, and what behavior or compatibility must remain intact?"
---

# Intl-T Migration

## Canonical Docs

- Public docs: https://intl-t.dev/docs
- Full text guide for AI and deep lookup: https://intl-t.dev/llms-full.txt
- Repo migration guide: [docs/migration.mdx](../../docs/migration.mdx)
- Repo Next.js guide: [docs/next.mdx](../../docs/next.mdx)
- Repo node logic and syntax: [docs/node.mdx](../../docs/node.mdx)
- Repo TypeScript guide: [docs/typescript.mdx](../../docs/typescript.mdx)
- Repo examples guide: [docs/examples.mdx](../../docs/examples.mdx)
- Repo Next example: [examples/with-next-app](../../examples/with-next-app)

## When to Use

- Moving from another i18n library to intl-t
- Upgrading an older intl-t setup toward the current repo structure
- Converting flat locale maps into intl-t tree-shaped locale files
- Preserving routing, server rendering, or client locale behavior while changing translation infrastructure
- Introducing TypeScript declarations or compatibility aliases during a migration

## Procedure

1. Audit the existing system before changing code.
   - Current locale list
   - Translation key shape
   - Server or client loading strategy
   - Routing and locale URL behavior
   - Existing compatibility constraints
2. Start with the canonical docs, then ground in the repo.
   - Use https://intl-t.dev/docs for the public migration and integration model.
   - Use https://intl-t.dev/llms-full.txt when you need full-text lookup across concepts.
   - Cross-check with [docs/migration.mdx](../../docs/migration.mdx), [docs/next.mdx](../../docs/next.mdx), and the example app.
3. Normalize translations into intl-t’s tree model.
   - Convert flat keys into nested objects when needed.
   - Keep every locale file structurally identical.
   - Review reserved keys before naming nodes.
   - Introduce `base` and `values` only where they actually improve structure or typing.
4. Centralize locale metadata.
   - Move `allowedLocales` and `defaultLocale` into a stable shared module when the app needs routing or middleware.
5. Move translation loading to the documented intl-t configuration.
   - For Next.js migrations, prefer async `createTranslation()` when locale loading or server behavior needs it.
   - Keep the runtime import surface current: `intl-t`, `intl-t/react`, `intl-t/next`, `intl-t/navigation`, `intl-t/utils`.
6. Rebuild framework integration incrementally.
   - React: add `Translation` and `useTranslation`, preserve client locale behavior, and add the React patch only if the migrated build actually needs it.
   - Next.js App Router: create `i18n/translation.ts`, create `i18n/navigation.ts`, export middleware, choose `param` or `request` strategy, and wire `setRequestLocale()` or `await getTranslation()` according to the rendering mode.
7. Add compatibility shims only when they reduce migration risk.
   - `getTranslations` and `useTranslations` aliases can ease migration.
   - Preserve old behavior only where it helps the rollout; do not carry stale architecture forward without reason.
8. Add TypeScript declaration support when the migration also needs strong autocomplete.
   - Use `generateDeclarations()` or the declarations CLI.
   - Verify `allowArbitraryExtensions: true` in `tsconfig.json`.
9. Validate behavior parity before widening the migration.
   - One server path and one client path resolve the correct locale.
   - Route behavior matches the intended canonical URL policy.
   - Variable interpolation, fallbacks, and pluralization match expected output.
   - Imports use current package names.
10. Update docs if the migration changes public usage or contributor guidance.

- Update `docs/` when the new public integration shape changes examples or import paths.
- Update [docs/contributing.mdx](../../docs/contributing.mdx) if the migration changes broader roadmap or contributor guidance.

## Response Rules

- Focus on migration order and risk reduction, not just final code snippets.
- Preserve behavior intentionally, not accidentally.
- Keep compatibility advice explicit so the user can migrate incrementally.
- Use the current repo naming and current public docs, not older package names or older import paths.
- When the migration question turns into general usage or integration design, continue with the repo’s consolidated usage skill flow.

## Primary Sources

- Public docs: https://intl-t.dev/docs
- Full text guide: https://intl-t.dev/llms-full.txt
- [docs/migration.mdx](../../docs/migration.mdx)
- [docs/next.mdx](../../docs/next.mdx)
- [docs/node.mdx](../../docs/node.mdx)
- [docs/typescript.mdx](../../docs/typescript.mdx)
- [docs/examples.mdx](../../docs/examples.mdx)
- [examples/with-next-app](../../examples/with-next-app)
- [AGENTS.md](../../AGENTS.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
