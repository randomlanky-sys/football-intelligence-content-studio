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

---

## Rebuild closure — 2026-11-09 (same day)

The audit above is the historical baseline. The v2 rebuild addressed every
blocker; evidence below was produced after the rebuild.

| Blocker | Resolution | Evidence |
|---|---|---|
| 1. No product surface | 12 routes shipped: 5 public, overview, projects, studio, data, review, export, settings | `packages/web/src/app/**`; E2E route tests |
| 2. Typecheck failed in 8 packages | All workspace projects typecheck | `pnpm -r --no-bail typecheck` → all Done |
| 3. Tests failed / missing | Real suites for every rebuilt library | `CI=true pnpm -r --no-bail test` → all green; web 30, api 12, evidence-engine 14, ui 11, export-engine 6, data-import 6, project-core 6, timebase 4, timeline 6, video-engine 4, ai-contracts 4 |
| 4. CI never ran | CI/CD trigger on `master`, valid shell, Node 22, pnpm 9.14, real gates | GitHub Actions run `42749137208`: verify passed in 47s, Playwright passed in 3m24s |
| 5. Root build broken | `turbo.json` uses `tasks`; web production build passes | `pnpm --filter @fics/web build` |
| 6. Unsubstantiated claims | SOC 2 / GDPR / "trusted by pro clubs" removed; privacy and terms state the beta is uncertified and browser-local | `/`, `/privacy`, `/terms` |
| 7. API stub | Typed Fastify API with zod, ETag/If-Match, in-memory repo, `/healthz`, `/readyz`, `/v1/projects`, `/v1/media`, `/v1/plugins` | `packages/api/src/index.test.ts` (12 tests) |

Additional verification:

- Playwright suite against the **production build**: 23/23 passing — all routes,
  workflows A–F, corrupt-storage quarantine, newer-workspace read-only, mobile
  shell with no horizontal overflow, and security headers.
- Security headers verified live in E2E: `nosniff`, `X-Frame-Options: DENY`,
  strict referrer policy, permissions policy, COOP, CSP with
  `frame-ancestors 'none'`; `X-Powered-By` removed.
- Storage safety proven in unit tests: quarantine-before-seed, read-only on a
  newer envelope, quota failure leaves memory unchanged, export→import
  round-trip, demo-scoped reset.
- Evidence integrity: staleness derived only for accepted/edited claims; a
  reopened stale claim displays `proposed` and the next accept re-baselines the
  hash. Regression test added (`store.test.ts`).
- E2E runs against `pnpm build && pnpm start`, so the tested artifact is the one
  that ships (not the dev compiler).

Remaining, owner-gated:

- **Live deployment was not performed.** Railway CLI tokens at the documented
  vault paths returned `Unauthorized`/`Invalid RAILWAY_TOKEN` on 2026-11-09, and
  the standing Railway policy requires the owner to name the target account in
  the current conversation before any state-changing command. The existing
  Railway service was created under a different account. Local production
  server and the full E2E suite are the verified artifact until credentials and
  the target account are confirmed.

