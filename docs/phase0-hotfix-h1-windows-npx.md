# Phase 0 · Hotfix H1 — Fix npm scripts for Windows PowerShell 7

## Problem

On Windows 11 / PowerShell 7, running `npm run lint` and `npm run format:check` failed with:

```
'eslint' is not recognized as an internal or external command
'prettier' is not recognized as an internal or external command
```

## Root cause

npm scripts that call local binaries by name (e.g. `eslint`, `tsup`) rely on npm appending `node_modules/.bin` to `PATH` before executing the script shell. On Windows with PowerShell 7, this PATH injection is unreliable — the shell cannot resolve bare binary names from `node_modules/.bin`.

## Fix

Prefix every local binary call in npm scripts with `npx`. `npx` explicitly resolves binaries from the local `node_modules/.bin` directory before falling back to global installs, bypassing the PATH issue entirely.

### package.json — scripts changed

| Before | After |
|--------|-------|
| `"build": "tsup"` | `"build": "npx tsup"` |
| `"test": "jest"` | `"test": "npx jest"` |
| `"test:watch": "jest --watch"` | `"test:watch": "npx jest --watch"` |
| `"test:coverage": "jest --coverage"` | `"test:coverage": "npx jest --coverage"` |
| `"lint": "eslint src tests --ext .ts"` | `"lint": "npx eslint src tests --ext .ts"` |
| `"lint:fix": "eslint src tests --ext .ts --fix"` | `"lint:fix": "npx eslint src tests --ext .ts --fix"` |
| `"format": "prettier --write ..."` | `"format": "npx prettier --write ..."` |
| `"format:check": "prettier --check ..."` | `"format:check": "npx prettier --check ..."` |
| `"typecheck": "tsc --noEmit"` | `"typecheck": "npx tsc --noEmit"` |
| `"prepare": "husky"` | `"prepare": "npx husky"` |

### .husky/pre-commit — changed

Replaced `npm run lint / format:check / typecheck` with direct `npx` calls to avoid the double-indirection of npm scripts calling npm scripts:

```sh
npx eslint src tests --ext .ts
npx prettier --check "src/**/*.ts" "tests/**/*.ts"
npx tsc --noEmit
```

### .husky/commit-msg — no change

Already used `npx --no -- commitlint --edit $1`. Confirmed correct, left untouched.

## Files modified

| File | Change |
|------|--------|
| `package.json` | All 10 scripts prefixed with `npx` |
| `.husky/pre-commit` | Replaced `npm run` calls with `npx` direct calls |
