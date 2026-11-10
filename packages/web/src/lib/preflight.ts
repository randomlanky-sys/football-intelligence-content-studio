import { runPreflight, type PreflightResult } from '@fics/export-engine'
import { resolveInsight } from './store'
import type { ExportPreset, Project } from './types'

export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface PreflightRow {
  id: string
  label: string
  status: CheckStatus
  detail: string
  fixHref?: string
  fixLabel?: string
}

export interface PreflightReport {
  rows: PreflightRow[]
  result: PreflightResult
  ok: boolean
  acceptedCount: number
  staleCount: number
  danglingCount: number
}

export const EXPORT_PRESETS: { id: ExportPreset; label: string; hint: string }[] = [
  { id: 'vertical_1080', label: 'Vertical 1080', hint: '9:16 for Shorts, Reels, TikTok' },
  { id: 'landscape_1080', label: 'Landscape 1080', hint: '16:9 for YouTube and web' },
  { id: 'square_1080', label: 'Square 1080', hint: '1:1 for feed posts' },
  { id: 'article', label: 'Article', hint: 'Text-first pack, no render' },
]

/**
 * Every failing rule carries the exact screen that fixes it, so a blocked
 * export is never a dead end.
 */
export function buildPreflight(project: Project, preset: ExportPreset): PreflightReport {
  const resolved = project.insights.map((insight) => resolveInsight(project, insight))
  const considered = resolved.filter(
    (insight) => insight.status === 'accepted' || insight.status === 'edited',
  )
  const acceptedCount = considered.filter((insight) => insight.displayStatus !== 'stale').length
  const staleCount = considered.filter((insight) => insight.displayStatus === 'stale').length

  const eventIds = new Set(project.events.map((event) => event.id))
  const danglingCount = considered.reduce(
    (count, insight) =>
      count + insight.evidence.filter((reference) => !eventIds.has(reference.eventId)).length,
    0,
  )

  const result = runPreflight({
    durationUs: project.durationUs,
    preset,
    acceptedInsights: acceptedCount,
    staleEvidence: staleCount,
    danglingEvidence: danglingCount,
  })

  const reviewHref = `/app/p/${project.id}/review`
  const dataHref = `/app/p/${project.id}/data`

  const rows: PreflightRow[] = [
    {
      id: 'duration',
      label: 'Match duration is set',
      status: project.durationUs > 0 ? 'pass' : 'fail',
      detail:
        project.durationUs > 0
          ? `Duration ${(project.durationUs / 60_000_000).toFixed(0)} minutes.`
          : 'A zero duration means there is no timeline to export.',
      fixHref: project.durationUs > 0 ? undefined : dataHref,
      fixLabel: 'Open data',
    },
    {
      id: 'events',
      label: 'Events are tagged',
      status: project.events.length > 0 ? 'pass' : 'fail',
      detail:
        project.events.length > 0
          ? `${project.events.length} events in the timeline.`
          : 'Import a CSV or add events before exporting.',
      fixHref: project.events.length > 0 ? undefined : dataHref,
      fixLabel: 'Import events',
    },
    {
      id: 'accepted',
      label: 'At least one accepted insight',
      status: acceptedCount > 0 ? 'pass' : 'fail',
      detail:
        acceptedCount > 0
          ? `${acceptedCount} accepted or edited insight${acceptedCount === 1 ? '' : 's'} will be used.`
          : 'The pack would contain no claims.',
      fixHref: acceptedCount > 0 ? undefined : reviewHref,
      fixLabel: 'Open review',
    },
    {
      id: 'stale',
      label: 'No stale evidence',
      status: staleCount === 0 ? 'pass' : 'fail',
      detail:
        staleCount === 0
          ? 'Every accepted insight matches its evidence hash.'
          : `${staleCount} accepted insight${staleCount === 1 ? '' : 's'} cite changed or missing evidence.`,
      fixHref: staleCount === 0 ? undefined : reviewHref,
      fixLabel: 'Fix evidence',
    },
    {
      id: 'dangling',
      label: 'Every evidence reference resolves',
      status: danglingCount === 0 ? 'pass' : 'fail',
      detail:
        danglingCount === 0
          ? 'All references point at events that exist.'
          : `${danglingCount} reference${danglingCount === 1 ? '' : 's'} point at events that no longer exist.`,
      fixHref: danglingCount === 0 ? undefined : reviewHref,
      fixLabel: 'Relink evidence',
    },
    {
      id: 'clips',
      label: 'Clips are optional',
      status: project.clips.length > 0 ? 'pass' : 'warn',
      detail:
        project.clips.length > 0
          ? `${project.clips.length} clips will be listed in the pack.`
          : 'No clips saved. The pack will ship without a clip list.',
    },
  ]

  return {
    rows,
    result,
    ok: result.ok && rows.every((row) => row.status !== 'fail'),
    acceptedCount,
    staleCount,
    danglingCount,
  }
}
