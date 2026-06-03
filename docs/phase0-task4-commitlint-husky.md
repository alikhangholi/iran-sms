# Phase 0 · Task 4 — commitlint + husky

## Files created

| File | Purpose |
|------|---------|
| `commitlint.config.cjs` | Commit message validation rules |
| `.husky/commit-msg` | Hook: validates commit message via commitlint |
| `.husky/pre-commit` | Hook: runs lint, format check, typecheck before commit |

## commitlint.config.cjs

**Why `.cjs`?** Same reason as `.eslintrc.cjs` — `"type": "module"` in `package.json` forces CommonJS configs to use the `.cjs` extension.

Extends `@commitlint/config-conventional` (Conventional Commits spec), with these overrides:

| Rule | Config | Effect |
|------|--------|--------|
| `type-enum` | level 2, always | Only these types allowed: `feat fix docs style refactor perf test chore revert ci build` |
| `subject-case` | level 2, lower-case | Subject must be lowercase |
| `subject-max-length` | 100 | Subject line length cap |
| `body-max-line-length` | 200 | Body line length cap |

### Valid commit format

```
feat: add kavenegar provider
fix: handle empty phone list in normalize-phone
chore: update dependencies
```

## .husky/pre-commit

Runs three checks in sequence before any commit is allowed:

```sh
set -e          # exit immediately on first failure
npm run lint
npm run format:check
npm run typecheck
```

`set -e` is the key — if any command exits non-zero, the script stops and git blocks the commit.

## .husky/commit-msg

```sh
npx --no -- commitlint --edit $1
```

`--no` prevents npx from downloading commitlint if it's not installed (fails loudly instead of silently installing the wrong version). `$1` is the path to the temporary commit message file git passes to the hook.

## Setup note

Husky installs hooks via `npm run prepare` (which runs `husky`). This runs automatically on `npm install` for any contributor who clones the repo.
