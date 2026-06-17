import { test, expect } from '@playwright/test';

test.describe('Pothole List', () => {
  test('should show empty state when no potholes reported', async ({ page }) => {
    // Clear any existing data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/potholes');
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state h3')).toContainText('No potholes found');
  });

  test('should show filter tabs', async ({ page }) => {
    await page.goto('/potholes');

    await expect(page.locator('.filter-tab').nth(0)).toContainText('All');
    await expect(page.locator('.filter-tab').nth(1)).toContainText('Active');
    await expect(page.locator('.filter-tab').nth(2)).toContainText('Resolved');
  });

  test('All filter should be active by default', async ({ page }) => {
    await page.goto('/potholes');

    const allTab = page.locator('.filter-tab').nth(0);
    await expect(allTab).toHaveClass(/active/);
  });

  test('should have link to report page from empty state', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/potholes');
    await expect(page.locator('.empty-state .btn')).toBeVisible();
    await page.click('.empty-state .btn');
    await expect(page).toHaveURL('/report');
  });
});
