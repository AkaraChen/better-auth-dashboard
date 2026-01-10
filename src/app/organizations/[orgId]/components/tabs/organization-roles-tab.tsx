"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Shield } from "lucide-react"
import type { FullOrganization } from "../../../types"
import * as m from "@/paraglide/messages"

interface OrganizationRolesTabProps {
  organization: FullOrganization
}

export function OrganizationRolesTab({
  organization,
}: OrganizationRolesTabProps) {
  // Count members by role
  const roleCounts = organization.members.reduce(
    (acc: Record<string, number>, member: { role: string }) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const roles = [
    { name: "owner", description: m.orgs_roles_owner() },
    { name: "admin", description: m.orgs_roles_admin() },
    { name: "member", description: m.orgs_roles_member() },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {m.orgs_roles_title()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {m.orgs_roles_description()}
          </p>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.name}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium capitalize">{role.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {m.orgs_roles_membersCount({ count: roleCounts[role.name] || 0 })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
