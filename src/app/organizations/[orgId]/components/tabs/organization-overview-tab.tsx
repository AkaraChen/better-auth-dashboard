"use client"

import { Building2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { FullOrganization } from "../../../types"
import * as m from "@/paraglide/messages"

interface OrganizationOverviewTabProps {
  organization: FullOrganization
}

export function OrganizationOverviewTab({
  organization,
}: OrganizationOverviewTabProps) {
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const adminCount = organization.members.filter(
    (m: { role: string }) => m.role === "admin"
  ).length
  const memberCount = organization.members.filter(
    (m: { role: string }) => m.role === "member"
  ).length
  const ownerCount = organization.members.filter(
    (m: { role: string }) => m.role === "owner"
  ).length
  const pendingInvitationsCount = organization.invitations.filter(
    (i: { status: string }) => i.status === "pending"
  ).length

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {m.orgs_detail_basicInfo()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{m.orgs_detail_orgId()}</label>
            <p className="font-mono text-sm">{organization.id}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{m.orgs_detail_name()}</label>
            <p className="font-medium">{organization.name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{m.orgs_detail_slug()}</label>
            <p className="font-mono">@{organization.slug}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{m.orgs_detail_createdAt()}</label>
            <p>{formatDateTime(organization.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{m.orgs_detail_quickStats()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{organization.members.length}</p>
              <p className="text-sm text-muted-foreground">{m.orgs_detail_totalMembers()}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{pendingInvitationsCount}</p>
              <p className="text-sm text-muted-foreground">{m.orgs_detail_pendingInvites()}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{adminCount + ownerCount}</p>
              <p className="text-sm text-muted-foreground">{m.orgs_detail_adminsOwners()}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{memberCount}</p>
              <p className="text-sm text-muted-foreground">{m.orgs_detail_memberCount()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
