// packages/db-migrations/src/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';

/** Competitions are shared across projects. */
export const competitions = pgTable('competitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  season: varchar('season', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  state: varchar('state', { length: 50 }).notNull().default('draft'),
  schemaVersion: integer('schema_ver').notNull().default(1),
  isDemo: boolean('is_demo').notNull().default(false),
  settings: jsonb('settings').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  kind: varchar('kind', { length: 50 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  fingerprint: varchar('fingerprint', { length: 255 }).notNull().unique(),
  durationUs: integer('duration_us').notNull().default(0),
  timescale: integer('timescale').notNull().default(1),
  availability: varchar('availability', { length: 50 }).notNull().default('local'),
  storageMode: varchar('storage_mode', { length: 50 }).notNull().default('local_handle'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  competitionId: uuid('competition_id').references(() => competitions.id, {
    onDelete: 'set null',
  }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  periodConfig: jsonb('period_config').notNull(),
  durationUs: integer('duration_us').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id')
    .references(() => matches.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  shortName: varchar('short_name', { length: 8 }).notNull(),
  identityState: varchar('identity_state', { length: 50 }).notNull(),
  colour: varchar('colour', { length: 9 }).notNull().default('#C6F24E'),
  formation: varchar('formation', { length: 20 }).notNull().default('4-3-3'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  number: integer('number'),
  identityState: varchar('identity_state', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  teamId: varchar('team_id', { length: 64 }).notNull(),
  playerId: varchar('player_id', { length: 64 }),
  minute: integer('minute').notNull(),
  tUs: integer('t_us').notNull(),
  x: real('x'),
  y: real('y'),
  endX: real('end_x'),
  endY: real('end_y'),
  outcome: varchar('outcome', { length: 50 }),
  xg: real('xg'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  claim: text('claim').notNull(),
  status: varchar('status', { length: 32 }).notNull().default('proposed'),
  evidenceHash: varchar('evidence_hash', { length: 64 }).notNull(),
  evidence: jsonb('evidence').notNull().default([]),
  limitations: text('limitations'),
  reviewer: varchar('reviewer', { length: 120 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const clips = pgTable('clips', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  inUs: integer('in_us').notNull(),
  outUs: integer('out_us').notNull(),
  tags: jsonb('tags').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  competitions,
  projects,
  mediaAssets,
  matches,
  teams,
  players,
  events,
  insights,
  clips,
};
