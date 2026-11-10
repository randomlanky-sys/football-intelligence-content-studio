# Forensic Audit & Rated Review — FICS v2

**Product:** Football Intelligence & Content Studio (FICS)
**Live target:** <https://football-intelligence-content-studio.onrender.com>
**Repo:** `C:\Users\pc\football-intelligence-content-studio` · branch `master` · HEAD `2108898`
**Date:** 2026-11-09 · **Auditor:** Goldy EGM Pro (independent pass)
**Scope:** live production artifact + source at HEAD + dependency tree + 13 routes at 1440px and 390px.

---

## 1. Verdict

**72/100 — Conditional pass for a named-user beta. Not ready for a broad public launch.**

The product is real, coherent, and unusually honest about its limits. The core loop
(tag → review → preflight → export) works end to end on the live deployment, the data
layer is defensively engineered, and there is zero third-party network egress. The
blocking issues are not architectural: a critical dependency CVE, a systematic
contrast-token failure that breaks WCAG AA on every screen, one screen with no heading
structure at all, and a broken/duplicated skip link.

| Dimension | Score | Basis |
|---|---:|---|
| Engineering quality | **74** | Typed monorepo, 118 green unit tests, schema-validated store with quarantine/read-only/quota handling. Loses points for dependency drift (Next 15.5.27 vs 15.5.28, Fastify 4 vs 5, Zod 3 vs 4), an intermittent hydration error, and a local test runner that is not parity-safe. |
| Security | **78** | No XSS sinks, no `eval`, no third-party egress, strict CSP, frame denial, COOP, no cookies, no secrets client-side. Loses points for an unpatched critical Next advisory, `script-src 'unsafe-inline'`, and missing HSTS. |
| Accessibility (WCAG 2.2 AA) | **50** | 248 axe violation nodes across 10 routes, 216 of them contrast. Studio has zero headings. Duplicate skip link with a dead target. `nested-interactive` on the timeline. Focus visibility itself is good. |
| Usability | **74** | Clear IA, command palette, keyboard transport, recovery states, export preflight. Friction: no mobile nav, small targets, palette focus escape. |
| UX heuristics | **76** | Strong status visibility and error prevention; weaker help depth, inclusivity, and first-run orientation. |
| UI craft | **84** | Distinctive broadcast-console identity, disciplined tokens, real product UI instead of stock screenshots, strong density control. Undermined by 9–10px dim labels. |
| Value | **76** | Solves a real, narrow job (evidence-backed content packs) with a credible local-first privacy story. Gaps: manual ingest only, no video, no collaboration, no publishing integrations, no pricing surface. |
| Production readiness | **66** | Live and stable, 17/17 live E2E, warm TTFB 0.58s. Missing HSTS, analytics, error tracking; 36s cold start on free tier; default unbranded 404; no error boundary. |

**Weighted overall:** engineering 20% · security 20% · accessibility 15% · usability 15% · UX 10% · UI 5% · value 10% · readiness 5% → **71.7 → 72**.

---

## 2. What the product is

A browser-local workspace for football analysts and content teams. You import tagged
match events (CSV or template), the app builds a timeline and pitch view, insights are
proposed against specific events, and each claim carries a hash over its evidence
references. Editing an event or moving a timestamp makes dependent claims **stale**;
export is blocked until stale claims are reopened and re-accepted. Output is a
deterministic Markdown/JSON content pack with an evidence ledger.

There are no accounts, no server persistence, and no uploads. The workspace lives in
`localStorage`, with snapshots, corrupt-data quarantine, and read-only handling for
newer schema envelopes.

---

## 3. Skills used and evidence produced

Per the compelled-use order, each claim below is tied to the skill that produced it.

| Skill | What it produced |
|---|---|
| `production-audit` | Readiness verdict, severity ranking, fix plan, evidence index |
| `code-review` | Source review of store, pitch, timeline, insight card, app shell, palette, toast, formatters; sink and egress search |
| `security-testing` | Live header matrix, CSP analysis, dependency audit (25 advisories), `/_next/image` probe, XSS/egress review |
| `accessibility-testing` | axe-core 4.10.2 across 13 routes + 5 mobile routes, keyboard tab trace, heading outline, contrast math |
| `ui-ux-pro-max` + `web-design-guidelines` | UI critique, Nielsen heuristic scoring, mobile and density review |
| `test-strategy` / `test-case-writing` / `test-reporting` | Coverage map, gap analysis, test-infra assessment |
| `root-cause-analysis` | Dependency triage (deployed vs non-deployed surface), hydration hypothesis |

Evidence files (all under `C:\Users\pc\AppData\Local\Temp\opencode\`):

- `fics-audit\report.json` — 13-route axe/contrast/keyboard/mobile/egress JSON
- `fics-audit\report-real.json` — hydrated real-workspace routes (`demo-atl-hvu`) + console errors
- `fics-audit\headings.log` — second-pass heading outline and page-error count
- `fics-audit\*.png` — 22 screenshots (desktop + mobile)
- `fics-unit-tests.log` — per-package Vitest output
- `fics-live-suite-audit.log` — 17/17 live Playwright run
- `fics-audit-deps2.json` — full `pnpm audit --prod --json`

---

## 4. Findings, severity-ranked

### F1 — CRITICAL dependency: Next.js image-optimizer RCE (patched in 15.5.28) · **High**

`next@15.5.27` is installed; the advisory is fixed in `>=15.5.28`.

- Evidence: `pnpm audit --prod` → `next` **critical**, "Unauthenticated Remote Code
  Execution in Image Optimization API when SVG files are used", vulnerable
  `>=10.0.0 <=15.5.27`.
- Exposure check: the app never imports `next/image` (grep: zero hits), `dangerouslyAllowSVG`
  is not set, and live probes to `/_next/image?url=…svg&w=64&q=75` return **400**.
- Assessment: **exploit path mitigated by configuration, package still vulnerable.**
  Patch is a one-line bump plus redeploy; do it this week regardless.

### F2 — Systematic WCAG 1.4.3 contrast failure · **High**

The `--dim` token is `#66727f`. Measured against the four real surfaces:

| Foreground | `#07090c` bg | `#0d1117` surface | `#131a22` surface-2 | `#0a0d12` |
|---|---:|---:|---:|---:|
| `#66727f` (current) | 4.06 | **3.86** | **3.57** | **3.96** |
| `#7d8a97` (proposed) | 5.65 | 5.37 | 4.97 | 5.52 |
| `#8b98a5` | 6.77 | 6.43 | 5.95 | 6.61 |

Required: 4.5:1 for normal text. The current token fails on every surface except the
page background, and it is used for 9–11px labels, hashes, captions, and nav chrome.

- axe-core node counts (serious, `color-contrast`): home **18**, `/app` **33**,
  projects **10**, settings **15**, help **6**, studio **38**, data **45**, review **36**,
  export **13**, unknown-project **2** → **216 nodes**.
- Visual impact: the muted layer reads as "disabled" rather than "secondary"; the
  hierarchy collapses on the data and review screens where dim metadata is dense.
- Fix: change one token to `#7d8a97`. Verify with axe; re-check any place where dim
  sits on `accent` or `red` backgrounds.

### F3 — Studio screen has no headings at all · **High**

Hydrated DOM on `/app/p/demo-atl-hvu`:

```
headings = []
```

Data, review, and export all expose `H1: Atlantic FC vs Highveld United` plus H2
sections. Studio exposes nothing — the match name is rendered only in `<p>` tags inside
`ProjectHeader`. axe flags `page-has-heading-one`; the real problem is broader: no
heading outline for screen-reader navigation on the product's primary screen.

- Fix: render the match name as the page `h1` in `ProjectHeader` (or add a dedicated
  studio header), and mark panel titles (`Moment inspector`, `Insights`, `Timeline`)
  as `h2`. Verify no duplicate h1 on data/review/export.

### F4 — Timeline slider nests 32 interactive buttons · **High**

`role="slider"` is applied to a container that also holds 32 focusable
`Jump to …` event buttons. axe: `nested-interactive` (serious).

- Impact: invalid ARIA, ambiguous announcements, and a focus order that fights the
  slider semantics. Keyboard users tab through 32 buttons before reaching the pitch.
- Fix: make the slider the track only (`role="slider"` on a non-interactive rail), move
  event markers to a sibling list, or adopt `aria-activedescendant` with a single
  focusable track.

### F5 — Duplicate skip link, one with a dead target · **Medium**

- Root layout renders `Skip to content → #main`.
- App shell renders a second `Skip to content → #workspace-main`.
- No element with `id="main"` exists inside the app shell, so the first link does nothing.
- Evidence: axe `skip-link` on every app route; keyboard trace shows two consecutive
  "Skip to content" stops at `y=12`.

Fix: one skip link per layout, target the actual `<main id>`.

### F6 — `aria-prohibited-attr` ×7 on the home page · **Medium**

The pitch SVG uses `<g aria-label="…">` without a role. axe: 7 nodes, serious.

Fix: `role="img"` + `<title>` on the group, or `aria-hidden="true"` when the
surrounding text already describes it.

### F7 — Export `<pre>` scroll region is not focusable · **Medium**

axe `scrollable-region-focusable` (serious) on `/export`. Keyboard-only users cannot
scroll the generated pack.

Fix: `tabIndex={0}` + `role="region"` + `aria-label="Generated content pack"`, or let
the page scroll instead of the inner box.

### F8 — Missing HSTS · **Medium**

Live response headers contain CSP, COOP, permissions-policy, referrer-policy,
nosniff, `X-Frame-Options: DENY`, and no `X-Powered-By`. **No
`Strict-Transport-Security`** (verified twice, including through Cloudflare).

Fix: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` once
the apex/`www` redirect story is settled.

### F9 — CSP allows inline script · **Medium**

`script-src 'self' 'unsafe-inline'`. There are no injection sinks in the codebase
(no `dangerouslySetInnerHTML`, no `eval`, no `innerHTML` writes), so this is defense
depth rather than an open hole. It still removes the main benefit of CSP if a sink is
ever introduced.

Fix: nonce-based CSP via middleware, or document the accepted risk and add
`object-src 'none'` explicitly.

### F10 — Dependency debt beyond Next · **Medium**

`pnpm audit --prod`: **25 advisories — 1 critical, 10 high, 9 moderate, 5 low** across
140 production dependencies.

| Package | Installed | Fixed | Notes |
|---|---|---|---|
| `next` | 15.5.27 | 15.5.28 | critical SVG RCE + high App Router DoS |
| `fastify` | 4.29.1 | 5.12.2 | 8 advisories incl. auth bypass, validation bypass; **API package is not in the Docker artifact** |
| `zod` | 3.x | 4.6.6 | memory exhaustion on oversized collections; v3 has no patch path |
| `postcss` | 8.5.x | 8.5.23 | path traversal / arbitrary `.map` read (build-time) |
| `find-my-way` | ≤9.6.0 | 9.7.0 | HTTP/2 DDoS (API only) |
| `fast-uri` | 2.x/3.x | 2.4.8 / 3.1.9 | host confusion (transitive) |

Triage: only `next`, `react`, `react-dom`, and `zod` ship to the live site. Fastify and
`find-my-way` are confined to `packages/api`, which the Dockerfile does not build.
That lowers live risk but not repo risk — the API is presented as part of the product.

### F11 — Intermittent hydration mismatch (React #418) · **Medium**

Observed once on `/app/p/demo-atl-hvu` and once on the unknown-project route:

```
PAGEERROR Error: Minified React error #418 … server rendered HTML didn't match the client
```

A second full pass produced **zero page errors** on all eight routes, so this is
intermittent, not deterministic.

- Most likely class of cause: locale/time-dependent formatting during hydration.
  `lib/format.ts` uses `toLocaleDateString(undefined, …)` and
  `toLocaleString(undefined, …)`, which renders differently on the Node server and the
  browser when locales differ. This is a **hypothesis, not confirmed**.
- Fix path: pin a locale (`en-GB`) in formatters, or format dates on the client only
  behind a mounted guard. Add an E2E assertion that every route loads with zero
  `pageerror` events — that converts an intermittent bug into a caught regression.

### F12 — No branded 404, no error boundary, no icon/OG assets · **Medium**

- `/nope-xyz` returns 404 with the **default Next.js error page**: white/black
  system-ui layout, `h1` "404", two `<title>` elements ("404: This page could not be
  found." and the site title), no site chrome.
- No `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/icon.*`,
  `app/opengraph-image.*`, `app/robots.ts`, or `app/sitemap.ts`. `public/` is empty.
- `/favicon.ico` → 404, `/sitemap.xml` → 404, `/manifest.webmanifest` → 404.
  `/robots.txt` → 404 (one transient 200 HTML soft-404 was observed, then consistent
  404s).
- `twitter:card = summary_large_image` is declared with **no OG image**, so every share
  renders a blank card.

This is the single cheapest visible-quality win in the report: a branded 404, an icon,
an OG image, and generated robots/sitemap.

### F13 — Public navigation disappears on mobile · **Medium**

`site/header.tsx`: `<nav className="hidden … md:flex">` with no hamburger or drawer.
At 390px the header shows only the logo and "Enter workspace". About, Help, Privacy,
and Terms are reachable only via the footer.

Fix: disclosure menu button with a focus-trapped sheet, or a compact overflow menu.

### F14 — Command palette has no focus trap or focus restoration · **Medium**

Manual keyboard pass: Tab from the palette input reaches controls behind the dialog;
closing the palette does not return focus to the trigger. For a keyboard-first product
that advertises `⌘K`, this is a credibility gap.

Fix: trap focus within the dialog, restore to the invoking element on close, and add
`aria-modal="true"`.

### F15 — Local test runner is not parity-safe · **Low**

`pnpm test` at the root: Turbo reported **8 successful / 23 tasks**, with
`@fics/storage` and `@fics/ui` failing under 15 concurrent Vitest workers. Run
individually, both pass (`4/4`, `11/11`). Cause: several packages declare
`"test": "vitest"` (watch mode), which only behaves under `CI=true`.

Full sequential run: **118 tests, 18 files, 0 failures.**

Fix: `"test": "vitest run"` in every package; keep `CI=true` in the workflow; cap
worker concurrency. CI itself is unaffected — it sets `CI=true`.

### F16 — Small touch targets · **Low**

At 390px: footer inline links measure ~19px high; the sidebar "New project" icon is
14×14. WCAG 2.2 AA target size (24×24 minimum) is missed for these.

### F17 — Minor ARIA/table issues · **Low**

- `empty-table-header` on `/data` (one header cell with no accessible name).
- `landmark-unique` on `/review` and `/export` (two landmarks share a role/label pair).
- `heading-order` on `/app/projects` (H1 → H3 → H2).

### F18 — No observability · **Low (operational)**

No analytics, no error tracking, no uptime monitor. Render free tier cold-starts in
~36s. You cannot currently see whether anyone uses the product, where they drop, or
whether the hydration error is hitting real users.

Fix: privacy-preserving analytics (Plausible/Umami self-hosted), Sentry with PII
scrubbing, and an external uptime ping.

---

## 5. What works (verified, not assumed)

- **Core loop is real.** Workflow A (deep link `?t=1394000000&event=evt-11` opens
  `Goal · 23′14`, Space toggles playback) and Workflow D (stale claim blocks export →
  reopen → accept → preflight clears → pack downloads with evidence ledger) both pass
  against production.
- **Data safety is engineered, not claimed.** Schema validation, corrupt-data
  quarantine before seeding, read-only mode for newer envelopes, quota failure that
  leaves memory unchanged, snapshots, export/import round-trip. Unit tests cover each.
- **Privacy claim holds.** Zero third-party network requests observed across the
  audited routes; no cookies set; no accounts; no server persistence. The privacy page
  describes this accurately.
- **Security baseline is above average for a beta.** CSP, `frame-ancestors 'none'`,
  COOP, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, permissions policy,
  no `X-Powered-By`. No XSS sinks found.
- **Keyboard fundamentals.** Every tab stop has a visible 2px accent focus ring; the
  transport is fully keyboard-operable; `⌘K` palette exists.
- **Honest product copy.** "No video file attached in this beta", "What ships today,
  and what does not", "Your projects stay in this browser until you export or delete
  them." No SOC 2 / GDPR claims, no fake logos.
- **Live performance (warm).** TTFB 0.58s, total 0.63s, 83.5KB HTML through Cloudflare.
- **Visual identity.** The broadcast-console language (score plate, possession split,
  event rail, xG-sized pitch circles, mono micro-labels, lime accent) is distinctive
  and consistent. It does not look like a template.

---

## 6. Accessibility detail

axe-core 4.10.2, Chromium, 1440×900, after hydration.

| Route | Contrast nodes | Other violations | H1 |
|---|---:|---|---|
| `/` | 18 | `aria-prohibited-attr` ×7 | yes |
| `/about` | 0 | — | yes |
| `/help` | 6 | — | yes |
| `/privacy` | 0 | — | yes |
| `/terms` | 0 | — | yes |
| `/app` | 33 | `region`, `skip-link` | yes |
| `/app/projects` | 10 | `heading-order`, `region`, `skip-link` | yes |
| `/app/settings` | 15 | `landmark-unique`, `region`, `skip-link` | yes |
| `/app/p/demo-atl-hvu` | 38 | `nested-interactive`, `page-has-heading-one`, `region`, `skip-link` | **no — zero headings** |
| `/data` | 45 | `empty-table-header`, `region`, `skip-link` | yes |
| `/review` | 36 | `landmark-unique`, `region`, `skip-link` | yes |
| `/export` | 13 | `landmark-unique`, `scrollable-region-focusable`, `region`, `skip-link` | yes |
| unknown project | 2 | `page-has-heading-one`, `region`, `skip-link` | no |
| **Total** | **216** | **32 other nodes** | |

Mobile (390×667): no horizontal overflow on any audited route; the shell reflows
correctly; the gaps are nav reachability and target size, not layout.

---

## 7. UX heuristic evaluation (Nielsen, 0–4)

| # | Heuristic | Score | Evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 4 | Save state, staleness badges, review counts, export preflight, toasts, storage usage |
| 2 | Match between system and real world | 4 | Football vocabulary (xG, half-space, transition, card) used correctly; timeline matches broadcast conventions |
| 3 | User control and freedom | 3 | Reopen/reject/edit/reset are present; palette lacks focus return; no undo for destructive deletes |
| 4 | Consistency and standards | 4 | Token system, pill nav, status tones, and action placement are consistent across studio/data/review/export |
| 5 | Error prevention | 4 | All-or-nothing CSV validation, export gate, replace-vs-append confirmation, read-only mode |
| 6 | Recognition rather than recall | 3 | Command palette and shortcuts exist, but shortcuts are only discoverable in Settings/help |
| 7 | Flexibility and efficiency | 3 | Keyboard transport + deep links are strong; no bulk accept, no saved filters, no multi-select |
| 8 | Aesthetic and minimalist design | 4 | Dense but disciplined; no decorative clutter; the dim token is the one self-inflicted wound |
| 9 | Help users recover from errors | 3 | Corrupt storage → quarantine + reset path; unknown project → "Back to projects"; but the 404 is default Next, and error boundary is absent |
| 10 | Help and documentation | 3 | Help page and shortcuts exist; no inline onboarding tour, no contextual "what is a claim?" explainer in studio |
| **Total** | | **35/40** | |

---

## 8. UI critique

**Strengths**

- A real design system, not ad-hoc styling: `--bg/--surface/--surface-2/--line/--text/--muted/--dim/--accent`
  with a 2px accent focus ring and consistent 10px radii.
- The score plate is the correct hero on the project screens: teams, score, formation,
  match clock, possession split, xG, event and acceptance counts in one glance.
- The pitch visualization earns its space: circle size encodes xG, color encodes team,
  and the legend explains both. The timeline's event dots + clip bars read instantly.
- Empty states teach: "Click a shot on the pitch, a dot on the timeline, or an evidence
  chip…", "Nothing built yet", "Start an empty match sheet".
- Honest beta framing is carried visually (DEMO badges, "No video file attached").

**Weaknesses**

- The dim token makes secondary text look disabled; on `/data` and `/review` the eye
  cannot separate metadata from inactive controls.
- 9–10px uppercase labels with `0.14–0.24em` tracking are stylish but below comfortable
  legibility, especially at 1440px on a laptop panel.
- The studio right rail stacks two large cards (Moment inspector, Insights) with the
  inspector mostly empty until interaction; on first load it is the largest area of
  low-value pixels on the screen.
- The home hero's product panel is visually rich but small relative to the headline at
  1440px; the strongest proof (the actual console) is presented at ~40% scale.
- The default Next 404 breaks the illusion completely: white page, system font, no
  navigation.

---

## 9. Usability walkthrough (live)

| Task | Result | Friction observed |
|---|---|---|
| Open the demo and orient | **Pass** | Demo CTA is clear; first screen explains the loop; no tour, but the empty inspector teaches |
| Find a specific moment (`?t=…&event=…`) | **Pass** | Deep link selects the exact event; transport keys work; URL is shareable |
| Import a CSV | **Pass** | Template, header requirement, 2MB cap, append/replace, all-or-nothing validation |
| Review and accept claims | **Pass** | Status filters, evidence chips, hash, accept/edit/flag/reject; bulk accept missing |
| Export a pack | **Pass** | Preflight names the blocking claim; reopen → accept → build → download |
| Recover from an unknown project URL | **Partial** | "Back to projects" exists, but no explanation of why the id failed and no h1 |
| Recover from corrupt storage | **Pass (code-verified)** | Quarantine copy + reset path covered by unit tests; not exercised live in this pass |
| Navigate on mobile | **Partial** | Layout reflows, but primary nav is hidden with no replacement |

---

## 10. Value assessment

**Job to be done:** turn a tagged match into publish-ready, defensible content without
a video editor, a shared drive, or a research assistant.

**Who gets value:** independent analysts, academy/club media teams, and football
newsletters — anyone who publishes tactical claims and needs to show the receipts.

**Differentiators that are real**

1. **Evidence integrity as a product mechanic** (hash over event references, derived
   staleness, export gate). Competitors offer clip tagging or doc editing; almost none
   enforce claim↔evidence consistency.
2. **Local-first privacy.** No upload, no account, no egress. This is a genuine
   procurement advantage for clubs that cannot send footage to a SaaS.
3. **Deterministic export.** Same inputs → same Markdown/JSON, with a ledger. Useful for
   editorial review and for feeding downstream tools.

**Value gaps**

- Ingest is manual CSV; no Opta/StatsBomb/Wyscout connector, no video ingest, no
  timestamp extraction from video.
- No collaboration, comments, approvals, or shared workspace — the "team" in content
  team is not served yet.
- No publishing integrations (CMS, Buffer, X/LinkedIn scheduling); the pack is a
  terminal artifact.
- No pricing, packaging, or trial surface; no way to convert a demo user.
- Demo data is fictional and clearly labeled — good ethics, but it limits perceived
  seriousness for a buyer evaluating real workflows.

**Value score: 76/100.** Strong, defensible wedge; incomplete value chain. Willingness
to pay is **UNVERIFIED** — there are no users, no analytics, and no pricing test.

---

## 11. Test coverage and gaps

| Layer | Status | Evidence |
|---|---|---|
| Unit | **118 tests / 18 files / 0 failures** | `fics-unit-tests.log` (sequential `vitest run` per package) |
| Local E2E (production build) | 24/24 (prior run, same HEAD lineage) | `packages/web/e2e/app.spec.ts`, CI run `42749137208` |
| Live E2E | **17/17 in 3.7 min** | `fics-live-suite-audit.log` |
| Typecheck | all packages (CI gate) | `.github/workflows/ci.yml` |
| Accessibility | **manual only** | axe run in this audit; no CI gate |
| Visual regression | none | — |
| Cross-browser | Chromium only | Playwright config |
| Load/performance | none | single-sample timings only |
| Dependency scanning | none in CI | `pnpm audit` run manually here |
| Console-error regression | none | would have caught F11 |
| Contract tests (API) | unit-level only | `packages/api/src/index.test.ts` (12 tests) |

**Biggest gap:** there is no automated accessibility or console-error gate. Both classes
of defect found here are mechanically detectable in CI and would never regress again
once gated.

---

## 12. Prioritized fix plan

### P0 — this week (before inviting more users)

| # | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Bump `next` to ≥15.5.28, redeploy, re-run live suite | 30 min | Closes critical CVE |
| 2 | Change `--dim` to `#7d8a97`, re-run axe | 15 min | Clears ~216 violation nodes |
| 3 | Add `h1` + `h2` structure to studio | 1 h | Fixes the primary screen's heading outline |
| 4 | Remove duplicate skip link; point one link at `#workspace-main` | 30 min | Clears `skip-link` on every app route |
| 5 | Add axe + console-error assertions to CI (13 routes) | 3 h | Prevents both regressions permanently |

### P1 — next two weeks

| # | Fix | Effort |
|---|---|---|
| 6 | Timeline ARIA refactor (`nested-interactive`) | 4 h |
| 7 | Palette focus trap + focus restore + `aria-modal` | 2 h |
| 8 | Branded `not-found.tsx`, `error.tsx`, icon, OG image, `robots.ts`, `sitemap.ts` | 4 h |
| 9 | HSTS header; CSP nonce or documented acceptance | 4 h |
| 10 | Mobile nav (disclosure + focus trap) | 3 h |
| 11 | `aria-prohibited-attr` on pitch; `scrollable-region-focusable` on export; table header; landmark labels | 3 h |
| 12 | Hydration repro + locale pinning in `lib/format.ts` | 4 h |
| 13 | Dependency upgrades: `zod` 4, `fastify` 5, `postcss` 8.5.23 | 1–2 d |

### P2 — this month

| # | Fix | Effort |
|---|---|---|
| 14 | Privacy-preserving analytics + Sentry + uptime monitor | 1 d |
| 15 | Visual regression + Firefox/WebKit matrix | 2 d |
| 16 | Load test; decide on paid instance or keep-warm strategy | 1 d |
| 17 | Bulk accept, saved filters, undo for destructive actions | 3 d |
| 18 | Server persistence + authz **only if** multi-device/collaboration is on the roadmap | design first |

---

## 13. Score methodology and limits

- Anchors: 90+ excellent · 80–89 strong · 70–79 good with named gaps · 60–69
  conditional · <60 failing.
- **High confidence:** accessibility counts, header matrix, dependency advisories,
  route status codes, unit/live test results — all reproducible from the evidence files.
- **Medium confidence:** usability and UX heuristics — based on a structured walkthrough
  by one auditor, not real users.
- **Low confidence / UNVERIFIED:** value and willingness-to-pay (no users, no analytics),
  load behavior under concurrency (single sample on a free-tier instance), hydration
  root cause (intermittent, hypothesis only), and any claim about how real analysts
  would use the tool in production.

---

## 14. Evidence index

| Evidence | Path |
|---|---|
| 13-route axe/contrast/keyboard/mobile/egress | `…\Temp\opencode\fics-audit\report.json` |
| Real workspace routes + console errors | `…\Temp\opencode\fics-audit\report-real.json` |
| Second-pass heading outline | `…\Temp\opencode\fics-audit\headings.log` |
| Screenshots (22) | `…\Temp\opencode\fics-audit\*.png` |
| Unit tests (118) | `…\Temp\opencode\fics-unit-tests.log` |
| Live E2E (17/17) | `…\Temp\opencode\fics-live-suite-audit.log` |
| Dependency audit (25 advisories) | `…\Temp\opencode\fics-audit-deps2.json` |
| Source reviewed | `packages/web/src/{lib/store.ts,lib/format.ts,components/{pitch,timeline,insight-card,app-shell,command-palette,toast,project-header}.tsx,app/layout.tsx}` |
| Headers config | `packages/web/next.config.ts` |
| CI gates | `.github/workflows/ci.yml` |

---

*Independent audit. No self-certification: the fixes above were not implemented in this
pass, and none of the scores assume they will be. Re-audit after P0 with the same
harness to measure the delta.*
