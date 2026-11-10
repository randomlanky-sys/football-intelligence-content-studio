'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { cx } from '@fics/ui'
import type { Project } from '@/lib/types'
import { Icon, Kbd } from '../ui'

interface Action {
  href: string
  label: string
  group: string
  hint?: string
}

export function CommandPalette({
  open,
  onClose,
  projects,
}: {
  open: boolean
  onClose: () => void
  projects: Project[]
}): ReactNode {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const actions = useMemo<Action[]>(
    () => [
      { href: '/app', label: 'Overview', group: 'Workspace', hint: 'KPIs, momentum, review queue' },
      { href: '/app/projects', label: 'Projects', group: 'Workspace', hint: 'Library and new project' },
      { href: '/app/settings', label: 'Settings', group: 'Workspace', hint: 'Storage, export, import' },
      { href: '/app/p/demo-atl-hvu', label: 'Demo match', group: 'Workspace', hint: 'Atlantic FC vs Highveld United' },
      ...projects.map((project) => ({
        href: `/app/p/${project.id}`,
        label: project.name,
        group: 'Projects',
        hint: `${project.competition} · ${project.score.home}–${project.score.away}`,
      })),
    ],
    [projects],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return actions
    return actions.filter(
      (action) =>
        action.label.toLowerCase().includes(needle) ||
        action.group.toLowerCase().includes(needle) ||
        action.hint?.toLowerCase().includes(needle),
    )
  }, [actions, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((current) => Math.max(current - 1, 0))
      }
      if (event.key === 'Enter') {
        const action = filtered[active]
        if (action) {
          event.preventDefault()
          router.push(action.href)
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, filtered, active, onClose, router])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close command palette"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-lg animate-fade-up overflow-hidden rounded-[14px] border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Icon name="search" className="h-4 w-4 text-dim" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            placeholder="Jump to a project or screen…"
            className="h-12 flex-1 bg-transparent text-sm text-text placeholder:text-dim focus:outline-none"
            aria-label="Search workspace"
          />
          <Kbd>esc</Kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Results">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-dim">No match. Try a project name.</li>
          ) : (
            filtered.map((action, index) => (
              <li key={action.href}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    router.push(action.href)
                    onClose()
                  }}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors',
                    index === active ? 'bg-surface-2 text-text' : 'text-muted hover:bg-surface-2/60',
                  )}
                >
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
                    {action.group}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{action.label}</span>
                    {action.hint ? <span className="block truncate text-[11px] text-dim">{action.hint}</span> : null}
                  </span>
                  <Icon name="arrow-right" className="h-3.5 w-3.5 text-dim" />
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[10px] text-dim">
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> move
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd> open
          </span>
          <span className="ml-auto">{filtered.length} results</span>
        </div>
      </div>
    </div>
  )
}
