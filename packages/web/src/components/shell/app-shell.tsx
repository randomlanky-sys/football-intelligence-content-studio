'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { cx, formatBytes } from '@fics/ui'
import { useWorkspace } from '@/lib/use-store'
import { Icon, Kbd, Logo } from '../ui'
import { buttonClass } from '../styles'
import { CommandPalette } from './command-palette'

const NAV = [
  { href: '/app', label: 'Overview', icon: 'grid' as const },
  { href: '/app/projects', label: 'Projects', icon: 'film' as const },
  { href: '/app/settings', label: 'Settings', icon: 'settings' as const },
]

export function AppShell({ children }: { children: ReactNode }): ReactNode {
  const pathname = usePathname() ?? '/app'
  const { projects, readOnly, notice, loaded, store } = useWorkspace()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const crumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length <= 1) return [{ label: 'Overview' }]
    if (segments[1] === 'projects') return [{ label: 'Projects' }]
    if (segments[1] === 'settings') return [{ label: 'Settings' }]
    if (segments[1] === 'p' && segments[2]) {
      const project = projects.find((candidate) => candidate.id === segments[2])
      const tail = segments[3]
      return [
        { label: project?.name ?? 'Project', href: `/app/p/${segments[2]}` },
        ...(tail ? [{ label: tail.charAt(0).toUpperCase() + tail.slice(1) }] : []),
      ]
    }
    return [{ label: 'Workspace' }]
  }, [pathname, projects])

  const storageBytes = loaded ? store.storageBytes() : 0
  const storageShare = Math.min(100, Math.round((storageBytes / (5 * 1024 * 1024)) * 100))

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-ink"
      >
        Skip to content
      </a>

      <aside className="hidden border-r border-line bg-surface/50 lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-line px-4">
          <Link href="/" aria-label="Football Intelligence home">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Workspace">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-sm transition-colors',
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted hover:bg-surface-2 hover:text-text',
                    )}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="label">Projects</p>
              <Link href="/app/projects#new" className="text-dim hover:text-accent" aria-label="New project">
                <Icon name="plus" className="h-3.5 w-3.5" />
              </Link>
            </div>
            {projects.length === 0 ? (
              <p className="px-2 text-xs leading-5 text-dim">No projects yet.</p>
            ) : (
              <ul className="space-y-0.5">
                {projects
                  .filter((project) => project.state !== 'archived')
                  .slice(0, 6)
                  .map((project) => {
                    const active = pathname.includes(project.id)
                    return (
                      <li key={project.id}>
                        <Link
                          href={`/app/p/${project.id}`}
                          className={cx(
                            'flex items-center gap-2 rounded-[10px] px-2 py-1.5 text-xs transition-colors',
                            active ? 'bg-surface-2 text-text' : 'text-muted hover:bg-surface-2/60 hover:text-text',
                          )}
                        >
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: project.teams.home.color }}
                          />
                          <span className="min-w-0 flex-1 truncate">{project.name}</span>
                          {project.origin === 'demo' ? (
                            <span className="font-mono text-[9px] uppercase text-accent">demo</span>
                          ) : null}
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            )}
          </div>
        </nav>

        <div className="border-t border-line p-3">
          <div className="surface-2 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">Browser storage</span>
              <span className="font-mono text-text">{formatBytes(storageBytes)}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-accent/70" style={{ width: `${Math.max(storageShare, 1)}%` }} />
            </div>
            <p className="mt-2 text-[10px] leading-4 text-dim">
              Local-first. Export a backup from Settings.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-6">
            <Link href="/" className="lg:hidden" aria-label="Football Intelligence home">
              <Logo compact />
            </Link>

            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
              <Link href="/app" className="text-dim hover:text-muted">
                Workspace
              </Link>
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                  <span className="text-dim">/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="truncate text-muted hover:text-text">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="truncate text-text">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-xs text-dim transition-colors hover:text-text sm:inline-flex"
              >
                <Icon name="search" className="h-3.5 w-3.5" />
                Search
                <Kbd>⌘K</Kbd>
              </button>
              <Link href="/app/projects#new" className={buttonClass('primary', 'sm')}>
                <Icon name="plus" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New project</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden" aria-label="Workspace mobile">
            {NAV.map((item) => {
              const active = item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs',
                    active ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface-2',
                  )}
                >
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              )
            })}
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/app/p/${project.id}`}
                className={cx(
                  'inline-flex h-8 max-w-[160px] shrink-0 items-center gap-1.5 rounded-full px-3 text-xs',
                  pathname.includes(project.id) ? 'bg-surface-2 text-text' : 'text-muted hover:bg-surface-2',
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.teams.home.color }} />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </nav>
        </header>

        {notice ? <NoticeBanner notice={notice} readOnly={readOnly} onDismiss={store.dismissNotice} /> : null}

        <main id="workspace-main" className="flex-1 px-4 py-5 lg:px-6 lg:py-6">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} projects={projects} />
    </div>
  )
}

function NoticeBanner({
  notice,
  readOnly,
  onDismiss,
}: {
  notice: NonNullable<ReturnType<typeof useWorkspace>['notice']>
  readOnly: boolean
  onDismiss: () => void
}): ReactNode {
  const tone =
    notice.kind === 'read-only'
      ? 'border-amber/40 bg-amber/10 text-amber'
      : notice.kind === 'recovery'
        ? 'border-red/40 bg-red/10 text-red'
        : 'border-cyan/40 bg-cyan/10 text-cyan'

  return (
    <div className={cx('border-b px-4 py-2.5 lg:px-6', tone)} role="status">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <Icon name={notice.kind === 'recovery' ? 'alert' : 'shield'} className="h-4 w-4 shrink-0" />
        <span className="font-medium">{notice.title}</span>
        <span className="min-w-0 flex-1 leading-5 opacity-90">{notice.detail}</span>
        {notice.kind === 'external-change' ? (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded border border-current/30 px-2 py-1 font-medium hover:bg-white/5"
          >
            Reload
          </button>
        ) : null}
        {readOnly ? (
          <Link href="/app/settings" className="rounded border border-current/30 px-2 py-1 font-medium hover:bg-white/5">
            Export a copy
          </Link>
        ) : null}
        <button type="button" onClick={onDismiss} className="rounded p-1 hover:bg-white/5" aria-label="Dismiss notice">
          <Icon name="x" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
