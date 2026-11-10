'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { InsightCard } from '@/components/insight-card'
import { useToast } from '@/components/toast'
import { Badge, Button, ButtonLink, Card, EmptyState, Icon, SectionTitle, Skeleton } from '@/components/ui'
import { INSIGHT_STATUS_LABEL, INSIGHT_STATUS_TONE } from '@/lib/format'
import type { DisplayInsightStatus } from '@/lib/types'
import { useProject, useWorkspace } from '@/lib/use-store'

const STATUS_ORDER: DisplayInsightStatus[] = [
  'stale',
  'needs_evidence',
  'proposed',
  'edited',
  'accepted',
  'rejected',
]

const FILTERS: { id: 'all' | DisplayInsightStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  ...STATUS_ORDER.map((status) => ({ id: status, label: INSIGHT_STATUS_LABEL[status] })),
]

export default function ReviewPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const { project, insights, loaded } = useProject(id)
  const { store } = useWorkspace()
  const toast = useToast()

  const [filter, setFilter] = useState<'all' | DisplayInsightStatus>('all')
  const [sort, setSort] = useState<'risk' | 'recent'>('risk')

  const counts = useMemo(() => {
    const map = new Map<DisplayInsightStatus, number>()
    for (const status of STATUS_ORDER) map.set(status, 0)
    for (const insight of insights) map.set(insight.displayStatus, (map.get(insight.displayStatus) ?? 0) + 1)
    return map
  }, [insights])

  const visible = useMemo(() => {
    const list = filter === 'all' ? insights : insights.filter((insight) => insight.displayStatus === filter)
    return list.slice().sort((left, right) => {
      if (sort === 'recent') return left.updatedAt < right.updatedAt ? 1 : -1
      return (STATUS_ORDER.indexOf(left.displayStatus) ?? 9) - (STATUS_ORDER.indexOf(right.displayStatus) ?? 9)
    })
  }, [insights, filter, sort])

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        body="It may have been deleted in another tab. Open the library to see what is available."
        action={
          <Link href="/app/projects" className="text-sm font-medium text-accent hover:underline">
            Back to projects
          </Link>
        }
      />
    )
  }

  function act(kind: 'accept' | 'reject' | 'reopen', insightId: string): void {
    if (!project) return
    const result =
      kind === 'accept'
        ? store.acceptInsight(project.id, insightId)
        : kind === 'reject'
          ? store.rejectInsight(project.id, insightId)
          : store.reopenInsight(project.id, insightId)

    if (result.ok) {
      const label = kind === 'accept' ? 'accepted' : kind === 'reject' ? 'rejected' : 'reopened'
      toast.push({ title: `Insight ${label}`, detail: insightId, tone: 'success' })
    } else {
      toast.push({ title: 'Action blocked', detail: result.message, tone: 'error' })
    }
  }

  const acceptReady = insights.filter(
    (insight) => insight.displayStatus === 'proposed' && insight.resolves,
  )

  return (
    <div className="space-y-4">
      <header className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="warn">Review</Badge>
              <span className="text-xs text-muted">{project.competition}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">{project.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {project.insights.length} claims · {counts.get('accepted') ?? 0} accepted ·{' '}
              {counts.get('stale') ?? 0} stale · {counts.get('needs_evidence') ?? 0} waiting on evidence
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/app/p/${project.id}`} variant="secondary" size="sm">
              Studio
            </ButtonLink>
            <ButtonLink href={`/app/p/${project.id}/data`} variant="secondary" size="sm">
              Data
            </ButtonLink>
            <ButtonLink href={`/app/p/${project.id}/export`} size="sm">
              Export
            </ButtonLink>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(filter === status ? 'all' : status)}
              className={cx(
                'surface-2 px-3 py-2.5 text-left transition-colors',
                filter === status ? 'border-accent/50 bg-accent/5' : 'hover:border-[#2c3947]',
              )}
            >
              <p className="text-[10px] uppercase tracking-[0.12em] text-dim">{INSIGHT_STATUS_LABEL[status]}</p>
              <p className="mt-1 font-mono text-lg font-semibold text-text">{counts.get(status) ?? 0}</p>
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-[10px] border border-line bg-surface p-1">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                  className={cx(
                    'h-7 rounded-[7px] px-2.5 text-[11px] transition-colors',
                    filter === item.id ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="ml-auto inline-flex items-center gap-2 text-xs text-muted">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as 'risk' | 'recent')}
                className="h-8 rounded-[10px] border border-line bg-surface px-2 text-xs text-text focus:border-accent/60 focus:outline-none"
              >
                <option value="risk">Risk first</option>
                <option value="recent">Most recently updated</option>
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title="Nothing in this filter"
              body="Choose another status, or accept a proposed claim to move it forward."
              action={
                <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
                  Show all insights
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {visible.map((insight) => (
                <div key={insight.id} id={insight.id} className="scroll-mt-24">
                  <InsightCard
                    insight={insight}
                    onSeek={(tUs, eventId) => {
                      window.location.href = `/app/p/${project.id}?t=${tUs}&event=${eventId}`
                    }}
                    onAccept={() => act('accept', insight.id)}
                    onReject={() => act('reject', insight.id)}
                    onEdit={(claim) => {
                      const result = store.editInsight(project.id, insight.id, claim)
                      if (result.ok) {
                        toast.push({ title: 'Claim edited', detail: insight.id, tone: 'success' })
                      } else {
                        toast.push({ title: 'Edit blocked', detail: result.message, tone: 'error' })
                      }
                    }}
                    onFlag={(limitation) => {
                      const result = store.flagInsight(project.id, insight.id, limitation)
                      if (result.ok) {
                        toast.push({ title: 'Flagged for evidence', detail: insight.id, tone: 'success' })
                      } else {
                        toast.push({ title: 'Flag blocked', detail: result.message, tone: 'error' })
                      }
                    }}
                    onReopen={() => act('reopen', insight.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionTitle eyebrow="Rules" title="What can move" />
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted">
              <li className="flex gap-2">
                <span className="text-accent">→</span> Proposed can be accepted only with at least one
                resolving evidence reference.
              </li>
              <li className="flex gap-2">
                <span className="text-accent">→</span> Accepting re-baselines the evidence hash to what the
                reviewer saw.
              </li>
              <li className="flex gap-2">
                <span className="text-accent">→</span> Stale means the hash, a reference or a timestamp no
                longer matches. Reopen and accept to fix.
              </li>
              <li className="flex gap-2">
                <span className="text-accent">→</span> Rejected is terminal until explicitly reopened.
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((status) => (
                <Badge key={status} tone={INSIGHT_STATUS_TONE[status]}>
                  {INSIGHT_STATUS_LABEL[status]}
                </Badge>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Batch" title="Accept the safe ones" />
            <p className="mt-2 text-xs leading-5 text-muted">
              {acceptReady.length === 0
                ? 'No proposed claim currently has resolving evidence.'
                : `${acceptReady.length} proposed claim${acceptReady.length === 1 ? '' : 's'} have resolving evidence and can be accepted.`}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3 w-full"
              disabled={acceptReady.length === 0}
              onClick={() => {
                let accepted = 0
                let failed = 0
                for (const insight of acceptReady) {
                  const result = store.acceptInsight(project.id, insight.id)
                  if (result.ok) accepted += 1
                  else failed += 1
                }
                toast.push({
                  title: `${accepted} insight${accepted === 1 ? '' : 's'} accepted`,
                  detail: failed > 0 ? `${failed} could not be accepted.` : 'Evidence hash re-baselined.',
                  tone: failed > 0 ? 'error' : 'success',
                })
              }}
            >
              <Icon name="check" className="h-3.5 w-3.5" /> Accept {acceptReady.length} safe claim
              {acceptReady.length === 1 ? '' : 's'}
            </Button>
          </Card>

          <Card>
            <SectionTitle eyebrow="Next" title="Export readiness" />
            <div className="mt-3 space-y-2 text-xs">
              <Row label="Accepted" value={counts.get('accepted') ?? 0} tone="text-green" />
              <Row label="Stale (blocks)" value={counts.get('stale') ?? 0} tone="text-amber" />
              <Row label="Dangling refs" value={insights.reduce((sum, insight) => sum + insight.staleReasons.filter((reason) => reason.includes('no longer exists')).length, 0)} tone="text-red" />
            </div>
            <ButtonLink href={`/app/p/${project.id}/export`} variant="secondary" size="sm" className="mt-4 w-full">
              Open export preflight
            </ButtonLink>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value, tone }: { label: string; value: number; tone: string }): ReactNode {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={cx('font-mono', tone)}>{value}</span>
    </div>
  )
}
