"use client"

import { useState } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { OrganizationDataTable } from "./components/organization-data-table"
import { CreateOrganizationDialog } from "./components/create-organization-dialog"
import { EditOrganizationDialog } from "./components/edit-organization-dialog"
import { DeleteOrganizationDialog } from "./components/delete-organization-dialog"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@tanstack/react-query"
import type { FullOrganization } from "./types"
import * as m from "@/paraglide/messages"

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

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogState, setEditDialogState] = useState<{
    open: boolean
    organization: FullOrganization | null
  }>({ open: false, organization: null })
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean
    organizationId: string | null
  }>({ open: false, organizationId: null })

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

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  const handleEdit = (organization: FullOrganization) => {
    setEditDialogState({ open: true, organization })
  }

  const handleDelete = (organizationId: string) => {
    setDeleteDialogState({ open: true, organizationId })
  }

  return (
    <BaseLayout
      title={m.orgs_title()}
      description={m.orgs_description()}
    >
      <div className="@container/main px-4 lg:px-6">
        <OrganizationDataTable
          organizations={organizations}
          loading={isLoading}
          error={error?.message || null}
          onRefresh={() => refetch()}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        organization={editDialogState.organization}
        open={editDialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogState({ open: false, organization: null })
          }
        }}
      />

      {/* Delete Organization Dialog */}
      <DeleteOrganizationDialog
        organization={organizations.find((org) => org.id === deleteDialogState.organizationId) || null}
        open={deleteDialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogState({ open: false, organizationId: null })
          }
        }}
      />
    </BaseLayout>
  )
}

// Re-export types
export type * from "./types"
