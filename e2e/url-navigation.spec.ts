import { test, expect } from '@playwright/test';

test.describe('URL-based Navigation', () => {
  test('/ should show dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-banner')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('/report should show report form', async ({ page }) => {
    await page.goto('/report');
    await expect(page.locator('h1')).toContainText('Report a Pothole');
    await expect(page).toHaveURL('/report');
  });

  test('/potholes should show pothole list', async ({ page }) => {
    await page.goto('/potholes');
    await expect(page.locator('h1')).toContainText('All Reported Potholes');
    await expect(page).toHaveURL('/potholes');
  });

  test('wildcard routes should redirect to /', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/');

    await page.goto('/register');
    await expect(page).toHaveURL('/');

    await page.goto('/settings');
    await expect(page).toHaveURL('/');

    await page.goto('/random/path');
    await expect(page).toHaveURL('/');
  });
});
