# Municipality Petition System - Workspace Instructions

## Project Overview

This is an Angular 21 SSR (Server-Side Rendering) demo application for webinar presentations. The app showcases modern Angular features including signals, standalone components, SSR with hydration, and role-based access control.

## Goal

The goal of this project is to demonstrate pitfalls that developers may not seeing related to usually Backend Tasks. For example:

- Correct response status codes for Pages (e.g. 404 for not found, 403 for unauthorized)
- Cache control headers for static assets and dynamic pages

**Key Documentation**: See [ARCHITECTURE.md](../ARCHITECTURE.md) for detailed architecture and data model.

## Code Style

### General Principles

- **Formatting**: Prettier is configured (100 char width, single quotes, Angular HTML parser)
- **TypeScript**: Use strict typing, avoid `any` types
- **Standalone Components**: All components must be standalone (no NgModules)
- **Signals**: Prefer signals over observables for state management
- **SSR-Safe**: Always check `isPlatformBrowser()` before accessing browser-only APIs

### Angular Patterns

**State Management**: Use Angular signals

```typescript
// ✅ Good - Using signals
todos = signal<Todo[]>([]);
filteredTodos = computed(() => this.todos().filter(...));

// ❌ Avoid - Using BehaviorSubject when signals work
todos$ = new BehaviorSubject<Todo[]>([]);
```

**SSR Safety**: Wrap browser-only code

```typescript
// ✅ Good - SSR-safe
constructor() {
  if (isPlatformBrowser()) {
    const data = localStorage.getItem('key');
  }
  // Or use afterNextRender() for hydration
  afterNextRender(() => {
    this.isHydrated.set(true);
  });
}

// ❌ Avoid - Breaks SSR
constructor() {
  const data = localStorage.getItem('key'); // Error on server
}
```

**Dependency Injection**: Use `inject()` in constructors

```typescript
// ✅ Good - Modern inject pattern
private todoService = inject(TodoService);
private router = inject(Router);

// ⚠️ Acceptable but less preferred
constructor(private todoService: TodoService) {}
```

## Architecture

### Component Structure

- **List Components**: Handle display and filtering (`list.component.ts`)
- **Detail Components**: Handle CRUD forms (`detail.component.ts`)
- **Services**: Business logic and state management (`services/`)
- **No shared modules**: Use standalone components only

### Service Layer

1. **StorageService**: SSR-safe localStorage wrapper (always use this instead of direct localStorage)
2. **TodoService**: Business logic and signal-based state (single source of truth for todos)
3. **AuthService**: Role management (admin/user toggle)

### Routing

- Use functional route guards if needed
- Leverage Angular's route parameters with `input()` binding
- SSR configuration in `app.config.server.ts`

## Build and Test

```bash
# Development
npm start              # Start dev server (http://localhost:4200)

# Production
npm run build          # Build for production

# SSR
npm run serve:ssr:webinar-pure-angular  # Run SSR server

# Testing
npm test               # Run Vitest tests
```

## Conventions

### File Naming

- Components: `feature-name.component.ts` (with separate `.html` file)
- Services: `feature.service.ts`
- Routes: `app.routes.ts`
- Always co-locate component HTML and TS files

### Component Development

- Keep templates in separate `.html` files (not inline)
- Use Tailwind CSS classes (v4.1.12 - no JS config needed)
- Mobile-first responsive design (use Tailwind breakpoints: `md:`, `lg:`)
- Implement skeleton loaders for SSR hydration UX

### State Management

- Use signals for all component state
- Use `computed()` for derived state
- Persist important state via `StorageService` (not direct localStorage)
- Signal updates trigger automatic re-renders

### Forms

- Use Reactive Forms with validation
- Implement proper form validation feedback
- Role-based form field visibility (admin vs. user)

## Common Patterns

### Loading Data After Hydration

```typescript
isHydrated = signal(false);

constructor() {
  afterNextRender(() => {
    this.isHydrated.set(true);
    this.loadData();
  });
}
```

### Role-Based UI

```typescript
// In template
@if (authService.isAdmin()) {
  <button>Admin Only Action</button>
}
```

### Search/Filter Pattern

```typescript
searchQuery = signal('');
filteredItems = computed(() =>
  this.items().filter((item) =>
    item.title.toLowerCase().includes(this.searchQuery().toLowerCase()),
  ),
);
```

## Angular-Specific Notes

- This project uses Angular 21 features (signals, control flow syntax `@if`, `@for`)
- No zone.js optimizations in place (standard change detection)
- SSR with event replay enabled for better UX
- Hydration is automatic but requires SSR-safe code

## What NOT to Do

- ❌ Don't use NgModules (project is standalone-only)
- ❌ Don't access `window`, `document`, or `localStorage` directly (use platform checks)
- ❌ Don't use observables for simple state (signals are preferred)
- ❌ Don't inline templates for components with complex HTML
- ❌ Don't skip mobile responsive testing (mobile-first design)
