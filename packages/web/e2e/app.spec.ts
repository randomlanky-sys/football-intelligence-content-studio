import { readFile } from 'node:fs/promises';
import { test, expect, type Page } from '@playwright/test';

const DEMO_ID = 'demo-atl-hvu';
const DEMO_NAME = 'Atlantic FC vs Highveld United';
const DEMO = `/app/p/${DEMO_ID}`;
const STORAGE_KEY = 'fics.workspace.v2';

/** Seeded once per browser context, before any app script runs. */
async function seedStorageOnce(page: Page, value: string): Promise<void> {
  await page.addInitScript(
    ([key, raw]) => {
      if (window.localStorage.getItem('__e2e_seeded') === null) {
        window.localStorage.setItem(key as string, raw as string);
        window.localStorage.setItem('__e2e_seeded', '1');
      }
    },
    [STORAGE_KEY, value] as const,
  );
}

test.describe('public routes', () => {
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
      await expect(page.getByRole('link', { name: 'Open the demo match' }).first()).toBeVisible();
    });
  }
});

test.describe('workspace routes', () => {
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
      await page.goto(path);
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

test.describe('workflows', () => {
  test('A — studio deep link opens the exact moment and transport keys work', async ({ page }) => {
    await page.goto(`${DEMO}?t=1394000000&event=evt-11`);

    const inspector = page.getByTestId('moment-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector).toContainText('Goal · 23′14');
    await expect(inspector).toContainText('T. Silva');
    await expect(inspector).toContainText('Cited by 1 insight');
    await expect(page.getByText('23:14', { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Close moment inspector' }).click();
    await expect(inspector).toHaveCount(0);
    await expect(page.getByText('Moment inspector', { exact: true })).toBeVisible();

    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  });

  test('B — review accepts a proposed claim and re-baselines its hash', async ({ page }) => {
    await page.goto(`${DEMO}/review`);

    const card = page.getByTestId('insight-ins-01');
    await expect(card).toBeVisible();
    await expect(card.getByText('Proposed', { exact: true })).toBeVisible();

    await card.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByText('Insight accepted')).toBeVisible();
    await expect(card.getByText('Accepted', { exact: true })).toBeVisible();
    await expect(card.getByRole('button', { name: 'Reopen' })).toBeVisible();
  });

  test('C — CSV import rejects a bad row, then appends valid events', async ({ page }) => {
    await page.goto(`${DEMO}/data`);

    const input = page.locator('#csv-input');
    await input.fill('minute,second,type,team\n99,99,goal,home\n');
    await expect(page.getByText(/Row 2:/)).toBeVisible();
    await expect(page.getByText('Nothing will be written until every row is valid.')).toBeVisible();

    await input.fill('minute,second,type,team\n10,0,pass,home\n20,0,tackle,away\n');
    await expect(page.getByText('2 valid rows', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Import 2 events' }).click();
    await expect(page.getByText('2 events imported')).toBeVisible();
    await expect(page.getByText('34 total', { exact: true })).toBeVisible();
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
    await expect(page.getByText('1/20', { exact: true })).toBeVisible();
  });

  test('E — export, reset the demo, then import restores the backup', async ({ page }) => {
    await page.goto('/app/settings');
    const backupPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export workspace' }).click();
    const backup = await backupPromise;
    const backupPath = await backup.path();
    expect(backupPath).toBeTruthy();

    await page.goto('/app/projects#new');
    // Wait for the hydrated client render (the project card only exists after
    // the store loads) before typing, so the controlled form is interactive.
    await expect(page.getByRole('link', { name: 'Open studio' }).first()).toBeVisible();
    await page.locator('#project-name').fill('E2E User Match');
    const create = page.getByRole('button', { name: 'Create project' });
    await expect(create).toBeEnabled();
    await create.click();
    await expect(page).toHaveURL(/\/app\/p\/[^/]+\/data$/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E User Match');

    await page.goto('/app/settings');
    await expect(page.getByRole('button', { name: 'Export workspace' })).toBeVisible();
    await page.getByRole('button', { name: 'Reset demo' }).click();
    const resetDialog = page.getByRole('dialog');
    await expect(resetDialog).toBeVisible();
    await resetDialog.locator('#reset-confirm').fill('RESET');
    await resetDialog.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.getByText('Demo reset')).toBeVisible();

    await page
      .locator('input[type="file"][accept*="json"]')
      .setInputFiles(backupPath as string);
    const importDialog = page.getByRole('dialog');
    await expect(importDialog.getByText('Replace this workspace?')).toBeVisible();
    await importDialog.getByRole('button', { name: 'Import and replace' }).click();
    await expect(page.getByText('Workspace imported')).toBeVisible();

    await page.goto('/app/projects');
    await expect(page.getByText(/1 saved/)).toBeVisible();
    await expect(page.getByText('E2E User Match')).toHaveCount(0);
    await expect(page.getByText(DEMO_NAME).first()).toBeVisible();
  });

  test('F — command palette jumps between screens', async ({ page }) => {
    await page.goto('/app');
    await page.keyboard.press('Control+K');

    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette).toBeVisible();
    await palette.getByRole('textbox', { name: 'Search workspace' }).fill('Settings');
    await palette.getByRole('option', { name: /Settings/ }).click();

    await expect(page).toHaveURL(/\/app\/settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  });
});

test.describe('storage safety', () => {
  test('corrupt storage is quarantined and the demo recovers', async ({ page }) => {
    await seedStorageOnce(page, '{ definitely not json');

    await page.goto('/app');
    await expect(
      page.getByRole('status').filter({ hasText: 'Saved workspace could not be read' }),
    ).toBeVisible();
    await expect(page.getByText(DEMO_NAME).first()).toBeVisible();

    await page.goto('/app/settings');
    await expect(page.getByText(/fics\.workspace\.v2\.corrupt\./)).toBeVisible();
  });

  test('a newer workspace opens read-only and refuses writes', async ({ page }) => {
    await seedStorageOnce(
      page,
      JSON.stringify({ version: 99, savedAt: '2026-11-09T00:00:00.000Z', projects: [] }),
    );

    await page.goto('/app');
    await expect(
      page.getByRole('status').filter({ hasText: 'This workspace is newer than the app' }),
    ).toBeVisible();

    await page.goto('/app/projects');
    await expect(page.getByText('Read-only workspace', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create project' })).toBeDisabled();
  });
});

test.describe('mobile', () => {
  test('@mobile workspace shell and studio stack without horizontal overflow', async ({ page }) => {
    await page.goto('/app');
    const nav = page.getByRole('navigation', { name: 'Workspace mobile' });
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Projects' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();

    await page.goto(DEMO);
    await expect(page.getByText('Timeline preview', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
