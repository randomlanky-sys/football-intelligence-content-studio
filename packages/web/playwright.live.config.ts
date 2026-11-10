import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.LIVE_BASE_URL ?? 'https://football-intelligence-content-studio.onrender.com';

/**
 * Live verification config. No webServer: it points at a deployed host and
 * proves the artifact that is actually serving traffic. Kept out of the default
 * `e2e/` suite so CI never depends on an external deployment.
 *
 * Run: LIVE_BASE_URL=https://... pnpm exec playwright test -c playwright.live.config.ts
 */
export default defineConfig({
  testDir: './e2e-live',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    navigationTimeout: 120_000,
  },
  projects: [
    {
      name: 'live-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
