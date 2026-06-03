# CI/CD Setup

## Workflows

### `ci.yml` — Continuous Integration

Triggers on every push to `main` and every PR targeting `main`.

Runs the full quality gate across a **Node 18 / 20 / 22 matrix**:

| Step | Command |
|------|---------|
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Format check | `npm run format:check` |
| Build | `npm run build` |
| Test + coverage | `npm run test:coverage` |

Coverage reports are uploaded as artifacts (`coverage-node-<version>`) for each matrix leg.

---

### `publish.yml` — npm Publish

Triggers via `workflow_run` when **CI completes successfully** on a commit whose branch name starts with `v` (i.e., a version tag).

**Why `workflow_run` instead of `push: tags` + a polling job?**  
`workflow_run` is GitHub's native cross-workflow ordering primitive. It receives the CI conclusion directly — no API polling, no rate-limit risk, no flakiness. The only trade-off is that the publish job only fires when CI itself ran on the same SHA, which is exactly the guarantee we want.

#### Publish steps

1. Checkout the exact SHA that CI passed on
2. Setup Node 22 with npm registry auth
3. `npm ci` → `npm run build` → `npm run test`
4. `npm publish --access public --provenance` (generates npm provenance attestation via OIDC)

#### Required secret

| Secret | Where to get it |
|--------|----------------|
| `NPM_TOKEN` | npmjs.org → Account Settings → Access Tokens → **Automation** token |

Add it at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

---

## Release workflow

```bash
# 1. Bump version (uses Changesets — see .changeset/)
npx changeset
npx changeset version

# 2. Commit, push, then tag
git add . && git commit -m "chore: release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags

# GitHub Actions takes it from here:
#   push → CI runs → CI passes → publish.yml fires → npm publish
```

## Artifacts

| Artifact | Retention | Contents |
|----------|-----------|---------|
| `coverage-node-18` | 90 days (default) | Istanbul/V8 coverage report |
| `coverage-node-20` | 90 days | Istanbul/V8 coverage report |
| `coverage-node-22` | 90 days | Istanbul/V8 coverage report |
