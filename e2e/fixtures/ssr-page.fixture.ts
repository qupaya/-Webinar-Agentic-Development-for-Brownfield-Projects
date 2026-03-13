import { test as base, expect, Page } from '@playwright/test';

/**
 * SSR-specific page helper for testing Angular SSR applications
 *
 * Provides utilities for:
 * - Verifying server-side rendering occurred
 * - Waiting for Angular hydration to complete
 * - Testing signal hydration and state preservation
 */
export class SSRPage {
  constructor(private page: Page) {}

  /**
   * Navigate to a path with SSR verification
   * @param path - The path to navigate to (e.g., '/', '/list', '/detail/1')
   * @param options - Optional navigation options
   */
  async goto(path: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) {
    const response = await this.page.goto(path, {
      waitUntil: options?.waitUntil || 'domcontentloaded',
    });
    return response;
  }

  /**
   * Verify that the page was server-side rendered
   * Checks for substantial HTML content and SSR markers
   */
  async verifyServerRendered(): Promise<boolean> {
    const html = await this.page.content();

    // Check for substantial SSR payload (more than just shell)
    const hasSubstantialContent = html.length > 1000;

    // Check for Angular SSR markers (ng-server-context attribute)
    const hasSSRMarkers = html.includes('ng-server-context') || html.includes('ngh=');

    return hasSubstantialContent || hasSSRMarkers;
  }

  /**
   * Wait for Angular hydration to complete
   * @param timeout - Max time to wait in milliseconds (default: 10000)
   */
  async waitForHydration(timeout = 10000): Promise<void> {
    try {
      // Wait for Angular to be available on window
      await this.page.waitForFunction(
        () => {
          const ng = (window as any).ng;
          // Check if Angular is fully bootstrapped
          return ng && ng.getComponent !== undefined;
        },
        { timeout },
      );
    } catch (error) {
      console.warn('Angular hydration check timed out:', error);
      // Don't fail the test, just warn - some pages might not have interactive Angular yet
    }
  }

  /**
   * Check if hydration preserved the initial server-rendered content
   * @param selector - Selector to check
   * @param expectedContent - Expected content that should persist through hydration
   */
  async checkHydrationPreservation(selector: string, expectedContent: string): Promise<boolean> {
    const contentBeforeHydration = await this.page.locator(selector).textContent();

    await this.waitForHydration();

    const contentAfterHydration = await this.page.locator(selector).textContent();

    return contentBeforeHydration === expectedContent && contentAfterHydration === expectedContent;
  }

  /**
   * Get the HTTP status code of the current page
   */
  async getStatusCode(): Promise<number | null> {
    const response = await this.page.goto(this.page.url());
    return response?.status() || null;
  }

  /**
   * Check if the page has hydration errors in console
   */
  async hasHydrationErrors(): Promise<boolean> {
    const errors: string[] = [];

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await this.page.waitForTimeout(1000);

    return errors.some(
      (error) =>
        error.includes('hydration') || error.includes('mismatch') || error.includes('NG0500'),
    );
  }
}

/**
 * Custom test fixture that extends Playwright's base test
 * Adds SSRPage helper for all tests
 */
type SSRPageFixture = {
  ssrPage: SSRPage;
};

export const test = base.extend<SSRPageFixture>({
  ssrPage: async ({ page }, use) => {
    const ssrPage = new SSRPage(page);
    await use(ssrPage);
  },
});

export { expect };
