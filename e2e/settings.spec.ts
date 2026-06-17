import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should show hero banner with correct title', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.hero-banner h1')).toContainText('Pothole Alert System');
    await expect(page.locator('.hero-banner p')).toContainText('Stay safe on the road');
  });

  test('should show stats cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.stat-card')).toHaveCount(4);
    await expect(page.locator('.stat-label').nth(0)).toContainText('Total Reports');
    await expect(page.locator('.stat-label').nth(1)).toContainText('Active Potholes');
    await expect(page.locator('.stat-label').nth(2)).toContainText('Nearby');
    await expect(page.locator('.stat-label').nth(3)).toContainText('GPS Tracking');
  });

  test('should show action buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('a[href="/report"].btn-action')).toBeVisible();
    await expect(page.locator('a[href="/potholes"].btn-action')).toBeVisible();
  });

  test('should show map section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.map-wrapper h2')).toContainText('Live Map');
    await expect(page.locator('.map-frame')).toBeVisible();
  });
});
