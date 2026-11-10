'use client'

import { useRef, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { timecode } from '@/lib/format'
import type { MatchEvent, Project } from '@/lib/types'

const TRACK_TICKS = 6

function eventColor(event: MatchEvent, project: Project): string {
  if (event.type === 'goal') return '#C6F24E'
  if (event.type === 'shot' || event.type === 'save') return '#4CC9F0'
  if (event.type === 'card' || event.type === 'foul') return '#FFB020'
  if (event.type === 'sub') return '#9AA7B4'
  return event.teamId === project.teams.home.id ? project.teams.home.color : project.teams.away.color
}

function eventLabel(event: MatchEvent): string {
  const minute = Math.floor(event.minute)
  const player = event.playerId ? ` · ${event.playerId}` : ''
  return `${event.type} ${minute}'${player}`
}

export function Timeline({
  project,
  tUs,
  onSeek,
  selectedEventId,
  onSelectEvent,
  inUs,
  outUs,
}: {
  project: Project
  tUs: number
  onSeek: (tUs: number) => void
  selectedEventId?: string
  onSelectEvent?: (eventId: string) => void
  inUs?: number
  outUs?: number
}): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null)
  const duration = Math.max(project.durationUs, 1)

  function seek(clientX: number): void {
    const element = trackRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onSeek(Math.round(ratio * duration))
  }

  function percent(value: number): number {
    return Math.max(0, Math.min(100, (value / duration) * 100))
  }

  const playhead = percent(tUs)

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="label">Timeline</span>
          <span className="font-mono text-xs text-text">{timecode(tUs)}</span>
          <span className="text-xs text-dim">/ {timecode(project.durationUs)}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-dim">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent" /> goal
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan" /> shot
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber" /> card / foul
          </span>
        </div>
      </div>

      <div className="px-4 pb-3 pt-2">
        <div className="relative h-5 select-none" aria-hidden="true">
          {Array.from({ length: TRACK_TICKS + 1 }, (_, index) => {
            const value = (duration / TRACK_TICKS) * index
            return (
              <span
                key={index}
                className="absolute -translate-x-1/2 font-mono text-[10px] text-dim"
                style={{ left: `${(index / TRACK_TICKS) * 100}%` }}
              >
                {timecode(value)}
              </span>
            )
          })}
        </div>

        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Match timeline"
          aria-valuemin={0}
          aria-valuemax={project.durationUs}
          aria-valuenow={tUs}
          aria-valuetext={timecode(tUs)}
          className="relative cursor-crosshair rounded-[10px] border border-line bg-[#0A1017] py-2"
          onClick={(event) => seek(event.clientX)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              onSeek(Math.max(0, tUs - 1_000_000))
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              onSeek(Math.min(duration, tUs + 1_000_000))
            }
          }}
        >
          <div className="relative mx-2 h-6 rounded bg-surface-2/70">
            {inUs !== undefined && outUs !== undefined && outUs > inUs ? (
              <div
                className="absolute inset-y-0 rounded bg-accent/15 ring-1 ring-accent/40"
                style={{ left: `${percent(inUs)}%`, width: `${percent(outUs - inUs)}%` }}
              />
            ) : null}
            {project.events.map((event) => (
              <button
                key={event.id}
                type="button"
                title={eventLabel(event)}
                aria-label={`Jump to ${eventLabel(event)}`}
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation()
                  onSelectEvent?.(event.id)
                  onSeek(event.tUs)
                }}
                className={cx(
                  'absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-120 hover:scale-150',
                  selectedEventId === event.id && 'ring-2 ring-text ring-offset-1 ring-offset-[#0A1017]',
                )}
                style={{
                  left: `${percent(event.tUs)}%`,
                  background: eventColor(event, project),
                  opacity: event.type === 'pass' ? 0.4 : 1,
                }}
              />
            ))}
          </div>

          <div className="relative mx-2 mt-2 h-3 rounded bg-surface-2/70">
            {project.clips.map((clip) => (
              <div
                key={clip.id}
                className="absolute inset-y-0 rounded-sm bg-cyan/30 ring-1 ring-cyan/40"
                title={`${clip.name} · ${timecode(clip.inUs)}–${timecode(clip.outUs)}`}
                style={{ left: `${percent(clip.inUs)}%`, width: `${Math.max(percent(clip.outUs - clip.inUs), 0.6)}%` }}
              />
            ))}
            {project.clips.length === 0 ? (
              <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-wider text-dim">
                no clips
              </span>
            ) : null}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-accent"
            style={{ left: `calc(${playhead}% + 0px)` }}
            aria-hidden="true"
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-accent" />
          </div>
        </div>

        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
          <span>{project.events.length} events</span>
          <span>{project.clips.length} clips</span>
        </div>
      </div>
    </div>
  )
}
