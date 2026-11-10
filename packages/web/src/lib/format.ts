import { formatTimecode } from '@fics/timebase'
import type { DisplayInsightStatus, ProjectState } from './types'

export function timecode(tUs: number): string {
  return formatTimecode(tUs)
}

export function timecodeFrames(tUs: number, fps: number): string {
  return formatTimecode(tUs, fps)
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso.length <= 10 ? `${iso}T12:00:00Z` : iso}`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export const PROJECT_STATE_LABEL: Record<ProjectState, string> = {
  draft: 'Draft',
  active: 'Active',
  review: 'In review',
  exported: 'Exported',
  archived: 'Archived',
}

export const INSIGHT_STATUS_LABEL: Record<DisplayInsightStatus, string> = {
  proposed: 'Proposed',
  needs_evidence: 'Needs evidence',
  accepted: 'Accepted',
  edited: 'Edited',
  rejected: 'Rejected',
  stale: 'Stale',
}

export const INSIGHT_STATUS_TONE: Record<
  DisplayInsightStatus,
  'neutral' | 'warn' | 'success' | 'data' | 'danger'
> = {
  proposed: 'neutral',
  needs_evidence: 'warn',
  accepted: 'success',
  edited: 'data',
  rejected: 'danger',
  stale: 'warn',
}

export function pct(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

export function shortName(name: string, max = 22): string {
  return name.length > max ? `${name.slice(0, max - 1).trimEnd()}…` : name
}
