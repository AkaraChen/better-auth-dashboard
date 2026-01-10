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
  Mail,
  XCircle,
} from "lucide-react"
import type { FullOrganization } from "../../../types"
import * as m from "@/paraglide/messages"

interface OrganizationInvitationsTabProps {
  organization: FullOrganization
}

export function OrganizationInvitationsTab({
  organization,
}: OrganizationInvitationsTabProps) {
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
      case "accepted":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "rejected":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      case "canceled":
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const getInvitationStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "accepted":
        return CheckCircle
      case "rejected":
      case "canceled":
        return XCircle
      default:
        return Clock
    }
  }

  const pendingInvitations = organization.invitations.filter(
    (i: { status: string }) => i.status === "pending"
  )
  const otherInvitations = organization.invitations.filter(
    (i: { status: string }) => i.status !== "pending"
  )

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {m.orgs_invitations_pendingTitle({ count: pendingInvitations.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {m.orgs_detail_noPendingInvitations()}
            </p>
          ) : (
            <div className="space-y-3">
              {pendingInvitations.map((invitation: FullOrganization["invitations"][0]) => {
                const StatusIcon = getInvitationStatusIcon(invitation.status)
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className={`h-5 w-5 ${
                          getInvitationStatusColor(invitation.status).split(" ")[0]
                        }`}
                      />
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.orgs_detail_role()} {invitation.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={getInvitationStatusColor(invitation.status)}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {invitation.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {m.orgs_detail_sent({ date: formatDateTime(invitation.createdAt) })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Invitations */}
      {otherInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {m.orgs_invitations_otherTitle({ count: otherInvitations.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherInvitations.map((invitation: FullOrganization["invitations"][0]) => {
                const StatusIcon = getInvitationStatusIcon(invitation.status)
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-lg border p-4 bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon
                        className={`h-5 w-5 ${
                          getInvitationStatusColor(invitation.status).split(" ")[0]
                        }`}
                      />
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.orgs_detail_role()} {invitation.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={getInvitationStatusColor(invitation.status)}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {invitation.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(invitation.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
