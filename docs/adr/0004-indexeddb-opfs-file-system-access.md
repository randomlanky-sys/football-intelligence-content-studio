# ADR-0004: Local-first persistence using IndexedDB, OPFS, and File System Access API

**Date**: 2026-10-10
**Status**: accepted
**Deciders**: Lead Software Developer & DevOps Proxy

## Context

The studio runs client-side on a creator's device and must reliably store large media assets (match footage up to several GB per match) while providing fast, responsive UI. Local-first ensures creators retain control and privacy (no uploads needed for core workflows) while enabling offline editing. We need a storage strategy that survives browser restarts, respects device quotas, and maintains robust recovery semantics.

## Decision

- Persistent local metaIndexedDB via Dexie with schemas mirroring PostgreSQL tables
- Temporary working proxies: OPFS (origin private file system) for derived visual proxies, thumbnails
- Original media access: File System Access API handles for originals, with relink fallback
- Eviction-aware storage: Debounced operations, snapshots every N ops, navigator.storage.persist() requested
- Offline sync: local ops logged; content synchronized to cloud on connectivity and user consent

## Alternatives Considered

### Alternative 1: Entirely browser storage with in-memory buffers
Store entire media in IndexedDB as blobs
- **Pros:** Simple retrieval
- **Cons:** IndexedDB quota limited (~10–60% vs non-encrypted); binary blobs hog space; slow to grow; GC not reliable

### Alternative 2: Entirely client storage with no File System Access API use
Force users to re-select files on reload
- **Pros:** No file handle management
- **Cons:** Poor UX; creators lose context; editing sessions disrupted; conflicts with "relink fallback" requirement

### Alternative 3: Entirely cloud storage
Store all footages on S3/Cloud object store; client only manages references
- **Pros:** Guarantees storage; no local quota
- **Cons:** Flow-varying (upload large media each match); violates true local-first; high consumption of network; drift not mitigable offline

### Alternative 4: Local cache + long-lived File System Access handles, no OPFS
Client keeps handles alive in memory; pointer file lists them
- **Pros:** Simpler code path
- **Cons:** Decorated gc cleaning; handles not persisted across sessions; blow up memory when many clips

## Consequences

### Positive
- Originals remain accessible offline across restarts without re-uploading
- Dynamic proxies serve fast scrubbing (OPFS caching); no re-read from disk each seek
- GC-resistant metadata; projects survive browser restarts
- Linear eviction policy prevents quota exhaustion by clearing derived assets first
- Simplified recovery: re-read handle map + Dexie manifest to reconstruct state

### Negative
- Handling file handle revocation by user (browser UI can revoke persistent handles)
  - Mitigation: periodic "relink" checks; backlink lost after handle revoked → switch to re-upload prompt
- Encryption overhead for open handles (OS enforces encryption) if system-wide encryption active
  - No impact on developer-side storage layer: library handles transparently
- OPFS purge or full "Clear site data" wipes sensitive assets; site must warn user

### Risks
- Quota exhaustion: User may select 100 matches but device low storage; playlists may become empty
  - Mitigation: FG-1 spike establishes eviction parameters; dashboard warns user on low space
- Chrome "incognito" tab: OPFS vs IndexedDB behave differently; should be documented for creator education
  - Mitigation: fallback: store files in standard file system if possible; else count as ephemeral

## References

- SSOT Section 4: Optimized stack selection (Overlay render, Local storage)
- Section 7: Data model (local stores mirror PostgreSQL)
- Fanset-1: Eviction, quota, restart tests