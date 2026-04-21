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
      const response = await page.goto('/detail/999999', {
        waitUntil: 'domcontentloaded',
      });

      // Should return 404 for non-existent petition ID
      expect(response?.status()).toBe(404);

      // Should show not found component
      const notFoundHeading = page.locator('h1:has-text("404")');
      await expect(notFoundHeading).toBeVisible();
    });
  });

  test.describe('Cache-Control Headers', () => {
    test.describe('404 Pages', () => {
      test('should have no-cache header for non-existent route', async ({ page }) => {
        const response = await page.goto('/nonexistent-route', {
          waitUntil: 'domcontentloaded',
        });

        expect(response?.status()).toBe(404);

        // 404 pages should not be cached to avoid browsers caching errors
        const cacheControl = response?.headers()['cache-control'];
        expect(cacheControl).toBeDefined();
        expect(cacheControl).toMatch(/no-cache|no-store|must-revalidate/);
      });

      test('should have no-cache header for non-existent detail route', async ({ page }) => {
        const response = await page.goto('/detail/999999', {
          waitUntil: 'domcontentloaded',
        });

        expect(response?.status()).toBe(404);

        // 404 responses must not be cached
        const cacheControl = response?.headers()['cache-control'];
        expect(cacheControl).toBeDefined();
        expect(cacheControl).toMatch(/no-cache|no-store|must-revalidate/);
      });
    });

    test.describe('Dynamic Content Pages', () => {
      test('should have no-cache header for list page', async ({ page }) => {
        const response = await page.goto('/list', {
          waitUntil: 'domcontentloaded',
        });

        expect(response?.status()).toBe(200);

        // List page shows dynamic content that changes frequently
        // Should not be cached or have very short cache
        const cacheControl = response?.headers()['cache-control'];
        expect(cacheControl).toBeDefined();
        // Accept no-cache, no-store, or short max-age (< 5 minutes)
        expect(cacheControl).toMatch(
          /no-cache|no-store|must-revalidate|max-age=(0|[1-9]|[1-9][0-9]|[12][0-9]{2})/,
        );
      });

      test('should have no-cache header for detail page with existing petition', async ({
        page,
      }) => {
        // First, populate debug data
        await page.goto('/list');
        await page.waitForLoadState('domcontentloaded');

        const title = page.locator('h1:has-text("Municipality Petitions")');
        for (let i = 0; i < 7; i++) {
          await title.click();
        }
        await page.waitForTimeout(500);

        // Navigate to a detail page
        const response = await page.goto('/detail/1', {
          waitUntil: 'domcontentloaded',
        });

        expect(response?.status()).toBe(200);

        // Detail pages contain user-editable data that must revalidate
        const cacheControl = response?.headers()['cache-control'];
        expect(cacheControl).toBeDefined();
        expect(cacheControl).toMatch(/no-cache|no-store|must-revalidate/);
      });

      test('should have no-cache header for add page', async ({ page }) => {
        const response = await page.goto('/add', {
          waitUntil: 'domcontentloaded',
        });

        expect(response?.status()).toBe(200);

        // Add page is a form that should always be fresh
        const cacheControl = response?.headers()['cache-control'];
        expect(cacheControl).toBeDefined();
        expect(cacheControl).toMatch(/no-cache|no-store|must-revalidate/);
      });
    });
  });
});
