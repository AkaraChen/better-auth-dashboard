"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import type { FullOrganization } from "../../../types"
import { InviteMemberDialog } from "../invite-member-dialog"
import { UpdateMemberRoleDialog } from "../update-member-role-dialog"

interface OrganizationMembersTabProps {
  organization: FullOrganization
}

export function OrganizationMembersTab({
  organization,
}: OrganizationMembersTabProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [roleDialogState, setRoleDialogState] = useState<{
    open: boolean
    member: FullOrganization["members"][0] | null
  }>({ open: false, member: null })

  const queryClient = useQueryClient()

  const removeMemberMutation = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      const response = await authClient.organization.removeMember({
        organizationId: organization.id,
        memberIdOrEmail: memberId,
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    onSuccess: () => {
      toast.success("Member removed successfully")
      queryClient.invalidateQueries({
        queryKey: ["organizations", organization.id, "full"],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
      case "admin":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({organization.members.length})
            </CardTitle>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="cursor-pointer"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {organization.members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No members yet
            </p>
          ) : (
            <div className="space-y-3">
              {organization.members.map((member: FullOrganization["members"][0]) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {member.user.image && (
                      <img
                        src={member.user.image}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {member.user.name || "Unnamed User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={getRoleColor(member.role)}
                    >
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {formatDate(member.createdAt)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setRoleDialogState({ open: true, member })
                          }
                          className="cursor-pointer"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            removeMemberMutation.mutate({ memberId: member.id })
                          }
                          disabled={member.role === "owner"}
                          className="cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InviteMemberDialog
        organizationId={organization.id}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <UpdateMemberRoleDialog
        member={roleDialogState.member}
        organizationId={organization.id}
        open={roleDialogState.open}
        onOpenChange={(open) => {
          if (!open) setRoleDialogState({ open: false, member: null })
        }}
      />
    </>
  )
}
