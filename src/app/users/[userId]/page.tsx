"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ArrowLeft,
  AlertCircle,
  Mail,
  Calendar,
  Shield,
  Ban,
  Key,
  Monitor,
  MoreVertical,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import type { BetterAuthUser } from "../page"
import { EditUserDialog, type EditUserFormValues } from "../components/edit-user-dialog"
import { SetPasswordDialog, type SetPasswordFormValues } from "../components/set-password-dialog"
import { UserSessionsDialog } from "../components/user-sessions-dialog"
import * as m from "@/paraglide/messages"

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const queryClient = useQueryClient()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      // Use listUsers with a filter since better-auth doesn't have a getUser endpoint
      const response = await authClient.admin.listUsers({
        query: {
          limit: "100",
          offset: 0,
        }
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      const foundUser = (response.data?.users as BetterAuthUser[])?.find(u => u.id === userId)
      if (!foundUser) {
        throw new Error("User not found")
      }
      return foundUser
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  const updateUserMutation = useMutation({
    mutationFn: async (values: EditUserFormValues) => {
      const result = await authClient.admin.updateUser({
        userId: userId!,
        data: {
          email: values.email,
          name: values.name,
          role: values.role || "user",
          emailVerified: values.emailVerified,
        }
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] })
      queryClient.invalidateQueries({ queryKey: ["users", "list"] })
      toast.success(m.users_toast_updated())
      setEditDialogOpen(false)
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const setPasswordMutation = useMutation({
    mutationFn: async (values: SetPasswordFormValues) => {
      const result = await authClient.admin.setUserPassword({
        userId: userId!,
        newPassword: values.newPassword,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      toast.success(m.users_password_success())
      setPasswordDialogOpen(false)
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const banUserMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const result = await authClient.admin.banUser({
        userId: userId!,
        banReason: reason,
      })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] })
      toast.success(m.users_toast_banned())
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const unbanUserMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.admin.unbanUser({ userId: userId! })
      if (result.error) {
        throw new Error(result.error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] })
      toast.success(m.users_toast_unbanned())
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const handleBan = () => {
    const reason = prompt(m.users_ban_prompt())
    if (reason !== null) {
      banUserMutation.mutate(reason || undefined)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  if (!userId) {
    return (
      <BaseLayout title={m.users_detail_error_invalidTitle()}>
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">{m.users_detail_error_invalidId()}</p>
          <Button asChild>
            <Link to="/users">{m.users_detail_action_backToList()}</Link>
          </Button>
        </div>
      </BaseLayout>
    )
  }

  if (isLoading) {
    return (
      <BaseLayout title={m.users_detail_loading_title()}>
        <div className="flex items-center justify-center px-4 py-12">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  if (error || !user) {
    return (
      <BaseLayout title={m.users_detail_error_notFoundTitle()}>
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">{m.users_detail_error_notFound()}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : m.users_detail_error_mayBeDeleted()}
          </p>
          <Button asChild>
            <Link to="/users">{m.users_detail_action_backToList()}</Link>
          </Button>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="@container/main px-4 lg:px-6 space-y-6">
        {/* Back navigation */}
        <Link to="/users">
          <Button variant="ghost" size="sm" className="cursor-pointer -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>

        {/* User header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">
                  {user.name || "Unnamed User"}
                </h1>
                {user.banned && (
                  <Badge variant="destructive">Banned</Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role || "user"}
                </Badge>
                {user.emailVerified ? (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-yellow-600">
                    <XCircle className="mr-1 h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setEditDialogOpen(true)}
                className="cursor-pointer"
              >
                <Shield className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPasswordDialogOpen(true)}
                className="cursor-pointer"
              >
                <Key className="mr-2 h-4 w-4" />
                Set Password
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSessionsDialogOpen(true)}
                className="cursor-pointer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                Manage Sessions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.banned ? (
                <DropdownMenuItem
                  onClick={() => unbanUserMutation.mutate()}
                  className="cursor-pointer"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleBan}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user.role || "user"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">{user.id}</code>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <EditUserDialog
          user={user}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={(_, values) => updateUserMutation.mutateAsync(values)}
        />

        <SetPasswordDialog
          user={user}
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          onSubmit={(_, values) => setPasswordMutation.mutateAsync(values)}
        />

        <UserSessionsDialog
          user={user}
          open={sessionsDialogOpen}
          onOpenChange={setSessionsDialogOpen}
        />
      </div>
    </BaseLayout>
  )
}
