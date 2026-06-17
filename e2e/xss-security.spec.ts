import { test, expect, Page } from '@playwright/test';

/**
 * XSS Security Tests for PotholeGuard
 *
 * Tests that user-supplied pothole data (description, reporter name)
 * is properly sanitized when rendered in the UI and map popups.
 */

const XSS_PAYLOADS = [
  { name: 'script tag', payload: '<script>alert(1)</script>' },
  { name: 'img onerror', payload: '<img src=x onerror="alert(1)">' },
  { name: 'svg onload', payload: '<svg onload="alert(1)">' },
];

function setupXssDetector(page: Page): () => boolean {
  let xssTriggered = false;
  page.on('dialog', async dialog => {
    xssTriggered = true;
    await dialog.dismiss();
  });
  return () => xssTriggered;
}

test.describe('@security XSS Security - Pothole Description Injection', () => {
  for (const { name, payload } of XSS_PAYLOADS) {
    test(`should prevent XSS via ${name} in pothole description`, async ({ page }) => {
      const wasXssTriggered = setupXssDetector(page);

      await page.goto('/');
      await page.evaluate(
        ([desc]) => {
          const potholes = [
            {
              id: 'xss-test',
              location: { lat: 20.0, lng: 78.0 },
              severity: 'high',
              description: desc,
              reportedAt: new Date().toISOString(),
              reportedBy: 'Attacker',
              resolved: false,
            },
          ];
          localStorage.setItem('pothole_alerts_data', JSON.stringify(potholes));
        },
        [payload],
      );

      await page.reload();
      await page.waitForTimeout(1500);

      expect(wasXssTriggered()).toBe(false);
    });
  }
});
