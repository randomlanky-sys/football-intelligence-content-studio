'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { STORAGE_KEY } from './schema'
import { createWorkspaceStore, MemoryStorage, resolveInsight, type WorkspaceStore } from './store'
import type { Project, ResolvedInsight, StoreState } from './types'

const StoreContext = createContext<WorkspaceStore | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createWorkspaceStore({
      storage: typeof window === 'undefined' ? new MemoryStorage() : window.localStorage,
    }),
  )

  useEffect(() => {
    if (!store.getSnapshot().loaded) store.load()
  }, [store])

  useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key !== STORAGE_KEY) return
      if (!store.getSnapshot().loaded) return
      store.markExternalChange()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [store])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): WorkspaceStore {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

export function useWorkspace(): StoreState & { store: WorkspaceStore } {
  const store = useStore()
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  return useMemo(() => ({ ...state, store }), [state, store])
}

export function useProject(id: string | undefined): {
  project: Project | undefined
  insights: ResolvedInsight[]
  loaded: boolean
} {
  const { projects, loaded } = useWorkspace()
  const project = useMemo(
    () => (id ? projects.find((candidate) => candidate.id === id) : undefined),
    [projects, id],
  )
  const insights = useMemo(() => {
    if (!project) return []
    return project.insights.map((insight) => resolveInsight(project, insight))
  }, [project])

  return { project, insights, loaded }
}
