"use client"

import { useState } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { ApiKeyDataTable } from "./components/api-key-data-table"
import { CreateApiKeyDialog } from "./components/create-api-key-dialog"
import { EditApiKeyDialog } from "./components/edit-api-key-dialog"
import { DeleteApiKeyDialog } from "./components/delete-api-key-dialog"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as m from "@/paraglide/messages"
import type { ApiKey } from "./types"

async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await authClient.apiKey.list()

  if (response.error) {
    throw new Error(response.error.message || "Failed to fetch API keys")
  }

  return (response.data || []).map((raw: any) => ({
    id: raw.id,
    name: raw.name || "Unnamed",
    userId: raw.userId,
    expiresAt: raw.expiresAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastUsedAt: raw.lastUsedAt || null,
    enabled: raw.enabled,
    startsWith: raw.start || raw.prefix || "",
    metadata: raw.metadata || undefined,
  } as ApiKey))
}

export default function ApiKeysPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogState, setEditDialogState] = useState<{
    open: boolean
    apiKey: ApiKey | null
  }>({ open: false, apiKey: null })
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean
    apiKeyId: string | null
  }>({ open: false, apiKeyId: null })

  const {
    data: apiKeys = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["api-keys", "list"],
    queryFn: fetchApiKeys,
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Toggle enabled mutation
  const toggleEnabledMutation = useMutation({
    mutationFn: async ({ apiKey, enabled }: { apiKey: ApiKey; enabled: boolean }) => {
      const result = await authClient.apiKey.update({
        keyId: apiKey.id,
        enabled,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to update API key")
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
      toast.success("API key updated successfully")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update API key")
    },
  })

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  const handleEdit = (apiKey: ApiKey) => {
    setEditDialogState({ open: true, apiKey })
  }

  const handleDelete = (apiKeyId: string) => {
    setDeleteDialogState({ open: true, apiKeyId })
  }

  const handleToggleEnabled = (apiKey: ApiKey) => {
    toggleEnabledMutation.mutate({
      apiKey,
      enabled: !apiKey.enabled,
    })
  }

  return (
    <BaseLayout
      title={m.apiKeys_title()}
      description={m.apiKeys_description()}
    >
      <div className="@container/main px-4 lg:px-6">
        <ApiKeyDataTable
          apiKeys={apiKeys}
          loading={isLoading}
          error={error?.message || null}
          onRefresh={() => refetch()}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleEnabled={handleToggleEnabled}
        />
      </div>

      {/* Create API Key Dialog */}
      <CreateApiKeyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit API Key Dialog */}
      <EditApiKeyDialog
        apiKey={editDialogState.apiKey}
        open={editDialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setEditDialogState({ open: false, apiKey: null })
          }
        }}
      />

      {/* Delete API Key Dialog */}
      <DeleteApiKeyDialog
        apiKey={apiKeys.find((key) => key.id === deleteDialogState.apiKeyId) || null}
        open={deleteDialogState.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogState({ open: false, apiKeyId: null })
          }
        }}
      />
    </BaseLayout>
  )
}

// Re-export types
export type * from "./types"
