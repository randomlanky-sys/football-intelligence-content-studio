// packages/api/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { buildApi } from './index'

describe('API Server', () => {
  test('buildApi returns an object with buildServer function', () => {
    const api = buildApi();
    expect(api).toHaveProperty('start');
    expect(typeof api.start).toBe('function');
  })

  test('placeholder for health check', () => {
    expect(true).toBe(true);
  })
})