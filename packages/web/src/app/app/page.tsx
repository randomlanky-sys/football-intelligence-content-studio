'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { MomentumChart, SplitBar } from '@/components/charts'
import { Badge, ButtonLink, Card, EmptyState, Icon, SectionTitle, Skeleton, StatCard } from '@/components/ui'
import { DEMO_MOMENTUM } from '@/lib/demo-data'
import { INSIGHT_STATUS_LABEL, INSIGHT_STATUS_TONE, formatDate, pluralize } from '@/lib/format'
import { controlIndex, xgTotals } from '@/lib/stats'
import type { Project, ResolvedInsight } from '@/lib/types'
import { useWorkspace } from '@/lib/use-store'

type Lens = 'analyst' | 'editor' | 'producer'

const LENSES: { id: Lens; label: string; line: string }[] = [
  { id: 'analyst', label: 'Analyst', line: 'What the match is telling us' },
  { id: 'editor', label: 'Editor', line: 'What is safe to publish' },
  { id: 'producer', label: 'Producer', line: 'What ships next' },
]

const RISK_ORDER: Record<string, number> = {
  stale: 0,
  needs_evidence: 1,
  proposed: 2,
  edited: 3,
  accepted: 4,
  rejected: 5,
}

export default function OverviewPage() {
  const { projects, loaded, readOnly, store } = useWorkspace()
  const [lens, setLens] = useState<Lens>('editor')

  const rows = useMemo(() => {
    return projects.map((project) => ({
      project,
      insights: store.getResolvedInsights(project.id),
    }))
  }, [projects, store])

  const totals = useMemo(() => {
    const all = rows.flatMap((row) => row.insights)
    return {
      projects: projects.filter((project) => project.state !== 'archived').length,
      accepted: all.filter((insight) => insight.displayStatus === 'accepted' || insight.displayStatus === 'edited').length,
      stale: all.filter((insight) => insight.displayStatus === 'stale').length,
      proposed: all.filter((insight) => insight.displayStatus === 'proposed').length,
      needsEvidence: all.filter((insight) => insight.displayStatus === 'needs_evidence').length,
      clips: projects.reduce((sum, project) => sum + project.clips.length, 0),
      events: projects.reduce((sum, project) => sum + project.events.length, 0),
    }
  }, [projects, rows])

  const queue = useMemo(() => {
    const items: { project: Project; insight: ResolvedInsight }[] = []
    for (const row of rows) {
      for (const insight of row.insights) {
        if (
          insight.displayStatus === 'stale' ||
          insight.displayStatus === 'needs_evidence' ||
          insight.displayStatus === 'proposed'
        ) {
          items.push({ project: row.project, insight })
        }
      }
    }
    return items
      .sort((left, right) => {
        const risk = (RISK_ORDER[left.insight.displayStatus] ?? 9) - (RISK_ORDER[right.insight.displayStatus] ?? 9)
        if (risk !== 0) return risk
        return left.project.name.localeCompare(right.project.name)
      })
      .slice(0, 8)
  }, [rows])

  const featured = useMemo(() => {
    const demo = projects.find((project) => project.id === 'demo-atl-hvu')
    return demo ?? projects.find((project) => project.state !== 'archived') ?? projects[0]
  }, [projects])

  const storageBytes = loaded ? store.storageBytes() : 0

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label mb-1.5">Workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            {readOnly
              ? 'Read-only workspace — a newer build owns this data.'
              : `${pluralize(totals.projects, 'active project')} · ${pluralize(totals.events, 'tagged event')} · ${pluralize(totals.clips, 'clip')}`}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Role lens"
          className="inline-flex rounded-[10px] border border-line bg-surface p-1"
        >
          {LENSES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={lens === item.id}
              onClick={() => setLens(item.id)}
              className={cx(
                'h-8 rounded-[7px] px-3 text-xs font-medium transition-colors',
                lens === item.id ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <p className="-mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
        {LENSES.find((item) => item.id === lens)?.line}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {lens === 'analyst' ? (
          <>
            <StatCard label="Tagged events" value={totals.events} hint="Across every project" tone="data" />
            <StatCard label="Accepted claims" value={totals.accepted} hint="Evidence-backed and reviewed" tone="success" />
            <StatCard label="Open questions" value={totals.proposed + totals.needsEvidence} hint="Proposed or waiting on evidence" tone="warn" />
            <StatCard label="Clips saved" value={totals.clips} hint="Ready to cut or cite" />
          </>
        ) : lens === 'editor' ? (
          <>
            <StatCard label="Stale evidence" value={totals.stale} hint="Blocking export until reopened" tone={totals.stale > 0 ? 'danger' : 'success'} />
            <StatCard label="Needs evidence" value={totals.needsEvidence} hint="Claims a reviewer flagged" tone={totals.needsEvidence > 0 ? 'warn' : 'neutral'} />
            <StatCard label="Awaiting review" value={totals.proposed} hint="Proposed claims, no decision yet" />
            <StatCard label="Accepted claims" value={totals.accepted} hint="Safe to enter a pack" tone="success" />
          </>
        ) : (
          <>
            <StatCard label="Projects" value={totals.projects} hint="Excluding archived" />
            <StatCard label="Ready to export" value={rows.filter((row) => row.project.state === 'review' || row.project.state === 'active').length} hint="Active or in review" tone="accent" />
            <StatCard label="Exported" value={projects.reduce((sum, project) => sum + project.exports.length, 0)} hint="Pack records, capped at 20 per project" />
            <StatCard label="Storage used" value={`${Math.max(1, Math.round(storageBytes / 1024))} KB`} hint="Local to this browser" />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
            <div>
              <p className="label">Momentum</p>
              <p className="mt-0.5 text-sm font-medium text-text">
                {featured ? featured.name : 'No project selected'}
              </p>
            </div>
            {featured ? (
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{featured.competition}</Badge>
                <Badge tone="accent">{formatDate(featured.date)}</Badge>
              </div>
            ) : null}
          </div>

          {featured ? (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="label">Score</p>
                  <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-text">
                    {featured.score.home}
                    <span className="mx-2 text-dim">–</span>
                    {featured.score.away}
                  </p>
                </div>
                <div className="min-w-[180px] flex-1">
                  <SplitBar
                    home={featured.possession.home}
                    away={featured.possession.away}
                    homeLabel={featured.teams.home.short}
                    awayLabel={featured.teams.away.short}
                  />
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="label">xG</p>
                    <p className="mt-1 font-mono text-sm text-text">
                      {xgTotals(featured).home.toFixed(2)} – {xgTotals(featured).away.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="label">Control</p>
                    <p className="mt-1 font-mono text-sm text-text">{controlIndex(featured)}/100</p>
                  </div>
                </div>
              </div>

              <MomentumChart
                values={DEMO_MOMENTUM}
                homeLabel={featured.teams.home.short}
                awayLabel={featured.teams.away.short}
              />

              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/app/p/${featured.id}`} size="sm" variant="primary">
                  Open studio
                </ButtonLink>
                <ButtonLink href={`/app/p/${featured.id}/review`} size="sm" variant="secondary">
                  Review {featured.insights.length}
                </ButtonLink>
                <ButtonLink href={`/app/p/${featured.id}/export`} size="sm" variant="ghost">
                  Export
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No projects yet"
                body="Create a project from the library, or open the demo match to see the full workflow."
                action={<ButtonLink href="/app/projects">Go to projects</ButtonLink>}
              />
            </div>
          )}
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div>
              <p className="label">Review queue</p>
              <p className="mt-0.5 text-sm font-medium text-text">Highest risk first</p>
            </div>
            <Badge tone={queue.length > 0 ? 'warn' : 'success'}>{queue.length} open</Badge>
          </div>

          {queue.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Queue is clear"
                body="No proposed, flagged or stale claims. Accepted claims are ready for export."
                action={<ButtonLink href={`/app/p/${featured?.id ?? 'demo-atl-hvu'}/export`} size="sm">Open export</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {queue.map(({ project, insight }) => (
                <li key={`${project.id}-${insight.id}`}>
                  <Link
                    href={`/app/p/${project.id}/review#${insight.id}`}
                    className="block px-5 py-3 transition-colors hover:bg-surface-2/60"
                  >
                    <div className="flex items-center gap-2">
                      <Badge tone={INSIGHT_STATUS_TONE[insight.displayStatus]}>
                        {INSIGHT_STATUS_LABEL[insight.displayStatus]}
                      </Badge>
                      <span className="truncate text-[11px] text-dim">{project.name}</span>
                      <span className="ml-auto font-mono text-[10px] text-dim">{insight.id}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{insight.claim}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <section>
        <SectionTitle
          eyebrow="Library"
          title="Recent projects"
          action={
            <Link href="/app/projects" className="text-xs font-medium text-accent hover:underline">
              All projects →
            </Link>
          }
        />
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <MiniProject key={project.id} project={project} insights={store.getResolvedInsights(project.id)} />
          ))}
          <Link
            href="/app/projects#new"
            className="surface flex min-h-[132px] flex-col items-center justify-center gap-2 border-dashed p-5 text-center transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface-2 text-muted">
              <Icon name="plus" className="h-4 w-4" />
            </span>
            <span className="text-sm text-text">New project</span>
            <span className="text-xs text-dim">Start from an empty sheet</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

function MiniProject({ project, insights }: { project: Project; insights: ResolvedInsight[] }): ReactNode {
  const accepted = insights.filter(
    (insight) => insight.displayStatus === 'accepted' || insight.displayStatus === 'edited',
  ).length

  return (
    <Link
      href={`/app/p/${project.id}`}
      className="surface flex flex-col p-4 transition-colors hover:border-[#2c3947]"
    >
      <div className="flex items-center gap-2">
        {project.origin === 'demo' ? <Badge tone="accent">Demo</Badge> : <Badge tone="neutral">{project.state}</Badge>}
        <span className="ml-auto text-[11px] text-dim">{formatDate(project.date)}</span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-text">{project.name}</p>
      <p className="truncate text-[11px] text-muted">{project.competition}</p>
      <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-dim">
        <span className="font-mono">
          {project.score.home}–{project.score.away}
        </span>
        <span>{accepted} accepted</span>
        <span>{project.events.length} events</span>
      </div>
    </Link>
  )
}
