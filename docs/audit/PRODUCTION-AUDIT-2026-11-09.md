# Production Audit — Football Intelligence & Content Studio
Date: 2026-11-09 · Auditor: Goldy EGM Pro (Elephant) · Skill: production-audit
Scope: repo `C:\Users\pc\football-intelligence-content-studio`, branch `master`, live URLs.

## Verdict
**Production audit: 34/100 — BLOCKED.** The public marketing site is live, but the product described in the SSOT does not exist in the codebase. Foundations (typecheck, tests, CI, build config) are partially broken. Claims on the live site are unsubstantiated.

## Blockers
1. **No product surface.** No `/app`, no dashboard, no project workflow, no studio, no review, no export. SSOT §9.1 route map is unimplemented.
2. **Typecheck fails in 8 of 16 packages** (`api`, `ai-contracts`, `data-import`, `db-migrations`, `evidence-engine`, `export-engine`, `project-core`, `timebase`). Evidence: `pnpm -r typecheck` → `8 fails, 8 passes`.
3. **Tests fail**: `export-engine` test file is truncated (esbuild "Unexpected end of file"); `data-import` has no test files and exits 1. Evidence: `pnpm -r test` → `2 fails, 12 passes`.
4. **CI never runs.** `.github/workflows/ci.yml` + `cd.yml` trigger on `main`; default branch is `master`. `cd packages/*` is invalid shell. CD `needs: [CI]` references no job. Node 20 violates `engines.node >=22`. Deploy step only echoes "Deploying to Supabase…".
5. **Root build broken.** `turbo.json` uses `pipeline` (Turbo 1.x) while `turbo ^2` requires `tasks`.
6. **Unsubstantiated claims on live homepage**: "SOC 2 certified", "GDPR compliant", "Trusted by … professional clubs", "40% conversion rate". Contradicts SSOT §11.5 and §15.4.
7. **API is a stub**: `/v1/projects` returns `[]` and `{id:'1'}` regardless of input; no validation, persistence, authz, or idempotency. 11 integration plugins only call `log.info`.

## High-value fixes
- Replace placeholder library implementations with real, tested logic (evidence hash, export preflight, CSV parser, form validation).
- Add a shared app shell, command palette, and keyboard model.
- Add E2E coverage for every route and the core workflows.
- Add `/privacy`, `/terms`, `/help`; remove compliance claims until reviewed.
- Add health/readiness and plugin status endpoints; document env vars.
- Add security headers (CSP, frame-ancestors, referrer-policy).

## Evidence checked
- `git status --short --branch`, `git log --oneline -5`
- `pnpm -r typecheck` (log: `%TEMP%\opencode\fics-typecheck.log`)
- `pnpm -r test` (log: `%TEMP%\opencode\fics-test.log`)
- `packages/*/src`, `packages/web/src/app/*`, `packages/web/e2e/app.spec.ts`
- `.github/workflows/ci.yml`, `.github/workflows/cd.yml`, `turbo.json`, `Dockerfile`, `railway.json`
- Live `https://web-production-644137.up.railway.app/` → 200, title "Football Intelligence & Content Studio"
- Live Render URL → timeout (free-tier idle)

## Evidence missing
- Render cold-start timing (needs a second request after warm-up).
- Real-user analytics (none exist).
- Any legal/compliance review artefacts.

## Next action
Approve the rescoped v2 workspace design (`docs/designs/fics-v2-workspace.md`) and execute the six-stage EGM delivery loop.
