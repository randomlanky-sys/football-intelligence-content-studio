// packages/db-migrations/src/schema.ts
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, jsonb, real } from 'drizzle-orm/pg-core';

// We'll define the schema here and then export it for use in migrations and in the API.

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  state: varchar('state', { length: 50 }).notNull().default('draft'),
  schemaVersion: integer('schema_ver').notNull().default(1),
  settings: jsonb('settings').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  kind: varchar('kind', { length: 50 }).notNull(), // e.g., 'video', 'audio'
  fingerprint: varchar('fingerprint', { length: 255 }).notNull().unique(),
  durationUs: integer('duration_us').notNull(),
  timescale: integer('timescale').notNull(),
  availability: varchar('availability', { length: 50 }).notNull().default('local'),
  storageMode: varchar('storage_mode', { length: 50 }).notNull().default('local_handle'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  competitionId: uuid('competition_id').references(() => competitions.id, { onDelete: 'set null' }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  periodConfig: jsonb('period_config').notNull(), // e.g., number of periods, length of each
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  identityState: varchar('identity_state', { length: 50 }).notNull(), // e.g., 'home', 'away'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  number: integer('number'),
  identityState: varchar('identity_state', { length: 50 }).notNull(), // e.g., 'starting', 'substitute'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  rev: integer('rev').notNull().default(1),
});

// We'll add more tables as needed, but for now we have a starting point.

// Export all tables for use in migrations and queries
export const schema = {
  projects,
  mediaAssets,
  matches,
  teams,
  players,
};