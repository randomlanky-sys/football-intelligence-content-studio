import { beforeEach, describe, expect, test } from 'vitest';
import {
  appendCommand,
  clearCommandLog,
  getCommandLog,
  listSnapshots,
  recoverFromSnapshot,
  resetProjectCore,
  snapshotProject,
} from './index';

beforeEach(() => {
  resetProjectCore();
});

describe('command log', () => {
  test('appendCommand returns a unique, project-scoped sequence', () => {
    const first = appendCommand('proj-123', { type: 'ADD_MEDIA', payload: {} });
    const second = appendCommand('proj-123', { type: 'ADD_MEDIA', payload: {} });
    expect(first).toContain('proj-123');
    expect(first).not.toBe(second);
  });

  test('entries are recorded in order and cloned', () => {
    const command = { type: 'ADD_MEDIA', payload: { id: 'm1' } };
    appendCommand('proj-1', command);
    command.payload.id = 'mutated';
    const log = getCommandLog('proj-1');
    expect(log).toHaveLength(1);
    expect(log[0]?.command).toEqual({ type: 'ADD_MEDIA', payload: { id: 'm1' } });
  });

  test('clearCommandLog empties one project only', () => {
    appendCommand('proj-1', {});
    appendCommand('proj-2', {});
    clearCommandLog('proj-1');
    expect(getCommandLog('proj-1')).toEqual([]);
    expect(getCommandLog('proj-2')).toHaveLength(1);
  });
});

describe('snapshots', () => {
  test('snapshotProject returns a reference and recovers a copy', () => {
    const payload = { name: 'Test Project', events: [{ id: 'e1' }] };
    const ref = snapshotProject('proj-123', payload);
    expect(ref).toContain('proj-123');
    expect(ref).toContain('snapshot');

    payload.events[0]!.id = 'mutated';
    const recovered = recoverFromSnapshot(ref);
    expect(recovered.recovered).toBe(true);
    expect(recovered.payload).toEqual({ name: 'Test Project', events: [{ id: 'e1' }] });
  });

  test('unknown references report not recovered', () => {
    expect(recoverFromSnapshot('missing-snapshot')).toEqual({
      snapshotRef: 'missing-snapshot',
      recovered: false,
    });
  });

  test('listSnapshots filters by project', () => {
    snapshotProject('proj-1', {});
    snapshotProject('proj-2', {});
    snapshotProject('proj-1', {});
    expect(listSnapshots('proj-1')).toHaveLength(2);
    expect(listSnapshots('proj-2')).toHaveLength(1);
  });
});
