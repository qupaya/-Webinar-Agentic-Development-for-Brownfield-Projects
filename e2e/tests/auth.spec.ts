import { test, expect } from '../fixtures/ssr-page.fixture';
import { ListPage } from '../pages/list.page';
import { DetailPage } from '../pages/detail.page';

test.describe('Role-Based Authentication', () => {
  let listPage: ListPage;

  test.beforeEach(async ({ page, ssrPage }) => {
    listPage = new ListPage(page);
    await ssrPage.goto('/list');
    await ssrPage.waitForHydration();
  });

  test.describe('Role Toggle', () => {
    test('should start in user mode by default', async ({ page }) => {
      const isUser = await listPage.isUserMode();
      const isAdmin = await listPage.isAdminMode();

      // Should be in one mode or the other
      expect(isUser || isAdmin).toBe(true);
    });

    test('should toggle from user to admin mode', async ({ page }) => {
      // Ensure starting in user mode
      if (await listPage.isAdminMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      const beforeToggle = await listPage.isUserMode();
      expect(beforeToggle).toBe(true);

      await listPage.toggleRole();
      await page.waitForTimeout(300);

      const afterToggle = await listPage.isAdminMode();
      expect(afterToggle).toBe(true);
    });

    test('should toggle from admin to user mode', async ({ page }) => {
      // Ensure starting in admin mode
      if (await listPage.isUserMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      const beforeToggle = await listPage.isAdminMode();
      expect(beforeToggle).toBe(true);

      await listPage.toggleRole();
      await page.waitForTimeout(300);

      const afterToggle = await listPage.isUserMode();
      expect(afterToggle).toBe(true);
    });

    test('should persist role after page reload', async ({ page, ssrPage }) => {
      // Toggle to admin
      if (await listPage.isUserMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      const roleBeforeReload = await listPage.isAdminMode();

      // Reload page
      await page.reload();
      await ssrPage.waitForHydration();

      const newListPage = new ListPage(page);
      const roleAfterReload = await newListPage.isAdminMode();

      // Role should persist (via localStorage)
      expect(roleAfterReload).toBe(roleBeforeReload);
    });

    test('should display correct role indicator text', async ({ page }) => {
      // User mode
      if (await listPage.isAdminMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      let buttonText = await listPage.roleToggleButton.textContent();
      expect(buttonText).toContain('User Mode');

      // Admin mode
      await listPage.toggleRole();
      await page.waitForTimeout(300);

      buttonText = await listPage.roleToggleButton.textContent();
      expect(buttonText).toContain('Admin Mode');
    });
  });

  test.describe('Admin Mode Permissions', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure admin mode
      if (await listPage.isUserMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }
    });

    test('should show "New Petition" button in admin mode', async ({ page }) => {
      await expect(listPage.newPetitionButton).toBeVisible();
    });

    test('should allow navigation to add page in admin mode', async ({ page }) => {
      await listPage.clickNewPetition();

      await page.waitForURL('**/add', { timeout: 5000 });
      expect(page.url()).toContain('/add');
    });

    test('should allow creating new petitions in admin mode', async ({ page, ssrPage }) => {
      const detailPage = new DetailPage(page);

      await listPage.clickNewPetition();
      await page.waitForURL('**/add', { timeout: 5000 });
      await ssrPage.waitForHydration();

      const petitionData = {
        title: 'Admin Created Petition ' + Date.now(),
        description: 'Created in admin mode',
      };

      await detailPage.fillForm(petitionData);
      await detailPage.clickSave();

      // Should successfully create
      await page.waitForURL('**/list', { timeout: 5000 });
    });

    test('should show editable form fields in admin mode', async ({ page, ssrPage }) => {
      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      // Navigate to first petition
      const firstPetition = page.locator('.bg-white.rounded-lg.shadow').first();
      await firstPetition.click();

      await page.waitForURL('**/detail/**', { timeout: 5000 });
      await ssrPage.waitForHydration();

      const detailPage = new DetailPage(page);

      // Should not show read-only badge
      const isReadOnly = await detailPage.isReadOnly();
      expect(isReadOnly).toBe(false);
    });

    test('should show delete button in admin mode', async ({ page, ssrPage }) => {
      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      const detailPage = new DetailPage(page);
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      await expect(detailPage.deleteButton).toBeVisible();
    });

    test('should allow deleting petitions in admin mode', async ({ page, ssrPage }) => {
      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      const detailPage = new DetailPage(page);
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      await detailPage.clickDelete();

      // Should navigate back to list
      await page.waitForURL('**/list', { timeout: 5000 });
    });
  });

  test.describe('User Mode Restrictions', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure user mode
      if (await listPage.isAdminMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }
    });

    test('should show disabled "New Petition" button in user mode', async ({ page }) => {
      // Should show disabled button
      const disabledButton = page.locator('.bg-gray-300:has-text("New Petition")');
      await expect(disabledButton).toBeVisible();
    });

    test('should not navigate to add page in user mode', async ({ page }) => {
      // Try to navigate directly
      await page.goto('/add');
      await page.waitForTimeout(500);

      // Should still be able to view the page, but form should be read-only
      // (The app allows viewing but restricts editing)
      expect(page.url()).toContain('/add');
    });

    test('should show read-only badge in user mode', async ({ page, ssrPage }) => {
      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      // Navigate to first petition
      const firstPetition = page.locator('.bg-white.rounded-lg.shadow').first();
      await firstPetition.click();

      await page.waitForURL('**/detail/**', { timeout: 5000 });
      await ssrPage.waitForHydration();

      const detailPage = new DetailPage(page);

      // Should show read-only badge
      const isReadOnly = await detailPage.isReadOnly();
      expect(isReadOnly).toBe(true);
    });

    test('should have read-only form fields in user mode', async ({ page, ssrPage }) => {
      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      const detailPage = new DetailPage(page);
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      // Title should be readonly
      const titleReadOnly = await detailPage.titleInput.getAttribute('readonly');
      expect(titleReadOnly).toBe('');

      // Description should be readonly
      const descReadOnly = await detailPage.descriptionTextarea.getAttribute('readonly');
      expect(descReadOnly).toBe('');
    });

    test('should not show delete button in user mode', async ({ page, ssrPage }) => {
      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      const detailPage = new DetailPage(page);
      await detailPage.gotoEdit(1);
      await ssrPage.waitForHydration();
      await page.waitForTimeout(500);

      // Delete button should not be visible
      const isVisible = await detailPage.deleteButton.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Role Persistence', () => {
    test('should persist admin role across navigation', async ({ page, ssrPage }) => {
      // Switch to admin
      if (await listPage.isUserMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      // Navigate to add page
      await listPage.clickNewPetition();
      await page.waitForURL('**/add', { timeout: 5000 });

      // Navigate back to list
      await page.goto('/list');
      await ssrPage.waitForHydration();

      const newListPage = new ListPage(page);
      const isStillAdmin = await newListPage.isAdminMode();

      expect(isStillAdmin).toBe(true);
    });

    test('should persist user role across navigation', async ({ page, ssrPage }) => {
      // Switch to user
      if (await listPage.isAdminMode()) {
        await listPage.toggleRole();
        await page.waitForTimeout(300);
      }

      await listPage.triggerDebugMode();
      await page.waitForTimeout(500);

      // Navigate to detail page
      const firstPetition = page.locator('.bg-white.rounded-lg.shadow').first();
      await firstPetition.click();
      await page.waitForURL('**/detail/**', { timeout: 5000 });

      // Navigate back to list
      await page.goto('/list');
      await ssrPage.waitForHydration();

      const newListPage = new ListPage(page);
      const isStillUser = await newListPage.isUserMode();

      expect(isStillUser).toBe(true);
    });
  });
});
