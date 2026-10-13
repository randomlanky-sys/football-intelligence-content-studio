// packages/project-core/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { appendCommand, snapshotProject, recoverFromSnapshot } from './index'

describe('project-core utilities', () => {
  test('appendCommand returns a string', () => {
    const seq = appendCommand('proj-123', {type: 'ADD_MEDIA', payload: {}})
    expect(typeof seq).toBe('string')
    expect(seq).toContain('proj-123')
    // We can also check that it's not empty
    expect(seq.length).toBeGreaterThan(0)
  })

  test('snapshotProject returns a reference', () => {
    const ref = snapshotProject('proj-123', {name: 'Test Project'})
    expect(typeof ref).toBe('string')
    expect(ref).toContain('proj-123')
    expect(ref).toContain('snapshot')
  })

  test('recoverFromSnapshot returns object with snapshotRef and recovered flag', () => {
    const rec = recoverFromSnapshot('proj-123-snapshot-1')
    expect(rec).toHaveProperty('snapshotRef')
    expect(rec.snapshotRef).toBe('proj-123-snapshot-1')
    expect(rec).toHaveProperty('recovered')
    expect(rec.recovered).toBe(true)
  })

  test('appendCommand generates different sequences for same project', () => {
    const seq1 = appendCommand('proj-123', {type: 'ADD_MEDIA', payload: {}})
    const seq2 = appendCommand('proj-123', {type: 'ADD_MEDIA', payload: {}})
    expect(seq1).not.toBe(seq2)
  })
})