"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import type { FullOrganization } from "../../types"
import { InviteMemberDialog } from "./invite-member-dialog"
import { UpdateMemberRoleDialog } from "./update-member-role-dialog"
import * as m from "@/paraglide/messages"

interface MembersSectionProps {
  organization: FullOrganization
}

export function MembersSection({ organization }: MembersSectionProps) {
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
      toast.success(m.orgs_overview_removedSuccess())
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {m.orgs_overview_members_title({ count: organization.members.length })}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setInviteDialogOpen(true)}
              className="cursor-pointer"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {m.orgs_overview_inviteMember()}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {organization.members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {m.orgs_detail_noMembers()}
            </p>
          ) : (
            <div className="space-y-2">
              {organization.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
                >
                  <Link
                    to={`/users/${member.user.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.user.name, member.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {member.user.name || m.orgs_detail_unnamedUser()}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatDate(member.createdAt)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setRoleDialogState({ open: true, member })}
                          className="cursor-pointer"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {m.orgs_overview_changeRole()}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => removeMemberMutation.mutate({ memberId: member.id })}
                          disabled={member.role === "owner"}
                          className="cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {m.orgs_overview_removeMember()}
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
