'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cx } from '@fics/ui'
import type { PreflightReport } from '@/lib/preflight'
import { Badge, Icon } from './ui'

export function PreflightChecklist({ report }: { report: PreflightReport }): ReactNode {
  const blocks = report.rows.filter((row) => row.status === 'fail').length
  const warns = report.rows.filter((row) => row.status === 'warn').length

  return (
    <section className="surface overflow-hidden" aria-label="Export preflight">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="label">Preflight</span>
          <Badge tone={report.ok ? 'success' : 'danger'}>
            {report.ok ? 'Ready' : `${blocks} blocking`}
          </Badge>
          {warns > 0 ? <Badge tone="warn">{warns} warning</Badge> : null}
        </div>
        <p className="text-[11px] text-dim">
          {report.acceptedCount} accepted · {report.staleCount} stale · {report.danglingCount} dangling
        </p>
      </div>

      <ul className="divide-y divide-line">
        {report.rows.map((row) => (
          <li key={row.id} className="flex items-start gap-3 px-4 py-3">
            <span
              className={cx(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                row.status === 'pass' && 'border-green/40 bg-green/10 text-green',
                row.status === 'warn' && 'border-amber/40 bg-amber/10 text-amber',
                row.status === 'fail' && 'border-red/40 bg-red/10 text-red',
              )}
            >
              <Icon
                name={row.status === 'pass' ? 'check' : row.status === 'warn' ? 'alert' : 'x'}
                className="h-3 w-3"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text">{row.label}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">{row.detail}</p>
            </div>
            {row.fixHref ? (
              <Link
                href={row.fixHref}
                className="shrink-0 text-xs font-medium text-accent hover:underline"
              >
                {row.fixLabel ?? 'Fix'} →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
