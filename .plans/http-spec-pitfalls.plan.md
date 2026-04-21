# SSR HTTP Validation Test Plan

## Goal

Demonstrate common SSR HTTP response pitfalls that frontend developers often miss when implementing server-side rendering in Angular.

## Test Results Summary

**Tests Run**: 13 total (6 passed, 7 failed)

### Pitfalls Identified ✅

1. **❌ 404 Status Codes Not Set** - Routes return 200 even for non-existent pages
   - Server returns 200 for all routes
   - Angular router handles navigation client-side
   - NotFoundComponent renders correctly BUT status code is wrong
   - **Impact**: Search engines index 404 pages, crawlers see success

2. **❌ Cache-Control Headers Missing** - No cache headers on dynamic content
   - All pages lack cache-control headers (undefined)
   - 404 pages can be cached indefinitely by browsers
   - Dynamic content (list/detail) served without revalidation
   - **Impact**: Stale data, cached errors, poor UX

## Test Categories

### ✅ 1. Basic Status Codes (6 tests - Partially Passing)

- [x] 200 for root route ✅
- [x] 200 for list route ✅
- [x] 200 for add route ✅
- [x] 200 for valid petition detail route ✅
- [x] 404 for non-existent route ❌ Returns 200
- [x] 404 for non-existent detail route ❌ Returns 200

**Status**: Tests implemented, pitfall demonstrated

### ✅ 2. Cache-Control Headers (7 tests - All Failing)

**Pitfall**: Improper caching causes stale data and 404s being cached indefinitely

- [x] 404 pages should have `no-cache` or `no-store` ❌ Header undefined
- [x] Detail pages (dynamic content) should have `no-cache` ❌ Header undefined
- [x] List page should have short cache or `no-cache` ❌ Header undefined
- [x] Add page should have `no-cache` ❌ Header undefined

**Status**: Tests implemented, pitfall demonstrated

### ⬜ 3. Authorization - 403 Forbidden (DEFERRED)

**Pitfall**: Server should return 403, not just client-side redirect

- [ ] Non-admin accessing `/add` should get 403
- [ ] Non-admin editing petition should get 403

**Note**: Requires server-side auth implementation (localStorage not accessible in SSR)

### ⬜ 4. Redirect Status Codes (DEFERRED)

**Pitfall**: Client-side redirect vs proper HTTP redirect

- [ ] Root to list should return 307/303 redirect (not 200 with client redirect)
- [ ] Redirect should include Location header

### ⬜ 5. SEO Meta Tags (DEFERRED)

**Pitfall**: Meta tags rendered client-side are invisible to crawlers

- [ ] Title tag present in SSR response
- [ ] Meta description present in SSR response
- [ ] Open Graph tags for detail pages

## Implementation Status

### Phase 1: ✅ COMPLETED - Core Pitfalls Demonstrated

1. ✅ Fixed detail 404 test logic
2. ✅ Implemented cache-control tests for 404 pages
3. ✅ Implemented cache-control tests for detail/list pages
4. ✅ Tests successfully demonstrate SSR pitfalls

### Findings

**404 Status Code Issue**:

- Angular routes show NotFoundComponent correctly (UI works)
- But server returns 200 OK for ALL routes including non-existent ones
- This is because Angular SSR renders ANY route successfully
- Need to set status code in NotFoundComponent or server middleware

**Cache Header Issue**:

- No cache-control headers set by default in Angular SSR
- Server needs to add appropriate headers based on route type
- Currently all responses lack caching strategy

### Next Steps for Fixing (Not Part of Demo)

To actually fix these issues (for reference):

1. **404 Status Codes**: Inject `Response` in NotFoundComponent and set status:

   ```typescript
   constructor() {
     const response = inject(RESPONSE, { optional: true });
     if (response) response.status(404);
   }
   ```

2. **Cache Headers**: Add middleware in `server.ts`:
   ```typescript
   app.use((req, res, next) => {
     // Set cache headers based on route
     if (req.url.includes('404') || res.statusCode === 404) {
       res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
     }
     next();
   });
   ```

## Webinar Talking Points

1. **Visual Success ≠ Correct Behavior**
   - App looks perfect (shows 404 page)
   - But HTTP status is wrong (200 instead of 404)
   - Search engines will index 404 pages

2. **Silent Caching Issues**
   - No error messages
   - Works fine in dev
   - Production users see stale data
   - 404s get cached and persist

3. **Backend Developer Mindset**
   - Frontend devs focus on UI working
   - Forget HTTP semantics matter in SSR
   - Status codes, headers are "backend concerns"
   - But SSR makes you responsible for both!

## Test Implementation Notes

### Cache-Control Header Access

```typescript
const response = await page.goto('/path');
const cacheControl = response?.headers()['cache-control'];
expect(cacheControl).toMatch(/no-cache|no-store/);
```

## Key Files

- `e2e/tests/http-validation.spec.ts` - Main test file ✅ Updated
- `src/server.ts` - Express server config (needs cache headers)
- `src/app/not-found/not-found.component.ts` - Needs status code injection
- `.plans/http-spec-pitfalls.plan.md` - This plan ✅ Updated
