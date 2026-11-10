import { describe, expect, test } from 'vitest';
import {
  formatPreflightSummary,
  generateExportMetadata,
  runPreflight,
  validatePostRender,
  validatePreFlight,
} from './index';

describe('export engine', () => {
  test('validatePreFlight requires a positive timestamp and valid metadata', () => {
    expect(validatePreFlight(1_000_000, { hasValidTimestamps: true })).toBe(true);
    expect(validatePreFlight(0, { hasValidTimestamps: true })).toBe(false);
    expect(validatePreFlight(1_000_000, { hasValidTimestamps: false })).toBe(false);
    expect(validatePreFlight(1_000_000, { hasValidTimestamps: true, durationUs: 0 })).toBe(false);
    expect(validatePreFlight(1_000_000, null)).toBe(false);
  });

  test('validatePostRender rejects QC issues', () => {
    expect(validatePostRender({ hasValidTimestamps: true })).toBe(true);
    expect(validatePostRender({ hasValidTimestamps: false })).toBe(false);
    expect(validatePostRender({ hasValidTimestamps: true, qcIssues: 1 })).toBe(false);
  });

  test('generateExportMetadata returns a complete record', () => {
    const metadata = generateExportMetadata({ format: 'json' });
    expect(metadata).toHaveProperty('exportId');
    expect(metadata).toHaveProperty('timestamp');
    expect(metadata.config).toEqual({ format: 'json' });
    expect(metadata.status).toBe('pending');
  });

  test('runPreflight blocks when there are no accepted insights', () => {
    const result = runPreflight({
      durationUs: 5_400_000_000,
      preset: 'vertical_1080',
      acceptedInsights: 0,
      staleEvidence: 0,
      danglingEvidence: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.id)).toContain('no_accepted_insights');
  });

  test('runPreflight blocks stale and dangling evidence', () => {
    const result = runPreflight({
      durationUs: 5_400_000_000,
      preset: 'landscape_1080',
      acceptedInsights: 3,
      staleEvidence: 1,
      danglingEvidence: 2,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining(['stale_evidence', 'dangling_evidence']),
    );
  });

  test('runPreflight passes a clean input and summarises it', () => {
    const result = runPreflight({
      durationUs: 5_400_000_000,
      preset: 'vertical_1080',
      acceptedInsights: 3,
      staleEvidence: 0,
      danglingEvidence: 0,
    });
    expect(result.ok).toBe(true);
    expect(formatPreflightSummary(result)).toBe('Ready to export.');
  });
});
