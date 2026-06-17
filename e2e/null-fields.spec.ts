import { test, expect } from '@playwright/test';

test.describe('Pothole Data Edge Cases', () => {
  test('should handle potholes with empty descriptions', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const potholes = [
        {
          id: 'test-1',
          location: { lat: 20.0, lng: 78.0 },
          severity: 'medium',
          description: '',
          reportedAt: new Date().toISOString(),
          reportedBy: 'Test User',
          resolved: false,
        },
      ];
      localStorage.setItem('pothole_alerts_data', JSON.stringify(potholes));
    });

    await page.reload();
    await expect(page.locator('.pothole-card')).toBeVisible();
    await expect(page.locator('.pothole-description')).toContainText('No description provided');
  });

  test('should handle potholes with missing reporter name', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const potholes = [
        {
          id: 'test-2',
          location: { lat: 19.0, lng: 77.0 },
          severity: 'high',
          description: 'Large pothole on highway',
          reportedAt: new Date().toISOString(),
          reportedBy: '',
          resolved: false,
        },
      ];
      localStorage.setItem('pothole_alerts_data', JSON.stringify(potholes));
    });

    await page.reload();
    await expect(page.locator('.pothole-card')).toBeVisible();
  });
});
