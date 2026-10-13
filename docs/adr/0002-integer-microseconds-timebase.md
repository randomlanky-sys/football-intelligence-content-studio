# ADR-0002: Integer microseconds for project clock & VFR frame tables

**Date**: 2026-10-10
**Status**: accepted
**Deciders**: Lead Software Developer & DevOps Proxy

## Context

Media timestamps exhibit variable frame rate (VFR) causing drift when using floating-point seconds. For precise frame-level operations, seeking, scrubbing, and deterministic timeline reconstruction, we need a timebase that avoids floating-point imprecision and supports frame stepping with sub-frame precision.

## Decision

- Use integer64 for project clock (microseconds instead of seconds)
- Each asset stores native timescale + per-frame PTS table as typed array (VFR-safe)
- Seek uses PTS table, not +1/fps approximation; round half-even to frame boundaries
- Match clock uses piecewise-linear clock_mappings per period with 2 anchor points and stored residual
- Drift beyond tolerance sets state "sync needs review"

## Alternatives Considered

### Alternative 1: Floating-point seconds
Measure match clock in seconds with floating-point; adjust frame updates by observed fps
- **Pros:** Simple to understand conceptually
- **Cons:** Accumulates sub-frame jitter, frame stepping approximate, poor repeatability across videos

### Alternative 2: Piecewise constant FPS per segment
Blocking approach: per segment define fixed fps; frame stepping is +1
- **Pros:** Conceptually simple
- **Cons:** Fails for VFR, breaking scrubbing, poor UX; requires regrouping for keyframe heavy content

## Consequences

### Positive
- Deterministic frame accuracy essential for scrubbing and export generation
- VFR safe; playback matches source even if fps varies
- Lossless pixel-level timeline reconstruction possible
- Simple integer math: better performance, no precision loss

### Negative
- Higher complexity for UI display (needs numeric conversion to human-friendly timestamps)
- More storage: pts table per asset (typically 10 MB for 3M samples)
- Serialization overhead (typed arrays require careful format choice)

### Risks
- Memory usage: large frame tables could be heavy on devices
  - Mitigation: virtual scrolling, lazy decode, baseline quantization; FG-1 spike covers eviction/threshold
- Drift not detected until playback time tag mapping fails; perceptible when watching
  - Mitigation: auth-consented cloud FFmpeg worker can provide drift detection fallback

## References

- SSOT Section 6: Timebase
- FG-1 Feasibility: Durable originals, quota exhaustion, restart tests