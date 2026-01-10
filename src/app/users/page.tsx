"use client"

import { useState, useEffect } from "react"
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BetterAuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0
  })
  const [totalCount, setTotalCount] = useState(0)

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

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authClient.admin.listUsers({
        query: {
          limit: String(pagination.limit),
          offset: pagination.offset,
          sortBy: "createdAt",
          sortDirection: "desc"
        }
      })

      if (response.error) {
        setError(response.error.message || m.users_error_fetchFailed())
      } else if (response.data) {
        setUsers(response.data.users as BetterAuthUser[] || [])
        setTotalCount(response.data.total || 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : m.users_error_fetchFailed())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination])

  // Create user
  const handleCreateUser = async (values: CreateUserFormValues) => {
    try {
      const result = await authClient.admin.createUser({
        email: values.email,
        password: values.password!,
        name: values.name,
        role: (values.role || "user") as "admin" | "user",
        data: {
          emailVerified: values.emailVerified,
        },
      })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_createFailed())
      }

      await fetchUsers()
    } catch (err) {
      throw err
    }
  }

  // Update user
  const handleUpdateUser = async (userId: string, values: EditUserFormValues) => {
    try {
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

      await fetchUsers()
    } catch (err) {
      throw err
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await authClient.admin.removeUser({ userId })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_deleteFailed())
      }

      await fetchUsers()
    } catch (err) {
      throw err
    }
  }

  // Ban user
  const handleBanUser = (userId: string) => {
    setUserToDelete(users.find(u => u.id === userId) || null)
    // We'll use a separate dialog for ban confirmation
    const reason = prompt(m.users_ban_prompt())
    if (reason !== null) {
      authClient.admin.banUser({
        userId,
        banReason: reason || undefined
      }).then(async (result) => {
        if (result.error) {
          toast.error(result.error.message || m.users_error_banFailed())
        } else {
          toast.success(m.users_toast_banned())
          await fetchUsers()
        }
      })
    }
  }

  // Unban user
  const handleUnbanUser = async (userId: string) => {
    try {
      const result = await authClient.admin.unbanUser({ userId })

      if (result.error) {
        toast.error(result.error.message || m.users_error_unbanFailed())
      } else {
        toast.success(m.users_toast_unbanned())
        await fetchUsers()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.users_error_unbanFailed())
    }
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

  const handleSetPassword = async (userId: string, values: SetPasswordFormValues) => {
    try {
      const result = await authClient.admin.setUserPassword({
        userId,
        newPassword: values.newPassword,
      })

      if (result.error) {
        throw new Error(result.error.message || m.users_error_updateFailed())
      }
    } catch (err) {
      throw err
    }
  }

  return (
    <BaseLayout
      title={m.users_title()}
      description={m.users_description()}
    >
      <div className="@container/main px-4 lg:px-6">
        <AdminDataTable
          users={users}
          loading={loading}
          error={error}
          totalCount={totalCount}
          onCreateUser={openCreateDialog}
          onUpdateUser={openEditDialog}
          onDeleteUser={openDeleteDialog}
          onBanUser={handleBanUser}
          onUnbanUser={handleUnbanUser}
          onManageSessions={openSessionsDialog}
          onSetPassword={openSetPasswordDialog}
          onRefresh={fetchUsers}
          onPaginationChange={handlePaginationChange}
        />

        {/* Create User Dialog */}
        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateUser}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          user={editDialogState.user}
          open={editDialogState.open}
          onOpenChange={closeEditDialog}
          onSubmit={handleUpdateUser}
        />

        {/* Delete Confirmation Dialog */}
        <UserDeleteDialog
          user={userToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteUser}
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
          onSubmit={handleSetPassword}
        />
      </div>
    </BaseLayout>
  )
}
