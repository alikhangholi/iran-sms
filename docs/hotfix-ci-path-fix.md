# Hotfix: Add `node_modules/.bin` to PATH in CI

**Date:** 2026-06-06

## Problem

CI passed `npm install` successfully but then failed with exit 127 (`eslint: not found`,
`tsc: not found`, etc.) when running `npm run lint`, `npm run typecheck`, and other script
steps. The binaries were installed but the shell could not resolve them.

## Root Cause

`npm run` normally prepends `node_modules/.bin` to `PATH` before executing a script, so
binaries are found. However, when each step in a GitHub Actions job runs in its own shell
process, `PATH` modifications made inside one step's shell do not persist to the next step.

When `npm install` ran in the *Install dependencies* step, `node_modules/.bin` was on `PATH`
only for the duration of that step. Every subsequent `run:` block started a fresh shell with
the original runner `PATH` — no `node_modules/.bin` — so direct binary calls (and `npm run`
invocations that ultimately exec the binary directly) failed with "not found".

## Fix

Add `node_modules/.bin` to `$GITHUB_PATH` immediately after the install step in both
workflows.

```yaml
- name: Add node_modules/.bin to PATH
  run: echo "$GITHUB_WORKSPACE/node_modules/.bin" >> $GITHUB_PATH
```

`$GITHUB_PATH` is the GitHub Actions file-based mechanism for persistently appending to
`PATH`. The runner reads this file before starting each subsequent step and prepends the listed
paths. This is the correct approach — `export PATH=...` inside a `run:` block only affects
the single step's shell and is not visible to later steps.

## Why not `export PATH=...`?

Each `run:` block is a separate shell invocation. Environment mutations (`export`, `PATH=...`)
live only for the lifetime of that shell process. `$GITHUB_PATH` is an out-of-band file the
runner itself reads between steps, making it the only reliable way to extend `PATH` across
steps without wrapping everything in a single `run:` block.

## Files Changed

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | Added PATH step after *Install dependencies*, before `npm run typecheck` |
| `.github/workflows/publish.yml` | Added PATH step after *Install dependencies*, before `npm run build` |
