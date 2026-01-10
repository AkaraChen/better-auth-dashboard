# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development (requires auth server running first)
pnpm mock-server  # Start mock auth server on port 3001 (separate terminal)
pnpm dev          # Start Vite dev server on port 5173

# Type checking (run after code changes)
pnpm tsc -b --noEmit

# Build and lint
pnpm build        # Type-check + build for production
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

## Architecture Overview

This is a **React admin dashboard** for managing authentication, organizations, and users using **better-auth** (client-only). The app connects to an external better-auth server; the included `mock-server.ts` is only for development.

### Key Tech Stack

- **Vite 7** + **React 19** + **TypeScript 5.9** + **React Router v7**
- **shadcn/ui** (New York style, 44+ components in `src/components/ui/`)
- **TanStack Query v5** for server state (5min staleTime, 10min gcTime)
- **Zustand** for client state (theme, sidebar config)
- **React Hook Form** + **Zod** for forms
- **Tailwind CSS v4** with inline theme configuration in `src/index.css`
- **@inlang/paraglide-js** for i18n (English, Chinese)

### Directory Structure

```
src/
├── app/                    # Page components (route-based)
│   ├── dashboard/          # Dashboard overview
│   ├── users/              # User management (admin feature)
│   ├── organizations/      # Organization management
│   ├── auth/               # Sign-in, sign-up, forgot-password
│   ├── settings/           # Account, appearance, billing, notifications, etc.
│   └── errors/             # 404, 403, 500 error pages
├── components/
│   ├── ui/                 # shadcn/ui components (44 components)
│   ├── layouts/            # Layout components (base-layout.tsx)
│   ├── router/             # Route renderer with lazy loading
│   └── app-sidebar.tsx     # Main navigation sidebar
├── lib/
│   ├── auth-client.ts      # better-auth client configuration (baseURL: localhost:3001)
│   ├── query-client.ts     # TanStack Query configuration
│   └── utils.ts            # cn(), assetUrl(), getAppUrl()
├── hooks/                  # Custom hooks (use-mobile, use-theme, use-sidebar-config, etc.)
├── contexts/               # Theme and sidebar contexts
├── config/
│   ├── routes.tsx          # Route configuration with lazy loading, feature flags, roles
│   └── theme-data.ts       # Theme presets
├── paraglide/              # Generated i18n code
└── types/                  # TypeScript type definitions
```

### Routing Architecture

- Routes are explicitly configured in [src/config/routes.tsx](src/config/routes.tsx)
- All routes are lazily loaded using `React.lazy()`
- Route properties: `path`, `element`, `title`, `icon`, `hide` (boolean), `requiresFeature` (array), `requiresRole` (array)
- Dynamic routes use `:orgId` pattern (e.g., `organizations/[orgId]/overview`)
- The sidebar automatically filters routes based on enabled features and user roles

### State Management Rules

1. **Server State**: Use TanStack Query for all API requests (see below for exceptions)
2. **Client State**: Use Zustand stores (`src/contexts/`)
3. **Form State**: Use React Hook Form with Zod validation

### API Request Pattern

**CRITICAL**: Use TanStack Query for API requests unless in edge cases.

```typescript
// Preferred: TanStack Query mutation
const mutation = useMutation({
  mutationFn: (data) => authClient.organization.someMethod(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["organizations"] })
    toast.success("Success message")
  }
})

// Query keys follow pattern: ["resource", "action", "id"]
```

### Authentication

- **Client-only better-auth**: Use only the client from [src/lib/auth-client.ts](src/lib/auth-client.ts)
- Auth server runs on port 3001 (mock-server.ts for development)
- Session management via `authClient.useSession()`
- Plugins enabled: `admin`, `organization`, `apiKey`
- Do NOT implement any server-side better-auth features in this app

### Feature Flags

Configure in `dashboard.config.ts`:
```typescript
{
  features: ['admin', 'organizations', 'api-key'],  // Toggle features
  brandName: 'Your Brand',
  roles: ['user', 'admin', 'custom-role']           // Custom roles
}
```

### Component Conventions

- Page components: `src/app/*/page.tsx`
- Feature components: Co-located in `components/` subdirectories
- Shared UI: `src/components/ui/` (shadcn/ui)
- Compound pattern: Split dialogs, forms, and tables into separate components
- Type definitions: Often in `types.ts` files within feature directories

### Styling

- Tailwind CSS v4 with CSS variables for theming (dark/light mode)
- Utility function `cn()` for merging Tailwind classes (from [src/lib/utils.ts](src/lib/utils.ts))
- Component variants use `class-variance-authority` (cva)
- Responsive: Mobile-first with `@container/main` for container queries

### Data Table Pattern

Reusable data tables with TanStack Table v8:
- Pagination, sorting, filtering
- Row actions (edit, delete, etc.)
- Loading/error states
- Integrated with dialogs for CRUD operations

## Important Rules

1. **Use context7 for unfamiliar libraries**: Query documentation before using new APIs
2. **Type-check after changes**: Run `pnpm tsc -b --noEmit` (do NOT run or build the project)
3. **Client-only better-auth**: Only use better-auth client features; the server is external
4. **TanStack Query for APIs**: Use TanStack Query for API requests unless it's an edge case
5. **Ask questions**: If unsure about anything, ask the user directly
