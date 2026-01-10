"use client"

import * as React from "react"
import {
  Shield,
  AlertTriangle,
  Settings,
  LayoutTemplate,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import config from "~/dashboard.config"
import { routes, type RouteConfig } from "@/config/routes"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"

// Convert route config to nav items format
const convertRouteToNavItem = (route: RouteConfig) => ({
  title: route.title!,
  url: route.path,
  icon: route.icon,
})

// Filter routes based on config and session
const filterVisibleRoutes = (
  routes: RouteConfig[],
  session: ReturnType<typeof useSession>["data"]
): RouteConfig[] => {
  return routes.filter((route) => {
    // Skip routes without a title (not meant for navigation)
    if (!route.title) return false

    // Skip hidden routes
    if (route.hide) return false

    // Check feature requirements
    if (route.requiresFeature && !config.features.includes(route.requiresFeature)) {
      return false
    }

    // Check role requirements
    if (route.requiresRole) {
      const userRole = session?.user?.role
      if (!userRole || !route.requiresRole.includes(userRole)) {
        return false
      }
    }

    return true
  })
}

// Static navigation groups for items not in routes (Auth, Errors, etc.)
const staticNavGroups = [
  {
    label: "Pages",
    items: [
      {
        title: "Landing",
        url: "/landing",
        target: "_blank" as const,
        icon: LayoutTemplate,
      },
      {
        title: "Auth Pages",
        url: "#",
        icon: Shield,
        items: [
          {
            title: "Sign In",
            url: "/auth/sign-in",
          },
          {
            title: "Sign Up",
            url: "/auth/sign-up",
          },
          {
            title: "Forgot Password",
            url: "/auth/forgot-password",
          },
        ],
      },
      {
        title: "Errors",
        url: "#",
        icon: AlertTriangle,
        items: [
          {
            title: "Unauthorized",
            url: "/errors/unauthorized",
          },
          {
            title: "Forbidden",
            url: "/errors/forbidden",
          },
          {
            title: "Not Found",
            url: "/errors/not-found",
          },
          {
            title: "Internal Server Error",
            url: "/errors/internal-server-error",
          },
          {
            title: "Under Maintenance",
            url: "/errors/under-maintenance",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings/appearance",
        icon: Settings,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  // Get user from session or use default values
  const user = session?.user
    ? {
        name: session.user.name || config.brand,
        email: session.user.email || "user@example.com",
        avatar: session.user.image || "",
      }
    : {
        name: config.brand,
        email: "guest@example.com",
        avatar: "",
      }

  // Filter routes based on features and roles
  const visibleRoutes = React.useMemo(
    () => filterVisibleRoutes(routes, session),
    [session]
  )

  // Build navigation groups from visible routes and static items
  const navGroups = React.useMemo(() => {
    const groups: Array<{ label: string; items: Array<any> }> = []

    // Main apps from routes
    const appItems = visibleRoutes.map(convertRouteToNavItem)
    if (appItems.length > 0) {
      groups.push({
        label: "Apps",
        items: appItems,
      })
    }

    // Add static navigation groups
    groups.push(...staticNavGroups)

    return groups
  }, [visibleRoutes])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{config.brand}</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
