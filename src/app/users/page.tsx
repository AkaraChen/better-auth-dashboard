"use client"

import { useState } from "react"
import * as m from "@/paraglide/messages"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AdminDataTable } from "./components/admin-data-table"
import { CreateUserDialog, type CreateUserFormValues } from "./components/create-user-dialog"
import { EditUserDialog, type EditUserFormValues } from "./components/edit-user-dialog"
import { UserDeleteDialog } from "./components/user-delete-dialog"
import { UserSessionsDialog } from "./components/user-sessions-dialog"
import { SetPasswordDialog, type SetPasswordFormValues } from "./components/set-password-dialog"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface BetterAuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  banned: boolean
  role?: string
}

export interface UserSession {
  token: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  impersonatedBy: string | null
}

interface UsersQueryData {
  users: BetterAuthUser[]
  total: number
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0
  })

  // Dialog states
  const [userToDelete, setUserToDelete] = useState<BetterAuthUser | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogState, setEditDialogState] = useState<{
    open: boolean
    user: BetterAuthUser | null
  }>({ open: false, user: null })
  const [sessionsDialogState, setSessionsDialogState] = useState<{
    open: boolean
    user: BetterAuthUser | null
  }>({ open: false, user: null })
  const [setPasswordDialogState, setSetPasswordDialogState] = useState<{
    open: boolean
    user: BetterAuthUser | null
  }>({ open: false, user: null })

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery<UsersQueryData, Error>({
    queryKey: ["users", "list", pagination.limit, pagination.offset],
    queryFn: async () => {
      const response = await authClient.admin.listUsers({
        query: {
          limit: String(pagination.limit),
          offset: pagination.offset,
          sortBy: "createdAt",
          sortDirection: "desc"
        }
      })

      if (response.error) {
        throw new Error(response.error.message || m.users_error_fetchFailed())
      }

      return {
        users: (response.data?.users as BetterAuthUser[]) || [],
        total: response.data?.total || 0,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const users = usersData?.users ?? []
  const totalCount = usersData?.total ?? 0

  const createUserMutation = useMutation<void, Error, CreateUserFormValues>({
    mutationFn: async (values: CreateUserFormValues) => {
      const result = await authClient.admin.createUser({
        email: values.email,
        password: values.password!,
        name: values.name,
        role: (values.role || "user") as "admin" | "user",
        data: { emailVerified: values.emailVerified },
      })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_createFailed())
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })

  const updateUserMutation = useMutation<void, Error, { userId: string; values: EditUserFormValues }>({
    mutationFn: async ({ userId, values }) => {
      const result = await authClient.admin.updateUser({
        userId,
        data: {
          email: values.email,
          name: values.name,
          role: values.role || "user",
          emailVerified: values.emailVerified,
        }
      })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_updateFailed())
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const deleteUserMutation = useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.removeUser({ userId })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_deleteFailed())
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const banUserMutation = useMutation<void, Error, { userId: string; reason?: string }>({
    mutationFn: async ({ userId, reason }) => {
      const result = await authClient.admin.banUser({
        userId,
        banReason: reason,
      })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_banFailed())
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(m.users_toast_banned())
    },
    onError: (mutationError) => {
      toast.error(mutationError.message)
    },
  })

  const unbanUserMutation = useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.unbanUser({ userId })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_unbanFailed())
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success(m.users_toast_unbanned())
    },
    onError: (mutationError) => {
      toast.error(mutationError.message)
    },
  })

  const setPasswordMutation = useMutation<void, Error, { userId: string; values: SetPasswordFormValues }>({
    mutationFn: async ({ userId, values }) => {
      const result = await authClient.admin.setUserPassword({
        userId,
        newPassword: values.newPassword,
      })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_updateFailed())
      }
    },
    onError: (mutationError) => {
      toast.error(mutationError.message)
    },
  })

  const handleBanUser = (userId: string) => {
    setUserToDelete(users.find(u => u.id === userId) || null)
    const reason = prompt(m.users_ban_prompt())
    if (reason !== null) {
      banUserMutation.mutate({
        userId,
        reason: reason || undefined,
      })
    }
  }

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId)
  }

  const handlePaginationChange = (newLimit: number, newOffset: number) => {
    setPagination({ limit: newLimit, offset: newOffset })
  }

  const openCreateDialog = () => {
    setCreateDialogOpen(true)
  }

  const openEditDialog = (user: BetterAuthUser) => {
    setEditDialogState({ open: true, user })
  }

  const closeEditDialog = () => {
    setEditDialogState({ open: false, user: null })
  }

  const openDeleteDialog = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setUserToDelete(user)
      setDeleteDialogOpen(true)
    }
  }

  const openSessionsDialog = (user: BetterAuthUser) => {
    setSessionsDialogState({ open: true, user })
  }

  const closeSessionsDialog = () => {
    setSessionsDialogState({ open: false, user: null })
  }

  const openSetPasswordDialog = (user: BetterAuthUser) => {
    setSetPasswordDialogState({ open: true, user })
  }

  const closeSetPasswordDialog = () => {
    setSetPasswordDialogState({ open: false, user: null })
  }

  return (
    <BaseLayout
      title={m.users_title()}
      description={m.users_description()}
    >
      <div className="@container/main px-4 lg:px-6">
        <AdminDataTable
          users={users}
          loading={isLoading}
          error={error?.message || null}
          totalCount={totalCount}
          onCreateUser={openCreateDialog}
          onUpdateUser={openEditDialog}
          onDeleteUser={openDeleteDialog}
          onBanUser={handleBanUser}
          onUnbanUser={handleUnbanUser}
          onManageSessions={openSessionsDialog}
          onSetPassword={openSetPasswordDialog}
          onRefresh={() => refetch()}
          onPaginationChange={handlePaginationChange}
        />

        {/* Create User Dialog */}
        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={(values) => createUserMutation.mutateAsync(values)}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          user={editDialogState.user}
          open={editDialogState.open}
          onOpenChange={closeEditDialog}
          onSubmit={(userId, values) => updateUserMutation.mutateAsync({ userId, values })}
        />

        {/* Delete Confirmation Dialog */}
        <UserDeleteDialog
          user={userToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={(userId) => deleteUserMutation.mutateAsync(userId)}
        />

        {/* Sessions Management Dialog */}
        <UserSessionsDialog
          user={sessionsDialogState.user}
          open={sessionsDialogState.open}
          onOpenChange={closeSessionsDialog}
        />

        {/* Set Password Dialog */}
        <SetPasswordDialog
          user={setPasswordDialogState.user}
          open={setPasswordDialogState.open}
          onOpenChange={closeSetPasswordDialog}
          onSubmit={(userId, values) => setPasswordMutation.mutateAsync({ userId, values })}
        />
      </div>
    </BaseLayout>
  )
}
