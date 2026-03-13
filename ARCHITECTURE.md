# Municipality Petition System - Architecture Documentation

## Overview

This is an Angular 21 SSR (Server-Side Rendering) application for managing municipality petitions. The app demonstrates modern Angular features including signals, standalone components, SSR with hydration, and role-based access control.

**Purpose**: Demo application for webinar presentations showcasing Angular SSR capabilities with a humorous municipality petition management system.

## Technology Stack

- **Angular**: 21.1.0 (Latest with signals, SSR, standalone components)
- **Tailwind CSS**: v4.1.12 (Latest version, no JS config file needed)
- **TypeScript**: Latest
- **Node.js**: Managed via Volta
- **Server-Side Rendering**: Built-in Angular SSR with event replay
- **State Management**: Angular Signals (signal, computed)
- **Forms**: Reactive Forms with validation
- **Storage**: localStorage (with SSR-safe wrapper)

## Application Features

### Core Functionality

1. **Petition Management**: Create, view, edit, and delete petitions
2. **Three-Status System**: Pending, Accepted, Rejected
3. **Role-Based Access Control**: Admin vs. User roles
4. **Search Functionality**: Filter petitions by title or description
5. **SSR with Skeleton Loaders**: Smooth hydration experience
6. **Mobile-First Responsive Design**: Full mobile support with Tailwind breakpoints
7. **Debug Mode**: 7 clicks on title populates 15 funny example petitions

### User Roles

- **User (Default)**: Read-only access, can view all petitions
- **Admin**: Full CRUD access, can accept/reject petitions with reasons
- **Toggle**: Click button in top-right to switch roles (persists in localStorage)

## Project Structure

```
src/
├── app/
│   ├── services/
│   │   ├── storage.service.ts      # SSR-safe localStorage wrapper
│   │   ├── todo.service.ts         # Petition state management
│   │   └── auth.service.ts         # Role-based access control
│   ├── list/
│   │   ├── list.component.ts       # List view logic
│   │   └── list.component.html     # 3-column responsive layout
│   ├── detail/
│   │   ├── detail.component.ts     # Detail/add/edit logic
│   │   └── detail.component.html   # Form with role-based UI
│   ├── not-found/
│   │   ├── not-found.component.ts  # 404 page
│   │   └── not-found.component.html
│   ├── app.routes.ts               # Route configuration
│   ├── app.config.ts               # Client-side app config
│   └── app.config.server.ts        # Server-side app config
├── main.ts                          # Client bootstrap
├── main.server.ts                   # Server bootstrap
└── server.ts                        # Express server for SSR
```

## Data Model

### Todo Interface

See the complete interface definition in [src/app/services/todo.service.ts](src/app/services/todo.service.ts).

**Key Properties**: id, title, description, status (pending/accepted/rejected), createdAt, processedDate, processedReason

## Services Architecture

### 1. StorageService

📄 [src/app/services/storage.service.ts](src/app/services/storage.service.ts)

**Purpose**: Provide SSR-safe localStorage access using `isPlatformBrowser()` to prevent server-side errors.

### 2. TodoService

📄 [src/app/services/todo.service.ts](src/app/services/todo.service.ts)

**Purpose**: Manage petition state with signals and localStorage persistence.

**Key Features**:

- Signal-based state management (todos, searchQuery, isHydrated)
- Computed `filteredTodos()` for search functionality
- CRUD operations: addTodo, updateTodo, deleteTodo
- Petition workflow: acceptPetition, rejectPetition, setPetitionPending
- Debug mode: populateDebugData() loads 15 funny examples
- SSR-safe: Uses `afterNextRender()` for client-side hydration

### 3. AuthService

📄 [src/app/services/auth.service.ts](src/app/services/auth.service.ts)

**Purpose**: Manage user roles (admin/user) with localStorage persistence.

**Key Features**:

- Signal-based role state (defaults to 'user' for security)
- Methods: isAdmin(), isUser(), setRole(), toggleRole()
- SSR-safe: Loads from localStorage after first render

## Components

### ListComponent

📄 [src/app/list/list.component.ts](src/app/list/list.component.ts)  
📄 [src/app/list/list.component.html](src/app/list/list.component.html)

**Purpose**: Display petitions in responsive 3-column layout with search and role switching.

**Key Features**:

- Computed filters: pendingPetitions(), acceptedPetitions(), rejectedPetitions()
- Real-time search on title/description
- Role toggle button (admin/user mode)
- Debug mode: 7 clicks on title → populates examples
- Responsive: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
- SSR skeleton loaders during hydration

### DetailComponent

📄 [src/app/detail/detail.component.ts](src/app/detail/detail.component.ts)  
📄 [src/app/detail/detail.component.html](src/app/detail/detail.component.html)

**Purpose**: Create new petitions (admin) or view/edit existing ones with role-based access control.

**Key Features**:

- **Add Mode** (admin only): Create new petitions
- **Edit Mode**: View/edit existing petitions
- **Admin Actions**: Save, Accept (with reason), Reject (with reason), Set Pending, Delete
- **User Mode**: Read-only view with "🔒 Read-only" badge
- **Navigation Guard**: Non-admins redirected from /add to /list
- **Validation**: Title (min 3 chars), reason required for accept/reject

### NotFoundComponent

📄 [src/app/not-found/not-found.component.ts](src/app/not-found/not-found.component.ts)  
📄 [src/app/not-found/not-found.component.html](src/app/not-found/not-found.component.html)

**Purpose**: 404 error page with link back to petition list.

## Routing

📄 [src/app/app.routes.ts](src/app/app.routes.ts)

**Routes**: `/` → `/list`, `/list`, `/add` (admin only), `/detail/:id`, `**` (404)

All routes use lazy loading with `loadComponent()`.

## SSR Implementation

### Hydration Strategy

1. **Server Render**: Components render with empty state, show skeleton loaders
2. **Client Bootstrap**: `afterNextRender()` triggers in services
3. **Data Load**: Services read from localStorage, set `isHydrated = true`
4. **UI Swap**: Templates detect hydration, swap skeletons for real data

### Platform Detection

Use `isPlatformBrowser(inject(PLATFORM_ID))` to check if code is running client-side.

### Skeleton Loaders

- Dynamic count based on viewport height
- Animated pulse effect with Tailwind
- Track by `$index` to avoid duplicate key errors

## Styling with Tailwind CSS v4

### Responsive Breakpoints

- **Mobile First**: Base styles for mobile (< 640px)
- **sm**: 640px+ (tablet)
- **md**: 768px+
- **lg**: 1024px+ (desktop)

### Key Patterns

- **Grid Layouts**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Flexbox**: `flex flex-col sm:flex-row` for mobile stacking
- **Spacing**: `p-4 sm:p-6 lg:p-8` for responsive padding
- **Typography**: `text-base` (16px) on inputs to prevent iOS zoom
- **Buttons**: `w-full sm:w-auto` for full-width on mobile

### Color Scheme

- **Pending**: Amber (amber-500, amber-700, amber-100)
- **Accepted**: Green (green-500, green-700, green-100)
- **Rejected**: Red (red-500, red-700, red-100)
- **Admin Mode**: Purple (purple-600, purple-700)
- **User Mode**: Gray (gray-600, gray-700)

## Debug Features

### 7-Click Populate

**How it works**:

1. Click "Municipality Petitions" title rapidly
2. After 7 clicks within 800ms window
3. Triggers `todoService.populateDebugData()`
4. Loads 15 funny example petitions (8 pending, 4 accepted, 3 rejected)

See full list of humorous example petitions in [src/app/services/todo.service.ts](src/app/services/todo.service.ts) → `populateDebugData()`

## Common Development Tasks

### Running the App

```bash
npm start              # Development server with SSR
npm run build          # Production build
npm run build:ssr      # SSR production build
npm run serve:ssr      # Serve SSR build locally
```

### Adding a New Status

1. Update `Todo` interface in [todo.service.ts](src/app/services/todo.service.ts)
2. Add computed filter in [list.component.ts](src/app/list/list.component.ts)
3. Add column in [list.component.html](src/app/list/list.component.html)
4. Add action methods in [detail.component.ts](src/app/detail/detail.component.ts)
5. Update UI in [detail.component.html](src/app/detail/detail.component.html)

### Modifying Role Behavior

1. Update [auth.service.ts](src/app/services/auth.service.ts) methods if adding new roles
2. Update template `@if (authService.isAdmin())` conditions
3. Update navigation guards in components

### Changing Color Scheme

Search/replace Tailwind color classes in component templates:

- Pending: `amber-` → your color
- Accepted: `green-` → your color
- Rejected: `red-` → your color

## Presentation Tips

### Demo Flow

1. **Start as User**: Show read-only experience
2. **Toggle to Admin**: Demonstrate role switch
3. **Create Petition**: Show add flow (admin only)
4. **Accept/Reject**: Show decision-making with reasons
5. **Debug Click**: 7-click title to show all features at once
6. **Mobile View**: Resize browser to show responsive design

### Key Features to Highlight

- ✅ SSR with smooth skeleton loaders
- ✅ Signals for reactive state (no RxJS needed)
- ✅ Standalone components (no NgModules)
- ✅ Role-based access control (simple toggle)
- ✅ Mobile-first responsive design
- ✅ Form validation
- ✅ localStorage persistence
- ✅ Tailwind CSS v4

### Talking Points

- "Modern Angular with signals is much simpler"
- "SSR works out of the box, see the skeleton loaders"
- "Standalone components mean less boilerplate"
- "Tailwind v4 requires zero JavaScript configuration"
- "Role switching shows how easy auth can be"
- "Mobile-first design ensures it works everywhere"

## Known Limitations

### Security

- **No Real Auth**: Role switching is client-side only, not secure
- **localStorage Only**: Data not synced across devices
- **No Backend**: All state is local, no persistence across sessions

### Features Not Implemented

- User authentication (real login system)
- Backend API integration
- Multi-user support
- Email notifications
- File attachments
- Commenting system
- Audit logs

### Browser Support

- Modern browsers only (ES2022+)
- No IE11 support
- Requires JavaScript enabled

## Future Enhancement Ideas

1. **Backend Integration**: Add NestJS/Express API
2. **Real Auth**: Implement JWT/OAuth
3. **Database**: PostgreSQL or MongoDB storage
4. **Real-time**: WebSocket updates for multi-user
5. **Email**: Notifications for status changes
6. **Analytics**: Dashboard with petition statistics
7. **Export**: PDF/CSV export functionality
8. **Comments**: Discussion threads on petitions
9. **Voting**: Public voting on petitions
10. **Categories**: Tag/categorize petitions

## Troubleshooting

### SSR Issues

- **Problem**: Data not loading on client
- **Solution**: Check `afterNextRender()` is called, verify localStorage has data

### Hydration Mismatch

- **Problem**: Angular warns about content mismatch
- **Solution**: Ensure server and client render same content initially (use skeletons)

### Form Not Editable

- **Problem**: Fields are read-only when they shouldn't be
- **Solution**: Check `authService.isAdmin()` returns true, verify readonly attribute binding

### Debug Mode Not Working

- **Problem**: 7 clicks don't populate data
- **Solution**: Click faster (within 800ms window), check console for debug message

### Mobile Zoom on Input

- **Problem**: iOS zooms in when focusing inputs
- **Solution**: Ensure inputs have `text-base` class (16px font size)

## Contact & Support

This is a demo application created for webinar presentations.

**Key Files**:

- **Services**: [storage.service.ts](src/app/services/storage.service.ts), [todo.service.ts](src/app/services/todo.service.ts), [auth.service.ts](src/app/services/auth.service.ts)
- **Components**: [list/](src/app/list/), [detail/](src/app/detail/), [not-found/](src/app/not-found/)
- **Config**: [app.routes.ts](src/app/app.routes.ts), [app.config.ts](src/app/app.config.ts), [app.config.server.ts](src/app/app.config.server.ts)

---

**Last Updated**: March 2026  
**Angular Version**: 21.1.0  
**Purpose**: Webinar demonstration of Angular SSR with signals
