# Contributing

Thanks for contributing to intl-t.

Keep changes focused, easy to review, and simple to modify.

## Basic flow

1. Fork the repository.
2. Create a branch for your change.
3. Open a pull request against `main`.

## Tests

- Legacy tests use `*.legacy.test.ts` or `*.legacy.test.tsx`.
- AI-generated tests use `*.ai.test.ts` or `*.ai.test.tsx`.

## Roadmap

Feature ideas, work in progress, and larger or more complex changes should also be tracked in `docs/contributing.mdx`. When you add something to the roadmap, update:

1. The bullet list.
2. The progress table.

## Workflows

```bash
bun install
bun run format
bun run lint
bun run typecheck
bun test
bun run build
```
