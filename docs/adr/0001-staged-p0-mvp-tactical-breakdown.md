# ADR-0001: Staged P0 MVP focusing on tactical breakdown

**Date**: 2026-10-10
**Status**: accepted
**Deciders**: Lead Software Developer & DevOps Proxy

## Context

The product vision contemplates a full football match analysis platform with events, statistics, comparisons, collaborations, and AI capabilities. However, building everything simultaneously risks scope creep, isolated integrations, and delayed user value. A phased rollout enables validation of core creator workflows and foundation before expanding.

## Decision

We adopt REV-003 staged P0 approach:
- **Primary audience:** Independent football creators producing evidence-backed tactical breakdown videos with voice-over
- **Platform:** Responsive web first, desktop, and Android deferred as phase 2 capability
- **Phases:** P0-A (core creator workflow) → P0-B (data import/validation) → P0-C (one AI capability) → P0-D (tracking assistance)
- **Deferred:** Season comparisons, provider integrations, native Android, social packs (hypothesis)

## Alternatives Considered

### Alternative 1: Fully featured MVP
All capabilities in a single release with sequential rollout
- **Pros:** Faster initial feature set
- **Cons:** Risk scope creep, integration debt, delayed creator value, higher development cost and complexity

### Alternative 2: Feature decay
Agile iterative delivery without clear phase gates
- **Pros:** Flexibility to shift priorities
- **Cons:** Difficult to measure readiness, accumulated technical debt, lack of user-validated verification

## Consequences

### Positive
- Clear founder: creator value loop with one verified export early
- Strong foundation for P0-B, P0-C, P0-D by validated creator workflow
- Easier performance budgeting, QA matrix definition, risk mitigation
- Opportunity lock-and-load for integration providers later

### Negative
- Postponement of season comparisons, social packs until validated
- Android support delays alignment with wider creator workflows
- Higher risk of AI provider lock-in if evaluation not completed in P0-C

### Risks
- Scope creep: creator may request season trends before P0-A is stable
  - Mitigation: enforce hard-gate (no repository until v0.2 clear approval) and phase gates
- Integration decisions risk: P0-C single AI provider choice may constrain later integration
  - Mitigation: structure AI contracts as pluggable providers with external eval harness, keep eval dataset small and reusable