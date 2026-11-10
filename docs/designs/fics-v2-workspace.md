# FICS v2 Workspace — Design Draft

Date: 2026-11-09 · Elephant: Goldy EGM Pro · Source brief: `concepts_brief.md`

## Stage ledger
| # | Stage | State | Evidence |
|---|---|---|---|
| 1 | Design | in progress | this document |
| 2 | Red-team | pending | Goldfish reports |
| 3 | Build | pending | diff + tests |
| 4 | Verify | pending | gate commands |
| 5 | Ship | pending | commit + deploy |
| 6 | Learn | pending | growth log + compact |

## 1. Problem
The repo has domain libraries and a marketing site, but no product. The SSOT describes a full studio; building it wholesale cannot ship today. We need a truthful, useful vertical slice that exercises the libraries and can grow into the SSOT.

## 2. Goals / Non-goals
Goals: see brief G1–G5. Non-goals: real video decode, auth/billing, CV tracking, cloud render, full SSOT.

## 3. Technical plan

### 3.1 Architecture
- **Next.js 15 App Router** in `packages/web`, React 19, Tailwind 3, TypeScript strict.
- **Client state**: a typed `ProjectStore` over `localStorage` with a versioned envelope (`{version, savedAt, projects}`). React context + `useSyncExternalStore` for subscriptions. All mutations go through store actions; no component writes storage directly.
- **Domain logic**: import from workspace packages (`@fics/schema`, `timebase`, `timeline`, `geometry`, `evidence-engine`, `export-engine`, `data-import`, `tactical-editor`, `ui`, `project-core`). Web tsconfig adds path aliases only if package builds are unavailable; prefer workspace deps.
- **API**: Fastify service in `packages/api` with zod validation, in-memory repository, `/healthz`, `/readyz`, `/v1/projects` CRUD, `/v1/plugins` status. Not required by the web app for go-live.
- **No server components with browser APIs.** Workspace routes are client components; public pages are server components where possible.

### 3.2 Data model (client)
```
Project {
  id, name, competition, date, state: draft|active|review|exported|archived,
  teams: { home: Team, away: Team },
  score: { home, away },
  durationUs, fps,
  events: Event[],
  insights: Insight[],
  clips: Clip[],
  exports: ExportRecord[],
  createdAt, updatedAt
}
Event { id, type, minute, tUs, teamId, playerId?, x?, y?, endX?, endY?, outcome?, xg? }
Insight { id, claim, status: proposed|needs_evidence|accepted|edited|rejected|stale,
          evidenceHash, evidence: EvidenceRef[], limitations?, reviewer?, updatedAt }
EvidenceRef { eventId, tUs, label }
Clip { id, name, inUs, outUs, tags[] }
ExportRecord { id, preset, createdAt, qcPassed, pack: ContentPack }
Team { id, name, short, color, formation }
```
Records validate with `@fics/schema` where the shapes align; a web-level zod schema covers fields the package schema lacks (teams/insights extensions). Demo seed passes validation at store init; invalid stored data falls back to seed and surfaces a recovery notice.

### 3.3 Routes and responsibilities
| Route | Job | Key interactions |
|---|---|---|
| `/` | Explain + enter | Hero, product proof (real screenshot), three workflows, honest beta note, CTA → `/app` |
| `/about` | Who/why | Mission, principles, data policy link |
| `/privacy` | Data honesty | Local-first statement, what is stored, export/delete |
| `/terms` | Beta terms | No warranty, acceptable use, rights attestation |
| `/help` | Self-serve | Keyboard map, error codes, FAQ, demo reset |
| `/app` | Overview | Role lens (Analyst/Coach/Creator), KPI row, momentum card, resume card, review queue, recent projects, empty state |
| `/app/projects` | Library | Search, filter by state, sort, grid/list, create, duplicate, archive, delete |
| `/app/p/[id]` | Studio | Score header, video/pitch stage, transport, event list, insight panel, multi-track timeline, keyboard shortcuts |
| `/app/p/[id]/data` | Import | CSV paste/upload → parse → validate → map → commit; events table with filters |
| `/app/p/[id]/review` | Evidence ledger | Claim list, status filters, accept/edit/reject/request-evidence, stale detection, hash display |
| `/app/p/[id]/export` | Export | Preflight checklist, preset, content pack generator, QC report, copy/download JSON |
| `/app/settings` | Control | Profile, appearance, storage usage, export/import/reset demo |

### 3.4 Design system — "stadium night"
Tokens (CSS vars + Tailwind extend):
- `--bg #07090C`, `--surface #0D1117`, `--surface-2 #131A22`, `--line #1F2933`
- `--text #E8EEF4`, `--muted #9AA7B4`, `--dim #66727F`
- `--accent #C6F24E` (lime), `--accent-ink #0A0F05`
- `--cyan #4CC9F0` (data), `--amber #FFB020` (warning), `--red #FF5D5D` (destructive), `--green #35D07F` (success)
- Type: system UI stack; display 700–800 tight tracking; mono for timestamps (`ui-monospace`).
- Radius 10/14; 1px borders; gradients only for atmosphere; no drop-shadow stacks.
- Motion 120/200 ms; all animation disabled under `prefers-reduced-motion`.
- Focus: 2px lime outline, offset 2px. All interactive targets ≥ 32 px, primary ≥ 44 px on touch.

### 3.5 Key components
`AppShell` (sidebar + topbar + content), `CommandPalette` (⌘K), `StatCard`, `MomentumChart` (SVG diverging bars), `XgRace` (SVG cumulative lines), `ShotMap` (pitch + sized marks), `PassMap` (arrows), `Pitch` (SVG, zones, orientation), `Timeline` (tracks, zoom, playhead), `VideoStage` (poster + simulated transport; pitch overlay toggle), `EventList` (virtualised if >100), `InsightCard` (claim, status, evidence chips, actions), `PreflightChecklist`, `ContentPackPanel`, `EmptyState`, `Toast`.

### 3.6 Keyboard model
Space play/pause · ←/→ frame step · Shift+←/→ 10 frames · I/O in/out · K keyframe · M marker · V/A/Z/T tools · ⌘K palette · Esc close.

### 3.7 Demo dataset
Fictional fixture: Atlantic FC 2–1 Highveld United, "Continental Cup — Matchday 6", 90 min, 25 fps. 32 events (goals, shots with xG, passes, tackles, cards, subs), 8 insights across proposed/needs_evidence/accepted/rejected/stale, 4 clips, momentum series, possession 54/46, shot map coordinates in metres (pitch 105×68).

### 3.8 Export pack
`ContentPack { title, hook, thread[], article, captions, hashtags, thumbnailBrief, evidenceSummary }`. Generated deterministically from accepted insights + match facts; refuses to include rejected or stale claims; preflight blocks when zero accepted insights, missing duration, or stale evidence.

## 4. Alternatives considered
- **Server-rendered dashboard with Postgres** — rejected for today: no auth, no DB provisioning, adds deploy risk.
- **Zustand/Redux** — rejected: one store, small surface; context + external store is enough.
- **Chart library (Recharts)** — rejected: bundle cost and styling friction; SVG primitives are small and testable.
- **Keep WebGL hero** — rejected for the critical path: 3D adds ~500 KB and LCP risk; replace with an SVG tactical hero. Component stays in repo, unused, until a later phase.
- **Full SSOT routes** — rejected: cannot ship today.

## 5. Detailed implementation plan (files, no code)

### 5.1 Foundation
- `turbo.json` → `tasks`; add `typecheck` task; outputs.
- `.github/workflows/ci.yml` → branch `master`, Node 22, `pnpm/action-setup@v4`, install, typecheck, test, build.
- `.github/workflows/cd.yml` → remove invalid `needs: [CI]`; deploy job gated on CI workflow completion; keep Railway as deploy target (no fake Supabase step).
- `packages/export-engine/src/index.test.ts` → rewrite complete suite.
- `packages/data-import/src/index.test.ts` → new suite (CSV quotes, CRLF, validation, commit).
- `packages/api/src/**` → typed routes, zod schemas, repository, plugin registry, tests.
- `packages/evidence-engine` → real SHA-256 (pure TS) + state machine tests.
- `packages/ui` → remove React hook; real validators; tests.
- `packages/timebase`, `project-core`, `ai-contracts`, `db-migrations` → fix strict TS errors.

### 5.2 Web foundation
- `src/styles/globals.css` → tokens, base, utilities, motion, scrollbars.
- `tailwind.config.js` → map tokens, fonts, animations.
- `src/app/layout.tsx` → metadata, viewport, skip link, toast provider.
- `src/lib/types.ts`, `src/lib/format.ts`, `src/lib/demo-data.ts`, `src/lib/store.ts`, `src/lib/use-store.ts`, `src/lib/use-keyboard.ts`, `src/lib/content-pack.ts`, `src/lib/preflight.ts`.

### 5.3 Components
`site/Header.tsx`, `site/Footer.tsx`, `shell/AppShell.tsx`, `shell/Sidebar.tsx`, `shell/Topbar.tsx`, `shell/CommandPalette.tsx`, `ui/*`, `charts/*`, `pitch/Pitch.tsx`, `studio/*`.

### 5.4 Routes
As §3.3. All workspace pages are client components reading the store; unknown project id → not-found panel with link back.

### 5.5 Tests
- Unit: content pack determinism, preflight rules, store reducers, formatting, CSV import.
- E2E (chromium, plus mobile project for smoke): routes, create/duplicate/delete project, open studio, accept insight, export pack, CSV import, settings reset/import, marketing nav.
- A11y: axe scan on `/`, `/app`, `/app/p/[id]`; keyboard-only studio smoke.

## 6. Verification plan
1. `pnpm install --frozen-lockfile` (clean).
2. `pnpm typecheck` → 0.
3. `pnpm test` → 0.
4. `pnpm --filter @fics/web build` → 0; record route table + first-load JS.
5. `pnpm --filter @fics/web exec playwright test` → 0 (chromium; mobile smoke).
6. `docker build` → 0 (optional if time).
7. Commit, push `master`, Railway deploy, poll status, hit every live route, assert new marker text.
8. Update compact + growth log.

## 7. Risks
| Risk | Mitigation |
|---|---|
| Scope creep into SSOT | Non-goals enforced; no auth/video decode today. |
| localStorage schema drift | Versioned envelope + validation + fallback + export/import (see §8). |
| Demo data feels fake | Label "Demo match"; realistic event mix; evidence links to real timestamps. |
| Build breaks on Railway | Local Docker-equivalent build + pinned lockfile + Node 22. |
| Time | Tier order: foundations → shell/store → studio → review/export → data/settings → marketing → E2E. |

## 8. Red-team resolutions (Goldfish, 2026-11-09)

These override any earlier sentence in this document that conflicts.

### 8.1 Store envelope and corruption policy
- Storage key: `fics.workspace.v2`. Version constant: `2`.
- Authoritative validator: the web-level zod schema in `src/lib/schema.ts`. `@fics/schema` is used for shared record shapes; where it is narrower than the workspace record, the workspace schema wins and the difference is documented.
- On load: parse envelope → validate. Outcomes:
  - **absent** → seed demo, persist, set `origin:'demo'`.
  - **valid version 2** → use as-is.
  - **valid version < 2** → run `migrate(from)` (identity stub today); persist migrated.
  - **version > 2** → enter **read-only mode**: no writes, banner explains the app is older than the data, offer export.
  - **unparseable/invalid** → copy the raw string to `fics.workspace.v2.corrupt.<ISO>` **before** any write, then seed, then show a recovery notice with the quarantine key.
- No seeding when `projects.length === 0` and the envelope exists (deleting the demo must not resurrect it).

### 8.2 Export / import contract
- File format is the envelope itself: `{ version, savedAt, projects }`, pretty-printed JSON.
- Import: version gate (refuse `> 2`; migrate `< 2`), validate every project, show a confirm dialog stating project count, take an automatic pre-import snapshot into `fics.workspace.v2.snapshot.<ISO>`, then replace. Never merge silently.
- Acceptance test: export → import → deep-equal of `projects`.
- Reset demo: only removes `origin === 'demo'`; user projects survive. Delete project: confirm by typing the project name; a snapshot is written first.

### 8.3 Evidence canonicalisation and staleness
- Hash input is exactly `JSON.stringify` of the evidence refs mapped to `{ eventId, tUs, label: label.trim() }`, sorted by `(tUs, eventId)`, with `tUs` as an integer.
- SHA-256 is implemented in pure TS in `@fics/evidence-engine` with known-answer tests (`""`, `"abc"`).
- `stale` is **derived at read time** for reviewed claims only (`accepted`/`edited`): `storedHash !== hash(currentRefs)` OR any `eventId` no longer exists OR the project duration changed below a referenced `tUs`. It is not a stored transition. A `proposed` or `needs_evidence` claim has no baselined hash, so reopening a stale claim shows `proposed` immediately and the next accept re-baselines the hash.
- Invalidations: event edit, `tUs` change, label edit, CSV re-commit that replaces events, project duration change.
- Dangling evidence renders as a warning chip and blocks export preflight.

### 8.4 Demo vs user data
- `Project.origin: 'demo' | 'user'`.
- Demo ids are fixed strings (`demo-atl-hvu`), user ids use `crypto.randomUUID()`.
- Demo fixture timestamps are fixed constants (no `Date.now()`), so content-pack tests are deterministic.
- The demo is labelled "Demo match" everywhere it appears.

### 8.5 Persistence failure, tabs, growth
- Mutation order: compute next state → persist → commit to memory. A failed persist leaves memory unchanged and raises a blocking toast (`QuotaExceededError` included).
- Cross-tab: listen to `storage`; if a foreign write changes `savedAt`, show a non-blocking banner with "Reload" (no silent last-writer-wins).
- `exports[]` is capped at the last 20; oldest evicted with a note in the export history.

### 8.6 Scope gate
- All 16 packages must typecheck and test green. The API rewrite is included because the owner explicitly asked for API/plugin validation.
- No `src` path aliases from web into packages. The web imports workspace packages and Next uses `transpilePackages`; package `types` point at source, so typecheck and runtime use the same code.

### 8.7 Tests for failure modes
Required unit tests: corrupt envelope → quarantine + seed + notice; `version: 99` → read-only, no write; quota throw → state unchanged; export→import deep-equal; SHA-256 known vectors; stale derivation (edit, dangling ref); content-pack determinism with fixed clock/ids.

### 8.8 Rollback and destructive actions
- Rollback = redeploy the previous image. Envelope changes are additive-only for one release; the previous build must still read v2 data (it will enter read-only if it sees a newer version).
- Delete project, reset demo, and import-replace all require confirmation; delete requires typing the project name; all three write a snapshot first.

### 8.9 Red-team open items accepted
- The API is not on the critical path; it is still built and tested because the owner asked for it.
- The WebGL hero stays out of the critical path; the SVG hero ships. The obsolete `three`/`gsap`/`lenis` components were deleted from the v2 tree.

## 9. Review disposition (3 Goldfish, 2026-11-09)

| Finding | Reviewer | Disposition |
|---|---|---|
| Corrupt envelope overwrites user data | readiness | **Accepted** → §8.1 quarantine-before-seed, read-only on newer version |
| Export/import contract undefined | readiness | **Accepted** → §8.2 envelope, snapshot, round-trip test |
| Evidence hash canonicalisation / stale predicate | readiness + comprehension | **Accepted** → §8.3 derived stale, sorted refs, known-answer tests |
| Demo vs user data indistinguishable | readiness | **Accepted** → `origin`, seed only when key absent |
| Persist failure / cross-tab / export growth | readiness | **Accepted** → §8.5 |
| "Inspect a moment" undefined | comprehension | **Accepted** → `MomentInspector` panel; every mark/chip opens it; deep link `?t=<us>&event=<id>` |
| Insight transitions undefined | comprehension | **Accepted** → status legend + transition table in §3.9; `request-evidence` becomes "Flag for evidence" and sets `needs_evidence` |
| First-run entry weak | comprehension | **Accepted** → primary CTA "Open the demo match" deep-links `/app/p/demo-atl-hvu` |
| Empty/loading/error states missing | comprehension | **Accepted** → state matrix §3.10; CSV all-or-nothing with row errors |
| Export blocked with no recovery | comprehension | **Accepted** → preflight rule → message → fix link; QC = preflight + accepted-insight count + evidence integrity |
| Content pack is developer JSON | comprehension | **Accepted** → readable sections, per-section copy, `.md` + `.json` download, metadata |
| Mobile core loop keyboard-only | comprehension | **Accepted** → mobile tab layout + touch transport; mobile core loop in E2E |
| Cut API + non-imported packages | zoom-out | **Rejected** — owner explicitly ordered API/plugin validation. Timeboxed: API rewrite is done; tests only. |
| Cut routes to a 3-screen slice | zoom-out | **Partially accepted** — keep 12 routes (owner asked for every dashboard/workflow) but drop speculative components: no PassMap, no XgRace, no virtualisation branch. Command palette kept (small, testable). |
| Frame-accurate transport over poster | zoom-out | **Partially accepted** — keep Space/←/→/I/O (cheap, testable), drop keyframe/marker/tool keys from the demo; help map reflects reality. |
| Drop import/export + storage UI | zoom-out | **Rejected** — these are the data-safety recovery paths required by §8.2. |
| Unmeasured "~500 KB" hero claim | zoom-out | **Accepted** → wording changed to "not measured; WebGL is out of scope for v2". |
| Undefined workflows A–F | zoom-out | **Accepted** → enumerated in §3.11. |

### 3.9 Insight status and transitions
| From | Action | To | Guard |
|---|---|---|---|
| proposed | Accept | accepted | ≥1 evidence ref resolves to an existing event |
| proposed | Edit | edited | claim non-empty, ≤280 chars |
| proposed | Reject | rejected | reason optional |
| proposed | Flag for evidence | needs_evidence | sets `limitations` |
| needs_evidence | Accept | accepted | evidence added and resolves |
| accepted/edited | (derived) | stale | hash mismatch, dangling ref or out-of-range ref; never stored |
| accepted/edited | Reopen | proposed | clears reviewer |

Legend: proposed (grey), needs_evidence (amber), accepted (green), edited (cyan), rejected (red), stale (amber-red, derived).

### 3.10 State matrix (per route)
Every data surface defines: loading (skeleton), empty (message + one action), filter-empty (clear filters), error (message + retry/export), success. CSV import is all-or-nothing with row-indexed errors and a rejected-rows download. Quota failure blocks writes and offers export.

### 3.11 Workflows A–F (E2E)
- **A** Open demo from landing → studio with populated score/timeline.
- **B** Inspect a moment: click a shot → MomentInspector shows event facts + evidence → jump updates playhead.
- **C** Review: accept a proposed insight → status accepted → review queue count drops → dashboard reflects it.
- **D** Export: preflight passes → generate pack → readable sections → copy section → download `.md` → QC report shows pass.
- **E** Import CSV: paste 3 valid + 1 invalid row → row error shown → fix → commit → event count increases.
- **F** Settings: export JSON → reset demo → import JSON → projects restored (round-trip).
