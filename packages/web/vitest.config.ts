import { defineConfig } from 'vitest/config'

/**
 * Unit tests only. Playwright owns `e2e/**`; running those specs through vitest
 * fails because Playwright's runner is not installed in the vitest process.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
    environment: 'node',
  },
})
