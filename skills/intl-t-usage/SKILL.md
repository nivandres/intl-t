---
name: intl-t-usage
description: "Use intl-t for setup, createTranslation, locale JSON syntax, node logic, TypeScript declarations, React, Next.js App Router, intl-t/utils, examples, and public docs-aligned usage questions."
argument-hint: "What are you trying to build, fix, explain, or document with intl-t?"
---

# Intl-T Usage

## Canonical Docs

- Public docs: https://intl-t.dev/docs
- Full text guide for AI and deep lookup: https://intl-t.dev/llms-full.txt
- Single-page AI fetches: use https://intl-t.dev/docs/<slug>.mdx to fetch the LLM-friendly text version of a specific doc page.
- Quick start: https://intl-t.dev/docs/quick-start
- Node guide: https://intl-t.dev/docs/node
- React guide: https://intl-t.dev/docs/react
- Next.js guide: https://intl-t.dev/docs/next
- Utils guide: https://intl-t.dev/docs/utils
- TypeScript guide: https://intl-t.dev/docs/typescript
- Examples guide: https://intl-t.dev/docs/examples

## When to Use

- General intl-t setup or usage questions
- Choosing between `intl-t`, `intl-t/react`, `intl-t/next`, and `intl-t/utils`
- Explaining the typed factory pattern behind `createTranslation()` and `createNavigation()`
- Designing locale JSON structure and explaining `base`, `values`, arrays, fallbacks, and variable inheritance
- Explaining node runtime behavior, including callable nodes, path traversal, and string-like rendering
- Wiring TypeScript declarations and editor autocomplete
- Integrating intl-t with React or Next.js App Router
- Using utilities like `inject`, `format`, `match`, `negotiator`, `resolveHref`, `resolvePath`, and `resolveLocale`
- Looking up examples or updating docs to match current public imports and package names
- Public usage questions that need both conceptual guidance and package-level direction

## Topic Routing

- Core API pattern:
  Treat `createTranslation()` and `createNavigation()` as typed factories that return the main API surface. Prefer destructuring helpers directly from the returned object instead of rebuilding wrappers around it.
- Setup and first use:
  Start with https://intl-t.dev/docs/quick-start, then adapt to the target framework.
- Locale JSON syntax and structure:
  Use https://intl-t.dev/docs/node and https://intl-t.dev/docs/examples.
- Node runtime behavior:
  Use https://intl-t.dev/docs/node and explain the node as function, object, and string-like value.
- TypeScript and declarations:
  Use https://intl-t.dev/docs/typescript and the declarations package surface.
- React integration:
  Use https://intl-t.dev/docs/react and the `intl-t/react` package surface.
- Next.js App Router and server behavior:
  Use https://intl-t.dev/docs/next, https://intl-t.dev/docs/migration, and the `intl-t/next` and `intl-t/navigation` package surfaces.
- Utilities and routing resolvers:
  Use https://intl-t.dev/docs/utils and the `intl-t/utils` package surface.
- Pattern lookup and examples:
  Use https://intl-t.dev/docs/examples.
- Public docs alignment:
  Keep explanations aligned with https://intl-t.dev/docs and current package names.

## Procedure

1. Classify the request before proposing code.
   - Plain runtime setup
   - Locale tree design
   - Node logic explanation
   - TypeScript declarations
   - React integration
   - Next.js App Router integration
   - Utils or resolvers
   - Examples or documentation
2. Start with the public docs for the canonical behavior.
   - Use https://intl-t.dev/docs for the public structure.
   - Use https://intl-t.dev/llms-full.txt when broad retrieval or full-text grounding is more efficient.

- Use https://intl-t.dev/docs/<slug>.mdx when you want the AI-friendly text version of one specific page.

3. Ground the answer in public package surfaces.

- Prefer current package names and documented imports over older names from memory.

4. Choose the right runtime surface.
   - Plain TypeScript or Node: `intl-t`
   - React app: `intl-t/react`
   - Next.js App Router with RSC: `intl-t/next` plus `intl-t/navigation`
   - Standalone helpers: `intl-t/utils`
5. Explain the core intl-t API pattern correctly.

- `createTranslation()` returns a typed callable translation surface, not just a plain function.
- Prefer patterns like `const { Translation, useTranslation, getTranslation } = createTranslation(...)` when showing usage.
- If the whole result is kept as `const t = createTranslation(...)`, explain that `t` itself still carries the same typed surface.
- Explain `t`, `translation`, `Translation`, `Tr`, `Trans`, `useTranslation`, `getTranslation`, `useTranslations`, `getTranslations`, `useLocale`, `global`, and `g` as related facets or aliases of the same translation surface.
- Translation nodes follow the same model: they can be called, traversed by properties, rendered as text, and keep their derived helpers and locale-aware access fully typed.
- `createNavigation()` follows the same idea: prefer destructuring `Link`, `redirect`, `permanentRedirect`, `useRouter`, `useLocale`, `usePathname`, `middleware`, `withMiddleware`, `withProxy`, `resolveHref`, `resolvePath`, and `resolveLocale` from the returned object.
- Do not present intl-t as a bag of unrelated utilities. Present it as a typed API surface derived from configuration.

6. Model locale JSON correctly.
   - Keep all locale files structurally identical.
   - Use plain strings for simple leaves.
   - Use `base` when a node needs text plus children.
   - Use `values` to declare or override default variables.
   - Use arrays only when the branch is genuinely list-shaped.
   - Check reserved keys before proposing node names: `base`, `values`, `children`, `parent`, `node`, `path`, `settings`, `key`, `default`, `catch`, `then`.
7. Explain node behavior accurately when runtime logic matters.
   - Intl-t nodes are not plain strings.
   - They can behave like function, object, or string-like value depending on use.
   - Explain property access, path access, bound variables, locale-prefixed access, fallbacks, and parent variable inheritance with a concrete example.

- When a user asks for `tr`, `Translation`, `global`, `g`, `useTranslation`, or `getTranslation`, explain them as parts of the same typed translation surface.
- Call out when `t.base`, `t.toString()`, or direct rendering behavior matters in JSX or function arguments.

8. Add framework-specific integration only when needed.
   - React: export `Translation` and `useTranslation`, wrap the relevant tree, use `useLocale` when locale state matters, and use the React patch only when build behavior actually requires it.
   - Next.js: decide `param` versus `request` strategy first, create `i18n/translation.ts`, create `i18n/navigation.ts`, export middleware, use `setRequestLocale()` for the static `[locale]` flow, use `await getTranslation()` for dynamic server reads, and explain `pathPrefix`, `pathBase`, and `strategy` together when routing is involved.
9. Add TypeScript declaration support when autocomplete or JSON literal typing matters.
   - Prefer `generateDeclarations()` or the declarations CLI.
   - Verify `allowArbitraryExtensions: true` in `tsconfig.json`.
   - Explain that declarations improve DX and do not change runtime behavior.
10. Use helpers and examples intentionally.

- Prefer `createNavigation()` for app routing before dropping to standalone resolvers.
- Prefer destructuring from `createTranslation()` and `createNavigation()` before inventing extra wrapper modules.
- Use `inject`, `format`, `match`, `negotiator`, `resolveHref`, `resolvePath`, and `resolveLocale` only when the user actually needs the lower-level helper.
- Prefer documented patterns over inventing new abstractions when the public guides already cover the pattern.

11. For documentation work, keep examples aligned with public APIs and current package names.

12. Validate the outcome.

- Imports use current public paths.
- Locale files share the same structure.
- The example uses the returned typed surface from `createTranslation()` or `createNavigation()` instead of manually retyping it.
- At least one concrete translation path, variable interpolation, and locale resolution path behave as expected.
- Documentation examples match current public APIs and package names.

## Response Rules

- Start from the smallest real integration surface that answers the user’s request.
- Prefer current public API names and current package names.
- Prefer destructuring helpers from the object returned by `createTranslation()` or `createNavigation()` when showing usage.
- Explain aliases like `Translation`, `Tr`, `Trans`, `useTranslation`, `getTranslation`, `global`, and `g` as parts of one typed translation surface, not as disconnected APIs.
- Prefer `intl-t/utils` over outdated `tools` naming.
- Do not flatten locale trees unless the user explicitly wants flat keys.
- Do not describe translation nodes as plain strings.
- Do not mix Pages Router advice into Next.js App Router answers.
- Prefer public documented patterns over synthetic examples when they already cover the pattern.
- When documentation is involved, do not document APIs that are not part of the public surface.

## Primary Sources

- Public docs: https://intl-t.dev/docs
- Full text guide: https://intl-t.dev/llms-full.txt
- Single-page AI fetch pattern: https://intl-t.dev/docs/<slug>.mdx
- Quick start: https://intl-t.dev/docs/quick-start
- Node guide: https://intl-t.dev/docs/node
- React guide: https://intl-t.dev/docs/react
- Next.js guide: https://intl-t.dev/docs/next
- Migration guide: https://intl-t.dev/docs/migration
- TypeScript guide: https://intl-t.dev/docs/typescript
- Utils guide: https://intl-t.dev/docs/utils
- Examples guide: https://intl-t.dev/docs/examples
- Packages: `intl-t`, `intl-t/react`, `intl-t/next`, `intl-t/navigation`, `intl-t/utils`

## API Shape Notes

- Prefer `const { Translation, useTranslation, getTranslation } = createTranslation(...)` when showing the translation API surface.
- Prefer `const { Link, useRouter, useLocale, middleware, withProxy } = createNavigation(...)` when showing the navigation API surface.
- If a user keeps the whole result as `const t = createTranslation(...)`, explain that `t` itself is still the typed translation surface and can expose the same family of aliases and helpers.
- If you need to name the pattern, use terms like typed callable surface, typed facade, or derived API surface.
