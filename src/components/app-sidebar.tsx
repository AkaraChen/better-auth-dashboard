"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  LayoutTemplate,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import config from "~/dashboard.config"

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

const data = {
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Pages",
      items: [
        {
          title: "Landing",
          url: "/landing",
          target: "_blank",
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
        {
          title: "FAQs",
          url: "/faqs",
          icon: HelpCircle,
        },
      ],
    },
  ],
}

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
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
