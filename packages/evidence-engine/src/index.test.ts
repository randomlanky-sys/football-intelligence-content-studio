import { describe, expect, test } from 'vitest';
import {
  canonicalizeEvidence,
  computeEvidenceHash,
  evaluateEvidence,
  hash,
  isEvidenceStale,
  nextReviewState,
  sha256Hex,
  transitionInsight,
  type EvidenceRef,
} from './index';

describe('SHA-256', () => {
  test('matches the known-answer vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('The quick brown fox jumps over the lazy dog')).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    );
  });

  test('handles messages that cross the padding boundary', () => {
    // 56 bytes forces a second 64-byte block.
    expect(sha256Hex('a'.repeat(56))).toBe(
      'b35439a4ac6f0948b6d6f9e3c6af0f5f590ce20f1bde7090ef7970686ec6738a',
    );
  });

  test('hash is a 64-character hex alias of sha256Hex', () => {
    expect(hash('test evidence')).toHaveLength(64);
    expect(hash('test evidence')).toBe(sha256Hex('test evidence'));
  });
});

describe('evidence canonicalisation', () => {
  const refs: EvidenceRef[] = [
    { eventId: 'evt-2', tUs: 2_000_000, label: '  Second  ' },
    { eventId: 'evt-1', tUs: 1_000_000, label: 'First' },
  ];

  test('trims labels and sorts by time then id', () => {
    expect(canonicalizeEvidence(refs)).toBe(
      '[{"eventId":"evt-1","tUs":1000000,"label":"First"},{"eventId":"evt-2","tUs":2000000,"label":"Second"}]',
    );
  });

  test('input order does not change the hash', () => {
    const reversed = [...refs].reverse();
    expect(computeEvidenceHash(refs)).toBe(computeEvidenceHash(reversed));
  });

  test('whitespace-only label differences do not change the hash', () => {
    const noisy = refs.map((ref) => ({ ...ref, label: `  ${ref.label}  ` }));
    expect(computeEvidenceHash(noisy)).toBe(computeEvidenceHash(refs));
  });
});

describe('derived staleness', () => {
  const refs: EvidenceRef[] = [{ eventId: 'evt-1', tUs: 1_000_000, label: 'Shot' }];
  const storedHash = computeEvidenceHash(refs);

  test('fresh evidence is not stale', () => {
    expect(
      isEvidenceStale({
        storedHash,
        refs,
        existingEventIds: new Set(['evt-1']),
        durationUs: 5_400_000_000,
      }),
    ).toBe(false);
  });

  test('a changed reference makes the hash stale', () => {
    const result = evaluateEvidence({
      storedHash,
      refs: [{ eventId: 'evt-1', tUs: 1_200_000, label: 'Shot' }],
    });
    expect(result.stale).toBe(true);
    expect(result.reasons).toContain('hash_mismatch');
  });

  test('a dangling event id is stale even when the hash matches', () => {
    const result = evaluateEvidence({
      storedHash,
      refs,
      existingEventIds: new Set(['other']),
    });
    expect(result.reasons).toContain('dangling_ref');
  });

  test('evidence beyond the project duration is out of range', () => {
    const result = evaluateEvidence({ storedHash, refs, durationUs: 500_000 });
    expect(result.reasons).toContain('out_of_range');
  });
});

describe('insight transitions', () => {
  test('accept requires resolving evidence', () => {
    expect(transitionInsight('proposed', 'accept', { evidenceResolves: false }).reason).toBe(
      'evidence_required',
    );
    expect(transitionInsight('proposed', 'accept', { evidenceResolves: true }).to).toBe('accepted');
    expect(transitionInsight('needs_evidence', 'accept', { evidenceResolves: true }).to).toBe(
      'accepted',
    );
  });

  test('reopen returns accepted, edited or rejected insights to proposed', () => {
    expect(transitionInsight('accepted', 'reopen', { evidenceResolves: true }).to).toBe('proposed');
    expect(transitionInsight('edited', 'reopen', { evidenceResolves: true }).to).toBe('proposed');
    expect(transitionInsight('rejected', 'reopen', { evidenceResolves: false }).to).toBe('proposed');
  });

  test('rejects invalid transitions', () => {
    expect(transitionInsight('rejected', 'accept', { evidenceResolves: true }).ok).toBe(false);
    expect(transitionInsight('accepted', 'edit', { evidenceResolves: true }).reason).toBe(
      'invalid_transition',
    );
  });

  test('legacy workflow still advances draft to review', () => {
    expect(nextReviewState('draft')).toBe('pending');
    expect(nextReviewState('pending')).toBe('review');
    expect(nextReviewState('review')).toBeNull();
  });
});
