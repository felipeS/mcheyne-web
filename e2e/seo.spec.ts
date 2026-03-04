import { test, expect } from '@playwright/test';

test.describe('SEO Pages and Localizations', () => {
  test('Verify Plan Index Page (English)', async ({ page }) => {
    await page.goto('/en/plan');
    await expect(page.getByText('Day 1', { exact: true })).toBeVisible();
  });

  test('Verify Plan Index Page (Spanish)', async ({ page }) => {
    await page.goto('/es/plan');
    await expect(page.getByText('Día 1', { exact: true })).toBeVisible();
    // Verify book name translation (e.g. Genesis -> Génesis in ES)
    await expect(page.getByText('Génesis 1, Mateo 1, Esdras 1, Hechos 1', { exact: true })).toBeVisible();
  });

  test('Verify Day Page (English)', async ({ page }) => {
    await page.goto('/en/day/1');
    await expect(page.getByText('Genesis 1', { exact: false }).first()).toBeVisible();
  });

  test('Verify Day Page (Spanish)', async ({ page }) => {
    await page.goto('/es/day/1');
    await expect(page.getByText('Génesis 1', { exact: false }).first()).toBeVisible();
  });

  test('Settings Dialog opens on Plan Index Page (Spanish)', async ({ page }) => {
    await page.goto('/es/plan');

    // Find the settings button in the header
    const settingsButton = page.locator('button.h-10.w-10').first();
    await settingsButton.click();

    // The dialog should open, wait for "Tema" text.
    await expect(page.getByText('Tema', { exact: true })).toBeVisible();
  });

  test('Navigating directly to a day respects the specific day, not today', async ({ page }) => {
    // Navigate to day 5. We should see "Genesis 5", not today's reading.
    await page.goto('/en/day/5');
    await expect(page.getByText('Genesis 5', { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });
});
