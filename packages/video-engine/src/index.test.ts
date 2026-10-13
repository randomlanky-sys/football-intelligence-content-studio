// packages/video-engine/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { frameToTimeUs, timeToFrameUs, calculateDurationUs } from './index'

describe('video engine utilities', () => {
  test('frameToTimeUs converts correctly', () => {
    // 30 fps, frame 0 -> 0 us
    expect(frameToTimeUs(0, 30)).toBe(0)
    // 30 fps, frame 1 -> 1/30 s = 33333.333... us -> rounded to 33333
    expect(frameToTimeUs(1, 30)).toBe(33333)
    // 60 fps, frame 1 -> 1/60 s = 16666.666... -> rounded to 16667
    expect(frameToTimeUs(1, 60)).toBe(16667)
    // 24 fps, frame 24 -> 1 s = 1,000,000 us
    expect(frameToTimeUs(24, 24)).toBe(1_000_000)
    // negative frame index -> 0
    expect(frameToTimeUs(-5, 30)).toBe(0)
  })

  test('timeToFrameUs converts correctly', () => {
    // 0 us -> frame 0
    expect(timeToFrameUs(0, 30)).toBe(0)
    // 33333 us at 30 fps -> 0.033333 s * 30 = 0.99999 -> floor to 0
    expect(timeToFrameUs(33333, 30)).toBe(0)
    // 33332 us -> slightly less than 1/30 s -> floor to 0
    expect(timeToFrameUs(33332, 30)).toBe(0)
    // 1,000,000 us at 24 fps -> 1 s * 24 = 24 frames
    expect(timeToFrameUs(1_000_000, 24)).toBe(24)
    // negative time -> 0
    expect(timeToFrameUs(-1000, 30)).toBe(0)
  })

  test('calculateDurationUs computes correctly', () => {
    // 0 frames -> 0
    expect(calculateDurationUs(0, 30)).toBe(0)
    // 1 frame at 30 fps -> 1/30 s = 33333.333... -> rounded to 33333
    expect(calculateDurationUs(1, 30)).toBe(33333)
    // 30 frames at 30 fps -> 1 s = 1,000,000 us
    expect(calculateDurationUs(30, 30)).toBe(1_000_000)
    // 60 frames at 60 fps -> 1 s = 1,000,000 us
    expect(calculateDurationUs(60, 60)).toBe(1_000_000)
    // negative frame count -> 0
    expect(calculateDurationUs(-5, 30)).toBe(0)
  })

  test('consistency between frameToTimeUs and timeToFrameUs', () => {
    const fps = 25
    for (let frame = 0; frame < 100; frame++) {
      const timeUs = frameToTimeUs(frame, fps)
      const frameBack = timeToFrameUs(timeUs, fps)
      // Due to rounding, we may be off by at most 1 frame.
      expect(frameBack).toBeGreaterThanOrEqual(frame - 1)
      expect(frameBack).toBeLessThanOrEqual(frame + 1)
    }
  })
})