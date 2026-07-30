# AGENTS.md — Knowledge Base (kb)

## What this is

Personal knowledge base built with [Docusaurus 3](https://docusaurus.io/). Hosted on GitHub Pages at `https://locphan87.github.io/kb/`. Content is Markdown in `docs/` and `blog/`. Also contains coding exercises under `src/exercises/` with paired `.test.ts` files.

## Commands

| Command | Purpose |
|---------|---------|
| `yarn start` | Dev server at localhost:3000, hot reload |
| `yarn build` | Static build to `build/` (fails on broken links — `onBrokenLinks: 'throw'`) |
| `yarn deploy` | Deploy to GitHub Pages (config: `locphan87/kb`, `gh-pages` branch) |
| `yarn test` | Jest (ts-jest, jsdom) — tests co-located as `*.test.ts`/`*.test.tsx` |
| `yarn test:cov` | Jest with coverage |
| `yarn typecheck` | `tsc` (extends `@docusaurus/tsconfig`) |

Order for safe changes: `yarn typecheck && yarn test && yarn build`.

## Layout

- **`docs/`** — Markdown content, sidebar auto-generated from filesystem via `sidebars.ts`
- **`blog/`** — Blog posts (`.md`, `.mdx`)
- **`src/`** — Custom React components, pages, CSS, exercises
- **`src/exercises/`** — Algorithm practice (binary gap, cyclic rotation, etc.), each module has a corresponding `.test.ts`
- **`.docusaurus/`** and **`build/`** — generated, gitignored

## Code style (observed)

- 2-space indentation in source, 4-space in exercises
- No ESLint or Prettier config present
- Tests use `@testing-library/react` with manual `jest.mock()` for Docusaurus modules
- `GEMINI.md` suggests conventions (I-prefix interfaces, `_` private members, JSDoc) but actual code does not follow them — trust the code, not the doc

## Deployment quirk

`editUrl` in config still points to `facebook/docusaurus` template repo — do not use. The actual repo is `locphan87/kb`.
