"use client"

import { Building2, Mail, Shield, Users } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { FullOrganization } from "../../types"
import { OrganizationOverviewTab } from "./tabs/organization-overview-tab"
import { OrganizationMembersTab } from "./tabs/organization-members-tab"
import { OrganizationInvitationsTab } from "./tabs/organization-invitations-tab"
import { OrganizationRolesTab } from "./tabs/organization-roles-tab"
import * as m from "@/paraglide/messages"

interface OrganizationDetailTabsProps {
  organization: FullOrganization
}

export function OrganizationDetailTabs({
  organization,
}: OrganizationDetailTabsProps) {
  const pendingInvitationsCount = organization.invitations.filter(
    (i: { status: string }) => i.status === "pending"
  ).length

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto">
        <TabsTrigger value="overview">
          <Building2 className="mr-2 h-4 w-4" />
          {m.orgs_detail_overview()}
        </TabsTrigger>
        <TabsTrigger value="members">
          <Users className="mr-2 h-4 w-4" />
          {m.orgs_detail_members({ count: organization.members.length })}
        </TabsTrigger>
        <TabsTrigger value="invitations">
          <Mail className="mr-2 h-4 w-4" />
          {m.orgs_detail_invitations({ count: pendingInvitationsCount })}
        </TabsTrigger>
        <TabsTrigger value="roles">
          <Shield className="mr-2 h-4 w-4" />
          {m.orgs_detail_roles()}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OrganizationOverviewTab organization={organization} />
      </TabsContent>

      <TabsContent value="members" className="mt-6">
        <OrganizationMembersTab organization={organization} />
      </TabsContent>

      <TabsContent value="invitations" className="mt-6">
        <OrganizationInvitationsTab organization={organization} />
      </TabsContent>

      <TabsContent value="roles" className="mt-6">
        <OrganizationRolesTab organization={organization} />
      </TabsContent>
    </Tabs>
  )
}
