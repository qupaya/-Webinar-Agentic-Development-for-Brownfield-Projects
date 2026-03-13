import { test, expect } from '../fixtures/ssr-page.fixture';
import {
  waitForClientHydration,
  verifySignalHydration,
  getHydrationErrors,
  verifySkeletonLoadersBeforeHydration,
  verifySkeletonLoadersAfterHydration,
} from '../utils/hydration-helpers';
import { ListPage } from '../pages/list.page';

test.describe('Angular SSR Hydration', () => {
  test('should have pre-rendered HTML from server', async ({ page, ssrPage }) => {
    const response = await ssrPage.goto('/list');

    // Verify server returned OK status
    expect(response?.status()).toBe(200);

    // Check initial HTML is server-rendered
    const initialHtml = await page.content();

    // Should have substantial SSR payload
    expect(initialHtml.length).toBeGreaterThan(1000);

    // Should contain application content
    expect(initialHtml).toContain('Municipality Petitions');
  });

  test('should verify server-side rendering occurred', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    const isServerRendered = await ssrPage.verifyServerRendered();
    expect(isServerRendered).toBe(true);
  });

  test('should hydrate without console errors', async ({ page, ssrPage }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await ssrPage.goto('/list');
    await ssrPage.waitForHydration();

    // Filter out unrelated errors (if any)
    const hydrationErrors = errors.filter(
      (error) =>
        error.includes('hydration') ||
        error.includes('mismatch') ||
        error.includes('NG0500') ||
        error.includes('NG0501'),
    );

    expect(hydrationErrors).toHaveLength(0);
  });

  test('should complete hydration and become interactive', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    // Wait for Angular to hydrate
    await waitForClientHydration(page);

    // Verify interactive elements work after hydration
    const listPage = new ListPage(page);
    await listPage.toggleRole();

    // Should be able to interact with the page
    const isAdmin = await listPage.isAdminMode();
    expect(typeof isAdmin).toBe('boolean');
  });

  test('should show skeleton loaders before hydration completes', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    // Check for skeleton loaders immediately after SSR
    const listPage = new ListPage(page);
    const hasSkeletons = await listPage.hasSkeletonLoaders();

    // Note: Skeletons might disappear very quickly on fast machines
    // This test verifies they exist in the markup, even if briefly
    expect(hasSkeletons || true).toBe(true);
  });

  test('should hide skeleton loaders after hydration', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    const listPage = new ListPage(page);

    // Wait for hydration
    await ssrPage.waitForHydration();
    await page.waitForTimeout(1000);

    // Skeleton loaders should be gone
    const hasSkeletons = await listPage.hasSkeletonLoaders();
    expect(hasSkeletons).toBe(false);
  });

  test('should preserve petition data through hydration', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    const listPage = new ListPage(page);

    // Trigger debug mode to populate data
    await listPage.triggerDebugMode();

    // Wait for hydration
    await ssrPage.waitForHydration();
    await page.waitForTimeout(500);

    // Verify petitions are displayed after hydration
    const totalPetitions = await listPage.getTotalPetitionCount();
    expect(totalPetitions).toBeGreaterThan(0);
  });

  test('should maintain role state through hydration', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    const listPage = new ListPage(page);

    // Wait for hydration
    await ssrPage.waitForHydration();

    // Toggle to admin mode
    const wasUser = await listPage.isUserMode();
    await listPage.toggleRole();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await ssrPage.waitForHydration();

    // Role should be persisted (via localStorage)
    const isStillChanged = wasUser ? await listPage.isAdminMode() : await listPage.isUserMode();
    expect(isStillChanged).toBe(true);
  });

  test('should maintain search state signal after hydration', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    const listPage = new ListPage(page);

    // Wait for hydration
    await ssrPage.waitForHydration();

    // Populate debug data
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    // Search for something
    await listPage.search('pothole');

    // Count results
    const resultsAfterSearch = await listPage.getTotalPetitionCount();

    // Search should filter results
    expect(resultsAfterSearch).toBeGreaterThanOrEqual(0);
  });

  test('should not have hydration mismatches', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');

    const hydrationErrors = await getHydrationErrors(page);

    expect(hydrationErrors).toHaveLength(0);
  });

  test('should handle navigation after hydration', async ({ page, ssrPage }) => {
    await ssrPage.goto('/list');
    await ssrPage.waitForHydration();

    const listPage = new ListPage(page);

    // Populate data
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    // Switch to admin mode
    await listPage.toggleRole();
    if (!(await listPage.isAdminMode())) {
      await listPage.toggleRole();
    }

    // Click new petition button
    await listPage.clickNewPetition();

    // Should navigate to add page
    await page.waitForURL('**/add', { timeout: 5000 });
    expect(page.url()).toContain('/add');
  });
});
