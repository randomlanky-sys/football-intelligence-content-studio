'use client'

import { useParams } from 'next/navigation'
import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { inputClass, textareaClass } from '@/components/styles'
import { useToast } from '@/components/toast'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FieldLabel,
  Icon,
  SectionTitle,
  Skeleton,
} from '@/components/ui'
import { rowsToEvents } from '@/lib/csv-import'
import { formatDate, timecode } from '@/lib/format'
import { xgTotals } from '@/lib/stats'
import type { EventType } from '@/lib/types'
import { useProject, useWorkspace } from '@/lib/use-store'

const TEMPLATE = `minute,second,type,team,player,x,y,xg,outcome
0,0,kickoff,home,,,,
12,18,tackle,away,M. Botha,62,38,,Won
23,14,goal,home,T. Silva,92,32,0.31,Left-foot finish
41,2,goal,away,S. Nkosi,90,40,0.28,Second-ball finish
90,0,whistle,home,,,,Full-time
`

export default function DataPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const { project, loaded } = useProject(id)
  const { store } = useWorkspace()
  const toast = useToast()

  const [csv, setCsv] = useState('')
  const [mode, setMode] = useState<'append' | 'replace'>('append')
  const [eventFilter, setEventFilter] = useState<'all' | EventType>('all')
  const [eventQuery, setEventQuery] = useState('')
  const [pendingEventId, setPendingEventId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = useMemo(() => {
    if (!project || csv.trim() === '') return null
    return rowsToEvents(csv, project.id, project.teams.home.id, project.teams.away.id)
  }, [csv, project])

  const filteredEvents = useMemo(() => {
    if (!project) return []
    const needle = eventQuery.trim().toLowerCase()
    return project.events
      .filter((event) => (eventFilter === 'all' ? true : event.type === eventFilter))
      .filter((event) =>
        !needle
          ? true
          : event.type.includes(needle) ||
            (event.playerId ?? '').toLowerCase().includes(needle) ||
            (event.outcome ?? '').toLowerCase().includes(needle),
      )
      .slice()
      .sort((left, right) => left.tUs - right.tUs)
  }, [project, eventFilter, eventQuery])

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        body="The project may have been deleted in another tab. Open the library to see what is available."
        action={
          <a href="/app/projects" className="text-sm font-medium text-accent hover:underline">
            Back to projects
          </a>
        }
      />
    )
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.push({ title: 'File too large', detail: 'CSV imports are capped at 2 MB in the browser.', tone: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCsv(typeof reader.result === 'string' ? reader.result : '')
      toast.push({ title: 'File loaded', detail: file.name, tone: 'success' })
    }
    reader.onerror = () => toast.push({ title: 'Could not read the file', tone: 'error' })
    reader.readAsText(file)
  }

  function importNow(): void {
    if (!project || !preview) return
    if (preview.errors.length > 0) return
    if (preview.events.length === 0) {
      toast.push({ title: 'Nothing to import', detail: 'The CSV has no data rows.', tone: 'error' })
      return
    }
    const result = store.commitEvents(project.id, preview.events, mode)
    if (result.ok) {
      toast.push({
        title: `${preview.events.length} events imported`,
        detail: mode === 'replace' ? 'The event list was replaced.' : 'Events appended to the timeline.',
        tone: 'success',
      })
      setCsv('')
      if (fileRef.current) fileRef.current.value = ''
    } else {
      toast.push({ title: 'Import failed', detail: result.message, tone: 'error' })
    }
  }

  function removeEvent(eventId: string): void {
    if (!project) return
    if (pendingEventId !== eventId) {
      setPendingEventId(eventId)
      return
    }
    const remaining = project.events.filter((event) => event.id !== eventId)
    const result = store.commitEvents(project.id, remaining, 'replace')
    if (result.ok) {
      toast.push({
        title: 'Event removed',
        detail: 'Any insight citing it is now stale and blocked from export.',
        tone: 'success',
      })
      setPendingEventId(null)
    } else {
      toast.push({ title: 'Could not remove event', detail: result.message, tone: 'error' })
    }
  }

  const xg = xgTotals(project)

  return (
    <div className="space-y-4">
      <header className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={project.origin === 'demo' ? 'accent' : 'data'}>
                {project.origin === 'demo' ? 'Demo match' : 'Your project'}
              </Badge>
              <Badge tone="neutral">{project.state}</Badge>
              <span className="text-xs text-muted">{project.competition}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">{project.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {formatDate(project.date)} · {project.events.length} events · {timecode(project.durationUs)} · xG{' '}
              {xg.home.toFixed(2)}–{xg.away.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/app/p/${project.id}`} className="text-xs font-medium text-accent hover:underline">
              Open studio →
            </a>
            <a href={`/app/p/${project.id}/review`} className="text-xs font-medium text-accent hover:underline">
              Review →
            </a>
            <a href={`/app/p/${project.id}/export`} className="text-xs font-medium text-accent hover:underline">
              Export →
            </a>
          </div>
        </div>

        <dl className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Goals', `${project.score.home}–${project.score.away}`],
            ['Possession', `${project.possession.home}%–${project.possession.away}%`],
            ['Clips', String(project.clips.length)],
            ['Insights', String(project.insights.length)],
          ].map(([label, value]) => (
            <div key={label} className="surface-2 px-3 py-2.5">
              <dt className="label">{label}</dt>
              <dd className="mt-1 font-mono text-sm text-text">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <SectionTitle
            eyebrow="Import"
            title="CSV events"
            action={<Badge tone="neutral">All-or-nothing validation</Badge>}
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-line bg-surface-2 px-3 py-2 text-xs text-muted transition-colors hover:text-text">
              <Icon name="download" className="h-3.5 w-3.5" />
              Choose CSV file
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCsv(TEMPLATE)
                toast.push({ title: 'Template loaded', detail: 'Edit the rows, then import.', tone: 'info' })
              }}
            >
              Load template
            </Button>
            <span className="ml-auto text-[11px] text-dim">Header row required · max 2 MB</span>
          </div>

          <div className="mt-3">
            <FieldLabel htmlFor="csv-input">Paste CSV</FieldLabel>
            <textarea
              id="csv-input"
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              rows={9}
              spellCheck={false}
              placeholder={TEMPLATE}
              className={cx(textareaClass, 'font-mono text-xs')}
            />
          </div>

          <fieldset className="mt-3">
            <legend className="mb-1.5 text-xs font-medium text-muted">Import mode</legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['append', 'Append to existing events'],
                  ['replace', 'Replace the event list'],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={cx(
                    'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2 text-xs',
                    mode === value
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-line bg-surface-2 text-muted',
                  )}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="accent-[#C6F24E]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {preview ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={preview.errors.length === 0 ? 'success' : 'danger'}>
                  {preview.errors.length === 0
                    ? `${preview.events.length} valid rows`
                    : `${preview.errors.length} row error${preview.errors.length === 1 ? '' : 's'}`}
                </Badge>
                {preview.errors.length === 0 ? (
                  <span className="text-xs text-muted">Ready to import.</span>
                ) : (
                  <span className="text-xs text-muted">Nothing will be written until every row is valid.</span>
                )}
              </div>

              {preview.errors.length > 0 ? (
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-[10px] border border-red/30 bg-red/5 p-3 text-xs text-red">
                  {preview.errors.map((error) => (
                    <li key={`${error.row}-${error.message}`}>
                      Row {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="max-h-56 overflow-auto rounded-[10px] border border-line">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 border-b border-line bg-surface-2">
                      <tr>
                        <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Time</th>
                        <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Type</th>
                        <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Team</th>
                        <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Player</th>
                        <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">xG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {preview.events.slice(0, 50).map((event) => (
                        <tr key={event.id}>
                          <td className="px-3 py-1.5 font-mono text-muted">{timecode(event.tUs)}</td>
                          <td className="px-3 py-1.5 text-text">{event.type}</td>
                          <td className="px-3 py-1.5 text-muted">
                            {event.teamId === project.teams.home.id ? project.teams.home.short : project.teams.away.short}
                          </td>
                          <td className="px-3 py-1.5 text-muted">{event.playerId ?? '—'}</td>
                          <td className="px-3 py-1.5 font-mono text-muted">{event.xg?.toFixed(2) ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Button
                variant="primary"
                onClick={importNow}
                disabled={preview.errors.length > 0 || preview.events.length === 0}
              >
                <Icon name="download" className="h-4 w-4" />
                Import {preview.events.length} events
              </Button>
            </div>
          ) : null}
        </Card>

        <Card>
          <SectionTitle
            eyebrow="Match sheet"
            title="Event timeline"
            action={<Badge tone="neutral">{project.events.length} total</Badge>}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Filter events</span>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
              <input
                value={eventQuery}
                onChange={(event) => setEventQuery(event.target.value)}
                placeholder="Filter by player, type or outcome"
                className={cx(inputClass, 'h-9 pl-9 text-xs')}
              />
            </label>
            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value as 'all' | EventType)}
              aria-label="Filter by event type"
              className={cx(inputClass, 'h-9 w-auto text-xs')}
            >
              <option value="all">All types</option>
              {['kickoff', 'pass', 'shot', 'goal', 'save', 'tackle', 'foul', 'card', 'sub', 'corner', 'offside', 'whistle'].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="mt-3 max-h-[560px] overflow-auto rounded-[10px] border border-line">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-line bg-surface-2">
                <tr>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Time</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Event</th>
                  <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">Detail</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-surface-2/50">
                    <td className="whitespace-nowrap px-3 py-1.5 font-mono text-muted">{timecode(event.tUs)}</td>
                    <td className="px-3 py-1.5">
                      <span className="text-text">{event.type}</span>
                      <span className="ml-1.5 text-dim">
                        {event.teamId === project.teams.home.id ? project.teams.home.short : project.teams.away.short}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-1.5 text-muted">
                      {event.playerId ? `${event.playerId} · ` : ''}
                      {event.outcome ?? (event.xg !== undefined ? `xG ${event.xg.toFixed(2)}` : '—')}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeEvent(event.id)}
                        className={cx(
                          'rounded px-1.5 py-1 text-[10px]',
                          pendingEventId === event.id
                            ? 'bg-red/15 text-red'
                            : 'text-dim hover:bg-red/10 hover:text-red',
                        )}
                      >
                        {pendingEventId === event.id ? 'Confirm' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEvents.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-dim">No events match this filter.</p>
            ) : null}
          </div>

          <p className="mt-3 text-[11px] leading-5 text-dim">
            Removing an event recalculates the score and can make any insight that cites it stale.
            That is intentional: the workspace never hides a broken evidence link.
          </p>
        </Card>
      </div>
    </div>
  )
}
