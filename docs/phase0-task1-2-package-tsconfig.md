# Phase 0 · Task 1–2 — package.json + tsconfig.json

## Files created

| File | Purpose |
|------|---------|
| `package.json` | Package manifest, scripts, devDependencies |
| `tsconfig.json` | TypeScript compiler options |

## package.json highlights

- **name:** `@alikhangholi/iran-sms` (scoped)
- **type:** `module` — pure ESM package
- **sideEffects:** `false` — enables tree-shaking
- **exports:** Dual CJS + ESM with `types` condition listed first (TypeScript resolution requirement)
- **No `dependencies`** — zero runtime dependencies
- **engines:** `node >= 18`

### devDependencies (latest stable, 2025)

| Package | Role |
|---------|------|
| `typescript` + `tsup` | Compile + bundle |
| `jest` + `ts-jest` + `@types/jest` | Testing |
| `eslint` + `@typescript-eslint/*` | Linting |
| `prettier` | Formatting |
| `husky` + `@commitlint/*` | Git hooks + commit convention |
| `@changesets/cli` | Versioning + changelog |

## tsconfig.json highlights

| Option | Value | Why |
|--------|-------|-----|
| `target` | `ES2020` | Broad Node 18+ compatibility |
| `module` | `ESNext` | Let tsup handle bundling |
| `moduleResolution` | `bundler` | Matches tsup's resolver |
| `strict` | `true` | Full strict mode |
| `exactOptionalPropertyTypes` | `true` | Prevents `undefined` in optional props |
| `noUncheckedIndexedAccess` | `true` | Safe array/object indexing |
| `declaration` + `declarationMap` | `true` | Type definitions + source maps |
| `rootDir` | `./src` | Source isolation |
| `outDir` | `./dist` | Build output |

## Fix applied

The initial `exports` field had `"types"` listed after `"import"` and `"require"`, which caused a tsup/esbuild warning ("condition will never be used"). Fixed by reordering to `types → import → require`.
