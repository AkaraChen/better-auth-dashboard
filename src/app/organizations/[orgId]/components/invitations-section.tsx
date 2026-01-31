"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import type { FullOrganization } from "../../types"
import * as m from "@/paraglide/messages"

interface InvitationsSectionProps {
  organization: FullOrganization
}

export function InvitationsSection({ organization }: InvitationsSectionProps) {
  const pendingInvitations = organization.invitations.filter(
    (i) => i.status === "pending"
  )

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "accepted":
        return CheckCircle
      default:
        return XCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
      case "accepted":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "rejected":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  // Only show if there are pending invitations
  if (pendingInvitations.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {m.orgs_invitations_pendingTitle({ count: pendingInvitations.length })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pendingInvitations.map((invitation) => {
            const StatusIcon = getStatusIcon(invitation.status)
            return (
              <div
                key={invitation.id}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited as {invitation.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className={getStatusColor(invitation.status)}>
                    {invitation.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {formatDate(invitation.createdAt)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
