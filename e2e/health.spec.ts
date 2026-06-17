import { test, expect } from '@playwright/test';

test.describe('Health Checks', () => {
  test('app should load successfully', async ({ page }) => {
    await page.goto('/');

    // Should see the app brand/logo
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });

    // Should see navigation
    await expect(page.locator('nav.navbar')).toBeVisible();
  });

  test('can navigate to report page', async ({ page }) => {
    await page.goto('/report');

    // Should see report page heading
    await expect(page.locator('h1')).toContainText('Report a Pothole', { timeout: 10000 });
  });

  test('can navigate to pothole list page', async ({ page }) => {
    await page.goto('/potholes');

    // Should see pothole list heading
    await expect(page.locator('h1')).toContainText('All Reported Potholes', { timeout: 10000 });
  });

  test('unknown routes redirect to dashboard', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Should be redirected to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('.hero-banner')).toBeVisible();
  });
});
