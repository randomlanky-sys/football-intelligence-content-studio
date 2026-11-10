# FICS v2 — Concepts Brief (Elephant brainstorm)

Date: 2026-11-09
Status: DRAFT → Goldfish review
Owner: human (delegated execution to Goldy EGM Pro)

## Overview
Football Intelligence & Content Studio (FICS) is a local-first match-intelligence and content workspace. An analyst imports match events, works a timeline against video, turns evidence into reviewable insights, and exports a publish-ready content pack. The v1 repo contains 16 domain libraries and a 3-page marketing site; the product itself was never built. v2 restarts the product surface with a rescoped, honest, verifiable vertical slice.

## Current state (evidence)
- Live marketing site on Railway (200), Render asleep.
- 16 TS packages, ~3.4k lines. Typecheck: 8 fail / 8 pass. Tests: 12 pass / 2 fail.
- No `/app`, no dashboard, no studio, no review, no export. API is a hardcoded stub. Plugins are log statements.
- CI/CD non-functional (wrong branch, invalid shell, fake deploy).
- Marketing claims unsubstantiated (SOC 2, GDPR, "trusted by pro clubs").

## Benchmark — what world-class looks like

| Product | Pattern worth taking | What to reject |
|---|---|---|
| **Hudl Sportscode / Wyscout** | Three modes: Setup, Tagging, Review. Tagging screen is sacred: video + tag buttons + timeline only. Clip → playlist → share. | Heavy desktop install, per-seat cost, opaque data model. |
| **SAP Sports One (Match Insights)** | Video, event timeline, and player data in one layout; personalised packages per player; side-by-side session comparison. | Enterprise density that buries the next action. |
| **SciSports** | 198 typed events, colour-coded categories, pitch view ⇄ table view; actions composed of sub-events. | Taxonomy sprawl without a beginner path. |
| **Opta Live** | Live stream with search, three-tier filters (team / event / content type), typed insight cards, strong visual hierarchy. | Infinite feed with no "where am I" anchor. |
| **OpenTag.Studio** | Live tagging, dashboard tiles that click through to clips, JSON save/load, localStorage crash recovery. | Feature wall with no guided first run. |
| **The Athletic match dashboard** | Score header first; threat/momentum timeline; shot map; one screen answers "what happened". | Editorial-only, not a working tool. |

**Synthesis — the five laws for v2**
1. **Evidence is a first-class object.** Every claim carries timestamped evidence and a hash; stale evidence is visible, never silent.
2. **One screen, one job.** Workspace = video/pitch + timeline + evidence panel. Settings, import, and export live in their own routes.
3. **Density with a spine.** Dark broadcast surface, one accent, tabular timestamps, no decorative chrome inside the workspace.
4. **Click-through everywhere.** Every chart mark, event chip, and insight opens the exact moment.
5. **Honest product.** No compliance badges, no invented metrics, no fake AI. Demo data is labelled as demo.

## Goals (v2, ship today)
- G1 A visitor understands the product in 10 seconds and can enter a populated workspace in one click.
- G2 A first-time user completes: open demo → inspect a moment → accept an insight → export a content pack, without a manual.
- G3 Every route and workflow is covered by a passing Playwright test; typecheck and unit tests are green across all packages.
- G4 The site is deployable from a clean checkout with one documented command and verified live after deploy.
- G5 Claims on the site are traceable to something the product actually does.

## Non-goals (today)
- Real video upload/decoding, WebCodecs, ffmpeg.wasm, cloud render.
- Accounts, billing, multi-tenant sync, Postgres/RLS.
- Computer-vision tracking, player identity, automatic event detection.
- The full SSOT phase E surface. Those return behind flags in later phases.

## Alternatives weighed
| Option | Why not |
|---|---|
| **A. Patch the landing page only** | Fast but leaves the product absent; owner asked for a restart, not a coat of paint. |
| **B. Build the full SSOT** | Weeks of work; would ship nothing today; violates the "go live today" constraint. |
| **C. Rescoped vertical slice (chosen)** | One real match, six real routes, evidence workflow, export pack, all libraries exercised, deployed today. Extendable to the SSOT without rewrites. |
| **D. Buy/embed a third-party analyst tool** | No rights, no differentiation, no evidence model. |

## Key decisions
1. **Guest mode, local-first.** No auth today; projects persist in `localStorage` with versioned schema, export/import, and reset. Auth is a later phase; the store boundary is designed so it can swap to an API.
2. **One demo match, fully populated.** Fictional fixture (Atlantic FC vs Highveld United) with 30+ events, 8 insights, 4 clips, xG, momentum. Demo is labelled and resettable.
3. **Use the monorepo libraries for real.** `@fics/schema` validates records; `timebase`/`timeline` drive the scrubber; `geometry` maps pitch coordinates; `evidence-engine` hashes and transitions review states; `export-engine` runs preflight; `data-import` parses CSV; `tactical-editor` drives tool state; `ui` formats numbers; `project-core` logs commands.
4. **Design identity: "stadium night".** Near-black blue surface, electric lime primary, floodlight cyan data accent, whistle amber warnings, card red destructive. System font stack (no network font fetch), tabular numerals, 120/200 ms motion, reduced-motion honoured.
5. **Drop the WebGL hero from the critical path.** Keep the 3D component in the repo behind a lazy boundary only if it does not affect LCP; otherwise replace with an SVG tactical hero. (Goldfish to challenge.)
6. **API becomes a real local service, not a deployment dependency.** Typed routes, zod validation, in-memory repo, plugin registry with status. Web app does not require it for today's go-live.
7. **CI fixed to the real branch and real commands.** `master`, Node 22, pnpm setup, turbo `tasks`, typecheck + test + build + E2E smoke.

## Rescoped information architecture
Public: `/` · `/about` · `/privacy` · `/terms` · `/help`
Workspace: `/app` (overview) · `/app/projects` · `/app/p/[id]` (studio) · `/app/p/[id]/data` · `/app/p/[id]/review` · `/app/p/[id]/export` · `/app/settings`

## Success criteria (checkable)
- [ ] `pnpm typecheck` exits 0 across all packages.
- [ ] `pnpm test` exits 0; data-import has ≥4 tests; export-engine suite parses and passes.
- [ ] `pnpm build` exits 0; all routes prerender or render without error.
- [ ] Playwright: marketing (4 routes), workspace (7 routes), workflows A–F pass on chromium.
- [ ] Lighthouse-ish budget: landing JS ≤ 250 KB gz first load; workspace lazy-loads heavy panels.
- [ ] No unsubstantiated compliance or performance claims in shipped copy.
- [ ] Railway deploy verified: live URL returns the new build (marker string) and all routes 200.

## Staging
1. Foundations (turbo, CI, package fixes, tests).
2. Design system + shell + demo data store.
3. Workspace routes + workflows.
4. Marketing v2 + legal/help.
5. E2E + a11y + build.
6. Ship + live verify + learn.
