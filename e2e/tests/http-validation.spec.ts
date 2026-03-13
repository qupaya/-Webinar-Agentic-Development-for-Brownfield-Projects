import { test, expect } from '@playwright/test';

test.describe('HTTP Validation', () => {
  test('should return 200 for root route', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for list route', async ({ page }) => {
    const response = await page.goto('/list');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for add route', async ({ page }) => {
    const response = await page.goto('/add');
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for valid petition detail route', async ({ page }) => {
    // First, populate debug data by going to list and clicking title 7 times
    await page.goto('/list');
    await page.waitForLoadState('domcontentloaded');

    const title = page.locator('h1:has-text("Municipality Petitions")');
    for (let i = 0; i < 7; i++) {
      await title.click();
    }
    await page.waitForTimeout(500);

    // Navigate to a detail page (ID 1 should exist after debug mode)
    const response = await page.goto('/detail/1');

    // Should return 200 for valid petition
    expect(response?.status()).toBe(200);
  });

  test('should return 200 for root and redirect to list', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Should redirect to /list
    await page.waitForURL('**/list', { timeout: 5000 });
    expect(page.url()).toContain('/list');
  });

  test.describe('Not Found', () => {
    test('should return 404 for non-existent route', async ({ page }) => {
      const response = await page.goto('/nonexistent-route', {
        waitUntil: 'domcontentloaded',
      });

      // Angular SSR should return 404 for unknown routes
      expect(response?.status()).toBe(404);
    });

    test('should display not-found component for 404', async ({ page }) => {
      await page.goto('/this-does-not-exist', {
        waitUntil: 'domcontentloaded',
      });

      // Should show not found message
      const notFoundHeading = page.locator('h1:has-text("404")');
      await expect(notFoundHeading).toBeVisible();
    });

    test('should return 404 for non-existent detail route', async ({ page }) => {
      // First, populate debug data by going to list and clicking title 7 times
      await page.goto('/list');
      await page.waitForLoadState('domcontentloaded');

      const title = page.locator('h1:has-text("Municipality Petitions")');
      for (let i = 0; i < 7; i++) {
        await title.click();
      }
      await page.waitForTimeout(500);

      // Navigate to a detail page (ID 1 should exist after debug mode)
      const response = await page.goto('/detail/1');

      // Should return 404 for non-existent detail route
      expect(response?.status()).toBe(404);
    });
  });
});
