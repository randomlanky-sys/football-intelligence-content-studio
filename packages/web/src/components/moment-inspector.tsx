'use client'

import type { ReactNode } from 'react'
import {
  INSIGHT_STATUS_LABEL,
  INSIGHT_STATUS_TONE,
  formatDate,
  timecode,
} from '@/lib/format'
import type { MatchEvent, Project, ResolvedInsight } from '@/lib/types'
import { Badge, Button, EmptyState, Icon } from './ui'
import { useToast } from './toast'

const TYPE_LABEL: Record<MatchEvent['type'], string> = {
  kickoff: 'Kick-off',
  pass: 'Pass',
  shot: 'Shot',
  goal: 'Goal',
  save: 'Save',
  tackle: 'Tackle',
  foul: 'Foul',
  card: 'Card',
  sub: 'Substitution',
  corner: 'Corner',
  offside: 'Offside',
  whistle: 'Whistle',
}

export function MomentInspector({
  project,
  event,
  insights,
  onClose,
  onSeek,
}: {
  project: Project
  event: MatchEvent | undefined
  insights: ResolvedInsight[]
  onClose: () => void
  onSeek: (tUs: number) => void
}): ReactNode {
  const toast = useToast()

  if (!event) {
    return (
      <div className="surface p-5">
        <p className="label mb-2">Moment inspector</p>
        <EmptyState
          title="Select a moment"
          body="Click any shot on the pitch, a dot on the timeline, or an evidence chip. The inspector shows the event facts, the exact timestamp and every insight that cites it."
        />
      </div>
    )
  }

  const team = event.teamId === project.teams.home.id ? project.teams.home : project.teams.away
  const citing = insights.filter((insight) =>
    insight.evidence.some((reference) => reference.eventId === event.id),
  )

  return (
    <aside className="surface overflow-hidden" data-testid="moment-inspector" aria-label="Moment inspector">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="label mb-1">Moment inspector</p>
          <p className="text-sm font-semibold text-text">
            {TYPE_LABEL[event.type]} · {Math.floor(event.minute)}′{String(Math.floor((event.minute % 1) * 60)).padStart(2, '0')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-dim hover:text-text"
          aria-label="Close moment inspector"
        >
          <Icon name="x" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: team.color }} />
          <span className="text-sm text-text">{team.name}</span>
          {event.playerId ? <span className="text-xs text-muted">· {event.playerId}</span> : null}
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs">
          <Fact label="Timestamp" value={timecode(event.tUs)} mono />
          <Fact label="Match date" value={formatDate(project.date)} />
          {event.xg !== undefined ? <Fact label="Expected goals" value={event.xg.toFixed(2)} mono /> : null}
          {event.outcome ? <Fact label="Outcome" value={event.outcome} /> : null}
          {event.x !== undefined && event.y !== undefined ? (
            <Fact label="Pitch position" value={`${event.x.toFixed(0)}m · ${event.y.toFixed(0)}m`} mono />
          ) : null}
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={() => onSeek(event.tUs)}>
            <Icon name="play" className="h-3.5 w-3.5" /> Jump to moment
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set('t', String(event.tUs))
              url.searchParams.set('event', event.id)
              void navigator.clipboard
                .writeText(url.toString())
                .then(() => toast.push({ title: 'Moment link copied', tone: 'success' }))
                .catch(() => toast.push({ title: 'Could not copy the link', tone: 'error' }))
            }}
          >
            <Icon name="copy" className="h-3.5 w-3.5" /> Copy link
          </Button>
        </div>

        <div>
          <p className="label mb-2">Cited by {citing.length} insight{citing.length === 1 ? '' : 's'}</p>
          {citing.length === 0 ? (
            <p className="text-xs leading-5 text-dim">
              No insight cites this event yet. Evidence chips are what make a claim reviewable.
            </p>
          ) : (
            <ul className="space-y-2">
              {citing.map((insight) => (
                <li key={insight.id} className="surface-2 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge tone={INSIGHT_STATUS_TONE[insight.displayStatus]}>
                      {INSIGHT_STATUS_LABEL[insight.displayStatus]}
                    </Badge>
                    <span className="font-mono text-[10px] text-dim">{insight.id}</span>
                  </div>
                  <p className="text-xs leading-5 text-muted">{insight.claim}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }): ReactNode {
  return (
    <div className="surface-2 px-2.5 py-2">
      <dt className="text-[10px] uppercase tracking-[0.12em] text-dim">{label}</dt>
      <dd className={mono ? 'mt-0.5 font-mono text-text' : 'mt-0.5 text-text'}>{value}</dd>
    </div>
  )
}
