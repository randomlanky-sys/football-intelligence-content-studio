import type { EvidenceRef } from '@fics/evidence-engine'

export type ProjectState = 'draft' | 'active' | 'review' | 'exported' | 'archived'
export type InsightStatus = 'proposed' | 'needs_evidence' | 'accepted' | 'edited' | 'rejected'
export type DisplayInsightStatus = InsightStatus | 'stale'
export type ProjectOrigin = 'demo' | 'user'
export type ExportPreset = 'vertical_1080' | 'landscape_1080' | 'square_1080' | 'article'

export type EventType =
  | 'kickoff'
  | 'pass'
  | 'shot'
  | 'goal'
  | 'save'
  | 'tackle'
  | 'foul'
  | 'card'
  | 'sub'
  | 'corner'
  | 'offside'
  | 'whistle'

export interface Team {
  id: string
  name: string
  short: string
  color: string
  formation: string
}

export interface MatchEvent {
  id: string
  type: EventType
  minute: number
  tUs: number
  teamId: string
  playerId?: string
  x?: number
  y?: number
  endX?: number
  endY?: number
  outcome?: string
  xg?: number
}

export interface Insight {
  id: string
  claim: string
  status: InsightStatus
  evidenceHash: string
  evidence: EvidenceRef[]
  limitations?: string
  reviewer?: string
  updatedAt: string
}

export interface Clip {
  id: string
  name: string
  inUs: number
  outUs: number
  tags: string[]
}

export interface ContentPackSection {
  id: string
  heading: string
  body: string
}

export interface ContentPack {
  title: string
  hook: string
  sections: ContentPackSection[]
  captions: string[]
  hashtags: string[]
  thumbnailBrief: string
  evidenceSummary: string[]
  matchLabel: string
  generatedAt: string
  acceptedInsightIds: string[]
}

export interface ExportRecord {
  id: string
  preset: ExportPreset
  createdAt: string
  qcPassed: boolean
  pack: ContentPack
}

export interface Project {
  id: string
  origin: ProjectOrigin
  name: string
  competition: string
  date: string
  state: ProjectState
  teams: { home: Team; away: Team }
  score: { home: number; away: number }
  possession: { home: number; away: number }
  durationUs: number
  fps: number
  events: MatchEvent[]
  insights: Insight[]
  clips: Clip[]
  exports: ExportRecord[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceEnvelope {
  version: number
  savedAt: string
  projects: Project[]
}

export interface ResolvedInsight extends Insight {
  displayStatus: DisplayInsightStatus
  staleReasons: string[]
  resolves: boolean
}

export type NoticeKind =
  | 'recovery'
  | 'read-only'
  | 'migrated'
  | 'external-change'
  | 'storage-unavailable'

export interface WorkspaceNotice {
  kind: NoticeKind
  title: string
  detail: string
  quarantineKey?: string
}

export interface StoreState {
  loaded: boolean
  readOnly: boolean
  projects: Project[]
  notice: WorkspaceNotice | null
}

export type MutationFailure =
  | 'read_only'
  | 'persist_failed'
  | 'not_found'
  | 'invalid_transition'
  | 'evidence_required'
  | 'invalid_input'
  | 'version_too_new'
  | 'invalid_json'
  | 'invalid_workspace'

export type MutationResult =
  | { ok: true }
  | { ok: false; error: MutationFailure; message: string }
