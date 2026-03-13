import { test, expect } from '../fixtures/ssr-page.fixture';
import { DetailPage } from '../pages/detail.page';
import { ListPage } from '../pages/list.page';

test.describe('Petition Detail Page', () => {
  test.describe('Add New Petition', () => {
    let detailPage: DetailPage;
    let listPage: ListPage;

    test.beforeEach(async ({ page, ssrPage }) => {
      detailPage = new DetailPage(page);
      listPage = new ListPage(page);

      // Go to list and ensure admin mode
      await ssrPage.goto('/list');
      await ssrPage.waitForHydration();

      if (await listPage.isUserMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      // Navigate to add page
      await detailPage.gotoAdd();
      await ssrPage.waitForHydration();
    });

    test('should display add petition form', async ({ page }) => {
      await expect(detailPage.heading).toHaveText('New Petition');
      await expect(detailPage.titleInput).toBeVisible();
      await expect(detailPage.descriptionTextarea).toBeVisible();
      await expect(detailPage.saveButton).toBeVisible();
    });

    test('should create new petition with valid data', async ({ page }) => {
      const petitionData = {
        title: 'Test Petition ' + Date.now(),
        description: 'This is a test petition description.',
      };

      await detailPage.fillForm(petitionData);
      await detailPage.clickSave();

      // Should navigate back to list
      await page.waitForURL('**/list', { timeout: 5000 });
      expect(page.url()).toContain('/list');
    });

    test('should show validation error for empty title', async ({ page }) => {
      await detailPage.fillForm({ title: '' });
      await detailPage.titleInput.blur();

      // Try to save
      await detailPage.clickSave();

      // Should show validation error
      const hasError = await detailPage.hasValidationError();
      expect(hasError).toBe(true);
    });

    test('should show validation error for title less than 3 characters', async ({ page }) => {
      await detailPage.fillForm({ title: 'ab' });
      await detailPage.titleInput.blur();

      // Trigger validation
      await detailPage.clickSave();

      // Should either show error or prevent submission
      const currentUrl = page.url();
      const stillOnAddPage = currentUrl.includes('/add');

      expect(stillOnAddPage).toBe(true);
    });

    test('should allow creating petition without description', async ({ page }) => {
      const petitionData = {
        title: 'Petition without description ' + Date.now(),
        description: '',
      };

      await detailPage.fillForm(petitionData);
      await detailPage.clickSave();

      // Should successfully create
      await page.waitForURL('**/list', { timeout: 5000 });
      expect(page.url()).toContain('/list');
    });

    test('should navigate back to list when cancel clicked', async ({ page }) => {
      await detailPage.clickCancel();

      await page.waitForURL('**/list', { timeout: 5000 });
      expect(page.url()).toContain('/list');
    });
  });

  test.describe('Edit Existing Petition', () => {
    let detailPage: DetailPage;
    let listPage: ListPage;

    test.beforeEach(async ({ page, ssrPage }) => {
      detailPage = new DetailPage(page);
      listPage = new ListPage(page);

      // Go to list, populate debug data, ensure admin mode
      await ssrPage.goto('/list');
      await ssrPage.waitForHydration();

      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      if (await listPage.isUserMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }
    });

    test('should display petition details in edit form', async ({ page, ssrPage }) => {
      // Navigate to first petition
      const firstPetition = page.locator('.bg-white.rounded-lg.shadow').first();
      await firstPetition.click();

      await page.waitForURL('**/detail/**', { timeout: 5000 });
      await ssrPage.waitForHydration();

      // Should show petition details
      await expect(detailPage.heading).toHaveText('Petition Details');
      await expect(detailPage.titleInput).not.toBeEmpty();
    });

    test('should update petition title', async ({ page, ssrPage }) => {
      // Navigate to a petition
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      const newTitle = 'Updated Petition Title ' + Date.now();
      await detailPage.fillForm({ title: newTitle });
      await detailPage.clickSave();

      // Should navigate back to list
      await page.waitForURL('**/list', { timeout: 5000 });
    });

    test('should display current status badge', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      // Should have status badge visible
      const status = await detailPage.getStatus();
      expect(status).toBeTruthy();
      expect(['pending', 'accepted', 'rejected']).toContain(status);
    });

    test('should show delete button in admin mode', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      await expect(detailPage.deleteButton).toBeVisible();
    });

    test('should delete petition when delete clicked', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      await detailPage.clickDelete();

      // Should navigate back to list
      await page.waitForURL('**/list', { timeout: 5000 });
      expect(page.url()).toContain('/list');
    });
  });

  test.describe('Read-Only Mode (User)', () => {
    let detailPage: DetailPage;
    let listPage: ListPage;

    test.beforeEach(async ({ page, ssrPage }) => {
      detailPage = new DetailPage(page);
      listPage = new ListPage(page);

      // Go to list, populate debug data, ensure user mode
      await ssrPage.goto('/list');
      await ssrPage.waitForHydration();

      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      if (await listPage.isAdminMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }
    });

    test('should display read-only badge in user mode', async ({ page, ssrPage }) => {
      // Navigate to first petition
      const firstPetition = page.locator('.bg-white.rounded-lg.shadow').first();
      await firstPetition.click();

      await page.waitForURL('**/detail/**', { timeout: 5000 });
      await ssrPage.waitForHydration();

      // Should show read-only badge
      const isReadOnly = await detailPage.isReadOnly();
      expect(isReadOnly).toBe(true);
    });

    test('should have read-only form fields in user mode', async ({ page, ssrPage }) => {
      // Navigate to a petition
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      // Check if title input is readonly
      const titleReadOnly = await detailPage.titleInput.getAttribute('readonly');
      expect(titleReadOnly).toBe('');
    });

    test('should not show delete button in user mode', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      // Delete button should not be visible
      const isVisible = await detailPage.deleteButton.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Not Found Handling', () => {
    let detailPage: DetailPage;

    test.beforeEach(async ({ page, ssrPage }) => {
      detailPage = new DetailPage(page);
    });

    test('should show not found message for non-existent petition', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(999999);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      // Should show not found message
      const isNotFound = await detailPage.isNotFound();
      expect(isNotFound).toBe(true);
    });

    test('should show back to list button when petition not found', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(999999);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      await expect(detailPage.backToListButton).toBeVisible();
    });

    test('should navigate back to list from not found page', async ({ page, ssrPage }) => {
      await detailPage.gotoEdit(999999);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      await detailPage.clickBackToList();

      await page.waitForURL('**/list', { timeout: 5000 });
      expect(page.url()).toContain('/list');
    });
  });
});
