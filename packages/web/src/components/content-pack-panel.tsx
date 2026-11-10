'use client'

import type { ReactNode } from 'react'
import { formatDateTime } from '@/lib/format'
import type { ContentPack } from '@/lib/types'
import { copyText, downloadText, slugForFile } from '@/lib/clipboard'
import { renderContentPackMarkdown } from '@/lib/content-pack'
import { Badge, Button, Icon } from './ui'
import { useToast } from './toast'

export function ContentPackPanel({
  pack,
  qcPassed,
  filenamePrefix,
}: {
  pack: ContentPack
  qcPassed: boolean
  filenamePrefix: string
}): ReactNode {
  const toast = useToast()
  const base = slugForFile(filenamePrefix)

  async function copy(label: string, text: string): Promise<void> {
    const ok = await copyText(text)
    toast.push({
      title: ok ? `${label} copied` : 'Copy failed',
      detail: ok ? undefined : 'Your browser blocked clipboard access. Select the text and copy manually.',
      tone: ok ? 'success' : 'error',
    })
  }

  return (
    <section className="space-y-4" aria-label="Generated content pack">
      <div className="surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={qcPassed ? 'success' : 'danger'}>{qcPassed ? 'QC passed' : 'QC failed'}</Badge>
          <Badge tone="data">{pack.acceptedInsightIds.length} evidence-backed claims</Badge>
          <span className="ml-auto text-[11px] text-dim">Generated {formatDateTime(pack.generatedAt)}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-text">{pack.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{pack.hook}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => downloadText(`${base}.md`, renderContentPackMarkdown(pack), 'text/markdown')}
          >
            <Icon name="download" className="h-3.5 w-3.5" /> Download .md
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadText(`${base}.json`, JSON.stringify(pack, null, 2), 'application/json')}
          >
            <Icon name="download" className="h-3.5 w-3.5" /> Download .json
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void copy('Whole pack', renderContentPackMarkdown(pack))}>
            <Icon name="copy" className="h-3.5 w-3.5" /> Copy all
          </Button>
        </div>
      </div>

      {pack.sections.map((section) => (
        <article key={section.id} className="surface p-4" data-testid={`pack-section-${section.id}`}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-text">{section.heading}</h4>
            <Button variant="ghost" size="sm" onClick={() => void copy(section.heading, section.body)}>
              <Icon name="copy" className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{section.body}</p>
        </article>
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="surface p-4">
          <h4 className="text-sm font-semibold text-text">Captions</h4>
          <ul className="mt-2 space-y-2">
            {pack.captions.map((caption, index) => (
              <li key={index} className="surface-2 flex items-start gap-2 p-2.5">
                <p className="flex-1 text-xs leading-5 text-muted">{caption}</p>
                <Button variant="ghost" size="sm" onClick={() => void copy('Caption', caption)} aria-label={`Copy caption ${index + 1}`}>
                  <Icon name="copy" className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[11px] text-cyan">{pack.hashtags.join(' ')}</p>
        </article>

        <article className="surface p-4">
          <h4 className="text-sm font-semibold text-text">Thumbnail brief</h4>
          <p className="mt-2 text-xs leading-5 text-muted">{pack.thumbnailBrief}</p>
          <h4 className="mt-4 text-sm font-semibold text-text">Evidence ledger</h4>
          <ul className="mt-2 space-y-1.5">
            {pack.evidenceSummary.map((line) => (
              <li key={line} className="text-xs leading-5 text-dim">
                {line}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
