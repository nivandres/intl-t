---
name: intl-t-migration
description: "Migrate from another i18n library or older intl-t setup. Use for flatten-to-tree JSON conversion, async locale loading, navigation setup, React patching, compatibility aliases, declarations, Next.js migration, and incremental adoption with current intl-t docs."
argument-hint: "What are you migrating from, and what behavior or compatibility must remain intact?"
---

# Intl-T Migration

## Canonical Docs

- Public docs: https://intl-t.dev/docs
- Full text guide for AI and deep lookup: https://intl-t.dev/llms-full.txt
- Single-page AI fetches: use https://intl-t.dev/docs/<slug>.mdx to fetch the LLM-friendly text version of a specific doc page.
- Migration guide: https://intl-t.dev/docs/migration
- Next.js guide: https://intl-t.dev/docs/next
- Node guide: https://intl-t.dev/docs/node
- TypeScript guide: https://intl-t.dev/docs/typescript
- Examples guide: https://intl-t.dev/docs/examples

## When to Use

- Moving from another i18n library to intl-t
- Upgrading an older intl-t setup toward the current public APIs
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
2. Start with the canonical docs.
   - Use https://intl-t.dev/docs for the public migration and integration model.
   - Use https://intl-t.dev/llms-full.txt when you need full-text lookup across concepts.
   - Use https://intl-t.dev/docs/<slug>.mdx when you want the AI-friendly text version of one specific page.
   - Cross-check the migration, Next.js, node, and TypeScript guides before proposing compatibility work.
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
10. Update public-facing documentation when the migration changes usage, imports, or examples.

## Response Rules

- Focus on migration order and risk reduction, not just final code snippets.
- Preserve behavior intentionally, not accidentally.
- Keep compatibility advice explicit so the user can migrate incrementally.
- Use current public package names and current public docs, not older names or stale import paths.
- When the migration question turns into general usage or integration design, continue with the intl-t usage skill flow.

## Primary Sources

- Public docs: https://intl-t.dev/docs
- Full text guide: https://intl-t.dev/llms-full.txt
- Single-page AI fetch pattern: https://intl-t.dev/docs/<slug>.mdx
- Migration guide: https://intl-t.dev/docs/migration
- Next.js guide: https://intl-t.dev/docs/next
- Node guide: https://intl-t.dev/docs/node
- TypeScript guide: https://intl-t.dev/docs/typescript
- Examples guide: https://intl-t.dev/docs/examples
- Packages: `intl-t`, `intl-t/react`, `intl-t/next`, `intl-t/navigation`, `intl-t/utils`
