import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const DEMO = '/app/p/demo-atl-hvu';
const DEMO_NAME = 'Atlantic FC vs Highveld United';

test.describe('live public routes', () => {
  const routes: [string, RegExp][] = [
    ['/', /Every claim, tied to the moment that proves it/],
    ['/about', /A studio built around the evidence trail/],
    ['/privacy', /Your data stays in your browser/],
    ['/terms', /Beta terms/],
    ['/help', /Shortcuts, rules and recovery/],
  ];

  for (const [path, heading] of routes) {
    test(`${path} renders its headline`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  }

  test('security headers and framework banner', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-powered-by']).toBeUndefined();
  });
});

test.describe('live workspace routes', () => {
  const routes: [string, string | RegExp][] = [
    ['/app', 'Overview'],
    ['/app/projects', 'Projects'],
    ['/app/settings', 'Settings'],
    [`${DEMO}/data`, DEMO_NAME],
    [`${DEMO}/review`, DEMO_NAME],
    [`${DEMO}/export`, DEMO_NAME],
  ];

  for (const [path, heading] of routes) {
    test(`${path} renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    });
  }

  test('studio renders transport, timeline, pitch and insights', async ({ page }) => {
    await page.goto(DEMO);
    await expect(page.getByText('Timeline preview', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await expect(page.getByText('Moment inspector', { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Insights' })).toContainText('8 claims');
  });

  test('an unknown project id offers a way back', async ({ page }) => {
    await page.goto('/app/p/does-not-exist');
    await expect(page.getByText('Project not found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to projects' })).toBeVisible();
  });
});

test.describe('live workflows', () => {
  test('A — deep link opens the exact moment and transport keys work', async ({ page }) => {
    await page.goto(`${DEMO}?t=1394000000&event=evt-11`);

    const inspector = page.getByTestId('moment-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText('Goal · 23′14');
    await expect(inspector).toContainText('T. Silva');
    await expect(inspector).toContainText('Cited by 1 insight');
    await expect(page.getByText('23:14', { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Close moment inspector' }).click();
    await expect(inspector).toHaveCount(0);

    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  });

  test('D — stale evidence blocks export until reopened and accepted', async ({ page }) => {
    await page.goto(`${DEMO}/export`);
    await expect(page.getByText('Preflight blocked', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Build content pack' })).toBeDisabled();
    await expect(page.getByRole('link', { name: /Fix evidence/ })).toBeVisible();

    await page.goto(`${DEMO}/review`);
    const stale = page.getByTestId('insight-ins-06');
    await expect(stale.getByText('Stale', { exact: true })).toBeVisible();
    await stale.getByRole('button', { name: 'Reopen to fix evidence' }).click();
    await expect(page.getByText('Insight reopened')).toBeVisible();
    await expect(stale.getByText('Proposed', { exact: true })).toBeVisible();
    await stale.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Insight accepted')).toBeVisible();

    await page.goto(`${DEMO}/export`);
    await expect(page.getByText('Preflight clear', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Build content pack' }).click();

    const panel = page.getByRole('region', { name: 'Generated content pack' });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('3 evidence-backed claims');

    const downloadPromise = page.waitForEvent('download');
    await panel.getByRole('button', { name: 'Download .md' }).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const markdown = await readFile(downloadPath as string, 'utf8');
    expect(markdown).toContain('## Evidence ledger');
    expect(markdown).toContain('Atlantic FC 2–1 Highveld United');
    expect(markdown).toContain('## Tactical read');
  });

  test('E — workspace backup downloads from settings', async ({ page }) => {
    await page.goto('/app/settings');
    const backupPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export workspace' }).click();
    const backup = await backupPromise;
    expect(await backup.path()).toBeTruthy();
    expect(backup.suggestedFilename()).toMatch(/fics|workspace|backup/i);
  });
});
