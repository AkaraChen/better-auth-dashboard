"use client"

import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import type { FullOrganization } from "../types"
import { OrganizationDetailHeader } from "./components/organization-detail-header"
import { OrganizationDetailTabs } from "./components/organization-detail-tabs"

export default function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()

  const { data: organization, isLoading, error, refetch } = useQuery({
    queryKey: ["organizations", orgId, "full"],
    queryFn: async () => {
      const response = await authClient.organization.getFullOrganization({
        query: { organizationId: orgId! }
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data as FullOrganization
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (!orgId) {
    return (
      <BaseLayout title="Invalid Organization">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Invalid organization ID</p>
          <Button asChild>
            <Link to="/organizations">Back to Organizations</Link>
          </Button>
        </div>
      </BaseLayout>
    )
  }

  if (isLoading) {
    return (
      <BaseLayout title="Loading Organization">
        <div className="flex items-center justify-center px-4 py-12">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  if (error || !organization) {
    return (
      <BaseLayout title="Organization Not Found">
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Organization not found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "You don't have access to this organization"}
          </p>
          <Button asChild>
            <Link to="/organizations">Back to Organizations</Link>
          </Button>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        <OrganizationDetailHeader
          organization={organization}
          onRefresh={() => refetch()}
        />
        <OrganizationDetailTabs organization={organization} />
      </div>
    </BaseLayout>
  )
}
