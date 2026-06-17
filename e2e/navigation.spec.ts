import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate through main pages via navbar', async ({ page }) => {
    await page.goto('/');

    // Should see dashboard
    await expect(page.locator('a.navbar-brand')).toBeVisible();
    await expect(page.locator('.hero-banner')).toBeVisible();

    // Click Report
    await page.click('a.nav-link[href="/report"]');
    await expect(page).toHaveURL('/report');
    await expect(page.locator('h1')).toContainText('Report a Pothole');

    // Click All Potholes
    await page.click('a.nav-link[href="/potholes"]');
    await expect(page).toHaveURL('/potholes');
    await expect(page.locator('h1')).toContainText('All Reported Potholes');

    // Click brand logo to go home
    await page.click('a.navbar-brand');
    await expect(page).toHaveURL('/');
  });

  test('should show back link on report page', async ({ page }) => {
    await page.goto('/report');

    const backLink = page.locator('.back-link');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should show back link on pothole list page', async ({ page }) => {
    await page.goto('/potholes');

    const backLink = page.locator('.back-link');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });
});
