import { test, expect } from '@playwright/test';
import { getToken, getAuthState } from './helpers/debug';

test.describe('Debug Interface', () => {
  test('should expose __conduit_debug__ interface', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });

    const token = await getToken(page);
    expect(token).toBeNull();

    const authState = await getAuthState(page);
    expect(authState).toBe('unauthenticated');
  });

  test('should return null for current user in pothole app', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.navbar-brand')).toBeVisible({ timeout: 10000 });

    const user = await page.evaluate(() => window.__conduit_debug__?.getCurrentUser() ?? null);
    expect(user).toBeNull();
  });
});
