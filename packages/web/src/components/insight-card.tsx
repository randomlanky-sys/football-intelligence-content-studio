'use client'

import { useState, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import {
  INSIGHT_STATUS_LABEL,
  INSIGHT_STATUS_TONE,
  formatDateTime,
  timecode,
} from '@/lib/format'
import type { ResolvedInsight } from '@/lib/types'
import { Badge, Button, Icon } from './ui'
import { textareaClass } from './styles'

export function InsightCard({
  insight,
  onSeek,
  onAccept,
  onReject,
  onEdit,
  onFlag,
  onReopen,
  readOnly = false,
}: {
  insight: ResolvedInsight
  onSeek?: (tUs: number, eventId: string) => void
  onAccept: () => void
  onReject: () => void
  onEdit: (claim: string) => void
  onFlag: (limitation: string) => void
  onReopen: () => void
  readOnly?: boolean
}): ReactNode {
  const [mode, setMode] = useState<'idle' | 'edit' | 'flag'>('idle')
  const [draft, setDraft] = useState(insight.claim)
  const [limitation, setLimitation] = useState(insight.limitations ?? '')
  const status = insight.displayStatus

  return (
    <article className="surface p-4" data-testid={`insight-${insight.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={INSIGHT_STATUS_TONE[status]}>{INSIGHT_STATUS_LABEL[status]}</Badge>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
          {insight.id}
        </span>
        <span className="ml-auto text-[11px] text-dim">{formatDateTime(insight.updatedAt)}</span>
      </div>

      {mode === 'edit' ? (
        <div className="mt-3">
          <label htmlFor={`claim-${insight.id}`} className="mb-1 block text-xs text-muted">
            Rewrite the claim (1–280 characters)
          </label>
          <textarea
            id={`claim-${insight.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            className={textareaClass}
            maxLength={280}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onEdit(draft)
                setMode('idle')
              }}
              disabled={draft.trim().length === 0}
            >
              Save edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMode('idle')}>
              Cancel
            </Button>
            <span className="ml-auto text-[11px] text-dim">{draft.length}/280</span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-text">{insight.claim}</p>
      )}

      {insight.limitations && mode !== 'flag' ? (
        <p className="mt-3 rounded-[10px] border border-amber/25 bg-amber/5 px-3 py-2 text-xs leading-5 text-amber">
          Limitation: {insight.limitations}
        </p>
      ) : null}

      {insight.staleReasons.length > 0 ? (
        <ul className="mt-3 space-y-1 rounded-[10px] border border-red/25 bg-red/5 px-3 py-2 text-xs leading-5 text-red">
          {insight.staleReasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {insight.evidence.map((reference) => (
          <button
            key={`${reference.eventId}-${reference.tUs}`}
            type="button"
            onClick={() => onSeek?.(reference.tUs, reference.eventId)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition-colors',
              insight.resolves
                ? 'border-line bg-surface-2 text-muted hover:border-cyan/40 hover:text-cyan'
                : 'border-red/40 bg-red/10 text-red',
            )}
            title={reference.label}
          >
            <Icon name="clock" className="h-3 w-3" />
            <span className="font-mono">{timecode(reference.tUs)}</span>
            <span className="max-w-[150px] truncate">{reference.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="font-mono text-[10px] text-dim" title={insight.evidenceHash}>
          hash {insight.evidenceHash.slice(0, 12)}…
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {mode === 'flag' ? (
            <>
              <input
                value={limitation}
                onChange={(event) => setLimitation(event.target.value)}
                placeholder="What evidence is missing?"
                className="h-8 w-56 rounded-[10px] border border-line bg-surface px-2 text-xs text-text placeholder:text-dim focus:border-amber/60 focus:outline-none"
                aria-label="Evidence limitation"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onFlag(limitation)
                  setMode('idle')
                }}
              >
                Flag
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('idle')}>
                Cancel
              </Button>
            </>
          ) : status === 'proposed' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onAccept}
                disabled={readOnly || !insight.resolves}
                title={insight.resolves ? 'Accept with evidence' : 'Add resolving evidence first'}
              >
                Accept
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setMode('edit')} disabled={readOnly}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('flag')} disabled={readOnly}>
                Flag for evidence
              </Button>
              <Button variant="danger" size="sm" onClick={onReject} disabled={readOnly}>
                Reject
              </Button>
            </>
          ) : status === 'needs_evidence' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onAccept}
                disabled={readOnly || !insight.resolves}
              >
                Accept
              </Button>
              <Button variant="danger" size="sm" onClick={onReject} disabled={readOnly}>
                Reject
              </Button>
            </>
          ) : status === 'accepted' || status === 'edited' ? (
            <Button variant="secondary" size="sm" onClick={onReopen} disabled={readOnly}>
              Reopen
            </Button>
          ) : status === 'stale' ? (
            <Button variant="primary" size="sm" onClick={onReopen} disabled={readOnly}>
              Reopen to fix evidence
            </Button>
          ) : (
            <span className="text-[11px] text-dim">Rejected claims never enter a content pack.</span>
          )}
        </div>
      </div>
    </article>
  )
}
