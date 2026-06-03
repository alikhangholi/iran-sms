# Phase 0 · Task 3 — ESLint + Prettier config

## Files created

| File | Purpose |
|------|---------|
| `.eslintrc.cjs` | ESLint configuration (CommonJS format) |
| `.prettierrc` | Prettier formatting rules |
| `.eslintignore` | Paths ESLint skips |

## .eslintrc.cjs

**Why `.cjs`?** The project has `"type": "module"` in `package.json`, which makes `.js` files treated as ESM. ESLint's config file must be CommonJS (`module.exports = …`), so `.cjs` extension is required to force CJS parsing.

### Parser & type-aware linting

```
parser: @typescript-eslint/parser
parserOptions.project: ./tsconfig.json   ← enables type-checked rules
extends: plugin:@typescript-eslint/recommended-type-checked
```

Type-aware rules require a `tsconfig.json` reference; they catch errors that syntax-only linting misses (e.g., floating promises, awaiting non-thenables).

### Rules summary

| Rule | Level | Effect |
|------|-------|--------|
| `no-explicit-any` | error | Bans `any` type |
| `explicit-function-return-type` | error | All functions must declare return type |
| `no-unused-vars` | error | Unused vars fail; `_`-prefixed params exempted |
| `consistent-type-imports` | error | Forces `import type` for type-only imports |
| `no-floating-promises` | error | Unhandled promise rejections caught at lint time |
| `await-thenable` | error | Prevents `await` on non-promises |
| `no-console` | warn | Flags console calls without blocking |

### ignorePatterns

`*.cjs` and `*.js` are ignored so the config file itself and any compiled output don't get linted.

## .prettierrc

| Option | Value | Rationale |
|--------|-------|-----------|
| `singleQuote` | `true` | Consistent with TypeScript community norm |
| `trailingComma` | `"all"` | Cleaner git diffs |
| `printWidth` | `100` | Wider than default 80; comfortable for TS generics |
| `endOfLine` | `"lf"` | Cross-platform consistency (avoids CRLF on Windows) |
| `arrowParens` | `"always"` | Consistent arrow function syntax |

## .eslintignore

Excludes `dist/`, `node_modules/`, `coverage/`, `*.cjs`, `*.mjs`, and build config files (`jest.config.ts`, `tsup.config.ts`) which don't need linting.
