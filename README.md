# Better Auth Dashboard

A standalone React admin dashboard for **better-auth** — use it as a replacement for better-auth Cloud if you prefer to self-host.

## Features

- **Organization Management** — Create and manage organizations, members, and roles
- **User Management** — Admin panel for managing users and permissions
- **API Key Management** — Generate and manage API keys for your applications
- **Non-invasive** — Pure client-side implementation, no backend modifications required

## Tech Stack

- React 19 + Vite 7 + TypeScript
- TanStack Query for server state
- shadcn/ui components (44+ components)
- Tailwind CSS v4 with dark mode
- React Router v7

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the mock auth server (in a separate terminal)
pnpm mock-server

# Start the dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard.

## How It Works

This dashboard connects to your existing better-auth server via the client SDK. It doesn't modify your backend — it's just a UI layer that uses better-auth's existing API endpoints.

Configure your better-auth server URL in [src/lib/auth-client.ts](src/lib/auth-client.ts).

## Development

```bash
pnpm tsc -b --noEmit  # Type check
pnpm build            # Build for production
pnpm lint             # Run ESLint
```
