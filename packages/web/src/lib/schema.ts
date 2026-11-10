import { z } from 'zod'

/**
 * Workspace schema. This is the authoritative validator for browser data; it is
 * deliberately broader than @fics/schema because a workspace project embeds its
 * teams, events, insights and clips in one document.
 */

export const WORKSPACE_VERSION = 2
export const STORAGE_KEY = 'fics.workspace.v2'

const isoDate = z.string().min(1)

export const teamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  short: z.string().min(1).max(8),
  color: z.string().min(1).max(24),
  formation: z.string().min(1).max(20),
})

export const matchEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'kickoff',
    'pass',
    'shot',
    'goal',
    'save',
    'tackle',
    'foul',
    'card',
    'sub',
    'corner',
    'offside',
    'whistle',
  ]),
  // Fractional minutes are valid: `minute` is a display convenience derived
  // from `tUs` (e.g. 1m24s => 1.4). `tUs` remains the integer source of truth.
  minute: z.number().min(0).max(200),
  tUs: z.number().int().min(0),
  teamId: z.string().min(1),
  playerId: z.string().optional(),
  x: z.number().min(-10).max(120).optional(),
  y: z.number().min(-10).max(80).optional(),
  endX: z.number().min(-10).max(120).optional(),
  endY: z.number().min(-10).max(80).optional(),
  outcome: z.string().max(120).optional(),
  xg: z.number().min(0).max(1).optional(),
})

export const evidenceRefSchema = z.object({
  eventId: z.string().min(1),
  tUs: z.number().int().min(0),
  label: z.string().min(1).max(160),
})

export const insightSchema = z.object({
  id: z.string().min(1),
  claim: z.string().min(1).max(400),
  status: z.enum(['proposed', 'needs_evidence', 'accepted', 'edited', 'rejected']),
  evidenceHash: z.string().length(64),
  evidence: z.array(evidenceRefSchema).max(24),
  limitations: z.string().max(600).optional(),
  reviewer: z.string().max(120).optional(),
  updatedAt: isoDate,
})

export const clipSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(160),
  inUs: z.number().int().min(0),
  outUs: z.number().int().min(0),
  tags: z.array(z.string().max(40)).max(12),
})

export const contentPackSchema = z.object({
  title: z.string(),
  hook: z.string(),
  sections: z.array(
    z.object({
      id: z.string(),
      heading: z.string(),
      body: z.string(),
    }),
  ),
  captions: z.array(z.string()),
  hashtags: z.array(z.string()),
  thumbnailBrief: z.string(),
  evidenceSummary: z.array(z.string()),
  matchLabel: z.string(),
  generatedAt: z.string(),
  acceptedInsightIds: z.array(z.string()),
})

export const exportRecordSchema = z.object({
  id: z.string().min(1),
  preset: z.enum(['vertical_1080', 'landscape_1080', 'square_1080', 'article']),
  createdAt: z.string(),
  qcPassed: z.boolean(),
  pack: contentPackSchema,
})

export const projectSchema = z.object({
  id: z.string().min(1),
  origin: z.enum(['demo', 'user']),
  name: z.string().min(1).max(160),
  competition: z.string().min(1).max(160),
  date: isoDate,
  state: z.enum(['draft', 'active', 'review', 'exported', 'archived']),
  teams: z.object({ home: teamSchema, away: teamSchema }),
  score: z.object({
    home: z.number().int().min(0).max(99),
    away: z.number().int().min(0).max(99),
  }),
  possession: z.object({
    home: z.number().min(0).max(100),
    away: z.number().min(0).max(100),
  }),
  durationUs: z.number().int().min(0),
  fps: z.number().positive().max(240),
  events: z.array(matchEventSchema).max(5000),
  insights: z.array(insightSchema).max(500),
  clips: z.array(clipSchema).max(500),
  exports: z.array(exportRecordSchema).max(20),
  createdAt: isoDate,
  updatedAt: isoDate,
})

export const workspaceEnvelopeSchema = z.object({
  version: z.number().int().positive(),
  savedAt: isoDate,
  projects: z.array(projectSchema).max(200),
})

export const eventImportRowSchema = z.object({
  minute: z.coerce.number().int().min(0).max(200),
  second: z.coerce.number().int().min(0).max(59),
  type: z.enum([
    'kickoff',
    'pass',
    'shot',
    'goal',
    'save',
    'tackle',
    'foul',
    'card',
    'sub',
    'corner',
    'offside',
    'whistle',
  ]),
  team: z.enum(['home', 'away']),
  player: z.string().max(80).optional(),
  x: z.coerce.number().min(-10).max(120).optional(),
  y: z.coerce.number().min(-10).max(80).optional(),
  xg: z.coerce.number().min(0).max(1).optional(),
  outcome: z.string().max(120).optional(),
})

export type EventImportRow = z.infer<typeof eventImportRowSchema>
