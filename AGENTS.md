# AGENTS.md

## Project model

- `intl-t` is a Bun workspace monorepo for a typed i18n library.
- The root package is a thin facade over `@intl-t/*` packages.
- Source of truth lives in `src/`, `packages/*/src`, and `docs/`.
- Generated output such as `dist/`, `packages/*/dist`, `app/.next/`, and `.source/` is not hand-edited.

## Key root files

- `package.json`: workspace layout, shared scripts, release fan-out, and lint-staged rules.
- `tsconfig.json`: TypeScript reference graph, root emit config, and local path aliases to package sources.
- `src/index.ts`: umbrella export for the core package.
- `src/translation.ts`, `src/react.ts`, `src/next.ts`, `src/tools.ts`: root facade entrypoints for the published surface.
- `docs/`: public documentation source in MDX.

## How to act

- Make the minimum change that solves the task.
- Do not over-engineer, generalize early, or add abstractions without clear need.
- Prefer fixing the owning package instead of patching around behavior from the root facade.
- Keep changes easy to review and easy to revert.
- Preserve existing public APIs unless the task explicitly requires a change.
- Summarize structure and behavior briefly; avoid dumping large inventories when a short mapping is enough.

## Repo map

- `src/`: root facade entrypoints and subpath exports.
- `packages/core`: core translation runtime.
- `packages/format`: formatting and variable injection.
- `packages/global`: shared runtime state.
- `packages/locales`: locale types and mappings.
- `packages/react`: React bindings.
- `packages/next`: Next integration.
- `packages/tools`: matching, negotiation, resolvers, and utilities.
- `packages/declarations`: declaration generation and CLI.
- `docs/`: documentation source content.
- `app/`: docs rendering app.

## Technical context

- The library build is plain TypeScript project-reference compilation.
- JavaScript and declaration files are both emitted from source.
- The root build includes root facades and referenced workspace packages.
- Internal package links use workspace ranges and are expected to stay aligned for publishing.
- Each publishable package has its own `tsconfig.json` and emits its own `dist/` output.
- The root package emits its own `dist/` facade files on top of the package builds.
- There is no separate bundler layer for the library packages.

## Technologies and how they are used

- Bun: package manager, workspace runner, install flow, test runner, and release-script entrypoint.
- Bun workspaces: connect the root package, docs app, and publishable packages in one monorepo.
- TypeScript project references: compile the library as a graph instead of as isolated packages.
- Root path aliases: point `@intl-t/*` imports to package source during local development.
- ESM package output: all published packages expose ESM entrypoints from generated `dist/` files.
- Prettier: formatting for code and docs content.
- Oxlint: fast linting for JavaScript and TypeScript files.
- Husky and lint-staged: pre-commit checks for staged files.
- Bun test: primary unit test runner across the workspace.
- Next.js: framework used only for the docs site in `app/`.
- React: used in the docs app and in the `@intl-t/react` and `@intl-t/next` integration packages.
- Fumadocs and MDX: docs content pipeline and site rendering layer.

## Root scripts and what they do

- `setup`: installs dependencies and builds the TypeScript reference graph.
- `build`: emits library output for the root package and referenced packages.
- `build:app`: builds the docs site separately from the library build.
- `test`: runs the workspace test suite with Bun.
- `test:watch`: runs tests in watch mode for local iteration.
- `test:coverage`: runs tests with coverage collection.
- `typecheck`: checks the root package and then asks workspaces to run their own typecheck scripts.
- `check`: runs formatting, linting, and typechecking as a broader validation pass.
- `format`: rewrites files with Prettier.
- `lint`: runs Oxlint with autofix behavior.
- `clean`: removes TypeScript build state for the project-reference graph.
- `dev`: points to test watch mode, not to the docs app.
- `dev:app`: starts the docs app for local documentation work.
- `start`: watches TypeScript types at the root library level.
- `start:app`: starts the built docs app.
- `bump`: fans out version bumps to `@intl-t/*` workspaces only.
- `release`: fans out publish steps to `@intl-t/*` workspaces only.

## Package scripts pattern

- Most publishable packages keep the same script shape: `build`, `typecheck`, `bump`, and `release`.
- Packages with tests also expose `test`.
- `build` usually emits the local `dist/` folder.
- `typecheck` usually verifies the package in isolation.
- `bump` updates that package version.
- `release` publishes that package under its npm name.

## Docs app scripts pattern

- The docs app has its own dev, build, start, and typecheck flow.
- Docs content usually changes in `docs/`, while docs app behavior changes in `app/`.
- The docs app should not be treated as part of the library emit graph.

## Build model

- Root `src/` files mostly re-export package surfaces; fix behavior in the owning package whenever possible.
- Shared type changes can cascade through the reference graph, especially from `core`, `global`, `locales`, and `tools`.
- The docs app is separate from the library build and should not be treated as part of the library emit graph.

## Package-specific context

- `core` is the runtime center of the repository. Changes here often affect `react`, `next`, and emitted type surfaces.
- `next` is user-facing and behavior-sensitive. Middleware, redirects, rewrites, params, and localized navigation deserve extra scrutiny.
- `react` owns hooks, context, hydration-sensitive behavior, and client locale persistence. Changes here can affect `next` downstream.
- `tools` is low-level and framework-light, but resolver and matching changes can cascade into `next` behavior.
- `format` affects rendered translation output through formatting and variable injection semantics.
- `declarations` is both a library surface and a CLI surface; generated output shape and `bin` behavior are public API.
- `global` is small but foundational; changes to runtime flags or defaults can ripple through most packages.
- `locales` is mostly type-level infrastructure; small changes can create broad downstream type breakage.
- `app` renders docs and consumes `docs/`; app changes should focus on presentation, navigation, MDX processing, and docs infrastructure.

## Key package files

- `packages/core/src/translation.ts`: translation runtime and node traversal.
- `packages/core/src/types.ts`: generic contracts and public typing model.
- `packages/next/src/navigation.ts`: Next integration entrypoint.
- `packages/next/src/middleware.ts`: locale negotiation, redirects, rewrites, and cookie/header behavior.
- `packages/next/src/router.ts`: client navigation wrappers.
- `packages/react/src/hooks.ts`: locale and translation hooks.
- `packages/react/src/context.ts`: React context wiring.
- `packages/react/src/client.ts`: persisted client locale behavior.
- `packages/tools/src/resolvers.ts`: path, href, and locale resolution.
- `packages/format/src/formatters.ts`: formatting behavior.
- `packages/format/src/inject.ts`: variable injection.
- `packages/declarations/src/index.ts`: parsing, scanning, watch mode, and declaration generation logic.
- `packages/global/src/index.ts`: shared runtime flags, defaults, and exported state.
- `packages/locales/src/index.ts`: exported locale types and mapping helpers.
- `app/source.config.ts`: docs pipeline and MDX configuration.
- `app/lib/source.ts`: docs source loader.
- `app/app/layout.tsx` and `app/app/layout.config.tsx`: docs shell and layout configuration.

## Documentation structure

- `docs/` is the source of truth for user-facing documentation.
- `app/` renders the docs site; prefer changing `docs/` for prose, guides, examples, and API usage.
- Update docs when public API, import paths, visible typing, or user-facing behavior changes.
- Skip docs churn for internal refactors with no external behavior change.
- App changes should not be used to hide or work around library bugs in `packages/`.

## Change policy

- Keep runtime changes, docs changes, and release metadata changes separate unless the task requires them together.
- Update docs only when public API, visible typing behavior, import paths, or user-facing behavior changes.
- Do not touch package metadata casually; it affects published surface and release behavior.
- Treat changes to `exports`, `main`, `module`, `types`, `bin`, versions, and dependency contracts as release-sensitive.

## Validation policy

- Validate the smallest relevant area first.
- Expand validation when shared types, exports, or cross-package behavior changes.
- Be stricter for foundational packages and lighter for local doc-only edits.
- Do not leave known type or test failures caused by your change unresolved.
- Current test coverage is strongest in `core`, `format`, `react`, and `tools`.
- Changes in `next` often need broader scrutiny because behavior is user-facing and test coverage is lighter.
- Export-shape and metadata changes should be checked against both the owning package and the root facade.
- Review affected docs pages when docs rendering or navigation changes are user-visible.

## Release policy

- Versioning is script-driven, not changeset-driven.
- The workspace bump flow targets `@intl-t/*`; the root `intl-t` version is separate.
- Keep publishable package versions synchronized when preparing a release.
- Release work follows this order: document public changes if needed, build everything, bump versions, move the release state through Git and main, publish `@intl-t/*`, then publish the root package.
- The published naming is `intl-t` for the root package and `@intl-t/*` for workspace packages.
- The root bump flow does not automatically version the root `intl-t` package.
- Treat changes to `exports`, `main`, `module`, `types`, `bin`, versions, and dependency contracts as release-sensitive.
- More explicitly, the release sequence is:
- update docs first when the release changes public API, imports, visible typing, or user-facing behavior
- build the library graph before versioning so release artifacts are verified from source
- bump and synchronize versions across publishable packages and the root package
- review the Git state, publish the release branch or merge state to `main`, and publish that state to GitHub
- publish all `@intl-t/*` packages first
- publish the root `intl-t` package last, after its dependencies are already released

## Editing tips

- Prefer concise bullets and short explanations over long narrative docs.
- Preserve existing style, module boundaries, and package ownership.
- If a change in one package can affect others downstream, call that out and validate accordingly.
- Keep runtime changes, docs changes, and release metadata changes separate unless the task requires them together.
- Avoid editing generated output just to make a diff look complete.
- Do not use the docs app as a workaround layer for underlying package bugs.
