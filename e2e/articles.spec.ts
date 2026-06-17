import { test, expect } from '@playwright/test';

test.describe('Pothole Reporting', () => {
  test('should show report form with required fields', async ({ page }) => {
    await page.goto('/report');

    await expect(page.locator('h1')).toContainText('Report a Pothole');
    await expect(page.locator('#severity')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#reporter')).toBeVisible();
  });

  test('submit button should be disabled without location', async ({ page }) => {
    await page.goto('/report');

    const submitBtn = page.locator('.btn-submit');
    await expect(submitBtn).toBeDisabled();
  });

  test('should show hint text when no location selected', async ({ page }) => {
    await page.goto('/report');

    await expect(page.locator('.hint-text')).toContainText('select a location');
  });

  test('severity dropdown should have three options', async ({ page }) => {
    await page.goto('/report');

    const options = page.locator('#severity option');
    await expect(options).toHaveCount(3);
  });
});
