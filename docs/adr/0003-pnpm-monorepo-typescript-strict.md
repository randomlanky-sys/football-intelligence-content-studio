# ADR-0003: pnpm monorepo with Turborepo and strict TypeScript

**Date**: 2026-10-10
**Status**: accepted
**Deciders**: Lead Software Developer & DevOps Proxy

## Context

The system requires shared TypeScript types across client and API; pluggable AI providers; modular video engine, tactical editor, timeline components; and incentive to keep packages pure (no circular dependencies). We need build tooling that supports remote caching, CI pipeline, and strict type discipline while managing increased complexity.

## Decision

- Monorepo powered by pnpm workspace with Turborepo remote cache
- Core packages: `timebase`, `geometry`, `project-core`, `storage`, `video-engine`, `tactical-editor`, `timeline`, `evidence-engine`, `data-import`, `ai-contracts`, `export-engine`, `ui`, `config`, `db/migrations`, `tests/*`, `docs/*`, `fixtures`
- All packages authored in TypeScript strict mode
- Dependency direction enforced via dependency-cruiser (pure packages never import UI or storage)
- Central schema registry (packages/schema): Zod models emit JSON Schema + OpenAPI 3.1 for API
- API backend using Fastify (same TS codebase), client Next.js consuming same schemas

## Alternatives Considered

### Alternative 1: Monolith
Single TypeScript codebase with webpack/vite bundling
- **Pros:** Simpler setup, no package management overhead
- **Cons:** Harder to reuse core logic (timebase, geometry, evidence) elsewhere; separation of concerns lost; bootstrap may be bloated

### Alternative 2: Separate monorepo per service
Multiple independent Yarn/BN workspaces
- **Pros:** Clearer separation, independent releases
- **Cons:** Shared schema synchronization challenges; distributed testing complexity; increased tooling setup

### Alternative 3: Pluriplural monorepo (subtree) within single repo
Inner monorepos for each package but separate repo for orchestration
- **Pros:** Likely overly complex for initial rollout
- **Cons:** Increased developer overhead without immediate benefit; cross-package test orchestration tricky

## Consequences

### Positive
- One schema, three consumers = single source of truth for contract
- Remote caching makes CI fast; builds complete in seconds
- Pure packages (timebase, geometry) can be reused anywhere without bundling UI baggage
- Spill-over observability and logging across packages
- Test sharing via Vitest

### Negative
- Incremental learning curve: example needed for pnpm; remote cache first-run warm-up
- Multiple tsconfig.json files to align; risk of misconfiguration
- Recalcitrant dependent packages may break consensus; need "one owner, one public index.ts" rule

### Risks
- fragmented ci: multiple pipelines (web app, API, worker) needing CI config alignment
  - Mitigation: Turborepo root CI handles all packages via turbo.json; shared eslint/tsconfig
- Schema drift: independent changes may decouple if not enforced
  - Mitigation: Tie schema to API endpoints; schema versioning in project_core migrations

## References

- SSOT Section 5: Repository and file plan
- Section 10: Dev cycle (Trunk-based, feature flags per phase)