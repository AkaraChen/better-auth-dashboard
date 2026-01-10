"use client"

import { useState, useEffect } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { AdminDataTable } from "./components/admin-data-table"
import { authClient } from "@/lib/auth-client"

export interface BetterAuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  banned: boolean
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

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await authClient.admin.listUsers({
        limit: pagination.limit,
        offset: pagination.offset,
        sortBy: "createdAt",
        sortDirection: "desc"
      })

      if (response.error) {
        setError(response.error.message || "Failed to fetch users")
      } else if (response.data) {
        setUsers(response.data.users || [])
        setTotalCount(response.data.total || 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination])

  const handleDeleteUser = (id: string) => {
    console.log("Delete user:", id)
  }

  const handleEditUser = (user: BetterAuthUser) => {
    console.log("Edit user:", user)
  }

  const handlePaginationChange = (newLimit: number, newOffset: number) => {
    setPagination({ limit: newLimit, offset: newOffset })
  }

  return (
    <BaseLayout
      title="Admin Users"
      description="Manage users from the better-auth system"
    >
      <div className="@container/main px-4 lg:px-6">
        <AdminDataTable
          users={users}
          loading={loading}
          error={error}
          totalCount={totalCount}
          pagination={pagination}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onRefresh={fetchUsers}
          onPaginationChange={handlePaginationChange}
        />
      </div>
    </BaseLayout>
  )
}
