// packages/geometry/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { metersToPixels, pixelsToMeters, applyHomography } from './index'

describe('geometry utilities', () => {
  test('metersToPixels converts correctly', () => {
    expect(metersToPixels(1, 100)).toBe(100)
    expect(metersToPixels(0.5, 200)).toBe(100)
    expect(metersToPixels(0, 100)).toBe(0)
  })

  test('pixelsToMeters converts correctly', () => {
    expect(pixelsToMeters(100, 100)).toBe(1)
    expect(pixelsToMeters(50, 100)).toBe(0.5)
    expect(pixelsToMeters(0, 100)).toBe(0)
  })

  test('applyHomography identity matrix', () => {
    const H = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]
    const pt = {x: 10, y: 20}
    const result = applyHomography(pt, H)
    expect(result).toEqual({x: 10, y: 20})
  })

  test('applyHomography scaling', () => {
    const H = [
      2, 0, 0,
      0, 2, 0,
      0, 0, 1
    ]
    const pt = {x: 5, y: 5}
    const result = applyHomography(pt, H)
    // Should be (10, 10) because w=1, x = (2*5)/1 = 10, y = (2*5)/1 = 10
    expect(result).toEqual({x: 10, y: 10})
  })

  test('applyHomography translation', () => {
    const H = [
      1, 0, 5,
      0, 1, 5,
      0, 0, 1
    ]
    const pt = {x: 1, y: 1}
    const result = applyHomography(pt, H)
    // w = 0*1 + 0*1 + 1 = 1
    // x = (1*1 + 0*1 + 5)/1 = 6
    // y = (0*1 + 1*1 + 5)/1 = 6
    expect(result).toEqual({x: 6, y: 6})
  })
})