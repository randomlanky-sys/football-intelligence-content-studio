import { describe, expect, it } from 'vitest'
import { computeEvidenceHash } from '@fics/evidence-engine'
import { createDemoProject, DEMO_PROJECT_ID } from './demo-data'
import { projectSchema, STORAGE_KEY } from './schema'
import { createWorkspaceStore, MemoryStorage } from './store'

const FIXED_NOW = Date.parse('2026-11-09T10:00:00.000Z')
const fixedNow = () => FIXED_NOW
const fixedId = () => 'generated-id'

function newStore(storage: MemoryStorage = new MemoryStorage()) {
  return createWorkspaceStore({ storage, now: fixedNow, idFactory: fixedId })
}

class QuotaStorage extends MemoryStorage {
  failWorkspaceWrites = false

  override setItem(key: string, value: string): void {
    if (this.failWorkspaceWrites && key === STORAGE_KEY) {
      const error = new Error('The quota has been exceeded.')
      error.name = 'QuotaExceededError'
      throw error
    }
    super.setItem(key, value)
  }
}

describe('demo fixture', () => {
  it('passes the authoritative project schema (fractional minutes included)', () => {
    const result = projectSchema.safeParse(createDemoProject())
    if (!result.success) {
      throw new Error(JSON.stringify(result.error.issues, null, 2))
    }
    expect(result.success).toBe(true)
    expect(result.data.events).toHaveLength(32)
    expect(result.data.insights).toHaveLength(8)
  })

  it('seeds only when the storage key is absent', () => {
    const storage = new MemoryStorage()
    const first = newStore(storage)
    first.load()
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull()

    const second = newStore(storage)
    const state = second.load()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0]?.id).toBe(DEMO_PROJECT_ID)
  })
})

describe('corrupt and newer workspaces', () => {
  it('quarantines unreadable JSON, restores the demo and reports the key', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{ this is not json')
    const store = newStore(storage)

    const state = store.load()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0]?.id).toBe(DEMO_PROJECT_ID)
    expect(state.notice?.kind).toBe('recovery')

    const keys = store.quarantineKeys()
    expect(keys).toHaveLength(1)
    expect(storage.getItem(keys[0] ?? '')).toBe('{ this is not json')
  })

  it('opens a newer workspace read-only and never overwrites it', () => {
    const raw = JSON.stringify({ version: 99, savedAt: '2026-11-09T09:00:00.000Z', projects: [] })
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, raw)
    const store = newStore(storage)

    const state = store.load()
    expect(state.readOnly).toBe(true)
    expect(state.notice?.kind).toBe('read-only')

    const created = store.createProject({ name: 'Should not exist' })
    expect(created.ok).toBe(false)
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
  })

  it('leaves memory untouched when the browser quota rejects the write', () => {
    const storage = new QuotaStorage()
    const store = newStore(storage)
    store.load()
    const before = store.getSnapshot().projects

    storage.failWorkspaceWrites = true
    const result = store.createProject({ name: 'Over quota' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('storage is full')
    expect(store.getSnapshot().projects).toEqual(before)
  })
})

describe('export / import round-trip', () => {
  it('restores the same projects through a JSON backup', () => {
    const source = newStore()
    source.load()
    source.createProject({ name: 'Round trip', competition: 'Test Cup' })
    const exported = source.exportEnvelope()

    const target = newStore()
    target.load()
    const result = target.importEnvelope(exported)

    expect(result.ok).toBe(true)
    expect(target.getSnapshot().projects).toEqual(source.getSnapshot().projects)
  })

  it('rejects a backup written by a newer schema version', () => {
    const store = newStore()
    store.load()
    const result = store.importEnvelope(
      JSON.stringify({ version: 99, savedAt: '2026-11-09T09:00:00.000Z', projects: [] }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('version_too_new')
  })
})

describe('insight review semantics', () => {
  it('accepts a proposed claim and re-baselines its evidence hash', () => {
    const store = newStore()
    store.load()
    const before = store.getProject(DEMO_PROJECT_ID)?.insights.find((item) => item.id === 'ins-01')
    expect(before?.status).toBe('proposed')

    const result = store.acceptInsight(DEMO_PROJECT_ID, 'ins-01')
    expect(result.ok).toBe(true)

    const after = store.getProject(DEMO_PROJECT_ID)?.insights.find((item) => item.id === 'ins-01')
    expect(after?.status).toBe('accepted')
    expect(after?.reviewer).toBe('You')
    expect(after?.evidenceHash).toBe(computeEvidenceHash(before?.evidence ?? []))
  })

  it('refuses to accept an insight with no evidence', () => {
    const store = newStore()
    store.load()
    const project = store.getProject(DEMO_PROJECT_ID)
    if (!project) throw new Error('demo missing')
    store.updateProject(DEMO_PROJECT_ID, {
      insights: project.insights.map((insight) =>
        insight.id === 'ins-02' ? { ...insight, evidence: [] } : insight,
      ),
    })

    const result = store.acceptInsight(DEMO_PROJECT_ID, 'ins-02')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('evidence_required')
  })

  it('treats rejected as terminal until an explicit reopen', () => {
    const store = newStore()
    store.load()

    expect(store.acceptInsight(DEMO_PROJECT_ID, 'ins-07').ok).toBe(false)
    expect(store.reopenInsight(DEMO_PROJECT_ID, 'ins-07').ok).toBe(true)

    const reopened = store.getProject(DEMO_PROJECT_ID)?.insights.find((item) => item.id === 'ins-07')
    expect(reopened?.status).toBe('proposed')
  })

  it('derives stale when a cited event is deleted, without storing the status', () => {
    const store = newStore()
    store.load()
    const project = store.getProject(DEMO_PROJECT_ID)
    if (!project) throw new Error('demo missing')

    const remaining = project.events.filter((event) => event.id !== 'evt-24')
    expect(store.commitEvents(DEMO_PROJECT_ID, remaining, 'replace').ok).toBe(true)

    const resolved = store.getResolvedInsights(DEMO_PROJECT_ID).find((item) => item.id === 'ins-05')
    expect(resolved?.status).toBe('accepted')
    expect(resolved?.displayStatus).toBe('stale')
    expect(resolved?.staleReasons.join(' ')).toContain('no longer exists')
  })

  it('ships one deliberately stale accepted insight in the demo fixture', () => {
    const store = newStore()
    store.load()
    const resolved = store.getResolvedInsights(DEMO_PROJECT_ID)
    const stale = resolved.filter((item) => item.displayStatus === 'stale')
    expect(stale.map((item) => item.id)).toEqual(['ins-06'])
  })

  it('reopening a stale claim returns it to proposed, and accepting re-baselines it', () => {
    const store = newStore()
    store.load()

    expect(store.reopenInsight(DEMO_PROJECT_ID, 'ins-06').ok).toBe(true)
    const reopened = store
      .getResolvedInsights(DEMO_PROJECT_ID)
      .find((item) => item.id === 'ins-06')
    expect(reopened?.status).toBe('proposed')
    expect(reopened?.displayStatus).toBe('proposed')
    expect(reopened?.staleReasons).toHaveLength(0)

    expect(store.acceptInsight(DEMO_PROJECT_ID, 'ins-06').ok).toBe(true)
    const accepted = store
      .getResolvedInsights(DEMO_PROJECT_ID)
      .find((item) => item.id === 'ins-06')
    expect(accepted?.status).toBe('accepted')
    expect(accepted?.displayStatus).toBe('accepted')
  })
})

describe('reset and user data', () => {
  it('resets only the demo and keeps user projects', () => {
    const store = newStore()
    store.load()
    const created = store.createProject({ name: 'My match' })
    expect(created.ok).toBe(true)

    expect(store.resetDemo().ok).toBe(true)
    const projects = store.getSnapshot().projects
    expect(projects.some((project) => project.origin === 'user')).toBe(true)
    expect(projects.filter((project) => project.origin === 'demo')).toHaveLength(1)
  })

  it('caps export history at 20 records per project', () => {
    const store = newStore()
    store.load()
    const project = store.getProject(DEMO_PROJECT_ID)
    if (!project) throw new Error('demo missing')

    const pack = {
      title: 'Pack',
      hook: 'Hook',
      sections: [],
      captions: [],
      hashtags: [],
      thumbnailBrief: 'Brief',
      evidenceSummary: [],
      matchLabel: 'Demo',
      generatedAt: '2026-11-09T10:00:00.000Z',
      acceptedInsightIds: [],
    }

    for (let index = 0; index < 25; index += 1) {
      expect(store.recordExport(DEMO_PROJECT_ID, 'article', pack, true).ok).toBe(true)
    }

    const after = store.getProject(DEMO_PROJECT_ID)
    expect(after?.exports).toHaveLength(20)
  })
})
