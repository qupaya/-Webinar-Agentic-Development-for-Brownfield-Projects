import { Page, expect } from '@playwright/test';

/**
 * Utility functions for testing Angular signal hydration in SSR applications
 */

/**
 * Verify that Angular signals were properly hydrated from server state
 * Checks for serialized state in the HTML
 */
export async function verifySignalHydration(page: Page): Promise<boolean> {
  const hydrationData = await page.evaluate(() => {
    // Check for Angular SSR state transfer script tags
    const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));

    if (scripts.length === 0) {
      return null;
    }

    try {
      // Try to parse any state transfer data
      for (const script of scripts) {
        const content = script.textContent;
        if (content) {
          const data = JSON.parse(content);
          if (data) {
            return data;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  return hydrationData !== null;
}

/**
 * Wait for Angular application to complete client-side hydration
 * Verifies that Angular is fully bootstrapped and interactive
 */
export async function waitForClientHydration(page: Page, timeout = 10000): Promise<void> {
  await page.waitForFunction(
    () => {
      const ng = (window as any).ng;
      // Check multiple indicators that Angular is ready
      return ng && ng.getComponent && ng.probe;
    },
    { timeout },
  );
}

/**
 * Test that signal changes work correctly after hydration
 * @param page - Playwright page
 * @param triggerSelector - Selector for element that triggers signal change
 * @param resultSelector - Selector for element that displays signal value
 * @param expectedValue - Expected value after change
 */
export async function testSignalChangeAfterHydration(
  page: Page,
  triggerSelector: string,
  resultSelector: string,
  expectedValue: string | RegExp,
): Promise<void> {
  // Wait for hydration
  await waitForClientHydration(page);

  // Trigger the signal change
  await page.locator(triggerSelector).click();

  // Verify the result
  if (typeof expectedValue === 'string') {
    await expect(page.locator(resultSelector)).toHaveText(expectedValue);
  } else {
    await expect(page.locator(resultSelector)).toHaveText(expectedValue);
  }
}

/**
 * Verify that localStorage is synced correctly after hydration
 * @param page - Playwright page
 * @param key - localStorage key to check
 * @param expectedValue - Expected value in localStorage
 */
export async function verifyLocalStorageAfterHydration(
  page: Page,
  key: string,
  expectedValue: string | null,
): Promise<boolean> {
  await waitForClientHydration(page);

  const actualValue = await page.evaluate((storageKey) => {
    return localStorage.getItem(storageKey);
  }, key);

  return actualValue === expectedValue;
}

/**
 * Check for hydration mismatches or errors in console
 * Returns array of hydration-related error messages
 */
export async function getHydrationErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        text.includes('hydration') ||
        text.includes('mismatch') ||
        text.includes('NG0500') ||
        text.includes('NG0501')
      ) {
        errors.push(text);
      }
    }
  });

  // Wait for any async errors to appear
  await page.waitForTimeout(2000);

  return errors;
}

/**
 * Verify skeleton loaders are shown before hydration
 * @param page - Playwright page
 * @param skeletonSelector - Selector for skeleton loader elements
 */
export async function verifySkeletonLoadersBeforeHydration(
  page: Page,
  skeletonSelector: string,
): Promise<boolean> {
  // Check immediately after page load (before hydration)
  const skeletons = page.locator(skeletonSelector);
  const count = await skeletons.count();

  return count > 0;
}

/**
 * Verify skeleton loaders are hidden after hydration
 * @param page - Playwright page
 * @param skeletonSelector - Selector for skeleton loader elements
 */
export async function verifySkeletonLoadersAfterHydration(
  page: Page,
  skeletonSelector: string,
): Promise<boolean> {
  await waitForClientHydration(page);

  // Give a bit of time for skeleton loaders to disappear
  await page.waitForTimeout(500);

  const skeletons = page.locator(skeletonSelector);
  const count = await skeletons.count();

  return count === 0;
}

/**
 * Measure hydration time (from page load to Angular ready)
 * Returns time in milliseconds
 */
export async function measureHydrationTime(page: Page): Promise<number> {
  const startTime = Date.now();

  await waitForClientHydration(page);

  const endTime = Date.now();

  return endTime - startTime;
}
