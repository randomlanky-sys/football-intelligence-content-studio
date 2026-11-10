'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { InsightCard } from '@/components/insight-card'
import { MomentInspector } from '@/components/moment-inspector'
import { Pitch } from '@/components/pitch'
import { ProjectHeader } from '@/components/project-header'
import { Timeline } from '@/components/timeline'
import { useToast } from '@/components/toast'
import { Badge, Button, EmptyState, Icon, Kbd, Skeleton } from '@/components/ui'
import { INSIGHT_STATUS_LABEL, INSIGHT_STATUS_TONE, timecode, timecodeFrames } from '@/lib/format'
import { useStudioKeyboard } from '@/lib/use-keyboard'
import { useProject, useWorkspace } from '@/lib/use-store'
import type { DisplayInsightStatus } from '@/lib/types'

const FILTERS: { id: 'all' | DisplayInsightStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'proposed', label: 'Proposed' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'stale', label: 'Stale' },
]

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioSkeleton />}>
      <StudioClient />
    </Suspense>
  )
}

function StudioSkeleton(): ReactNode {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-40" />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}

function StudioClient(): ReactNode {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const searchParams = useSearchParams()
  const { project, insights, loaded } = useProject(id)
  const { store } = useWorkspace()
  const toast = useToast()

  const [tUs, setTUs] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined)
  const [filter, setFilter] = useState<'all' | DisplayInsightStatus>('all')
  const [clipIn, setClipIn] = useState<number | undefined>(undefined)
  const [clipOut, setClipOut] = useState<number | undefined>(undefined)
  const hydrated = useRef(false)

  const fps = project?.fps ?? 25
  const duration = project?.durationUs ?? 0
  const frameUs = Math.round(1_000_000 / fps)

  useEffect(() => {
    if (!project || hydrated.current) return
    hydrated.current = true
    const initialT = Number(searchParams.get('t'))
    if (Number.isFinite(initialT) && initialT >= 0) {
      setTUs(Math.min(initialT, project.durationUs))
    }
    const eventId = searchParams.get('event')
    if (eventId && project.events.some((event) => event.id === eventId)) {
      setSelectedEventId(eventId)
    }
  }, [project, searchParams])

  useEffect(() => {
    if (!playing || duration <= 0) return
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const delta = (now - last) * 1000
      last = now
      setTUs((current) => {
        const next = current + delta
        if (next >= duration) {
          setPlaying(false)
          return duration
        }
        return next
      })
    }, 80)
    return () => window.clearInterval(timer)
  }, [playing, duration])

  const selectedEvent = useMemo(
    () => project?.events.find((event) => event.id === selectedEventId),
    [project, selectedEventId],
  )

  const visibleInsights = useMemo(() => {
    if (filter === 'all') return insights
    return insights.filter((insight) => insight.displayStatus === filter)
  }, [insights, filter])

  function seek(next: number): void {
    setTUs(Math.max(0, Math.min(duration, Math.round(next))))
  }

  function step(frames: number): void {
    seek(tUs + frames * frameUs)
  }

  useStudioKeyboard({
    onTogglePlay: () => setPlaying((current) => !current),
    onStep: step,
    onMarkIn: () => {
      setClipIn(Math.round(tUs))
      toast.push({ title: `Clip in at ${timecode(tUs)}`, tone: 'info' })
    },
    onMarkOut: () => {
      setClipOut(Math.round(tUs))
      toast.push({ title: `Clip out at ${timecode(tUs)}`, tone: 'info' })
    },
    enabled: Boolean(project),
  })

  if (!loaded) return <StudioSkeleton />

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        body="It may have been deleted in another tab, or the link is wrong. Open the library to see what is available."
        action={
          <Link href="/app/projects" className="text-sm font-medium text-accent hover:underline">
            Back to projects
          </Link>
        }
      />
    )
  }

  const clipReady = clipIn !== undefined && clipOut !== undefined && clipOut > clipIn

  return (
    <div className="space-y-4">
      <ProjectHeader project={project} insights={insights} active="studio" />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Badge tone="neutral">Timeline preview</Badge>
                <span className="text-[11px] text-dim">No video file attached in this beta</span>
              </div>
              <span className="font-mono text-xs text-text">
                {timecodeFrames(tUs, fps)}
                <span className="text-dim"> / {timecodeFrames(duration, fps)}</span>
              </span>
            </div>

            <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-4 bg-[radial-gradient(600px_260px_at_50%_0%,rgba(198,242,78,0.08),transparent_70%)] px-4 py-8">
              <p className="text-5xl font-semibold tabular-nums tracking-tight text-text sm:text-6xl">
                {timecode(tUs)}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
                frame {Math.floor(tUs / frameUs)} · {fps} fps
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => step(-10)} aria-label="Back ten frames">
                  <Icon name="arrow-left" className="h-3.5 w-3.5" />
                  <span className="font-mono text-[10px]">10f</span>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setPlaying((current) => !current)}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  <Icon name={playing ? 'pause' : 'play'} className="h-4 w-4" />
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => step(10)} aria-label="Forward ten frames">
                  <span className="font-mono text-[10px]">10f</span>
                  <Icon name="arrow-right" className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-dim">
                <span className="inline-flex items-center gap-1">
                  <Kbd>Space</Kbd> play
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>←</Kbd>
                  <Kbd>→</Kbd> step
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>I</Kbd>
                  <Kbd>O</Kbd> clip in / out
                </span>
              </div>
            </div>
          </div>

          <Timeline
            project={project}
            tUs={tUs}
            onSeek={seek}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            inUs={clipIn}
            outUs={clipOut}
          />

          <div className="surface p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="label">Clip</span>
                <span className="font-mono text-xs text-text">
                  {clipIn !== undefined ? timecode(clipIn) : '--:--'}
                  <span className="mx-1 text-dim">→</span>
                  {clipOut !== undefined ? timecode(clipOut) : '--:--'}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setClipIn(Math.round(tUs))}>
                Mark in
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setClipOut(Math.round(tUs))}>
                Mark out
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!clipReady}
                onClick={() => {
                  if (clipIn === undefined || clipOut === undefined) return
                  const name = `Clip ${timecode(clipIn)}–${timecode(clipOut)}`
                  const result = store.updateProject(project.id, {
                    clips: [
                      ...project.clips,
                      {
                        id: `clip-${Date.now().toString(36)}`,
                        name,
                        inUs: clipIn,
                        outUs: clipOut,
                        tags: ['review'],
                      },
                    ],
                  })
                  if (result.ok) {
                    toast.push({ title: 'Clip saved', detail: name, tone: 'success' })
                    setClipIn(undefined)
                    setClipOut(undefined)
                  } else {
                    toast.push({ title: 'Could not save clip', detail: result.message, tone: 'error' })
                  }
                }}
              >
                <Icon name="film" className="h-3.5 w-3.5" /> Save clip
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setClipIn(undefined)
                  setClipOut(undefined)
                }}
              >
                Clear
              </Button>
              <span className="ml-auto text-[11px] text-dim">
                {project.clips.length} clip{project.clips.length === 1 ? '' : 's'} saved
              </span>
            </div>
          </div>

          <Pitch project={project} selectedEventId={selectedEventId} onSelect={setSelectedEventId} />
        </div>

        <div className="space-y-4">
          {selectedEvent ? (
            <MomentInspector
              project={project}
              event={selectedEvent}
              insights={insights}
              onClose={() => setSelectedEventId(undefined)}
              onSeek={seek}
            />
          ) : (
            <div className="surface p-5">
              <p className="label mb-2">Moment inspector</p>
              <p className="text-sm leading-6 text-muted">
                Click a shot on the pitch, a dot on the timeline, or an evidence chip to inspect the
                exact moment. Every insight that cites the event is listed with its review status.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="surface-2 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-dim">Events</p>
                  <p className="mt-0.5 font-mono text-text">{project.events.length}</p>
                </div>
                <div className="surface-2 p-2.5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-dim">Evidence links</p>
                  <p className="mt-0.5 font-mono text-text">
                    {project.insights.reduce((sum, insight) => sum + insight.evidence.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <section className="surface overflow-hidden" aria-label="Insights">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p className="label">Insights</p>
                <p className="mt-0.5 text-sm font-medium text-text">{project.insights.length} claims</p>
              </div>
              <Badge tone="data">
                {insights.filter((insight) => insight.displayStatus === 'accepted').length} accepted
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 border-b border-line px-3 py-2">
              {FILTERS.map((item) => {
                const count =
                  item.id === 'all'
                    ? insights.length
                    : insights.filter((insight) => insight.displayStatus === item.id).length
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    aria-pressed={filter === item.id}
                    className={cx(
                      'h-7 rounded-full px-2.5 text-[11px] transition-colors',
                      filter === item.id ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text',
                    )}
                  >
                    {item.label} <span className="font-mono text-dim">{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="max-h-[720px] space-y-3 overflow-y-auto p-3">
              {visibleInsights.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-dim">No insights in this filter.</p>
              ) : (
                visibleInsights.map((insight) => (
                  <div key={insight.id} id={insight.id} className="scroll-mt-24">
                    <div className="mb-1.5 flex items-center gap-2 px-1">
                      <Badge tone={INSIGHT_STATUS_TONE[insight.displayStatus]}>
                        {INSIGHT_STATUS_LABEL[insight.displayStatus]}
                      </Badge>
                      {insight.displayStatus === 'stale' ? (
                        <span className="text-[10px] text-amber">blocks export</span>
                      ) : null}
                      <Link
                        href={`/app/p/${project.id}/review#${insight.id}`}
                        className="ml-auto text-[11px] text-dim hover:text-accent"
                      >
                        Review →
                      </Link>
                    </div>
                    <InsightCard
                      insight={insight}
                      onSeek={(nextT, eventId) => {
                        seek(nextT)
                        setSelectedEventId(eventId)
                      }}
                      onAccept={() => toast.push({ title: 'Open Review to accept', tone: 'info' })}
                      onReject={() => toast.push({ title: 'Open Review to reject', tone: 'info' })}
                      onEdit={() => toast.push({ title: 'Open Review to edit', tone: 'info' })}
                      onFlag={() => toast.push({ title: 'Open Review to flag', tone: 'info' })}
                      onReopen={() => toast.push({ title: 'Open Review to reopen', tone: 'info' })}
                      readOnly
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
