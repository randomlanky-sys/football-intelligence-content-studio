export type ExportPreset = 'vertical_1080' | 'landscape_1080' | 'square_1080' | 'article';

export type PreflightSeverity = 'block' | 'warn';

export interface PreflightIssue {
  id: string;
  severity: PreflightSeverity;
  message: string;
  fix: string;
}

export interface PreflightInput {
  durationUs: number;
  preset: ExportPreset;
  acceptedInsights: number;
  staleEvidence: number;
  danglingEvidence: number;
}

export interface PreflightResult {
  ok: boolean;
  preset: ExportPreset;
  issues: PreflightIssue[];
  checkedAt: string;
}

export interface PreflightMetadata {
  hasValidTimestamps: boolean;
  durationUs?: number;
  preset?: string;
}

const SUPPORTED_PRESETS: readonly ExportPreset[] = [
  'vertical_1080',
  'landscape_1080',
  'square_1080',
  'article',
];

/**
 * Legacy-compatible preflight predicate. Real checks: a positive timestamp, a
 * valid timestamp flag, and a positive duration when one is supplied.
 */
export function validatePreFlight(timestampUs: number, metadata: PreflightMetadata | null | undefined): boolean {
  if (!Number.isFinite(timestampUs) || timestampUs <= 0) return false;
  if (!metadata || metadata.hasValidTimestamps !== true) return false;
  if (metadata.durationUs !== undefined && metadata.durationUs <= 0) return false;
  return true;
}

/**
 * Full preflight used by the export screen. Every issue names the fix so a
 * blocked user has a recovery path instead of a dead end.
 */
export function runPreflight(input: PreflightInput): PreflightResult {
  const issues: PreflightIssue[] = [];

  if (!SUPPORTED_PRESETS.includes(input.preset)) {
    issues.push({
      id: 'preset_unsupported',
      severity: 'block',
      message: `Export preset "${String(input.preset)}" is not supported.`,
      fix: 'Choose one of the supported presets: vertical 1080, landscape 1080, square 1080, or article.',
    });
  }

  if (!Number.isFinite(input.durationUs) || input.durationUs <= 0) {
    issues.push({
      id: 'no_duration',
      severity: 'block',
      message: 'The project has no duration, so there is nothing to export.',
      fix: 'Set the match duration in the project data before exporting.',
    });
  } else if (input.durationUs < 10_000_000) {
    issues.push({
      id: 'clip_too_short',
      severity: 'warn',
      message: 'The export is shorter than 10 seconds.',
      fix: 'Confirm this is intentional, or extend the clip range.',
    });
  }

  if (input.acceptedInsights <= 0) {
    issues.push({
      id: 'no_accepted_insights',
      severity: 'block',
      message: 'No insight has been accepted, so the pack would have no claims.',
      fix: 'Open Review and accept at least one insight with resolving evidence.',
    });
  }

  if (input.staleEvidence > 0) {
    issues.push({
      id: 'stale_evidence',
      severity: 'block',
      message: `${input.staleEvidence} accepted insight(s) cite stale evidence.`,
      fix: 'Re-open each stale insight, confirm its evidence, and accept it again.',
    });
  }

  if (input.danglingEvidence > 0) {
    issues.push({
      id: 'dangling_evidence',
      severity: 'block',
      message: `${input.danglingEvidence} evidence reference(s) point at events that no longer exist.`,
      fix: 'Remove or re-link the missing evidence before exporting.',
    });
  }

  return {
    ok: issues.every((issue) => issue.severity !== 'block'),
    preset: input.preset,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Post-render quality control. A render passes only when it reports a positive
 * duration, a valid timestamp flag, and no blocking QC issues.
 */
export function validatePostRender(metadata: (PreflightMetadata & { qcIssues?: number }) | null | undefined): boolean {
  if (!metadata) return false;
  if (metadata.hasValidTimestamps !== true) return false;
  if (metadata.durationUs !== undefined && metadata.durationUs <= 0) return false;
  if (metadata.qcIssues !== undefined && metadata.qcIssues > 0) return false;
  return true;
}

export interface ExportMetadata {
  exportId: string;
  timestamp: number;
  config: Record<string, unknown>;
  status: 'pending';
}

export function generateExportMetadata(config: Record<string, unknown> = {}): ExportMetadata {
  const exportId =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `export-${Date.now().toString(36)}`;
  return { exportId, timestamp: Date.now(), config, status: 'pending' };
}

export function formatPreflightSummary(result: PreflightResult): string {
  const blocks = result.issues.filter((issue) => issue.severity === 'block').length;
  const warnings = result.issues.filter((issue) => issue.severity === 'warn').length;
  if (result.ok && warnings === 0) return 'Ready to export.';
  if (result.ok) return `Ready with ${warnings} warning(s).`;
  return `${blocks} blocking issue(s), ${warnings} warning(s).`;
}
