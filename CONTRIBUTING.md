# Contributing to intl-t

Thank you for your interest in contributing to this project! This guide will help you get started with the development process.

## Development Setup

### Prerequisites

- Bun installed on your system

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/nivandres/intl-t.git`
3. Navigate to the project directory: `cd intl-t`
4. Install dependencies and build the workspace graph: `bun run setup`
5. Run the relevant validation commands for the area you are changing

## Working with the Monorepo

This project uses a Bun workspace monorepo.

Main areas:

- `src/`: root facade package for `intl-t`
- `packages/`: publishable workspace packages under `@intl-t/*`
- `docs/`: documentation content in MDX
- `app/`: documentation site workspace

The source of truth is the TypeScript source under `src/` and `packages/*/src/`. Generated output such as `dist/`, `packages/*/dist`, and `app/.next/` should not be edited by hand.

## Development Workflow

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Keep the change scoped so it can be reviewed cleanly
4. Run the smallest relevant checks first:
   - `bun run test`
   - `bun run typecheck`
5. Run broader validation if needed:
   - `bun run build`
   - `bun run check`
6. Commit your changes using the conventions below
7. Push your branch to your fork
8. Open a pull request

## Change Scope Guidelines

Prefer keeping these concerns separate unless the task clearly requires them together:

- library runtime or type changes
- documentation content changes
- docs app rendering or layout changes
- package metadata or release preparation

If a change affects public API, import paths, visible typing behavior, or user-facing runtime behavior, update the relevant docs. Internal refactors or maintenance changes do not automatically require documentation updates.

## Validation Commands

Common commands from the repository root:

- `bun run setup`: install dependencies and build the TypeScript project graph
- `bun run build`: compile the library packages and root facades with `tsc -b`
- `bun run test`: run Bun tests
- `bun run typecheck`: run root and workspace typechecks
- `bun run check`: run formatting, linting, and typechecking
- `bun run dev:app`: start the documentation site in dev mode
- `bun run build:app`: build the documentation site

If you are changing a package with local tests, prefer targeted validation for that area before running broader checks.

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear and structured commit messages:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code changes that neither fix bugs nor add features
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependencies, etc.

## Pull Request Guidelines

1. Ensure the affected area is validated with the relevant test, typecheck, and build commands
2. Update documentation when public-facing behavior or API usage changed
3. Avoid mixing release/versioning edits with unrelated runtime changes
4. Address any feedback from code reviews

## Versioning and Release Notes

Routine contributions should not change package versions unless the work is explicitly release-related.

This repository publishes:

- the root umbrella package as `intl-t`
- workspace packages as `@intl-t/*`

If you are doing release preparation, keep versions synchronized and follow the repository release order:

1. Update documentation first when the release changes public API, imports, visible typing, or user-facing behavior.
2. Build and validate the full workspace before versioning.
3. Bump the workspace package versions and then the root `intl-t` version so the release stays synchronized.
4. Review the Git state, commit the release changes, and move that release state through `main` and GitHub.
5. Publish the `@intl-t/*` packages first.
6. Publish the root `intl-t` package last.

Do not publish the root package before the scoped workspace packages it depends on.

## Code of Conduct

Please be respectful and constructive in all interactions within our community.

## Questions?

If you have any questions, please [open an issue](https://github.com/nivandres/intl-t/issues/new) for discussion.

Thank you for contributing to intl-t!
