/**
 * Evidence engine: SHA-256 hashing, canonical evidence serialisation, derived
 * staleness, and the insight review state machine.
 *
 * The hash is the product's integrity primitive: an accepted insight stores the
 * hash of the evidence it was accepted against. At read time the hash is
 * recomputed; a mismatch (or a dangling event reference) marks the insight
 * stale. Nothing here touches the network or Node's crypto module, so the same
 * code runs in the browser and in tests.
 */

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const SHA256_IV = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

function rotr(value: number, bits: number): number {
  return ((value >>> bits) | (value << (32 - bits))) >>> 0;
}

/** Pure-TypeScript SHA-256. Returns a lowercase 64-character hex digest. */
export function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLength = bytes.length * 8;
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[bytes.length] = 0x80;

  const view = new DataView(buffer.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x1_0000_0000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  const state = new Uint32Array(SHA256_IV);
  const schedule = new Uint32Array(64);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      schedule[i] = view.getUint32(offset + i * 4);
    }
    for (let i = 16; i < 64; i += 1) {
      const w15 = schedule[i - 15] ?? 0;
      const w2 = schedule[i - 2] ?? 0;
      const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3);
      const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10);
      schedule[i] =
        ((schedule[i - 16] ?? 0) + s0 + (schedule[i - 7] ?? 0) + s1) >>> 0;
    }

    let a = state[0] ?? 0;
    let b = state[1] ?? 0;
    let c = state[2] ?? 0;
    let d = state[3] ?? 0;
    let e = state[4] ?? 0;
    let f = state[5] ?? 0;
    let g = state[6] ?? 0;
    let h = state[7] ?? 0;

    for (let i = 0; i < 64; i += 1) {
      const sigma1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 =
        (h + sigma1 + choice + (SHA256_K[i] ?? 0) + (schedule[i] ?? 0)) >>> 0;
      const sigma0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sigma0 + majority) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    state[0] = ((state[0] ?? 0) + a) >>> 0;
    state[1] = ((state[1] ?? 0) + b) >>> 0;
    state[2] = ((state[2] ?? 0) + c) >>> 0;
    state[3] = ((state[3] ?? 0) + d) >>> 0;
    state[4] = ((state[4] ?? 0) + e) >>> 0;
    state[5] = ((state[5] ?? 0) + f) >>> 0;
    state[6] = ((state[6] ?? 0) + g) >>> 0;
    state[7] = ((state[7] ?? 0) + h) >>> 0;
  }

  let digest = '';
  for (let i = 0; i < 8; i += 1) {
    digest += (state[i] ?? 0).toString(16).padStart(8, '0');
  }
  return digest;
}

/** Backwards-compatible alias: hash any string with SHA-256. */
export function hash(data: string): string {
  return sha256Hex(data);
}

export interface EvidenceRef {
  eventId: string;
  tUs: number;
  label: string;
}

/**
 * Canonical serialisation: only `eventId`, `tUs`, `label`, label trimmed, tUs
 * truncated to an integer, sorted by (tUs, eventId). Two evidence sets that a
 * human would call identical always hash identically.
 */
export function canonicalizeEvidence(refs: readonly EvidenceRef[]): string {
  const normalized = refs
    .map((ref) => ({
      eventId: ref.eventId,
      tUs: Math.trunc(ref.tUs),
      label: ref.label.trim(),
    }))
    .sort((left, right) => {
      if (left.tUs !== right.tUs) return left.tUs - right.tUs;
      if (left.eventId < right.eventId) return -1;
      if (left.eventId > right.eventId) return 1;
      return 0;
    });
  return JSON.stringify(normalized);
}

export function computeEvidenceHash(refs: readonly EvidenceRef[]): string {
  return sha256Hex(canonicalizeEvidence(refs));
}

export type StaleReason = 'hash_mismatch' | 'dangling_ref' | 'out_of_range';

export interface EvidenceStalenessInput {
  storedHash: string;
  refs: readonly EvidenceRef[];
  /** Ids of events that currently exist in the project. */
  existingEventIds?: ReadonlySet<string>;
  /** Current project duration; refs at or beyond it are out of range. */
  durationUs?: number;
}

export interface EvidenceStalenessResult {
  stale: boolean;
  reasons: StaleReason[];
  currentHash: string;
}

/**
 * Staleness is derived, never stored: recompute the hash, check every ref
 * resolves to an existing event, and check refs fall inside the project.
 */
export function evaluateEvidence(input: EvidenceStalenessInput): EvidenceStalenessResult {
  const reasons: StaleReason[] = [];
  const currentHash = computeEvidenceHash(input.refs);

  if (currentHash !== input.storedHash) reasons.push('hash_mismatch');

  if (input.existingEventIds) {
    const dangling = input.refs.some((ref) => !input.existingEventIds?.has(ref.eventId));
    if (dangling) reasons.push('dangling_ref');
  }

  const durationUs = input.durationUs;
  if (durationUs !== undefined) {
    const outOfRange = input.refs.some((ref) => ref.tUs < 0 || ref.tUs >= durationUs);
    if (outOfRange) reasons.push('out_of_range');
  }

  return { stale: reasons.length > 0, reasons, currentHash };
}

export function isEvidenceStale(input: EvidenceStalenessInput): boolean {
  return evaluateEvidence(input).stale;
}

// ---------------------------------------------------------------------------
// Insight review state machine
// ---------------------------------------------------------------------------

export type InsightStatus = 'proposed' | 'needs_evidence' | 'accepted' | 'edited' | 'rejected';
export type InsightAction = 'accept' | 'edit' | 'reject' | 'flag' | 'reopen';

export interface InsightTransitionContext {
  /** True when at least one evidence ref resolves to an existing event. */
  evidenceResolves: boolean;
}

export interface InsightTransitionResult {
  ok: boolean;
  from: InsightStatus;
  action: InsightAction;
  to?: InsightStatus;
  reason?: string;
}

export function transitionInsight(
  from: InsightStatus,
  action: InsightAction,
  context: InsightTransitionContext,
): InsightTransitionResult {
  if (action === 'accept') {
    if (from !== 'proposed' && from !== 'needs_evidence') {
      return { ok: false, from, action, reason: 'invalid_transition' };
    }
    if (!context.evidenceResolves) {
      return { ok: false, from, action, reason: 'evidence_required' };
    }
    return { ok: true, from, action, to: 'accepted' };
  }

  if (action === 'edit') {
    if (from !== 'proposed') return { ok: false, from, action, reason: 'invalid_transition' };
    return { ok: true, from, action, to: 'edited' };
  }

  if (action === 'reject') {
    if (from !== 'proposed' && from !== 'needs_evidence') {
      return { ok: false, from, action, reason: 'invalid_transition' };
    }
    return { ok: true, from, action, to: 'rejected' };
  }

  if (action === 'flag') {
    if (from !== 'proposed') return { ok: false, from, action, reason: 'invalid_transition' };
    return { ok: true, from, action, to: 'needs_evidence' };
  }

  if (from !== 'accepted' && from !== 'edited' && from !== 'rejected') {
    return { ok: false, from, action, reason: 'invalid_transition' };
  }
  return { ok: true, from, action, to: 'proposed' };
}

// ---------------------------------------------------------------------------
// Legacy review records (kept for compatibility with earlier callers)
// ---------------------------------------------------------------------------

export type EvidenceState = 'draft' | 'pending' | 'review' | 'approved' | 'rejected' | 'stale';

export interface EvidenceReview {
  reviewerId: string;
  reviewedAt: number;
  state: EvidenceState;
  comments?: string;
  evidenceHash?: string;
}

export interface EvidenceLink {
  sourceId: string;
  targetId: string;
  relationship: 'supports' | 'contradicts' | 'references';
  createdAt: number;
}

export function createEvidenceReview(
  reviewerId: string,
  state: EvidenceState,
  comments?: string,
): EvidenceReview {
  return { reviewerId, reviewedAt: Date.now() * 1000, state, comments };
}

export function createEvidenceLink(
  sourceId: string,
  targetId: string,
  relationship: 'supports' | 'contradicts' | 'references',
): EvidenceLink {
  return { sourceId, targetId, relationship, createdAt: Date.now() * 1000 };
}

export function isFinalState(state: EvidenceState): boolean {
  return state === 'approved' || state === 'rejected' || state === 'stale';
}

export function nextReviewState(currentState: EvidenceState): EvidenceState | null {
  const workflow: Record<EvidenceState, EvidenceState | null> = {
    draft: 'pending',
    pending: 'review',
    review: null,
    approved: null,
    rejected: null,
    stale: null,
  };
  return workflow[currentState];
}
