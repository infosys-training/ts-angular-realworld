import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should handle missing localStorage gracefully', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // App should still load
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.hero-banner')).toBeVisible();
  });

  test('should handle corrupted localStorage data gracefully', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('pothole_alerts_data', 'not-valid-json');
    });
    await page.reload();

    // App should still load without crashing
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });
  });

  test('should handle invalid pothole data in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('pothole_alerts_data', JSON.stringify([{ id: 'test', invalid: true }]));
    });
    await page.reload();

    // App should still load
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });
  });
});
