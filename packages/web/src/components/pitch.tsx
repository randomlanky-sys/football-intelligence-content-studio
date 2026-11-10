'use client'

import { useState, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import type { MatchEvent, Project, Team } from '@/lib/types'

const PITCH_LENGTH = 105
const PITCH_WIDTH = 68

function penaltyBox(x: number, side: 'left' | 'right'): string {
  const depth = 16.5
  const width = 40.32
  const y = (PITCH_WIDTH - width) / 2
  if (side === 'left') return `M${x} ${y} h${depth} v${width} h-${depth} z`
  return `M${x} ${y} h-${depth} v${width} h${depth} z`
}

function sixYardBox(x: number, side: 'left' | 'right'): string {
  const depth = 5.5
  const width = 18.32
  const y = (PITCH_WIDTH - width) / 2
  if (side === 'left') return `M${x} ${y} h${depth} v${width} h-${depth} z`
  return `M${x} ${y} h-${depth} v${width} h${depth} z`
}

/** Convert a stored shot coordinate into display space (away attacks left). */
function displayPoint(event: MatchEvent, team: 'home' | 'away'): { x: number; y: number } | null {
  if (event.x === undefined || event.y === undefined) return null
  const x = team === 'away' ? PITCH_LENGTH - event.x : event.x
  return { x, y: event.y }
}

export function Pitch({
  project,
  selectedEventId,
  onSelect,
  className,
}: {
  project: Project
  selectedEventId?: string
  onSelect?: (eventId: string) => void
  className?: string
}): ReactNode {
  const [hovered, setHovered] = useState<string | null>(null)
  const homeId = project.teams.home.id

  const marks = project.events
    .filter((event) => event.type === 'shot' || event.type === 'goal')
    .map((event) => {
      const team: 'home' | 'away' = event.teamId === homeId ? 'home' : 'away'
      const point = displayPoint(event, team)
      if (!point) return null
      return { event, team, point }
    })
    .filter((mark): mark is NonNullable<typeof mark> => mark !== null)

  return (
    <div className={cx('surface overflow-hidden', className)}>
      <svg
        viewBox={`-6 -6 ${PITCH_LENGTH + 12} ${PITCH_WIDTH + 12}`}
        className="block w-full"
        role="group"
        aria-label={`Shot map for ${project.teams.home.name} vs ${project.teams.away.name}`}
      >
        <defs>
          <pattern id="turf" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#0B1A12" />
            <rect width="3" height="6" fill="#0D1F15" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={PITCH_LENGTH} height={PITCH_WIDTH} fill="url(#turf)" rx="1.5" />

        <g fill="none" stroke="rgba(232,238,244,0.28)" strokeWidth="0.45">
          <rect x="0" y="0" width={PITCH_LENGTH} height={PITCH_WIDTH} rx="1.5" />
          <line x1={PITCH_LENGTH / 2} y1="0" x2={PITCH_LENGTH / 2} y2={PITCH_WIDTH} />
          <circle cx={PITCH_LENGTH / 2} cy={PITCH_WIDTH / 2} r="9.15" />
          <circle cx={PITCH_LENGTH / 2} cy={PITCH_WIDTH / 2} r="0.7" fill="rgba(232,238,244,0.4)" />
          <path d={penaltyBox(0, 'left')} />
          <path d={penaltyBox(PITCH_LENGTH, 'right')} />
          <path d={sixYardBox(0, 'left')} />
          <path d={sixYardBox(PITCH_LENGTH, 'right')} />
          <circle cx="11" cy={PITCH_WIDTH / 2} r="0.55" fill="rgba(232,238,244,0.5)" />
          <circle cx={PITCH_LENGTH - 11} cy={PITCH_WIDTH / 2} r="0.55" fill="rgba(232,238,244,0.5)" />
          <path d={`M0 1.5a1.5 1.5 0 001.5-1.5`} />
          <path d={`M0 ${PITCH_WIDTH - 1.5}a1.5 1.5 0 011.5 1.5`} />
          <path d={`M${PITCH_LENGTH} 1.5a1.5 1.5 0 01-1.5-1.5`} />
          <path d={`M${PITCH_LENGTH} ${PITCH_WIDTH - 1.5}a1.5 1.5 0 00-1.5 1.5`} />
        </g>

        <text x="4" y="6" fill="rgba(232,238,244,0.32)" fontSize="3" fontFamily="ui-monospace, monospace">
          {project.teams.home.short} →
        </text>
        <text
          x={PITCH_LENGTH - 4}
          y="6"
          textAnchor="end"
          fill="rgba(232,238,244,0.32)"
          fontSize="3"
          fontFamily="ui-monospace, monospace"
        >
          ← {project.teams.away.short}
        </text>

        {marks.map(({ event, team, point }) => {
          const color = team === 'home' ? project.teams.home.color : project.teams.away.color
          const radius = 1.8 + Math.min(event.xg ?? 0.05, 0.9) * 9
          const selected = selectedEventId === event.id
          const active = hovered === event.id
          return (
            <g
              key={event.id}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${event.type === 'goal' ? 'Goal' : 'Shot'} by ${event.playerId ?? 'unknown'} at ${Math.floor(event.minute)} minutes, ${event.xg?.toFixed(2) ?? '0.00'} expected goals`}
              className={onSelect ? 'cursor-pointer' : undefined}
              onClick={() => onSelect?.(event.id)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                  keyEvent.preventDefault()
                  onSelect?.(event.id)
                }
              }}
              onMouseEnter={() => setHovered(event.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(event.id)}
              onBlur={() => setHovered(null)}
            >
              {selected || active ? (
                <circle cx={point.x} cy={point.y} r={radius + 2.2} fill="none" stroke="#E8EEF4" strokeWidth="0.6" />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={color}
                fillOpacity={event.type === 'goal' ? 0.95 : 0.42}
                stroke={color}
                strokeWidth={event.type === 'goal' ? 0.7 : 0.4}
              />
              {event.type === 'goal' ? (
                <circle cx={point.x} cy={point.y} r={radius * 0.32} fill="#07090C" />
              ) : null}
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="flex items-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: project.teams.home.color }} />
            {project.teams.home.short}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: project.teams.away.color }} />
            {project.teams.away.short}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-text/60" />
            Goal
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
          Circle size = xG · click a shot
        </p>
      </div>
    </div>
  )
}

export function TeamSwatch({ team, className }: { team: Team; className?: string }): ReactNode {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: team.color }} />
      <span className="text-sm text-text">{team.name}</span>
    </span>
  )
}
