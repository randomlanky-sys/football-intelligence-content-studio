# Football Intelligence & Content Studio (FICS)

A local-first football match-intelligence and content workspace. Import match
events, work the timeline against a video poster, turn timestamped evidence into
reviewable insights, and export a publish-ready content pack — with the evidence
trail visible at every step.

**Status:** v2.0.0-beta. Guest workspace, no account, no server copy. Data lives
in the browser and can be exported, imported and reset. The demo match is
fictional and labelled as demo.

## Quick start

```bash
pnpm install
pnpm --filter @fics/web dev        # http://localhost:3000
```

Production build:

```bash
pnpm --filter @fics/web build
pnpm --filter @fics/web start --port 3000
```

Requires Node 22+ and pnpm 9+.

## Routes

| Route | Job |
|---|---|
| `/` | Product story and one-click entry to the demo |
| `/about`, `/privacy`, `/terms`, `/help` | Honest beta copy, data policy, shortcuts |
| `/app` | Overview: projects, review queue, export readiness |
| `/app/projects` | Library, search, filters, create/duplicate/archive/delete |
| `/app/p/[id]` | Studio: pitch, timeline, transport, moment inspector, insights |
| `/app/p/[id]/data` | Event table, CSV import (all-or-nothing), clips |
| `/app/p/[id]/review` | Evidence ledger: accept/edit/reject/flag/reopen |
| `/app/p/[id]/export` | Preflight, content-pack preview, `.md` / `.json` download |
| `/app/settings` | Backup, import, reset demo, storage keys, quarantine |

## Architecture

- `packages/web` — Next.js 15 App Router, React 19, Tailwind, the only deployable app.
- `packages/api` — typed Fastify service (zod validation, ETag/If-Match, health
  and readiness, in-memory repo). Not on the web critical path; kept because
  API/plugin validation is in scope.
- Domain libraries — `schema`, `timebase`, `timeline`, `geometry`,
  `evidence-engine`, `export-engine`, `data-import`, `project-core`,
  `tactical-editor`, `ui`, `ai-contracts`, `db-migrations`, `storage`,
  `video-engine`.

The web app imports workspace packages directly (`transpilePackages`); there are
no `src` path aliases from the app into packages.

### API service

```bash
pnpm --filter @fics/api build
PORT=3000 pnpm --filter @fics/api start
```

`GET /healthz`, `GET /readyz`, `GET /v1/plugins`, and CRUD at `/v1/projects`
(ETag / `If-Match`), `/v1/media`. The only environment variable is `PORT`
(default `3000`).

## Data safety model

- Versioned envelope `fics.workspace.v2` (schema version `2`) in `localStorage`.
- Seed only when the key is absent; unreadable data is copied to
  `fics.workspace.v2.corrupt.<stamp>` before recovery; a newer version opens
  read-only and refuses writes.
- Mutations are persistence-first: a failed write (including quota) leaves
  memory unchanged.
- Accepted insights store an evidence hash; staleness is derived at read time
  for accepted/edited claims only (hash mismatch, dangling ref, out-of-range
  timestamp). Reopen → proposed → accept re-baselines the hash.
- Export/import is a full replace with a pre-import snapshot; reset and delete
  are scoped and confirmed. `exports[]` is capped at 20 per project.

## Quality gates

```bash
pnpm -r --no-bail typecheck
$env:CI='true'; pnpm -r --no-bail test      # PowerShell
pnpm --filter @fics/web build
pnpm --filter @fics/web test:e2e            # builds, starts production, runs Playwright
```

The E2E suite covers every route, workflows A–F (deep link, review,
CSV import, stale-evidence recovery, backup/reset/restore, command palette),
storage quarantine, read-only recovery and the mobile shell. It runs against the
production build, not the dev compiler.

## Deployment

Live: **https://football-intelligence-content-studio.onrender.com** (Render,
Docker runtime, branch `master`).

`Dockerfile` builds the web app; `render.yaml` and `railway.json` describe the
service. CI runs typecheck, unit tests, production build and Playwright on
`master`.

Live verification is a separate suite that points at the deployed host:

```bash
cd packages/web
$env:LIVE_BASE_URL='https://football-intelligence-content-studio.onrender.com'
pnpm exec playwright test -c playwright.live.config.ts
```

It checks all 12 routes, security headers, the studio shell, the deep link, the
stale → reopen → accept → export flow with a real `.md` download, and the
workspace backup. A deployment is only accepted when that suite is green.


## Documents

- `concepts_brief.md` — benchmark, laws, alternatives, scope.
- `docs/designs/fics-v2-workspace.md` — binding design, red-team resolutions,
  state matrix, workflows.
- `docs/audit/PRODUCTION-AUDIT-2026-11-09.md` — pre-rebuild audit and closure
  evidence.
