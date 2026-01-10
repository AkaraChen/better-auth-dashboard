"use client"

import { BaseLayout } from "@/components/layouts/base-layout"
import { OrganizationDataTable } from "./components/organization-data-table"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: any
  createdAt: Date
}

export interface OrganizationMember {
  id: string
  organizationId: string
  role: string
  createdAt: Date
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  email: string
  role: string
  status: "pending" | "accepted" | "rejected" | "canceled"
  expiresAt: Date | null
  createdAt: Date
  inviterId: string
}

export interface FullOrganization extends Organization {
  members: OrganizationMember[]
  invitations: OrganizationInvitation[]
}

async function fetchFullOrganizations(): Promise<FullOrganization[]> {
  // First, get the list of organizations the user is a member of
  const listResponse = await authClient.organization.list()

  if (listResponse.error) {
    throw new Error(listResponse.error.message || "Failed to fetch organizations")
  }

  if (!listResponse.data || listResponse.data.length === 0) {
    return []
  }

  // Fetch full details for each organization
  const fullOrgsPromises = listResponse.data.map(async (org) => {
    const fullResponse = await authClient.organization.getFullOrganization({
      query: {
        organizationId: org.id,
      }
    })

    if (fullResponse.error) {
      console.error(`Failed to fetch full details for org ${org.id}:`, fullResponse.error)
      return null
    }

    return fullResponse.data as FullOrganization
  })

  const fullOrgs = await Promise.all(fullOrgsPromises)
  return fullOrgs.filter((org): org is FullOrganization => org !== null)
}

export default function OrganizationsPage() {
  const { data: session } = useSession()

  const {
    data: organizations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organizations", "list-full"],
    queryFn: fetchFullOrganizations,
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return (
    <BaseLayout
      title="Organizations"
      description="Manage your organizations and teams"
    >
      <div className="@container/main px-4 lg:px-6">
        <OrganizationDataTable
          organizations={organizations}
          loading={isLoading}
          error={error?.message || null}
          onRefresh={() => refetch()}
        />
      </div>
    </BaseLayout>
  )
}
