# kb

Personal knowledge base — engineering notes, reference cards and AI-workflow
conventions — published with [Docusaurus](https://docusaurus.io/) at
<https://locphan87.github.io/kb/>.

## Layout

| Path       | Contents                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `docs/`    | The notes. Sidebar is generated from the folder structure; `_category_.json` controls a folder's label and position. |
| `blog/`    | Longer-form posts, with `authors.yml` and `tags.yml` for metadata.                                                   |
| `src/`     | Homepage, shared components and coding katas (`src/exercises/`) with unit tests.                                     |
| `scripts/` | Shell cheat sheets (not part of the build).                                                                          |

## Development

Node version comes from `.nvmrc` (Node 22); the package manager is Yarn 1.

```bash
yarn install
yarn start          # dev server with hot reload
```

## Checks

The same commands run in CI on every pull request:

```bash
yarn format:check   # Prettier (docs/ and blog/ are excluded on purpose)
yarn lint           # ESLint
yarn typecheck      # tsc
yarn test           # Jest
yarn build          # fails on broken links, broken anchors and undefined blog tags
```

`yarn install` installs a Husky pre-commit hook that runs `lint-staged`
(ESLint + Prettier on staged files).

## Adding a note

1. Add a markdown file under the relevant `docs/` folder — kebab-case filenames,
   no spaces.
2. Add front matter with a `title` when the filename is not a good sidebar label.
3. Preview with `yarn start`, then `yarn build` before pushing.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and pushes it to the `gh-pages` branch served by GitHub Pages. To deploy by hand:

```bash
GIT_USER=<your GitHub username> yarn deploy
```
