# End-to-End Testing with Playwright

This directory contains end-to-end (E2E) tests for the Municipality Petition System using Playwright.

## Overview

The test suite covers:

- **SSR Hydration**: Verifies Angular server-side rendering and hydration behavior
- **HTTP Status Codes**: Tests correct response codes (200, 404) for routes
- **List Page**: Tests petition list display, search, and filtering
- **Detail Page**: Tests CRUD operations for petitions
- **Authentication**: Tests role-based access control (Admin vs. User)

## Directory Structure

```
e2e/
├── fixtures/
│   └── ssr-page.fixture.ts      # Custom SSR testing utilities
├── pages/
│   ├── list.page.ts              # Page object for list view
│   └── detail.page.ts            # Page object for detail view
├── tests/
│   ├── hydration.spec.ts         # SSR hydration tests
│   ├── status-codes.spec.ts      # HTTP status code tests
│   ├── list.spec.ts              # List page tests
│   ├── detail.spec.ts            # Detail page tests
│   └── auth.spec.ts              # Role-based auth tests
└── utils/
    └── hydration-helpers.ts      # Hydration testing utilities
```

## Running Tests

### All Tests (All Browsers)

```bash
npm run e2e
```

### Single Browser

```bash
npm run e2e:chromium  # Chrome/Chromium
npm run e2e:firefox   # Firefox
npm run e2e:webkit    # Safari/WebKit
```

### Interactive UI Mode

```bash
npm run e2e:ui
```

This opens Playwright's UI mode for interactive test debugging and development.

### Debug Mode

```bash
npm run e2e:debug
```

Opens tests in debug mode with the Playwright Inspector.

### Headed Mode (Visible Browser)

```bash
npm run e2e:headed
```

Runs tests with the browser window visible instead of headless mode.

### View Test Report

```bash
npm run e2e:report
```

Opens the HTML test report from the last test run.

### Record New Tests

```bash
npm run e2e:codegen
```

Opens Playwright Codegen to record interactions and generate test code.

## Configuration

Playwright configuration is in [`playwright.config.ts`](../playwright.config.ts) at the project root.

### Key Settings

- **Test Directory**: `./e2e`
- **Base URL**: `http://localhost:4200`
- **Web Server**: Automatically starts dev server (`npm start`) before tests
- **Browsers**: Chromium, Firefox, WebKit
- **Reporter**: HTML report (opens automatically on failure)
- **Retries**: 2 retries on CI, 0 locally
- **Screenshot**: Only on failure
- **Video**: Retained on failure

### Testing SSR Build

To test against the production SSR build instead of dev server:

1. Edit `playwright.config.ts`
2. Change `webServer.command` to:
   ```typescript
   command: 'npm run build && npm run serve:ssr:webinar-pure-angular',
   ```

## Test Patterns

### Page Object Model

Tests use the Page Object Model pattern for maintainability:

```typescript
import { ListPage } from '../pages/list.page';

test('example test', async ({ page }) => {
  const listPage = new ListPage(page);
  await listPage.goto();
  await listPage.search('test');
  // ...
});
```

### SSR-Aware Testing

Use the custom SSR fixture for hydration testing:

```typescript
import { test, expect } from '../fixtures/ssr-page.fixture';

test('hydration test', async ({ page, ssrPage }) => {
  await ssrPage.goto('/list');
  await ssrPage.waitForHydration();
  // Test after hydration completes
});
```

### Hydration Helpers

Utility functions for testing SSR behavior:

```typescript
import {
  waitForClientHydration,
  verifySignalHydration,
  getHydrationErrors,
} from '../utils/hydration-helpers';

test('check hydration', async ({ page }) => {
  await page.goto('/list');
  await waitForClientHydration(page);

  const errors = await getHydrationErrors(page);
  expect(errors).toHaveLength(0);
});
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/ssr-page.fixture';
import { ListPage } from '../pages/list.page';

test.describe('Feature Name', () => {
  test('should do something', async ({ page, ssrPage }) => {
    // Arrange
    const listPage = new ListPage(page);
    await ssrPage.goto('/list');
    await ssrPage.waitForHydration();

    // Act
    await listPage.search('test');

    // Assert
    const count = await listPage.getTotalPetitionCount();
    expect(count).toBeGreaterThan(0);
  });
});
```

### Testing Role-Based Access

```typescript
test('admin can create petition', async ({ page, ssrPage }) => {
  const listPage = new ListPage(page);
  await ssrPage.goto('/list');
  await ssrPage.waitForHydration();

  // Switch to admin mode
  if (await listPage.isUserMode()) {
    await listPage.toggleRole();
  }

  // Test admin functionality
  await expect(listPage.newPetitionButton).toBeVisible();
});
```

### Testing Debug Mode

The app has a debug mode that populates sample data (7 clicks on title):

```typescript
test('with debug data', async ({ page, ssrPage }) => {
  const listPage = new ListPage(page);
  await ssrPage.goto('/list');
  await ssrPage.waitForHydration();

  // Trigger debug mode
  await listPage.triggerDebugMode();
  await page.waitForTimeout(500);

  // Now you have sample petitions to test with
  const count = await listPage.getTotalPetitionCount();
  expect(count).toBeGreaterThan(0);
});
```

## CI/CD Integration

Tests are configured to run differently in CI environments:

- **CI Detection**: Checks `process.env.CI`
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 worker on CI (sequential), parallel locally
- **Server Reuse**: Disabled on CI, enabled locally
- **Test Isolation**: Each test runs in a fresh browser context

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Timing Out

- Increase `timeout` in `playwright.config.ts`
- Check if dev server is starting correctly
- Use `npm run e2e:debug` to step through tests

### Hydration Errors

- Check browser console output
- Use `getHydrationErrors()` helper to capture errors
- Verify SSR rendering with `ssrPage.verifyServerRendered()`

### Flaky Tests

- Add explicit waits: `await page.waitForTimeout(500)`
- Use `waitForHydration()` before interactions
- Check for race conditions in async operations

### Server Not Starting

- Ensure dev server port 4200 is not already in use
- Check `webServer.timeout` in config (default: 120s)
- Verify `npm start` works manually

## Best Practices

1. **Always wait for hydration** before testing interactive features
2. **Use Page Object Model** for maintainable tests
3. **Clear localStorage** between tests if needed (use `beforeEach`)
4. **Populate debug data** when testing with petitions
5. **Test both user and admin modes** for role-based features
6. **Verify SSR behavior** separately from client-side behavior
7. **Use descriptive test names** that explain what is being tested
8. **Keep tests independent** - don't rely on test execution order

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Angular SSR Guide](https://angular.dev/guide/ssr)
- [Project Architecture](../ARCHITECTURE.md)
