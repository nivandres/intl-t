---
name: intl-t-usage
description: "Use intl-t across the whole project. Use for setup, createTranslation, locale JSON syntax, node logic, TypeScript declarations, React, Next.js App Router, intl-t/utils, examples, docs authoring, and repo-wide intl-t questions."
argument-hint: "What are you trying to build, fix, explain, or document with intl-t?"
---

# Intl-T Usage

## Canonical Docs

- Public docs: https://intl-t.dev/docs
- Full text guide for AI and deep lookup: https://intl-t.dev/llms-full.txt
- Repo quick start: [docs/quick-start.mdx](../../docs/quick-start.mdx)
- Repo node logic and syntax: [docs/node.mdx](../../docs/node.mdx)
- Repo React guide: [docs/react.mdx](../../docs/react.mdx)
- Repo Next.js guide: [docs/next.mdx](../../docs/next.mdx)
- Repo utils guide: [docs/utils.mdx](../../docs/utils.mdx)
- Repo TypeScript guide: [docs/typescript.mdx](../../docs/typescript.mdx)
- Repo examples guide: [docs/examples.mdx](../../docs/examples.mdx)
- Repo contributor guidance: [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), [docs/contributing.mdx](../../docs/contributing.mdx)

## Project Overview

- `intl-t` is a Bun + TypeScript monorepo for a fully typed object-based i18n library.
- The root package publishes `intl-t` and re-exports public entry points from `src/`.
- `packages/core` owns core translation behavior.
- `packages/react` owns React hooks, provider behavior, patching, and JSX integration.
- `packages/next` owns Next.js App Router, middleware, navigation, and request locale behavior.
- `packages/utils` owns helpers such as `inject`, `format`, `match`, `negotiator`, and resolvers.
- `packages/declarations` owns generated TypeScript declaration support.
- `docs/` is the main source of truth for user-facing documentation.
- `examples/with-next-app` and `examples/with-farm-react` are the closest real integration examples.
- `apps/docs` renders the docs site, but docs content usually belongs in `docs/`.

## When to Use

- General intl-t setup or usage questions
- Choosing between `intl-t`, `intl-t/react`, `intl-t/next`, and `intl-t/utils`
- Designing locale JSON structure and explaining `base`, `values`, arrays, fallbacks, and variable inheritance
- Explaining node runtime behavior, including callable nodes, path traversal, and string-like rendering
- Wiring TypeScript declarations and editor autocomplete
- Integrating intl-t with React or Next.js App Router
- Using utilities like `inject`, `format`, `match`, `negotiator`, `resolveHref`, `resolvePath`, and `resolveLocale`
- Looking up repo examples or updating docs to match current imports and package names
- Repo-wide intl-t questions that need both public docs and local source grounding

## Topic Routing

- Setup and first use:
  Start with [docs/quick-start.mdx](../../docs/quick-start.mdx), then adapt to the target framework.
- Locale JSON syntax and structure:
  Use [docs/node.mdx](../../docs/node.mdx) and [docs/examples.mdx](../../docs/examples.mdx).
- Node runtime behavior:
  Use [docs/node.mdx](../../docs/node.mdx) and explain the node as function, object, and string-like value.
- TypeScript and declarations:
  Use [docs/typescript.mdx](../../docs/typescript.mdx) and [packages/declarations](../../packages/declarations).
- React integration:
  Use [docs/react.mdx](../../docs/react.mdx) and [examples/with-farm-react](../../examples/with-farm-react).
- Next.js App Router and server behavior:
  Use [docs/next.mdx](../../docs/next.mdx), [docs/migration.mdx](../../docs/migration.mdx), and [examples/with-next-app](../../examples/with-next-app).
- Utilities and routing resolvers:
  Use [docs/utils.mdx](../../docs/utils.mdx) and [packages/utils](../../packages/utils).
- Pattern lookup and examples:
  Use [docs/examples.mdx](../../docs/examples.mdx) and both example apps.
- Docs authoring and repo conventions:
  Use [AGENTS.md](../../AGENTS.md), [CONTRIBUTING.md](../../CONTRIBUTING.md), and [docs/contributing.mdx](../../docs/contributing.mdx).

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
3. Immediately ground the answer in repo-local sources.
   - Prefer relative repo docs and example apps when they already show the requested pattern.
   - Prefer current package names and imports from local code over older names from memory.
4. Choose the right runtime surface.
   - Plain TypeScript or Node: `intl-t`
   - React app: `intl-t/react`
   - Next.js App Router with RSC: `intl-t/next` plus `intl-t/navigation`
   - Standalone helpers: `intl-t/utils`
5. Model locale JSON correctly.
   - Keep all locale files structurally identical.
   - Use plain strings for simple leaves.
   - Use `base` when a node needs text plus children.
   - Use `values` to declare or override default variables.
   - Use arrays only when the branch is genuinely list-shaped.
   - Check reserved keys before proposing node names: `base`, `values`, `children`, `parent`, `node`, `path`, `settings`, `key`, `default`, `catch`, `then`.
6. Explain node behavior accurately when runtime logic matters.
   - Intl-t nodes are not plain strings.
   - They can behave like function, object, or string-like value depending on use.
   - Explain property access, path access, bound variables, locale-prefixed access, fallbacks, and parent variable inheritance with a concrete example.
   - Call out when `t.base`, `t.toString()`, or direct rendering behavior matters in JSX or function arguments.
7. Add framework-specific integration only when needed.
   - React: export `Translation` and `useTranslation`, wrap the relevant tree, use `useLocale` when locale state matters, and use the React patch only when build behavior actually requires it.
   - Next.js: decide `param` versus `request` strategy first, create `i18n/translation.ts`, create `i18n/navigation.ts`, export middleware, use `setRequestLocale()` for the static `[locale]` flow, use `await getTranslation()` for dynamic server reads, and explain `pathPrefix`, `pathBase`, and `strategy` together when routing is involved.
8. Add TypeScript declaration support when autocomplete or JSON literal typing matters.
   - Prefer `generateDeclarations()` or the declarations CLI.
   - Verify `allowArbitraryExtensions: true` in `tsconfig.json`.
   - Explain that declarations improve DX and do not change runtime behavior.
9. Use helpers and examples intentionally.
   - Prefer `createNavigation()` for app routing before dropping to standalone resolvers.
   - Use `inject`, `format`, `match`, `negotiator`, `resolveHref`, `resolvePath`, and `resolveLocale` only when the user actually needs the lower-level helper.
   - Reuse example app structure instead of inventing new abstractions when the repo already has the pattern.
10. For documentation work, keep docs aligned with the codebase.

- Put user-facing prose in `docs/`.
- Touch `apps/docs` only for rendering or docs app infrastructure.
- If a change updates roadmap items or larger contributor guidance, also update [docs/contributing.mdx](../../docs/contributing.mdx).

11. Validate the outcome.

- Imports use current public paths.
- Locale files share the same structure.
- At least one concrete translation path, variable interpolation, and locale resolution path behave as expected.
- Documentation examples match the repo’s current structure and package names.

## Response Rules

- Start from the smallest real integration surface that answers the user’s request.
- Prefer current public API names and current package names from this repo.
- Prefer `intl-t/utils` over outdated `tools` naming.
- Do not flatten locale trees unless the user explicitly wants flat keys.
- Do not describe translation nodes as plain strings.
- Do not mix Pages Router advice into Next.js App Router answers.
- Prefer repo examples and repo docs over synthetic examples when they already cover the pattern.
- When documentation is involved, do not document APIs that do not exist in this repo.

## Primary Sources

- Public docs: https://intl-t.dev/docs
- Full text guide: https://intl-t.dev/llms-full.txt
- [docs/quick-start.mdx](../../docs/quick-start.mdx)
- [docs/node.mdx](../../docs/node.mdx)
- [docs/react.mdx](../../docs/react.mdx)
- [docs/next.mdx](../../docs/next.mdx)
- [docs/migration.mdx](../../docs/migration.mdx)
- [docs/typescript.mdx](../../docs/typescript.mdx)
- [docs/utils.mdx](../../docs/utils.mdx)
- [docs/examples.mdx](../../docs/examples.mdx)
- [examples/with-next-app](../../examples/with-next-app)
- [examples/with-farm-react](../../examples/with-farm-react)
- [packages/react](../../packages/react)
- [packages/next](../../packages/next)
- [packages/utils](../../packages/utils)
- [packages/declarations](../../packages/declarations)
- [AGENTS.md](../../AGENTS.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
