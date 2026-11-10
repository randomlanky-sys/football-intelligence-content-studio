/**
 * Project command log and snapshots. In-memory today; the interface is shaped
 * so a durable store can replace the maps without changing callers.
 */

export interface CommandEntry {
  seq: string;
  projectId: string;
  command: unknown;
  recordedAt: number;
}

export interface SnapshotRecord {
  ref: string;
  projectId: string;
  payload: unknown;
  createdAt: number;
}

export interface RecoveryResult {
  snapshotRef: string;
  recovered: boolean;
  payload?: unknown;
}

const commandLog = new Map<string, CommandEntry[]>();
const snapshots = new Map<string, SnapshotRecord>();
let commandCounter = 0;
let snapshotCounter = 0;

function clone<T>(value: T): T {
  if (typeof globalThis.structuredClone === 'function') return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Append a command and return its sequence id (`<projectId>-cmd-000001`). */
export function appendCommand(projectId: string, command: unknown): string {
  commandCounter += 1;
  const seq = `${projectId}-cmd-${commandCounter.toString().padStart(6, '0')}`;
  const entries = commandLog.get(projectId) ?? [];
  entries.push({ seq, projectId, command: clone(command), recordedAt: Date.now() });
  commandLog.set(projectId, entries);
  return seq;
}

export function getCommandLog(projectId: string): CommandEntry[] {
  return [...(commandLog.get(projectId) ?? [])];
}

export function clearCommandLog(projectId: string): void {
  commandLog.delete(projectId);
}

/** Snapshot a project payload and return a reference. */
export function snapshotProject(projectId: string, payload: unknown): string {
  snapshotCounter += 1;
  const ref = `${projectId}-snapshot-${snapshotCounter}`;
  snapshots.set(ref, {
    ref,
    projectId,
    payload: clone(payload),
    createdAt: Date.now(),
  });
  return ref;
}

/** Recover a snapshot. Unknown references report `recovered: false`. */
export function recoverFromSnapshot(snapshotRef: string): RecoveryResult {
  const record = snapshots.get(snapshotRef);
  if (!record) return { snapshotRef, recovered: false };
  return { snapshotRef, recovered: true, payload: clone(record.payload) };
}

export function listSnapshots(projectId: string): SnapshotRecord[] {
  return [...snapshots.values()].filter((snapshot) => snapshot.projectId === projectId);
}

/** Test/reset hook: clears all in-memory state. */
export function resetProjectCore(): void {
  commandLog.clear();
  snapshots.clear();
  commandCounter = 0;
  snapshotCounter = 0;
}
