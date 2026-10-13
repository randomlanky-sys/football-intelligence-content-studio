// packages/export-engine/src/index.test.ts
import { expect, test, describe } from 'vitest'
import { validatePreFlight, validatePostRender, generateExportMetadata } from './index'

describe('export engine utilities', () => {
  test('validatePreFlight validates pre-flight status', () => {
    expect(validatePreFlight(1000000, { hasValidTimestamps: true })).toBe(true);
    expect(validatePreFlight(0, { hasValidTimestamps: true })).toBe(false);
    expect(validatePreFlight(1000000, { hasValidTimestamps: false })).toBe(false);
  })

  test('validatePostRender validates post-render status', () => {
    expect(validatePostRender({ hasValidTimestamps: true })).toBe(true);
    expect(validatePostRender({ hasValidTimestamps: false })).toBe(false);
  })

  test('generateExportMetadata generates correct metadata', () => {
    const metadata = generateExportMetadata({ format: 'json' });
    expect(metadata).toHaveProperty('exportId');
    expect(metadata).toHaveProperty('timestamp');
    expect(metadata).toHaveProperty('config');
    expect(result.valid).toBe(true);
  })