# AGENTS.md

## Project Overview

`intl-t` is a Bun + TypeScript monorepo for a fully-typed object-based i18n library built around tree-shaped translation objects.

i18n typed model across plain TypeScript, React, and Next.js, with helpers for formatting, locale types, and generated declarations.

## Workspace Map

- `intl-t` root package: published facade that re-exports the public entry points from `src/`.
- `@intl-t/core`: core translation engine and typed translation tree runtime.
- `@intl-t/react`: React bindings such as providers and hooks.
- `@intl-t/next`: Next.js integration for locale-aware apps.
- `@intl-t/format`: formatting helpers, variable injection, and ICU-related behavior.
- `@intl-t/utils`: shared utilities used by the ecosystem packages.
- `@intl-t/declarations`: generates TypeScript declaration files from translation objects.
- `@intl-t/locales`: locale types shared across packages.
- `intl-t-docs` in `apps/docs`: Next.js documentation app.
- `@intl-t/assets` in `assets/`: internal repository assets.
- `docs/`: MDX content consumed by the docs app.
- `examples/`: integration examples for consumers.

## Common Scripts

Package manager: `bun`

```bash
bun install
bun run format
bun run lint
bun run typecheck
bun test
bun run build
```

## Example

```ts
import { createTranslation } from "intl-t";

const en = {
  homepage: {
    title: "Homepage",
    welcome: "Welcome, {user}!",
  },
} as const;

const t = createTranslation({ locales: { en } });

t("homepage.title");
t("homepage.welcome", { user: "Ivan" });
t.homepage.title;
```

## Testing

- Run all tests: `bun test`
- Tests mainly live under `packages/*/tests`.
- Testing naming:
  - Legacy tests: `*.legacy.test.ts` or `*.legacy.test.tsx`
  - AI-generated tests: `*.ai.test.ts` or `*.ai.test.tsx`

## Code Style

- Format: `bun run format`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Keep changes focused, easy to review, and simple to modify.

## Contribution Notes

- Open pull requests against `main`.
- Before submitting code changes, run: `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run build`, `bun test`
- CI in `.github/workflows/main.yml` runs the same checks for code changes.
- If you update roadmap items or larger feature plans, also update `docs/contributing.mdx`:
  - the roadmap bullet list
  - the progress table
