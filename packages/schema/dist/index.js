// packages/schema/src/index.ts
import { z } from 'zod';
/**
 * Project schema for football intelligence & content studio.
 */
export const projectSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().min(1),
    name: z.string().min(1).max(255),
    state: z.enum(['draft', 'active', 'archived', 'completed']),
    schemaVer: z.number().int().positive().default(1),
    settings: z.record(z.unknown()).default({}),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Media asset schema.
 */
export const mediaSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    kind: z.enum(['video', 'audio', 'image']),
    fingerprint: z.string().min(1).max(255),
    durationUs: z.number().int().nonnegative(),
    timescale: z.number().int().positive(),
    availability: z.enum(['local', 'cloud', 'proxy']).default('local'),
    storageMode: z.enum(['local_handle', 'opfs', 'cloud']).default('local_handle'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Match schema.
 */
export const matchSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    competitionId: z.string().uuid().nullable(),
    date: z.string().datetime(),
    periodConfig: z.record(z.unknown()),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Team schema.
 */
export const teamSchema = z.object({
    id: z.string().uuid(),
    matchId: z.string().uuid(),
    name: z.string().min(1).max(255),
    identityState: z.enum(['home', 'away']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Player schema.
 */
export const playerSchema = z.object({
    id: z.string().uuid(),
    teamId: z.string().uuid(),
    name: z.string().min(1).max(255),
    number: z.number().int().positive().nullable(),
    identityState: z.enum(['starting', 'substitute']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Competition schema.
 */
export const competitionSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    name: z.string().min(1).max(255),
    dateRange: z.string().nullable(), // TSRANGE as string
    config: z.record(z.unknown()).default({}),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Event schema for match events.
 */
export const eventSchema = z.object({
    id: z.string().uuid(),
    matchId: z.string().uuid(),
    type: z.string().min(1),
    matchClock: z.number().int().nonnegative(),
    tUs: z.number().int().nonnegative(),
    pitchX: z.number().nullable(),
    pitchY: z.number().nullable(),
    source: z.enum(['import', 'human', 'ai']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Clip schema.
 */
export const clipSchema = z.object({
    id: z.string().uuid(),
    assetId: z.string().uuid(),
    inUs: z.number().int().nonnegative(),
    outUs: z.number().int().nonnegative(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
/**
 * Insight schema.
 */
export const insightSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    claim: z.string().min(1),
    status: z.enum(['draft', 'review', 'approved', 'rejected', 'stale']),
    evidenceHash: z.string().nullable(),
    limitations: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    rev: z.number().int().nonnegative().default(1),
});
// Export all schemas
export const schemas = {
    project: projectSchema,
    media: mediaSchema,
    match: matchSchema,
    team: teamSchema,
    player: playerSchema,
    competition: competitionSchema,
    event: eventSchema,
    clip: clipSchema,
    insight: insightSchema,
};
