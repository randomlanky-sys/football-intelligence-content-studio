import { test, expect } from '@playwright/test';

test.describe('Football Intelligence & Content Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Football Intelligence/);
  });

  test('should display navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/.*projects/);
  });

  test('should display project list', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('[data-testid="project-list"]')).toBeVisible();
  });

  test('should display project details', async ({ page }) => {
    await page.goto('/projects/1');
    await expect(page.locator('[data-testid="project-detail"]')).toBeVisible();
  });
});