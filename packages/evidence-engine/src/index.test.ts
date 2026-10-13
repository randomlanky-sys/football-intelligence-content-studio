// packages/evidence-engine/src/index.test.ts
import { expect, test, describe } from 'vitest'
import {
  hash,
  EvidenceState,
  EvidenceReview,
  EvidenceLink,
  createEvidenceReview,
  createEvidenceLink,
  isFinalState,
  nextReviewState
} from './index'

describe('evidence engine utilities', () => {
  test('hash produces consistent output', () => {
    const data = 'test evidence';
    const hash1 = hash(data);
    const hash2 = hash(data);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  })

  test('hash produces different output for different inputs', () => {
    expect(hash('evidence A')).not.toBe(hash('evidence B'));
  })

  test('EvidenceState type is a string union', () => {
    // EvidenceState is a type alias for string union, verify the values
    const ds: EvidenceState = 'draft';
    const ps: EvidenceState = 'pending';
    const rs: EvidenceState = 'review';
    const as: EvidenceState = 'approved';
    const rs2: EvidenceState = 'rejected';
    const ss: EvidenceState = 'stale';
    expect(ds).toBe('draft');
    expect(ps).toBe('pending');
    expect(rs).toBe('review');
    expect(as).toBe('approved');
    expect(rs2).toBe('rejected');
    expect(ss).toBe('stale');
  })

  test('createEvidenceReview creates correct object', () => {
    const review = createEvidenceReview('reviewer-123', 'pending', 'Initial review required');
    expect(review).toHaveProperty('reviewerId', 'reviewer-123');
    expect(review).toHaveProperty('state', 'pending');
    expect(review).toHaveProperty('reviewedAt');
    expect(typeof review.reviewedAt).toBe('number');
    expect(review.reviewedAt).toBeGreaterThan(0);
    expect(review).toHaveProperty('comments', 'Initial review required');
  })

  test('createEvidenceLink creates correct object', () => {
    const link = createEvidenceLink('evidence-1', 'match-42', 'supports');
    expect(link).toHaveProperty('sourceId', 'evidence-1');
    expect(link).toHaveProperty('targetId', 'match-42');
    expect(link).toHaveProperty('relationship', 'supports');
    expect(link).toHaveProperty('createdAt');
    expect(typeof link.createdAt).toBe('number');
    expect(link.createdAt).toBeGreaterThan(0);
  })

  test('isFinalState identifies final states', () => {
    expect(isFinalState('approved')).toBe(true);
    expect(isFinalState('rejected')).toBe(true);
    expect(isFinalState('draft')).toBe(false);
    expect(isFinalState('pending')).toBe(false);
    expect(isFinalState('review')).toBe(false);
  })

  test('nextReviewState workflow', () => {
    expect(nextReviewState('draft')).toBe('pending');
    expect(nextReviewState('pending')).toBe('review');
    expect(nextReviewState('review')).toBe(null); // at end if approved/rejected
    expect(nextReviewState('approved')).toBe(null);
    expect(nextReviewState('rejected')).toBe(null);
  })
})