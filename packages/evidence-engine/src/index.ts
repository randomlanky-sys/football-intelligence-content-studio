// packages/evidence-engine/src/index.ts
/**
 * Evidence hashing utility using SHA-256.
 * In a real implementation, this would use a cryptographic library.
 * For this placeholder, we compute a deterministic hash based on the input.
 */
export function hash(data: string): string {
  // Placeholder: In a real app, use crypto.createHash('sha256').update(data).digest('hex')
  // For now, we compute a simple deterministic hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  // Convert to hex-like string (simplified)
  return hash.toString(16).padStart(64, '0');
}

/**
 * Evidence review state.
 * Tracks the lifecycle of an evidence item from import to final approval.
 */
export type EvidenceState =
  | 'draft'
  | 'pending'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'stale';

/**
 * Evidence review record.
 * Tracks who reviewed the evidence, when, and their decision.
 */
export interface EvidenceReview {
  reviewerId: string;
  reviewedAt: number; // microseconds since epoch
  state: EvidenceState;
  comments?: string;
  evidenceHash?: string;
}

/**
 * Evidence link - connects evidence to other entities.
 */
export interface EvidenceLink {
  sourceId: string; // The ID of the evidence item
  targetId: string; // The ID of the related entity
  relationship: 'supports' | 'contradicts' | 'references';
  createdAt: number; // microseconds since epoch
}

/**
 * Create a new evidence review.
 * @param reviewerId - The ID of the reviewer
 * @param state - The review state
 * @param comments - Optional comments
 * @returns An evidence review record
 */
export function createEvidenceReview(
  reviewerId: string,
  state: EvidenceState,
  comments?: string
): EvidenceReview {
  return {
    reviewerId,
    reviewedAt: Date.now() * 1000, // microseconds since epoch
    state,
    comments,
  };
}

/**
 * Link evidence to another entity.
 * @param sourceId - Evidence item ID
 * @param targetId - Related entity ID
 * @param relationship - Type of relationship
 * @returns An evidence link record
 */
export function createEvidenceLink(
  sourceId: string,
  targetId: string,
  relationship: 'supports' | 'contradicts' | 'references'
): EvidenceLink {
  return {
    sourceId,
    targetId,
    relationship,
    createdAt: Date.now() * 1000,
  };
}

/**
 * Check if evidence state is final (no further review needed).
 * @param state - The evidence state
 * @returns True if the state is final
 */
export function isFinalState(state: EvidenceState): boolean {
  return state === 'approved' || state === 'rejected' || state === 'stale';
}

/**
 * Get the next state in the review workflow.
 * @param currentState - Current evidence state
 * @returns The next appropriate state, or null if at the end of the workflow
 */
export function nextReviewState(currentState: EvidenceState): EvidenceState | null {
  // Workflow: draft -> pending -> review -> (terminal)
  // All states except draft and pending are considered terminal
  const workflow: Record<EvidenceState, EvidenceState | null> = {
    draft: 'pending',
    pending: 'review',
    review: null,
    approved: null,
    rejected: null,
    stale: null,
  };
  return workflow[currentState] || null;
}