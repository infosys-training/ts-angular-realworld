import { test, expect } from '@playwright/test';

test.describe('Map Component', () => {
  test('should render map on dashboard', async ({ page }) => {
    await page.goto('/');

    // Map container should be present
    await expect(page.locator('.map-frame')).toBeVisible();
    // Leaflet map should initialize (look for tile layer)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });

  test('should render map on report page', async ({ page }) => {
    await page.goto('/report');

    await expect(page.locator('.map-frame-report')).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
  });
});
