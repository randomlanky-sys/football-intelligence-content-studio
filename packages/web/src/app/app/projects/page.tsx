'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cx } from '@fics/ui'
import { ProjectCard } from '@/components/project-header'
import { inputClass } from '@/components/styles'
import { useToast } from '@/components/toast'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FieldLabel,
  Icon,
  SectionTitle,
  Skeleton,
} from '@/components/ui'
import type { Project, ProjectState } from '@/lib/types'
import { useWorkspace } from '@/lib/use-store'

const FILTERS: { id: 'all' | ProjectState; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'active', label: 'Active' },
  { id: 'review', label: 'In review' },
  { id: 'exported', label: 'Exported' },
  { id: 'archived', label: 'Archived' },
]

export default function ProjectsPage() {
  const { projects, loaded, readOnly, store } = useWorkspace()
  const router = useRouter()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | ProjectState>('all')
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (window.location.hash === '#new') {
      window.setTimeout(() => nameRef.current?.focus(), 60)
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((project) => {
      if (filter !== 'all' && project.state !== filter) return false
      if (!needle) return true
      return (
        project.name.toLowerCase().includes(needle) ||
        project.competition.toLowerCase().includes(needle) ||
        project.teams.home.name.toLowerCase().includes(needle) ||
        project.teams.away.name.toLowerCase().includes(needle)
      )
    })
  }, [projects, query, filter])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const project of projects) map.set(project.state, (map.get(project.state) ?? 0) + 1)
    return map
  }, [projects])

  function duplicate(project: Project): void {
    const result = store.duplicateProject(project.id)
    if (result.ok) {
      toast.push({ title: 'Project duplicated', detail: result.project.name, tone: 'success' })
    } else {
      toast.push({ title: 'Could not duplicate', detail: result.message, tone: 'error' })
    }
  }

  function archive(project: Project): void {
    const result = store.archiveProject(project.id)
    if (result.ok) {
      toast.push({ title: 'Project archived', detail: project.name, tone: 'success' })
    } else {
      toast.push({ title: 'Could not archive', detail: result.message, tone: 'error' })
    }
  }

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label mb-1.5">Library</p>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length} saved · {counts.get('review') ?? 0} in review · {counts.get('exported') ?? 0} exported
          </p>
        </div>
        <a href="#new" className="text-xs font-medium text-accent hover:underline">
          Jump to new project →
        </a>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 sm:max-w-sm">
          <span className="sr-only">Search projects</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by match, competition or team…"
            className={cx(inputClass, 'pl-9')}
          />
        </label>

        <div className="flex flex-wrap gap-1 rounded-[10px] border border-line bg-surface p-1">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cx(
                'h-7 rounded-[7px] px-2.5 text-xs transition-colors',
                filter === item.id ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={projects.length === 0 ? 'No projects yet' : 'No projects match that filter'}
          body={
            projects.length === 0
              ? 'Create your first project below, or open the demo match to explore the full workflow.'
              : 'Clear the search or choose another state. Archived projects keep their data and exports.'
          }
          action={
            projects.length === 0 ? (
              <a href="#new" className="text-sm font-medium text-accent hover:underline">
                Create a project ↓
              </a>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setFilter('all')
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const insights = store.getResolvedInsights(project.id)
            return (
              <ProjectCard
                key={project.id}
                project={project}
                accepted={
                  insights.filter(
                    (insight) =>
                      insight.displayStatus === 'accepted' || insight.displayStatus === 'edited',
                  ).length
                }
                proposed={insights.filter((insight) => insight.displayStatus === 'proposed').length}
                onDuplicate={() => duplicate(project)}
                onArchive={() => archive(project)}
                onDelete={() => setPendingDelete(project)}
              />
            )
          })}
        </div>
      )}

      <section id="new" className="scroll-mt-24">
        <Card>
          <SectionTitle
            eyebrow="New project"
            title="Start an empty match sheet"
            action={
              readOnly ? (
                <Badge tone="warn">Read-only workspace</Badge>
              ) : (
                <Badge tone="neutral">Local to this browser</Badge>
              )
            }
          />
          <NewProjectForm
            disabled={readOnly}
            nameRef={nameRef}
            onCreate={(input) => {
              const result = store.createProject(input)
              if (!result.ok) {
                toast.push({ title: 'Could not create project', detail: result.message, tone: 'error' })
                return
              }
              toast.push({ title: 'Project created', detail: result.project.name, tone: 'success' })
              router.push(`/app/p/${result.project.id}/data`)
            }}
          />
        </Card>
      </section>

      {pendingDelete ? (
        <DeleteDialog
          project={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            const result = store.deleteProject(pendingDelete.id)
            if (result.ok) {
              toast.push({
                title: 'Project deleted',
                detail: 'A snapshot was written before deletion.',
                tone: 'success',
              })
              setPendingDelete(null)
            } else {
              toast.push({ title: 'Could not delete', detail: result.message, tone: 'error' })
            }
          }}
        />
      ) : null}
    </div>
  )
}

function NewProjectForm({
  onCreate,
  disabled,
  nameRef,
}: {
  onCreate: (input: {
    name: string
    competition?: string
    date?: string
    homeName?: string
    awayName?: string
  }) => void
  disabled: boolean
  nameRef: React.RefObject<HTMLInputElement | null>
}): ReactNode {
  const [name, setName] = useState('')
  const [competition, setCompetition] = useState('')
  const [date, setDate] = useState('')
  const [homeName, setHomeName] = useState('')
  const [awayName, setAwayName] = useState('')

  function submit(event: FormEvent): void {
    event.preventDefault()
    if (name.trim().length === 0) return
    onCreate({
      name,
      competition: competition.trim() || undefined,
      date: date || undefined,
      homeName: homeName.trim() || undefined,
      awayName: awayName.trim() || undefined,
    })
    setName('')
    setCompetition('')
    setDate('')
    setHomeName('')
    setAwayName('')
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <FieldLabel htmlFor="project-name">Project name *</FieldLabel>
        <input
          id="project-name"
          ref={nameRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Harbour City vs North Rovers"
          required
          maxLength={160}
          className={inputClass}
        />
      </div>
      <div>
        <FieldLabel htmlFor="project-competition">Competition</FieldLabel>
        <input
          id="project-competition"
          value={competition}
          onChange={(event) => setCompetition(event.target.value)}
          placeholder="League · Matchday 4"
          maxLength={160}
          className={inputClass}
        />
      </div>
      <div>
        <FieldLabel htmlFor="project-date">Match date</FieldLabel>
        <input
          id="project-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={cx(inputClass, '[color-scheme:dark]')}
        />
      </div>
      <div>
        <FieldLabel htmlFor="project-home">Home team</FieldLabel>
        <input
          id="project-home"
          value={homeName}
          onChange={(event) => setHomeName(event.target.value)}
          placeholder="Home XI"
          maxLength={120}
          className={inputClass}
        />
      </div>
      <div>
        <FieldLabel htmlFor="project-away">Away team</FieldLabel>
        <input
          id="project-away"
          value={awayName}
          onChange={(event) => setAwayName(event.target.value)}
          placeholder="Away XI"
          maxLength={120}
          className={inputClass}
        />
      </div>
      <div className="flex items-end xl:col-span-3">
        <Button type="submit" variant="primary" disabled={disabled || name.trim().length === 0}>
          <Icon name="plus" className="h-4 w-4" />
          Create project
        </Button>
        <p className="ml-3 text-xs text-dim">
          Starts empty — import events from the Data screen next.
        </p>
      </div>
    </form>
  )
}

function DeleteDialog({
  project,
  onCancel,
  onConfirm,
}: {
  project: Project
  onCancel: () => void
  onConfirm: () => void
}): ReactNode {
  const [typed, setTyped] = useState('')
  const matches = typed === project.name

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} aria-label="Cancel delete" tabIndex={-1} />
      <div className="relative w-full max-w-md animate-fade-up rounded-[14px] border border-line bg-surface p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-red/40 bg-red/10 text-red">
            <Icon name="trash" className="h-4 w-4" />
          </span>
          <h2 id="delete-title" className="text-base font-semibold text-text">
            Delete this project?
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          <span className="text-text">{project.name}</span> and its {project.events.length} events,{' '}
          {project.insights.length} insights and {project.exports.length} export records will be removed
          from this browser. A snapshot is written first.
        </p>
        <div className="mt-4">
          <FieldLabel htmlFor="delete-confirm">
            Type the project name to confirm: <span className="text-text">{project.name}</span>
          </FieldLabel>
          <input
            id="delete-confirm"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            className={inputClass}
            autoFocus
            aria-invalid={typed.length > 0 && !matches}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={!matches}>
            Delete project
          </Button>
        </div>
      </div>
    </div>
  )
}
