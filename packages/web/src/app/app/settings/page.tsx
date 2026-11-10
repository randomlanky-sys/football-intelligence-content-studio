'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { cx, formatBytes } from '@fics/ui'
import { useToast } from '@/components/toast'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  FieldLabel,
  Icon,
  SectionTitle,
  Skeleton,
} from '@/components/ui'
import { downloadText } from '@/lib/clipboard'
import { STORAGE_KEY } from '@/lib/schema'
import { useWorkspace } from '@/lib/use-store'

interface PendingImport {
  raw: string
  fileName: string
  projectCount: number
  savedAt: string
  version: number
}

const QUOTA_BYTES = 5 * 1024 * 1024

export default function SettingsPage() {
  const { projects, loaded, readOnly, notice, store } = useWorkspace()
  const toast = useToast()

  const [keys, setKeys] = useState<string[]>([])
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [typedReset, setTypedReset] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const read = () => {
      const found: string[] = []
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index)
        if (key && key.startsWith(STORAGE_KEY)) found.push(key)
      }
      setKeys(found.sort())
    }
    read()
    window.addEventListener('storage', read)
    return () => window.removeEventListener('storage', read)
  }, [projects])

  const bytes = loaded ? store.storageBytes() : 0
  const share = Math.min(100, Math.round((bytes / QUOTA_BYTES) * 100))
  const userProjects = useMemo(() => projects.filter((project) => project.origin === 'user'), [projects])
  const demoProjects = useMemo(() => projects.filter((project) => project.origin === 'demo'), [projects])

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  function exportWorkspace(): void {
    downloadText(
      `fics-workspace-${new Date().toISOString().slice(0, 10)}.json`,
      store.exportEnvelope(),
      'application/json',
    )
    toast.push({ title: 'Workspace exported', detail: 'JSON backup downloaded.', tone: 'success' })
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.push({ title: 'File too large', detail: 'Workspace backups are capped at 10 MB.', tone: 'error' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : ''
      try {
        const parsed = JSON.parse(raw) as { version?: unknown; savedAt?: unknown; projects?: unknown }
        if (!Array.isArray(parsed.projects)) throw new Error('Missing projects array.')
        setPendingImport({
          raw,
          fileName: file.name,
          projectCount: parsed.projects.length,
          savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : 'unknown',
          version: typeof parsed.version === 'number' ? parsed.version : Number(parsed.version ?? 0),
        })
      } catch (error) {
        toast.push({
          title: 'Not a workspace backup',
          detail: error instanceof Error ? error.message : 'The file could not be parsed.',
          tone: 'error',
        })
      }
      event.target.value = ''
    }
    reader.onerror = () => toast.push({ title: 'Could not read the file', tone: 'error' })
    reader.readAsText(file)
  }

  function confirmImport(): void {
    if (!pendingImport) return
    const result = store.importEnvelope(pendingImport.raw)
    if (result.ok) {
      toast.push({
        title: 'Workspace imported',
        detail: `${pendingImport.projectCount} project${pendingImport.projectCount === 1 ? '' : 's'} restored. A pre-import snapshot was written.`,
        tone: 'success',
      })
      setPendingImport(null)
    } else {
      toast.push({ title: 'Import rejected', detail: result.message, tone: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="label mb-1.5">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Backup, restore and inspect what this browser holds. There is no account and no server copy.
        </p>
      </header>

      {readOnly ? (
        <div className="rounded-[10px] border border-amber/40 bg-amber/10 px-4 py-3 text-xs leading-5 text-amber">
          This workspace was written by a newer build. It is read-only here; export a copy and open it in
          the newer version. Nothing on this page will overwrite it.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <SectionTitle eyebrow="Storage" title="Browser usage" action={<Badge tone={share > 80 ? 'warn' : 'neutral'}>{share}%</Badge>} />
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cx('h-full', share > 80 ? 'bg-amber' : 'bg-accent/70')}
                style={{ width: `${Math.max(share, 1)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>{formatBytes(bytes)} used</span>
              <span>~{formatBytes(QUOTA_BYTES)} typical browser quota</span>
            </div>

            <dl className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ['Projects', String(projects.length)],
                ['Your projects', String(userProjects.length)],
                ['Demo projects', String(demoProjects.length)],
              ].map(([label, value]) => (
                <div key={label} className="surface-2 px-3 py-2.5">
                  <dt className="label">{label}</dt>
                  <dd className="mt-1 font-mono text-sm text-text">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={exportWorkspace}>
                <Icon name="download" className="h-3.5 w-3.5" /> Export workspace
              </Button>
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] border border-line bg-surface-2 px-3 text-xs text-muted transition-colors hover:text-text">
                <Icon name="download" className="h-3.5 w-3.5" /> Import backup
                <input type="file" accept="application/json,.json" onChange={handleImportFile} className="sr-only" />
              </label>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-dim">
              Import replaces the whole workspace after writing a pre-import snapshot. It never merges.
            </p>
          </Card>

          <Card>
            <SectionTitle eyebrow="Danger zone" title="Demo and recovery" />
            <div className="mt-4 space-y-3">
              <div className="surface-2 flex flex-wrap items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm text-text">Reset the demo match</p>
                  <p className="mt-0.5 text-[11px] text-dim">
                    Restores demo events, insights and clips. Your {userProjects.length} project
                    {userProjects.length === 1 ? '' : 's'} survive.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setResetOpen(true)} disabled={readOnly}>
                  Reset demo
                </Button>
              </div>

              <div className="surface-2 p-3">
                <p className="text-sm text-text">Quarantined data</p>
                <p className="mt-0.5 text-[11px] leading-5 text-dim">
                  Unreadable workspaces are copied before recovery. This build records{' '}
                  {store.quarantineKeys().length} quarantine key
                  {store.quarantineKeys().length === 1 ? '' : 's'} in memory for this session.
                </p>
                {store.quarantineKeys().length > 0 ? (
                  <ul className="mt-2 space-y-1 font-mono text-[10px] text-amber">
                    {store.quarantineKeys().map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Keys" title="Local storage keys" />
            <ul className="mt-3 space-y-1.5">
              {keys.length === 0 ? (
                <li className="text-xs text-dim">No keys visible.</li>
              ) : (
                keys.map((key) => (
                  <li key={key} className="flex items-center gap-2 rounded-[10px] border border-line bg-surface px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted">{key}</span>
                    <span className="text-[10px] text-dim">
                      {key === STORAGE_KEY ? 'workspace' : key.includes('.snapshot.') ? 'snapshot' : 'quarantine'}
                    </span>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-3 text-[11px] leading-5 text-dim">
              Recovery from a snapshot is a manual copy in browser devtools for now. Export regularly.
            </p>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionTitle eyebrow="Help" title="Shortcuts and rules" />
            <ul className="mt-3 space-y-2 text-xs leading-5 text-muted">
              <li>Space plays or pauses the studio transport.</li>
              <li>← / → step a frame; hold Shift for ten.</li>
              <li>I / O mark clip in and out.</li>
              <li>⌘K or Ctrl K opens the command palette.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/help" variant="secondary" size="sm">
                Full help
              </ButtonLink>
              <ButtonLink href="/privacy" variant="ghost" size="sm">
                Data policy
              </ButtonLink>
            </div>
          </Card>

          <Card>
            <SectionTitle eyebrow="Build" title="Beta information" />
            <dl className="mt-3 space-y-2 text-xs">
              {[
                ['Version', '2.0.0-beta'],
                ['Workspace schema', 'v2'],
                ['Storage key', STORAGE_KEY],
                ['Account', 'None required'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="truncate font-mono text-[10px] text-text">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {notice ? (
            <Card>
              <SectionTitle eyebrow="Notice" title={notice.title} />
              <p className="mt-2 text-xs leading-5 text-muted">{notice.detail}</p>
              {notice.quarantineKey ? (
                <p className="mt-2 break-all font-mono text-[10px] text-amber">{notice.quarantineKey}</p>
              ) : null}
            </Card>
          ) : null}
        </aside>
      </div>

      {pendingImport ? (
        <ImportDialog
          pending={pendingImport}
          onCancel={() => setPendingImport(null)}
          onConfirm={confirmImport}
        />
      ) : null}

      {resetOpen ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setResetOpen(false)} aria-label="Cancel reset" tabIndex={-1} />
          <div className="relative w-full max-w-md animate-fade-up rounded-[14px] border border-line bg-surface p-5 shadow-2xl">
            <h2 id="reset-title" className="text-base font-semibold text-text">
              Reset the demo match?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Demo events, insights and clips return to their original state. {userProjects.length} user
              project{userProjects.length === 1 ? '' : 's'} will not be touched. A snapshot is written first.
            </p>
            <div className="mt-4">
              <FieldLabel htmlFor="reset-confirm">Type RESET to confirm</FieldLabel>
              <input
                id="reset-confirm"
                value={typedReset}
                onChange={(event) => setTypedReset(event.target.value)}
                className="h-10 w-full rounded-[10px] border border-line bg-surface px-3 text-sm text-text focus:border-accent/60 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setResetOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={typedReset !== 'RESET'}
                onClick={() => {
                  const result = store.resetDemo()
                  if (result.ok) {
                    toast.push({ title: 'Demo reset', detail: 'Your projects were preserved.', tone: 'success' })
                    setResetOpen(false)
                    setTypedReset('')
                  } else {
                    toast.push({ title: 'Reset failed', detail: result.message, tone: 'error' })
                  }
                }}
              >
                Reset demo
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ImportDialog({
  pending,
  onCancel,
  onConfirm,
}: {
  pending: PendingImport
  onCancel: () => void
  onConfirm: () => void
}): ReactNode {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel import" tabIndex={-1} />
      <div className="relative w-full max-w-md animate-fade-up rounded-[14px] border border-line bg-surface p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan">
            <Icon name="shield" className="h-4 w-4" />
          </span>
          <h2 id="import-title" className="text-base font-semibold text-text">
            Replace this workspace?
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          <span className="text-text">{pending.fileName}</span> contains {pending.projectCount} project
          {pending.projectCount === 1 ? '' : 's'} saved {pending.savedAt}. Importing replaces everything
          currently in this browser. A snapshot is written first.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="surface-2 px-2.5 py-2">
            <dt className="text-[10px] uppercase tracking-[0.12em] text-dim">Schema version</dt>
            <dd className="mt-0.5 font-mono text-text">{pending.version}</dd>
          </div>
          <div className="surface-2 px-2.5 py-2">
            <dt className="text-[10px] uppercase tracking-[0.12em] text-dim">Projects</dt>
            <dd className="mt-0.5 font-mono text-text">{pending.projectCount}</dd>
          </div>
        </dl>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Import and replace
          </Button>
        </div>
      </div>
    </div>
  )
}
