import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { LayoutDashboard, Users as UsersIcon, HelpCircle, Building2, KeyRound, type LucideIcon } from 'lucide-react'
import type { Feature } from '~/dashboard.config.type'
import * as m from '@/paraglide/messages'

// Lazy load components for better performance
const Landing = lazy(() => import('@/app/landing/page'))
const Dashboard = lazy(() => import('@/app/dashboard/page'))
const Users = lazy(() => import('@/app/users/page'))
const Organizations = lazy(() => import('@/app/organizations/page'))
const OrganizationDetail = lazy(() => import('@/app/organizations/[orgId]/page'))
const ApiKeys = lazy(() => import('@/app/api-keys/page'))
const FAQs = lazy(() => import('@/app/faqs/page'))

// Auth pages
const SignIn = lazy(() => import('@/app/auth/sign-in/page'))
const SignUp = lazy(() => import('@/app/auth/sign-up/page'))
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'))

// Error pages
const Unauthorized = lazy(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazy(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazy(() => import('@/app/errors/under-maintenance/page'))

// Settings pages
const AppearanceSettings = lazy(() => import('@/app/settings/appearance/page'))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]

  // Navigation display configuration
  title?: string
  icon?: LucideIcon
  hide?: boolean
  requiresFeature?: Feature
  requiresRole?: string[]
}

export const getRoutes = (): RouteConfig[] => [
  // Default route - redirect to dashboard
  // Use relative path "dashboard" instead of "/dashboard" for basename compatibility
  {
    path: "/",
    element: <Navigate to="dashboard" replace />
  },

  // Landing Page
  {
    path: "/landing",
    element: <Landing />,
    hide: true
  },

  // Dashboard Routes
  {
    path: "/dashboard",
    element: <Dashboard />,
    title: m.dashboard_title(),
    icon: LayoutDashboard
  },

  // Content Pages
  {
    path: "/users",
    element: <Users />,
    title: m.users_title(),
    icon: UsersIcon,
    requiresFeature: "admin"
  },
  {
    path: "/organizations",
    element: <Organizations />,
    title: m.orgs_title(),
    icon: Building2,
    requiresFeature: "organizations"
  },
  {
    path: "/organizations/:orgId",
    element: <OrganizationDetail />,
    hide: true
  },
  {
    path: "/api-keys",
    element: <ApiKeys />,
    title: m.apiKeys_title(),
    icon: KeyRound,
    requiresFeature: "api-key"
  },
  {
    path: "/faqs",
    element: <FAQs />,
    title: "FAQs",
    icon: HelpCircle,
    hide: true
  },

  // Authentication Routes
  {
    path: "/auth/sign-in",
    element: <SignIn />,
    hide: true
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />,
    hide: true
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword />,
    hide: true
  },

  // Error Pages
  {
    path: "/errors/unauthorized",
    element: <Unauthorized />,
    hide: true
  },
  {
    path: "/errors/forbidden",
    element: <Forbidden />,
    hide: true
  },
  {
    path: "/errors/not-found",
    element: <NotFound />,
    hide: true
  },
  {
    path: "/errors/internal-server-error",
    element: <InternalServerError />,
    hide: true
  },
  {
    path: "/errors/under-maintenance",
    element: <UnderMaintenance />,
    hide: true
  },

  // Settings Routes
  {
    path: "/settings/appearance",
    element: <AppearanceSettings />
  },

  // Catch-all route for 404
  {
    path: "*",
    element: <NotFound />
  }
]

// Export a default routes array for backward compatibility
export const routes: RouteConfig[] = getRoutes()
