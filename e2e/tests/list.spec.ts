import { test, expect } from '../fixtures/ssr-page.fixture';
import { ListPage } from '../pages/list.page';

test.describe('Petition List Page', () => {
  let listPage: ListPage;

  test.beforeEach(async ({ page, ssrPage }) => {
    listPage = new ListPage(page);
    await ssrPage.goto('/list');
    await ssrPage.waitForHydration();
  });

  test('should display page title', async ({ page }) => {
    await expect(listPage.titleHeading).toBeVisible();
    await expect(listPage.titleHeading).toHaveText('Municipality Petitions');
  });

  test('should display search input', async ({ page }) => {
    await expect(listPage.searchInput).toBeVisible();
    await expect(listPage.searchInput).toHaveAttribute('placeholder', /Search by title/);
  });

  test('should display role toggle button', async ({ page }) => {
    await expect(listPage.roleToggleButton).toBeVisible();
  });

  test('should display three petition columns', async ({ page }) => {
    const pendingHeading = page.locator('h2:has-text("Pending")');
    const acceptedHeading = page.locator('h2:has-text("Accepted")');
    const rejectedHeading = page.locator('h2:has-text("Rejected")');

    await expect(pendingHeading).toBeVisible();
    await expect(acceptedHeading).toBeVisible();
    await expect(rejectedHeading).toBeVisible();
  });

  test('should populate debug data when title clicked 7 times', async ({ page }) => {
    await listPage.triggerDebugMode();

    // Should have petitions after debug mode
    const totalCount = await listPage.getTotalPetitionCount();
    expect(totalCount).toBeGreaterThan(0);
  });

  test('should filter petitions with search', async ({ page }) => {
    // Populate debug data first
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    const initialCount = await listPage.getTotalPetitionCount();
    expect(initialCount).toBeGreaterThan(0);

    // Search for something specific
    await listPage.search('pothole');
    await page.waitForTimeout(300);

    const filteredCount = await listPage.getTotalPetitionCount();

    // Filtered results should be less than or equal to total
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should clear search and show all petitions', async ({ page }) => {
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    const initialCount = await listPage.getTotalPetitionCount();

    // Search for something
    await listPage.search('test');
    await page.waitForTimeout(300);

    // Clear search
    await listPage.search('');
    await page.waitForTimeout(300);

    const clearedCount = await listPage.getTotalPetitionCount();

    // Should show all petitions again
    expect(clearedCount).toBe(initialCount);
  });

  test('should navigate to add page when admin clicks new petition', async ({ page }) => {
    // Switch to admin mode
    if (await listPage.isUserMode()) {
      await listPage.toggleRole();
    }

    await expect(listPage.newPetitionButton).toBeVisible();
    await listPage.clickNewPetition();

    // Should navigate to add page
    await page.waitForURL('**/add', { timeout: 5000 });
    expect(page.url()).toContain('/add');
  });

  test('should show disabled new petition button in user mode', async ({ page }) => {
    // Switch to user mode
    if (await listPage.isAdminMode()) {
      await listPage.toggleRole();
    }

    // Should show disabled button or message
    const disabledButton = page.locator('.bg-gray-300:has-text("New Petition")');
    await expect(disabledButton).toBeVisible();
  });

  test('should display petitions in correct columns by status', async ({ page }) => {
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    const pendingCount = await listPage.getPetitionCount('pending');
    const acceptedCount = await listPage.getPetitionCount('accepted');
    const rejectedCount = await listPage.getPetitionCount('rejected');

    // Debug mode should create petitions in all statuses
    expect(pendingCount).toBeGreaterThan(0);
    expect(acceptedCount).toBeGreaterThan(0);
    expect(rejectedCount).toBeGreaterThan(0);
  });

  test('should navigate to detail page when petition clicked', async ({ page }) => {
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    // Get first petition card
    const firstPetition = page.locator('.bg-white.rounded-lg.shadow').first();
    await firstPetition.click();

    // Should navigate to detail page
    await page.waitForURL('**/detail/**', { timeout: 5000 });
    expect(page.url()).toContain('/detail/');
  });

  test('should maintain search query while switching roles', async ({ page }) => {
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    // Search for something
    await listPage.search('petition');
    await page.waitForTimeout(300);

    const beforeToggleCount = await listPage.getTotalPetitionCount();

    // Toggle role
    await listPage.toggleRole();
    await page.waitForTimeout(300);

    const afterToggleCount = await listPage.getTotalPetitionCount();

    // Search results should remain the same
    expect(afterToggleCount).toBe(beforeToggleCount);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await listPage.triggerDebugMode();
    await page.waitForTimeout(500);

    // Search for something that doesn't exist
    await listPage.search('ThisShouldNotMatchAnything12345');
    await page.waitForTimeout(300);

    const count = await listPage.getTotalPetitionCount();

    // Should have zero results
    expect(count).toBe(0);
  });

  test('should persist role preference after page reload', async ({ page }) => {
    const initialMode = await listPage.isAdminMode();

    // Toggle role
    await listPage.toggleRole();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    const newListPage = new ListPage(page);
    const afterReloadMode = await newListPage.isAdminMode();

    // Role should be opposite of initial
    expect(afterReloadMode).toBe(!initialMode);
  });
});
