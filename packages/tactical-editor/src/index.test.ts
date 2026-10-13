// packages/tactical-editor/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { frameToTimestampUs, timestampToFrameUs, createAnnotation, isToolActive, getOppositeTeam } from './index'

describe('tactical editor utilities', () => {
  test('frameToTimestampUs converts correctly', () => {
    // 30 fps, frame 0 -> 0 us
    expect(frameToTimestampUs(0, 30)).toBe(0)
    // 30 fps, frame 1 -> 1/30 s = 33333.333... -> rounded to 33333
    expect(frameToTimestampUs(1, 30)).toBe(33333)
    // 60 fps, frame 1 -> 1/60 s = 16666.666... -> rounded to 16667
    expect(frameToTimestampUs(1, 60)).toBe(16667)
    // 24 fps, frame 24 -> 1 s = 1,000,000 us
    expect(frameToTimestampUs(24, 24)).toBe(1_000_000)
    // negative frame index -> 0
    expect(frameToTimestampUs(-5, 30)).toBe(0)
  })

  test('timestampToFrameUs converts correctly', () => {
    // 0 us -> frame 0
    expect(timestampToFrameUs(0, 30)).toBe(0)
    // 33333 us at 30 fps -> 0.033333 s * 30 = 0.99999 -> floor to 0
    expect(timestampToFrameUs(33333, 30)).toBe(0)
    // 33332 us -> slightly less than 1/30 s -> floor to 0
    expect(timestampToFrameUs(33332, 30)).toBe(0)
    // 1,000,000 us at 24 fps -> 1 s * 24 = 24 frames
    expect(timestampToFrameUs(1_000_000, 24)).toBe(24)
    // negative time -> 0
    expect(timestampToFrameUs(-1000, 30)).toBe(0)
  })

  test('createAnnotation creates object with expected fields', () => {
    const annotation = createAnnotation('arrow', 42, { x: 100, y: 200 })
    expect(annotation).toHaveProperty('type', 'arrow')
    expect(annotation).toHaveProperty('frame', 42)
    expect(annotation).toHaveProperty('props')
    expect(annotation.props).toEqual({ x: 100, y: 200 })
    expect(annotation).toHaveProperty('id')
    expect(typeof annotation.id).toBe('string')
    expect(annotation.id.length).toBe(9)
    expect(annotation).toHaveProperty('timestamp')
    expect(typeof annotation.timestamp).toBe('number')
    expect(annotation.timestamp).toBeGreaterThan(0)
  })

  test('isToolActive returns correct boolean', () => {
    expect(isToolActive('arrow', 'arrow')).toBe(true)
    expect(isToolActive('arrow', 'circle')).toBe(false)
    expect(isToolActive(null, 'arrow')).toBe(false)
    // test with different string
    expect(isToolActive('arrow', 'square')).toBe(false)
  })

  test('getOppositeTeam returns opposite', () => {
    expect(getOppositeTeam('home')).toBe('away')
    expect(getOppositeTeam('away')).toBe('home')
  })
})