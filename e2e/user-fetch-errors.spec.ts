import { test, expect } from '@playwright/test';
import { isDebugInterfaceAvailable, getAuthState } from './helpers/debug';

test.describe('App Initialization', () => {
  test('debug interface should be available after app loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });

    const available = await isDebugInterfaceAvailable(page);
    expect(available).toBe(true);
  });

  test('auth state should be unauthenticated for pothole app', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });

    const state = await getAuthState(page);
    expect(state).toBe('unauthenticated');
  });

  test('app should load with clean localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator('.hero-banner')).toBeVisible();
    await expect(page.locator('.stat-number').first()).toContainText('0');
  });
});
