import { randomUUID } from 'node:crypto';

export type ProjectState = 'draft' | 'active' | 'review' | 'exported' | 'archived';

export interface ProjectRecord {
  id: string;
  ownerId: string;
  name: string;
  state: ProjectState;
  schemaVer: number;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  rev: number;
}

export interface CreateProjectInput {
  name: string;
  ownerId?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateProjectInput {
  name?: string;
  state?: ProjectState;
  settings?: Record<string, unknown>;
}

/**
 * In-memory project repository. The API is deliberately storage-agnostic so a
 * Postgres-backed implementation can replace it without touching the routes.
 */
export class ProjectRepository {
  readonly #items = new Map<string, ProjectRecord>();

  list(ownerId?: string): ProjectRecord[] {
    const all = [...this.#items.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return ownerId ? all.filter((p) => p.ownerId === ownerId) : all;
  }

  get(id: string): ProjectRecord | undefined {
    return this.#items.get(id);
  }

  create(input: CreateProjectInput): ProjectRecord {
    const now = new Date().toISOString();
    const record: ProjectRecord = {
      id: randomUUID(),
      ownerId: input.ownerId ?? 'local-user',
      name: input.name,
      state: 'draft',
      schemaVer: 1,
      settings: input.settings ?? {},
      createdAt: now,
      updatedAt: now,
      rev: 1,
    };
    this.#items.set(record.id, record);
    return record;
  }

  update(id: string, patch: UpdateProjectInput): ProjectRecord | undefined {
    const current = this.#items.get(id);
    if (!current) return undefined;
    const next: ProjectRecord = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
      rev: current.rev + 1,
    };
    this.#items.set(id, next);
    return next;
  }

  delete(id: string): boolean {
    return this.#items.delete(id);
  }

  clear(): void {
    this.#items.clear();
  }

  get size(): number {
    return this.#items.size;
  }
}
