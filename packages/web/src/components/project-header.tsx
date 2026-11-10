'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatDate, timecode } from '@/lib/format'
import type { Project, ResolvedInsight } from '@/lib/types'
import { xgTotals } from '@/lib/stats'
import { SplitBar } from './charts'
import { Badge, ButtonLink, Icon } from './ui'

export function ProjectHeader({
  project,
  insights,
  active = 'studio',
}: {
  project: Project
  insights: ResolvedInsight[]
  active?: 'studio' | 'data' | 'review' | 'export'
}): ReactNode {
  const xg = xgTotals(project)
  const accepted = insights.filter(
    (insight) => insight.displayStatus === 'accepted' || insight.displayStatus === 'edited',
  ).length

  return (
    <header className="surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        {project.origin === 'demo' ? <Badge tone="accent">Demo match</Badge> : <Badge tone="data">Your project</Badge>}
        <span className="text-xs text-muted">{project.competition}</span>
        <span className="text-xs text-dim">· {formatDate(project.date)}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <Badge tone={project.state === 'review' ? 'warn' : project.state === 'exported' ? 'success' : 'neutral'}>
            {project.state}
          </Badge>
        </span>
      </div>

      <div className="grid gap-4 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3 md:justify-end md:text-right">
          <div className="order-2 md:order-1">
            <p className="text-base font-semibold text-text">{project.teams.home.name}</p>
            <p className="text-xs text-dim">{project.teams.home.formation} · home</p>
          </div>
          <span
            className="order-1 h-8 w-1.5 rounded-full md:order-2"
            style={{ background: project.teams.home.color }}
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-3xl font-semibold tabular-nums text-text">{project.score.home}</span>
          <span className="text-sm text-dim">–</span>
          <span className="font-mono text-3xl font-semibold tabular-nums text-text">{project.score.away}</span>
          <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-dim sm:block">
            {timecode(project.durationUs)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full" style={{ background: project.teams.away.color }} />
          <div>
            <p className="text-base font-semibold text-text">{project.teams.away.name}</p>
            <p className="text-xs text-dim">{project.teams.away.formation} · away</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-line px-4 py-3 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
        <SplitBar
          home={project.possession.home}
          away={project.possession.away}
          homeLabel={project.teams.home.short}
          awayLabel={project.teams.away.short}
        />
        <div className="flex items-center gap-5 text-xs text-muted">
          <span>
            xG <span className="font-mono text-text">{xg.home.toFixed(2)}</span>
          </span>
          <span>
            xG <span className="font-mono text-text">{xg.away.toFixed(2)}</span>
          </span>
          <span>
            <span className="font-mono text-text">{project.events.length}</span> events
          </span>
          <span>
            <span className="font-mono text-text">{accepted}</span> accepted
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <NavPill href={`/app/p/${project.id}`} active={active === 'studio'} icon="film" label="Studio" />
          <NavPill href={`/app/p/${project.id}/data`} active={active === 'data'} icon="grid" label="Data" />
          <NavPill href={`/app/p/${project.id}/review`} active={active === 'review'} icon="shield" label="Review" />
          <NavPill href={`/app/p/${project.id}/export`} active={active === 'export'} icon="download" label="Export" />
        </div>
      </div>
    </header>
  )
}

function NavPill({
  href,
  active,
  icon,
  label,
}: {
  href: string
  active: boolean
  icon: 'film' | 'grid' | 'shield' | 'download'
  label: string
}): ReactNode {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'inline-flex h-8 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 text-xs font-medium text-accent'
          : 'inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 text-xs text-muted transition-colors hover:text-text'
      }
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
    </Link>
  )
}

export function ProjectCard({
  project,
  accepted,
  proposed,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  project: Project
  accepted: number
  proposed: number
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
}): ReactNode {
  return (
    <article className="surface flex flex-col p-4 transition-colors duration-120 hover:border-[#2c3947]">
      <div className="flex items-center gap-2">
        {project.origin === 'demo' ? <Badge tone="accent">Demo</Badge> : <Badge tone="neutral">{project.state}</Badge>}
        <span className="ml-auto text-[11px] text-dim">{formatDate(project.date)}</span>
      </div>

      <h3 className="mt-2 text-base font-semibold leading-6 text-text">{project.name}</h3>
      <p className="mt-0.5 text-xs text-muted">{project.competition}</p>

      <div className="mt-3 flex items-center gap-2 font-mono text-sm">
        <span style={{ color: project.teams.home.color }}>{project.teams.home.short}</span>
        <span className="text-text">
          {project.score.home}–{project.score.away}
        </span>
        <span style={{ color: project.teams.away.color }}>{project.teams.away.short}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-dim">
        <span>{project.events.length} events</span>
        <span>{accepted} accepted</span>
        <span>{proposed} proposed</span>
        <span>{project.clips.length} clips</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        <ButtonLink href={`/app/p/${project.id}`} size="sm" variant="primary">
          Open studio
        </ButtonLink>
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-[10px] px-2 py-1.5 text-xs text-muted hover:bg-surface-2 hover:text-text"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="rounded-[10px] px-2 py-1.5 text-xs text-muted hover:bg-surface-2 hover:text-text"
          disabled={project.state === 'archived'}
        >
          Archive
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto rounded-[10px] px-2 py-1.5 text-xs text-red/80 hover:bg-red/10 hover:text-red"
        >
          Delete
        </button>
      </div>
    </article>
  )
}
