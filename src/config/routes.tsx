import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// Lazy load components for better performance
const Landing = lazy(() => import('@/app/landing/page'))
const Dashboard = lazy(() => import('@/app/dashboard/page'))
const Users = lazy(() => import('@/app/users/page'))
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
}

export const routes: RouteConfig[] = [
  // Default route - redirect to dashboard
  // Use relative path "dashboard" instead of "/dashboard" for basename compatibility
  {
    path: "/",
    element: <Navigate to="dashboard" replace />
  },

  // Landing Page
  {
    path: "/landing",
    element: <Landing />
  },

  // Dashboard Routes
  {
    path: "/dashboard",
    element: <Dashboard />
  },

  // Content Pages
  {
    path: "/users",
    element: <Users />
  },
  {
    path: "/faqs",
    element: <FAQs />
  },

  // Authentication Routes
  {
    path: "/auth/sign-in",
    element: <SignIn />
  },
  {
    path: "/auth/sign-up",
    element: <SignUp />
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword />
  },

  // Error Pages
  {
    path: "/errors/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/errors/forbidden",
    element: <Forbidden />
  },
  {
    path: "/errors/not-found",
    element: <NotFound />
  },
  {
    path: "/errors/internal-server-error",
    element: <InternalServerError />
  },
  {
    path: "/errors/under-maintenance",
    element: <UnderMaintenance />
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
