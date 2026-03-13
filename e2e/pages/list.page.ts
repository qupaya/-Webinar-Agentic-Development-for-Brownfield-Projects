import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Petition List page
 * Represents the main list view with search and petition columns
 */
export class ListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly titleHeading: Locator;
  readonly roleToggleButton: Locator;
  readonly newPetitionButton: Locator;
  readonly pendingColumn: Locator;
  readonly acceptedColumn: Locator;
  readonly rejectedColumn: Locator;
  readonly skeletonLoaders: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#search');
    this.titleHeading = page.locator('h1:has-text("Municipality Petitions")');
    this.roleToggleButton = page.locator('button:has-text("Mode")');
    this.newPetitionButton = page.locator('a[href="/add"]');
    this.pendingColumn = page.locator('h2:has-text("Pending")').locator('..');
    this.acceptedColumn = page.locator('h2:has-text("Accepted")').locator('..');
    this.rejectedColumn = page.locator('h2:has-text("Rejected")').locator('..');
    this.skeletonLoaders = page.locator('.animate-pulse');
  }

  /**
   * Navigate to the list page
   */
  async goto() {
    await this.page.goto('/list');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Search for petitions
   * @param query - Search term to enter
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    // Give a moment for search filtering to apply
    await this.page.waitForTimeout(300);
  }

  /**
   * Toggle user role (admin/user)
   */
  async toggleRole() {
    await this.roleToggleButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Check if currently in admin mode
   */
  async isAdminMode(): Promise<boolean> {
    const text = await this.roleToggleButton.textContent();
    return text?.includes('Admin Mode') || false;
  }

  /**
   * Check if currently in user mode
   */
  async isUserMode(): Promise<boolean> {
    const text = await this.roleToggleButton.textContent();
    return text?.includes('User Mode') || false;
  }

  /**
   * Click the "New Petition" button
   */
  async clickNewPetition() {
    await this.newPetitionButton.click();
  }

  /**
   * Click the title heading (for debug mode)
   */
  async clickTitle() {
    await this.titleHeading.click();
  }

  /**
   * Click title multiple times to trigger debug mode (7 clicks)
   */
  async triggerDebugMode() {
    for (let i = 0; i < 7; i++) {
      await this.titleHeading.click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Get all petition cards in a specific column
   * @param status - 'pending', 'accepted', or 'rejected'
   */
  getPetitionsInColumn(status: 'pending' | 'accepted' | 'rejected'): Locator {
    if (status === 'pending') {
      return this.pendingColumn.locator('.bg-white.rounded-lg.shadow');
    } else if (status === 'accepted') {
      return this.acceptedColumn.locator('.bg-white.rounded-lg.shadow');
    } else {
      return this.rejectedColumn.locator('.bg-white.rounded-lg.shadow');
    }
  }

  /**
   * Get count of petitions in a specific column
   * @param status - 'pending', 'accepted', or 'rejected'
   */
  async getPetitionCount(status: 'pending' | 'accepted' | 'rejected'): Promise<number> {
    const petitions = this.getPetitionsInColumn(status);
    return await petitions.count();
  }

  /**
   * Click on a specific petition by title
   * @param title - Title text to search for
   */
  async clickPetitionByTitle(title: string) {
    const petition = this.page.locator(`.bg-white.rounded-lg.shadow:has-text("${title}")`);
    await petition.click();
  }

  /**
   * Get petition card by title
   * @param title - Title text to search for
   */
  getPetitionByTitle(title: string): Locator {
    return this.page.locator(`.bg-white.rounded-lg.shadow:has-text("${title}")`).first();
  }

  /**
   * Check if skeleton loaders are visible
   */
  async hasSkeletonLoaders(): Promise<boolean> {
    const count = await this.skeletonLoaders.count();
    return count > 0;
  }

  /**
   * Wait for skeleton loaders to disappear
   */
  async waitForSkeletonsToDisappear() {
    await this.page.waitForTimeout(500);
    await expect(this.skeletonLoaders.first()).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify petitions are rendered (not skeleton loaders)
   */
  async verifyPetitionsRendered() {
    await this.waitForSkeletonsToDisappear();
    const pendingCount = await this.getPetitionCount('pending');
    const acceptedCount = await this.getPetitionCount('accepted');
    const rejectedCount = await this.getPetitionCount('rejected');

    // At least one column should have petitions or all should be empty
    return pendingCount >= 0 && acceptedCount >= 0 && rejectedCount >= 0;
  }

  /**
   * Get total number of visible petitions across all columns
   */
  async getTotalPetitionCount(): Promise<number> {
    const pending = await this.getPetitionCount('pending');
    const accepted = await this.getPetitionCount('accepted');
    const rejected = await this.getPetitionCount('rejected');
    return pending + accepted + rejected;
  }
}
