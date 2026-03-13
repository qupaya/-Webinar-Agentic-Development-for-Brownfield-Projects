import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Petition Detail/Add/Edit page
 * Represents the form for creating or editing petitions
 */
export class DetailPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly backToListButton: Locator;
  readonly deleteButton: Locator;
  readonly statusBadge: Locator;
  readonly readOnlyBadge: Locator;
  readonly skeletonLoader: Locator;
  readonly notFoundMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.titleInput = page.locator('#title');
    this.descriptionTextarea = page.locator('#description');
    this.saveButton = page.locator('button[type="submit"]:has-text("Save")');
    this.cancelButton = page.locator('a:has-text("Cancel")');
    this.backToListButton = page.locator('a:has-text("Back to List")');
    this.deleteButton = page.locator('button:has-text("Delete Petition")');
    this.statusBadge = page.locator(
      '.px-3.py-1.rounded-full:has-text("Pending"), .px-3.py-1.rounded-full:has-text("Accepted"), .px-3.py-1.rounded-full:has-text("Rejected")',
    );
    this.readOnlyBadge = page.locator('span:has-text("🔒 Read-only")');
    this.skeletonLoader = page.locator('.animate-pulse');
    this.notFoundMessage = page.locator('h1:has-text("Petition Not Found")');
  }

  /**
   * Navigate to add new petition page
   */
  async gotoAdd() {
    await this.page.goto('/add');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to edit petition page
   * @param id - Petition ID
   */
  async gotoEdit(id: number) {
    await this.page.goto(`/detail/${id}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if in add mode (new petition)
   */
  async isAddMode(): Promise<boolean> {
    const text = await this.heading.textContent();
    return text?.includes('New Petition') || false;
  }

  /**
   * Check if in edit mode (existing petition)
   */
  async isEditMode(): Promise<boolean> {
    const text = await this.heading.textContent();
    return text?.includes('Petition Details') || false;
  }

  /**
   * Check if petition not found message is displayed
   */
  async isNotFound(): Promise<boolean> {
    return await this.notFoundMessage.isVisible();
  }

  /**
   * Check if read-only badge is displayed
   */
  async isReadOnly(): Promise<boolean> {
    try {
      return await this.readOnlyBadge.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Fill in the petition form
   * @param data - Form data
   */
  async fillForm(data: { title?: string; description?: string }) {
    if (data.title !== undefined) {
      await this.titleInput.clear();
      await this.titleInput.fill(data.title);
    }
    if (data.description !== undefined) {
      await this.descriptionTextarea.clear();
      await this.descriptionTextarea.fill(data.description);
    }
  }

  /**
   * Get current form values
   */
  async getFormValues(): Promise<{ title: string; description: string }> {
    const title = (await this.titleInput.inputValue()) || '';
    const description = (await this.descriptionTextarea.inputValue()) || '';
    return { title, description };
  }

  /**
   * Click Save button
   */
  async clickSave() {
    await this.saveButton.click();
  }

  /**
   * Click Cancel button
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Click Delete button
   */
  async clickDelete() {
    await this.deleteButton.click();
  }

  /**
   * Click Back to List button
   */
  async clickBackToList() {
    await this.backToListButton.click();
  }

  /**
   * Submit the form (fill and save)
   * @param data - Form data
   */
  async submitForm(data: { title: string; description?: string }) {
    await this.fillForm(data);
    await this.clickSave();
    // Wait for navigation
    await this.page.waitForURL('**/list', { timeout: 5000 });
  }

  /**
   * Get current status of the petition
   */
  async getStatus(): Promise<string | null> {
    try {
      const text = await this.statusBadge.textContent();
      return text?.trim().toLowerCase() || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationError(): Promise<boolean> {
    const errorMessage = this.page.locator('.text-red-600');
    return await errorMessage.isVisible();
  }

  /**
   * Get validation error message
   */
  async getValidationError(): Promise<string | null> {
    const errorMessage = this.page.locator('.text-red-600');
    try {
      return await errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Check if skeleton loader is visible
   */
  async hasSkeletonLoader(): Promise<boolean> {
    const count = await this.skeletonLoader.count();
    return count > 0;
  }

  /**
   * Wait for skeleton loader to disappear
   */
  async waitForSkeletonToDisappear() {
    await this.page.waitForTimeout(500);
    try {
      await expect(this.skeletonLoader.first()).not.toBeVisible({ timeout: 10000 });
    } catch {
      // Skeleton might not exist, which is fine
    }
  }

  /**
   * Accept petition (admin only, in edit mode)
   * @param reason - Optional reason for acceptance
   */
  async acceptPetition(reason?: string) {
    const acceptButton = this.page.locator('button:has-text("Accept Petition")');
    await acceptButton.click();

    if (reason) {
      const reasonInput = this.page.locator('#processedReason');
      await reasonInput.fill(reason);
    }

    const confirmButton = this.page.locator('button:has-text("Confirm")');
    await confirmButton.click();
  }

  /**
   * Reject petition (admin only, in edit mode)
   * @param reason - Optional reason for rejection
   */
  async rejectPetition(reason?: string) {
    const rejectButton = this.page.locator('button:has-text("Reject Petition")');
    await rejectButton.click();

    if (reason) {
      const reasonInput = this.page.locator('#processedReason');
      await reasonInput.fill(reason);
    }

    const confirmButton = this.page.locator('button:has-text("Confirm")');
    await confirmButton.click();
  }

  /**
   * Set petition back to pending (admin only, in edit mode)
   */
  async setPetitionPending() {
    const pendingButton = this.page.locator('button:has-text("Set as Pending")');
    await pendingButton.click();
  }
}
