import {
  computeEvidenceHash,
  evaluateEvidence,
  transitionInsight,
  type InsightAction,
} from '@fics/evidence-engine'
import { createDemoProject } from './demo-data'
import { projectSchema, STORAGE_KEY, WORKSPACE_VERSION, workspaceEnvelopeSchema } from './schema'
import type {
  ContentPack,
  ExportPreset,
  ExportRecord,
  Insight,
  MatchEvent,
  MutationResult,
  Project,
  ResolvedInsight,
  StoreState,
  Team,
  WorkspaceEnvelope,
} from './types'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class MemoryStorage implements StorageLike {
  private readonly data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }

  keys(): string[] {
    return [...this.data.keys()]
  }
}

export interface WorkspaceStoreOptions {
  storage: StorageLike
  now?: () => number
  idFactory?: () => string
}

export interface CreateProjectInput {
  name: string
  competition?: string
  date?: string
  homeName?: string
  awayName?: string
}

export type CreateResult =
  | { ok: true; project: Project }
  | { ok: false; error: Extract<MutationResult, { ok: false }>['error']; message: string }

function failure(error: Extract<MutationResult, { ok: false }>['error'], message: string): MutationResult {
  return { ok: false, error, message }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'QuotaExceededError') {
      return 'Browser storage is full. Export your workspace, then delete a project or reset the demo.'
    }
    return error.message
  }
  return 'Unknown storage error.'
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 4)
}

function safeStamp(iso: string): string {
  return iso.replace(/[:.]/g, '-')
}

export interface WorkspaceStore {
  subscribe(listener: () => void): () => void
  getSnapshot(): StoreState
  getServerSnapshot(): StoreState
  load(): StoreState
  getProject(id: string): Project | undefined
  getResolvedInsights(id: string): ResolvedInsight[]
  createProject(input: CreateProjectInput): CreateResult
  duplicateProject(id: string): CreateResult
  updateProject(id: string, patch: Partial<Project>): MutationResult
  archiveProject(id: string): MutationResult
  deleteProject(id: string): MutationResult
  commitEvents(projectId: string, events: MatchEvent[], mode: 'append' | 'replace'): MutationResult
  acceptInsight(projectId: string, insightId: string): MutationResult
  rejectInsight(projectId: string, insightId: string): MutationResult
  editInsight(projectId: string, insightId: string, claim: string): MutationResult
  flagInsight(projectId: string, insightId: string, limitation: string): MutationResult
  reopenInsight(projectId: string, insightId: string): MutationResult
  recordExport(projectId: string, preset: ExportPreset, pack: ContentPack, qcPassed: boolean): MutationResult
  resetDemo(): MutationResult
  importEnvelope(raw: string): MutationResult
  exportEnvelope(): string
  storageBytes(): number
  dismissNotice(): void
  markExternalChange(): void
  quarantineKeys(): string[]
}

export function createWorkspaceStore(options: WorkspaceStoreOptions): WorkspaceStore {
  const storage = options.storage
  const now = options.now ?? (() => Date.now())
  const idFactory = options.idFactory ?? (() => globalThis.crypto.randomUUID())

  let state: StoreState = {
    loaded: false,
    readOnly: false,
    projects: [],
    notice: null,
  }
  const listeners = new Set<() => void>()
  const quarantined: string[] = []

  function emit(): void {
    for (const listener of listeners) listener()
  }

  function setState(next: Partial<StoreState>): void {
    state = { ...state, ...next }
    emit()
  }

  function serialize(projects: Project[]): string {
    const envelope: WorkspaceEnvelope = {
      version: WORKSPACE_VERSION,
      savedAt: new Date(now()).toISOString(),
      projects,
    }
    return JSON.stringify(envelope)
  }

  function snapshotCurrent(): void {
    try {
      const key = `${STORAGE_KEY}.snapshot.${safeStamp(new Date(now()).toISOString())}`
      storage.setItem(key, serialize(state.projects))
    } catch {
      // A failed snapshot must not silently destroy data; the caller's write
      // will still fail loudly if storage is unusable.
    }
  }

  function quarantine(raw: string): string {
    const key = `${STORAGE_KEY}.corrupt.${safeStamp(new Date(now()).toISOString())}`
    try {
      storage.setItem(key, raw)
      quarantined.push(key)
    } catch {
      // If quarantine itself cannot be written, the in-memory seed still loads
      // and the notice tells the user where their data would have been kept.
    }
    return key
  }

  function persist(nextProjects: Project[], notice?: StoreState['notice']): MutationResult {
    if (state.readOnly) {
      return failure('read_only', 'This workspace was created by a newer version of the app. It is read-only here.')
    }
    try {
      storage.setItem(STORAGE_KEY, serialize(nextProjects))
    } catch (error) {
      return failure('persist_failed', describeError(error))
    }
    setState({ projects: nextProjects, notice: notice ?? state.notice })
    return { ok: true }
  }

  function load(): StoreState {
    const raw = storage.getItem(STORAGE_KEY)

    if (raw === null) {
      const demo = createDemoProject()
      try {
        storage.setItem(STORAGE_KEY, serialize([demo]))
        setState({ loaded: true, projects: [demo], readOnly: false, notice: null })
      } catch (error) {
        setState({
          loaded: true,
          projects: [demo],
          readOnly: false,
          notice: {
            kind: 'storage-unavailable',
            title: 'Storage is unavailable',
            detail: `${describeError(error)} The demo is loaded in memory only.`,
          },
        })
      }
      return state
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      const key = quarantine(raw)
      const demo = createDemoProject()
      const notice = {
        kind: 'recovery' as const,
        title: 'Saved workspace could not be read',
        detail: `The unreadable data was copied to ${key} before the demo was restored. Export a backup from Settings before making changes.`,
        quarantineKey: key,
      }
      const result = persist([demo], notice)
      if (!result.ok) {
        setState({ loaded: true, projects: [demo], notice })
      }
      return state
    }

    const version =
      typeof parsed === 'object' && parsed !== null && 'version' in parsed
        ? Number((parsed as { version: unknown }).version)
        : Number.NaN

    if (Number.isFinite(version) && version > WORKSPACE_VERSION) {
      const tolerant = workspaceEnvelopeSchema.safeParse(parsed)
      setState({
        loaded: true,
        readOnly: true,
        projects: tolerant.success ? tolerant.data.projects : [],
        notice: {
          kind: 'read-only',
          title: 'This workspace is newer than the app',
          detail: `The data is version ${version}; this build understands version ${WORKSPACE_VERSION}. Nothing will be written. Export a copy before opening a newer build.`,
        },
      })
      return state
    }

    const result = workspaceEnvelopeSchema.safeParse(parsed)
    if (!result.success) {
      const key = quarantine(raw)
      const demo = createDemoProject()
      const notice = {
        kind: 'recovery' as const,
        title: 'Saved workspace failed validation',
        detail: `The invalid data was copied to ${key}. The demo match has been restored; import a backup if you have one.`,
        quarantineKey: key,
      }
      const result = persist([demo], notice)
      if (!result.ok) {
        setState({ loaded: true, projects: [demo], notice })
      }
      return state
    }

    if (result.data.version < WORKSPACE_VERSION) {
      // Migration is an identity step today; the schema above already coerces
      // the v2 shape. Persisting the migrated envelope pins the new version.
      const migrated = result.data.projects
      try {
        storage.setItem(STORAGE_KEY, serialize(migrated))
      } catch {
        // Keep the migrated data in memory even if the pin fails.
      }
      setState({
        loaded: true,
        readOnly: false,
        projects: migrated,
        notice: {
          kind: 'migrated',
          title: 'Workspace upgraded',
          detail: `Data was upgraded from version ${result.data.version} to ${WORKSPACE_VERSION}. Export a backup to keep a copy of the old format.`,
        },
      })
      return state
    }

    setState({ loaded: true, readOnly: false, projects: result.data.projects, notice: null })
    return state
  }

  function findProject(id: string): Project | undefined {
    return state.projects.find((project) => project.id === id)
  }

  function replaceProject(projectId: string, update: (project: Project) => Project): MutationResult {
    const project = findProject(projectId)
    if (!project) return failure('not_found', 'Project not found.')

    const next = update(project)
    const parsed = projectSchema.safeParse(next)
    if (!parsed.success) {
      return failure('invalid_input', parsed.error.issues[0]?.message ?? 'Project data is invalid.')
    }

    const projects = state.projects.map((candidate) =>
      candidate.id === projectId ? parsed.data : candidate,
    )
    return persist(projects)
  }

  function defaultTeam(name: string, color: string, formation: string, suffix: string): Team {
    return {
      id: `team-${suffix}`,
      name,
      short: initials(name) || suffix.toUpperCase(),
      color,
      formation,
    }
  }

  function buildProject(input: CreateProjectInput, id: string, origin: Project['origin']): Project {
    const homeName = input.homeName?.trim() || 'Home XI'
    const awayName = input.awayName?.trim() || 'Away XI'
    const timestamp = new Date(now()).toISOString()
    return {
      id,
      origin,
      name: input.name.trim(),
      competition: input.competition?.trim() || 'Friendly',
      date: input.date || timestamp.slice(0, 10),
      state: 'draft',
      teams: {
        home: defaultTeam(homeName, '#C6F24E', '4-3-3', 'home'),
        away: defaultTeam(awayName, '#4CC9F0', '4-2-3-1', 'away'),
      },
      score: { home: 0, away: 0 },
      possession: { home: 50, away: 50 },
      durationUs: 0,
      fps: 25,
      events: [],
      insights: [],
      clips: [],
      exports: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }

  function createProject(input: CreateProjectInput): CreateResult {
    if (state.readOnly) {
      return { ok: false, error: 'read_only', message: 'This workspace is read-only.' }
    }
    if (!input.name || input.name.trim().length === 0) {
      return { ok: false, error: 'invalid_input', message: 'A project name is required.' }
    }

    const project = buildProject(input, idFactory(), 'user')
    const result = persist([...state.projects, project])
    if (!result.ok) return { ok: false, error: result.error, message: result.message }
    return { ok: true, project }
  }

  function duplicateProject(id: string): CreateResult {
    const source = findProject(id)
    if (!source) return { ok: false, error: 'not_found', message: 'Project not found.' }

    const timestamp = new Date(now()).toISOString()
    const copy: Project = {
      ...source,
      id: idFactory(),
      origin: 'user',
      name: `${source.name} (copy)`,
      state: 'draft',
      exports: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    const result = persist([...state.projects, copy])
    if (!result.ok) return { ok: false, error: result.error, message: result.message }
    return { ok: true, project: copy }
  }

  function updateProject(id: string, patch: Partial<Project>): MutationResult {
    return replaceProject(id, (project) => ({
      ...project,
      ...patch,
      id: project.id,
      updatedAt: new Date(now()).toISOString(),
    }))
  }

  function archiveProject(id: string): MutationResult {
    return updateProject(id, { state: 'archived' })
  }

  function deleteProject(id: string): MutationResult {
    if (!findProject(id)) return failure('not_found', 'Project not found.')
    snapshotCurrent()
    return persist(state.projects.filter((project) => project.id !== id))
  }

  function commitEvents(projectId: string, events: MatchEvent[], mode: 'append' | 'replace'): MutationResult {
    return replaceProject(projectId, (project) => {
      const nextEvents = mode === 'replace' ? events : [...project.events, ...events]
      const maxTUs = nextEvents.reduce((max, event) => Math.max(max, event.tUs), 0)
      const durationUs = Math.max(project.durationUs, maxTUs + 1_000_000)
      const goals = nextEvents.filter((event) => event.type === 'goal')
      return {
        ...project,
        events: nextEvents,
        durationUs,
        score: {
          home: goals.filter((event) => event.teamId === project.teams.home.id).length,
          away: goals.filter((event) => event.teamId === project.teams.away.id).length,
        },
        state: project.state === 'draft' ? 'active' : project.state,
      }
    })
  }

  function mutateInsight(
    projectId: string,
    insightId: string,
    action: InsightAction,
    patch: (insight: Insight) => Partial<Insight> = () => ({}),
  ): MutationResult {
    return replaceProject(projectId, (project) => {
      const insight = project.insights.find((candidate) => candidate.id === insightId)
      if (!insight) throw new Error('missing insight')

      const eventIds = new Set(project.events.map((event) => event.id))
      const resolves =
        insight.evidence.length > 0 &&
        insight.evidence.every((reference) => eventIds.has(reference.eventId))
      const transition = transitionInsight(insight.status, action, { evidenceResolves: resolves })
      if (!transition.ok || !transition.to) {
        throw new Error(transition.reason ?? 'invalid_transition')
      }

      const updated: Insight = {
        ...insight,
        ...patch(insight),
        status: transition.to,
        updatedAt: new Date(now()).toISOString(),
        // Accepting re-baselines the integrity hash against current evidence.
        evidenceHash: action === 'accept' ? computeEvidenceHash(insight.evidence) : insight.evidenceHash,
      }
      return {
        ...project,
        insights: project.insights.map((candidate) => (candidate.id === insightId ? updated : candidate)),
      }
    })
  }

  function guardedInsight(
    projectId: string,
    insightId: string,
    action: InsightAction,
    patch?: (insight: Insight) => Partial<Insight>,
  ): MutationResult {
    try {
      return mutateInsight(projectId, insightId, action, patch)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'invalid_transition'
      if (reason === 'evidence_required') {
        return failure('evidence_required', 'Add at least one evidence reference that resolves to an event first.')
      }
      if (reason === 'missing insight') return failure('not_found', 'Insight not found.')
      return failure('invalid_transition', 'That review action is not available from the current status.')
    }
  }

  function acceptInsight(projectId: string, insightId: string): MutationResult {
    return guardedInsight(projectId, insightId, 'accept', () => ({ reviewer: 'You' }))
  }

  function rejectInsight(projectId: string, insightId: string): MutationResult {
    return guardedInsight(projectId, insightId, 'reject', () => ({ reviewer: 'You' }))
  }

  function editInsight(projectId: string, insightId: string, claim: string): MutationResult {
    const trimmed = claim.trim()
    if (trimmed.length === 0 || trimmed.length > 280) {
      return failure('invalid_input', 'An edited claim must be 1–280 characters.')
    }
    return guardedInsight(projectId, insightId, 'edit', () => ({
      claim: trimmed,
      reviewer: 'You',
    }))
  }

  function flagInsight(projectId: string, insightId: string, limitation: string): MutationResult {
    return guardedInsight(projectId, insightId, 'flag', () => ({
      limitations: limitation.trim() || 'Evidence requested by reviewer.',
      reviewer: 'You',
    }))
  }

  function reopenInsight(projectId: string, insightId: string): MutationResult {
    return guardedInsight(projectId, insightId, 'reopen', () => ({ reviewer: undefined }))
  }

  function recordExport(
    projectId: string,
    preset: ExportPreset,
    pack: ContentPack,
    qcPassed: boolean,
  ): MutationResult {
    const record: ExportRecord = {
      id: idFactory(),
      preset,
      createdAt: new Date(now()).toISOString(),
      qcPassed,
      pack,
    }
    return replaceProject(projectId, (project) => ({
      ...project,
      state: 'exported',
      exports: [...project.exports, record].slice(-20),
    }))
  }

  function resetDemo(): MutationResult {
    snapshotCurrent()
    const userProjects = state.projects.filter((project) => project.origin === 'user')
    return persist([...userProjects, createDemoProject()], null)
  }

  function importEnvelope(raw: string): MutationResult {
    if (state.readOnly) return failure('read_only', 'This workspace is read-only.')

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return failure('invalid_json', 'The file is not valid JSON.')
    }

    const version =
      typeof parsed === 'object' && parsed !== null && 'version' in parsed
        ? Number((parsed as { version: unknown }).version)
        : Number.NaN
    if (Number.isFinite(version) && version > WORKSPACE_VERSION) {
      return failure(
        'version_too_new',
        `This backup is version ${version}; this build understands version ${WORKSPACE_VERSION}.`,
      )
    }

    const result = workspaceEnvelopeSchema.safeParse(parsed)
    if (!result.success) {
      const issue = result.error.issues[0]
      return failure(
        'invalid_workspace',
        issue ? `${issue.path.join('.') || 'workspace'}: ${issue.message}` : 'Workspace failed validation.',
      )
    }

    snapshotCurrent()
    return persist(result.data.projects)
  }

  function getResolvedInsights(id: string): ResolvedInsight[] {
    const project = findProject(id)
    if (!project) return []
    return project.insights.map((insight) => resolveInsight(project, insight))
  }

  function storageBytes(): number {
    try {
      return new TextEncoder().encode(storage.getItem(STORAGE_KEY) ?? '').length
    } catch {
      return 0
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => state,
    getServerSnapshot: () => state,
    load,
    getProject: findProject,
    getResolvedInsights,
    createProject,
    duplicateProject,
    updateProject,
    archiveProject,
    deleteProject,
    commitEvents,
    acceptInsight,
    rejectInsight,
    editInsight,
    flagInsight,
    reopenInsight,
    recordExport,
    resetDemo,
    importEnvelope,
    exportEnvelope: () => serialize(state.projects),
    storageBytes,
    dismissNotice: () => setState({ notice: null }),
    markExternalChange: () =>
      setState({
        notice: {
          kind: 'external-change',
          title: 'This workspace changed in another tab',
          detail: 'Reload to pick up the other tab before editing, so one tab does not overwrite the other.',
        },
      }),
    quarantineKeys: () => [...quarantined],
  }
}

/**
 * Resolve an insight for display. `stale` is derived, never stored: the stored
 * hash must match current evidence, every reference must resolve, and every
 * timestamp must sit inside the project.
 */
export function resolveInsight(project: Project, insight: Insight): ResolvedInsight {
  const eventIds = new Set(project.events.map((event) => event.id))
  const evaluation = evaluateEvidence({
    storedHash: insight.evidenceHash,
    refs: insight.evidence,
    existingEventIds: eventIds,
    durationUs: project.durationUs,
  })
  const resolves =
    insight.evidence.length > 0 &&
    insight.evidence.every((reference) => eventIds.has(reference.eventId))

  // Staleness only applies to claims a reviewer signed off. A proposed or
  // needs-evidence claim has no baselined hash yet, so a mismatch there is not
  // a regression — reopening a stale claim must show "proposed", not "stale",
  // until the next accept re-baselines the hash.
  const reviewed = insight.status === 'accepted' || insight.status === 'edited'
  const stale = reviewed && evaluation.stale
  const displayStatus =
    insight.status === 'rejected' ? 'rejected' : stale ? 'stale' : insight.status

  const reasons: string[] = []
  if (stale && evaluation.reasons.includes('hash_mismatch')) reasons.push('Evidence changed since review')
  if (stale && evaluation.reasons.includes('dangling_ref')) reasons.push('An evidence event no longer exists')
  if (stale && evaluation.reasons.includes('out_of_range')) reasons.push('Evidence sits outside the match duration')

  return { ...insight, displayStatus, staleReasons: reasons, resolves }
}
