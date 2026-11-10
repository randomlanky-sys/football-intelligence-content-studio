'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState, type ReactNode } from 'react'
import { validatePostRender } from '@fics/export-engine'
import { cx } from '@fics/ui'
import { ContentPackPanel } from '@/components/content-pack-panel'
import { PreflightChecklist } from '@/components/preflight-checklist'
import { textareaClass } from '@/components/styles'
import { useToast } from '@/components/toast'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Icon,
  SectionTitle,
  Skeleton,
} from '@/components/ui'
import { downloadText, slugForFile } from '@/lib/clipboard'
import { buildContentPack, ContentPackError, renderContentPackMarkdown } from '@/lib/content-pack'
import { formatDateTime } from '@/lib/format'
import { buildPreflight, EXPORT_PRESETS } from '@/lib/preflight'
import type { ContentPack, ExportPreset } from '@/lib/types'
import { useProject, useWorkspace } from '@/lib/use-store'

export default function ExportPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const { project, loaded } = useProject(id)
  const { store } = useWorkspace()
  const toast = useToast()

  const [preset, setPreset] = useState<ExportPreset>('vertical_1080')
  const [pack, setPack] = useState<ContentPack | null>(null)
  const [error, setError] = useState<string | null>(null)

  const report = useMemo(() => (project ? buildPreflight(project, preset) : null), [project, preset])

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-32" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (!project || !report) {
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

  const qcPassed = validatePostRender({
    hasValidTimestamps:
      project.durationUs > 0 && project.events.every((event) => event.tUs >= 0 && event.tUs <= project.durationUs),
    durationUs: project.durationUs,
    qcIssues: report.rows.filter((row) => row.status === 'fail').length,
  })

  function generate(): void {
    if (!project) return
    try {
      const next = buildContentPack(project)
      setPack(next)
      setError(null)
      const result = store.recordExport(project.id, preset, next, report?.ok ?? false)
      if (!result.ok) {
        toast.push({ title: 'Pack built but not recorded', detail: result.message, tone: 'error' })
        return
      }
      toast.push({
        title: 'Content pack built',
        detail: `${next.acceptedInsightIds.length} evidence-backed claims · ${preset}`,
        tone: 'success',
      })
    } catch (caught) {
      const message =
        caught instanceof ContentPackError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'The pack could not be built.'
      setError(message)
      setPack(null)
      toast.push({ title: 'Pack blocked', detail: message, tone: 'error' })
    }
  }

  const latest = project.exports.slice().reverse()

  return (
    <div className="space-y-4">
      <header className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={report.ok ? 'success' : 'danger'}>
                {report.ok ? 'Preflight clear' : 'Preflight blocked'}
              </Badge>
              <span className="text-xs text-muted">{project.competition}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">{project.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {report.acceptedCount} accepted · {report.staleCount} stale · {report.danglingCount} dangling
              references · {project.clips.length} clips
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/app/p/${project.id}`} variant="secondary" size="sm">
              Studio
            </ButtonLink>
            <ButtonLink href={`/app/p/${project.id}/review`} variant="secondary" size="sm">
              Review
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <PreflightChecklist report={report} />

          <Card>
            <SectionTitle eyebrow="Preset" title="Choose the output shape" />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {EXPORT_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPreset(item.id)
                    setPack(null)
                    setError(null)
                  }}
                  aria-pressed={preset === item.id}
                  className={cx(
                    'rounded-[10px] border p-3 text-left transition-colors',
                    preset === item.id
                      ? 'border-accent/50 bg-accent/10'
                      : 'border-line bg-surface-2 hover:border-[#2c3947]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cx('text-sm font-medium', preset === item.id ? 'text-accent' : 'text-text')}>
                      {item.label}
                    </span>
                    {preset === item.id ? <Icon name="check" className="h-3.5 w-3.5 text-accent" /> : null}
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted">{item.hint}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={generate} disabled={!report.ok}>
                <Icon name="spark" className="h-4 w-4" />
                Build content pack
              </Button>
              {!report.ok ? (
                <p className="text-xs text-amber">
                  Fix the blocking rules above first. Every rule links to the screen that fixes it.
                </p>
              ) : (
                <p className="text-xs text-muted">Deterministic output — the same project always builds the same pack.</p>
              )}
            </div>

            {error ? (
              <p className="mt-3 rounded-[10px] border border-red/30 bg-red/5 px-3 py-2 text-xs leading-5 text-red">
                {error}
              </p>
            ) : null}
          </Card>

          {pack ? (
            <ContentPackPanel pack={pack} qcPassed={qcPassed} filenamePrefix={`${project.name}-${preset}`} />
          ) : (
            <Card>
              <SectionTitle eyebrow="Output" title="Nothing built yet" />
              <p className="mt-2 text-sm leading-6 text-muted">
                The pack includes a match summary, what decided it, a tactical read, the clip list, three
                captions, hashtags, a thumbnail brief and a full evidence ledger.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {['Summary', 'Tactical read', 'Evidence ledger'].map((item) => (
                  <div key={item} className="surface-2 px-3 py-2 text-xs text-dim">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionTitle eyebrow="QC" title="Quality gate" />
            <ul className="mt-3 space-y-2 text-xs">
              <QcRow label="Timestamps inside duration" pass={qcPassed || project.events.length === 0} />
              <QcRow label="Duration positive" pass={project.durationUs > 0} />
              <QcRow label="Accepted claims present" pass={report.acceptedCount > 0} />
              <QcRow label="No stale evidence" pass={report.staleCount === 0} />
              <QcRow label="References resolve" pass={report.danglingCount === 0} />
            </ul>
            <p className="mt-3 text-[11px] leading-5 text-dim">
              QC is evaluated at build time. A pack recorded with a failed gate is marked in the history
              below and should not be published.
            </p>
          </Card>

          <Card>
            <SectionTitle
              eyebrow="History"
              title="Export records"
              action={<Badge tone="neutral">{project.exports.length}/20</Badge>}
            />
            {latest.length === 0 ? (
              <p className="mt-3 text-xs leading-5 text-muted">No exports recorded yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {latest.slice(0, 6).map((record) => (
                  <li key={record.id} className="surface-2 p-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={record.qcPassed ? 'success' : 'danger'}>
                        {record.qcPassed ? 'QC pass' : 'QC fail'}
                      </Badge>
                      <span className="font-mono text-[10px] text-dim">{record.preset}</span>
                      <span className="ml-auto text-[10px] text-dim">{formatDateTime(record.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-xs text-muted">{record.pack.title}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          downloadText(
                            `${slugForFile(record.pack.title)}.md`,
                            renderContentPackMarkdown(record.pack),
                            'text/markdown',
                          )
                        }
                        className="text-[11px] text-accent hover:underline"
                      >
                        .md
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadText(
                            `${slugForFile(record.pack.title)}.json`,
                            JSON.stringify(record.pack, null, 2),
                            'application/json',
                          )
                        }
                        className="text-[11px] text-accent hover:underline"
                      >
                        .json
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle eyebrow="Copy" title="What ships" />
            <pre className={cx(textareaClass, 'mt-3 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px]')}>
              {`# ${project.name}\n\n- ${report.acceptedCount} accepted claims\n- ${project.clips.length} clips\n- ${project.events.length} events\n- preset: ${preset}\n- gate: ${report.ok ? 'clear' : 'blocked'}`}
            </pre>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function QcRow({ label, pass }: { label: string; pass: boolean }): ReactNode {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <Badge tone={pass ? 'success' : 'danger'}>{pass ? 'pass' : 'fail'}</Badge>
    </li>
  )
}
