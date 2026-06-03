# Phase 0 · Task 5 — Changesets + .gitignore + folder scaffold

## Files created

### Configuration

| File | Purpose |
|------|---------|
| `.changeset/config.json` | Changesets versioning config |
| `.gitignore` | Git exclusion rules |
| `tsup.config.ts` | tsup bundler entry + format config |
| `CHANGELOG.md` | Empty changelog (populated by Changesets) |
| `README.md` | Package readme |

### Source scaffold

```
src/
├── index.ts                          # Public API — exports only
└── lib/
    ├── client.ts                     # IranSms client class
    ├── types.ts                      # Shared types and interfaces
    ├── error.ts                      # IranSmsError class
    ├── result.ts                     # SmsResult<T> wrapper
    ├── providers/
    │   ├── base.provider.ts          # Abstract SmsProvider base
    │   ├── kavenegar.provider.ts     # KavehNegar provider
    │   ├── smsir.provider.ts         # SMS.ir provider
    │   ├── farazsms.provider.ts      # FarazSMS provider
    │   └── ghasedak.provider.ts      # Ghasedak provider
    └── utils/
        ├── http.ts                   # Shared fetch wrapper
        └── normalize-phone.ts        # Iranian phone normalizer
```

### Placeholder directories

| Path | Purpose |
|------|---------|
| `tests/.gitkeep` | Test suite root (populated in Phase 2) |
| `docs/.gitkeep` | Documentation root |
| `.github/workflows/.gitkeep` | CI/CD workflows root |

## .changeset/config.json highlights

| Field | Value | Meaning |
|-------|-------|---------|
| `access` | `"public"` | Publishes as public scoped package |
| `baseBranch` | `"main"` | Diff base for changesets |
| `commit` | `false` | Changesets does not auto-commit version bumps |
| `updateInternalDependencies` | `"patch"` | Internal dep bumps use patch version |

## .gitignore

Excludes: `node_modules/`, `dist/`, `coverage/`, `*.log`, `.env*` (but tracks `.env.example`), OS files (`Thumbs.db`, `.DS_Store`), and `*.tsbuildinfo`.

## tsup.config.ts

```ts
entry: ['src/index.ts']
format: ['esm', 'cjs']
dts: true       // generates .d.ts + .d.cts
sourcemap: true
clean: true     // wipes dist/ before each build
```

## Build verification

`npm run build` (tsup) ran successfully against the empty `src/index.ts`:

- `dist/index.js` (ESM) — 33 B
- `dist/index.cjs` (CJS) — 48 B
- `dist/index.d.ts` — 13 B
- All source maps emitted
- Zero errors, zero warnings
