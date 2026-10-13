// packages/timebase/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { nowMicros, stepFrame, seekToFrame } from './index'

describe('timebase utilities', () => {
  test('nowMicros returns a number', () => {
    const t = nowMicros()
    expect(typeof t).toBe('number')
    // Should be a positive number (microseconds since epoch)
    expect(t).toBeGreaterThan(0)
    // Optionally check it's within a reasonable range of Date.now()*1000
    // Allow up to 100ms difference due to execution skew
    const nowMs = Date.now()
    const expected = nowMs * 1000
    const diff = Math.abs(t - expected)
    expect(diff).toBeLessThanOrEqual(100 * 1000) // 100 ms in microseconds
  })

  test('stepFrame returns pts at index', () => {
    const pts = [0, 33, 66, 100] // microseconds per frame
    expect(stepFrame(pts, 0)).toBe(0)
    expect(stepFrame(pts, 1)).toBe(33)
    expect(stepFrame(pts, 2)).toBe(66)
    expect(stepFrame(pts, 3)).toBe(100)
    // out of bounds returns 0
    expect(stepFrame(pts, -1)).toBe(0)
    expect(stepFrame(pts, 4)).toBe(0)
    expect(stepFrame(pts, 100)).toBe(0)
  })

  test('seekToFrame finds correct index', () => {
    const pts = [0, 33, 66, 100, 133, 166]
    // exact matches
    expect(seekToFrame(pts, 0)).toBe(0)
    expect(seekToFrame(pts, 33)).toBe(1)
    expect(seekToFrame(pts, 66)).toBe(2)
    expect(seekToFrame(pts, 100)).toBe(3)
    // between frames
    expect(seekToFrame(pts, 50)).toBe(1) // between 33 and 66 -> index 1
    expect(seekToFrame(pts, 99)).toBe(2) // between 66 and 100 -> index 2 (66 <= 99 < 100)
    expect(seekToFrame(pts, 150)).toBe(4) // between 133 and 166 -> index 4
  })

  test('seekToFrame edge cases', () => {
    const pts = [10, 20, 30]
    // target less than first element
    expect(seekToFrame(pts, 5)).toBe(-1)
    // target equal to first
    expect(seekToFrame(pts, 10)).toBe(0)
    // target between first and second
    expect(seekToFrame(pts, 15)).toBe(0)
    // target equal to second
    expect(seekToFrame(pts, 20)).toBe(1)
    // target greater than last
    expect(seekToFrame(pts, 100)).toBe(2)
    // empty array
    expect(seekToFrame([], 5)).toBe(-1)
    // single element array
    expect(seekToFrame([5], 3)).toBe(-1)
    expect(seekToFrame([5], 5)).toBe(0)
    expect(seekToFrame([5], 7)).toBe(0)
  })
})