import { Users, Building2, Key, MailCheck } from "lucide-react"
import * as m from "@/paraglide/messages"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { authClient, useSession } from "@/lib/auth-client"
import type { FullOrganization } from "@/app/organizations/types"
import dashboardConfig from "~/dashboard.config"
import type { Feature } from "~/dashboard.config.type"

export function SectionCards() {
  const { data: session, isPending: sessionPending } = useSession()

  const { data: usersData, isPending: usersPending } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      if (!session?.user) return null
      const res = await authClient.admin.listUsers({
        query: { limit: "1000", sortBy: "createdAt", sortDirection: "desc" }
      })
      return res.data
    },
    enabled: !!session?.user && dashboardConfig.features.includes("admin"),
  })

  const { data: organizations, isPending: orgsPending } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await authClient.organization.list()
      return res.data
    },
    enabled: dashboardConfig.features.includes("organizations"),
  })

  const { data: fullOrganizations, isPending: fullOrgsPending } = useQuery({
    queryKey: ["organizations", "full"],
    queryFn: async () => {
      const listResponse = await authClient.organization.list()
      if (listResponse.error || !listResponse.data) return []

      const fullOrgsPromises = listResponse.data.map(async (org) => {
        const fullResponse = await authClient.organization.getFullOrganization({
          query: { organizationId: org.id }
        })
        return fullResponse.error ? null : (fullResponse.data as FullOrganization)
      })

      const fullOrgs = await Promise.all(fullOrgsPromises)
      return fullOrgs.filter((org): org is FullOrganization => org !== null)
    },
    enabled: dashboardConfig.features.includes("organizations"),
  })

  const { data: apiKeys, isPending: apiKeysPending } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await authClient.apiKey.list()
      return res.data
    },
    enabled: dashboardConfig.features.includes("api-key"),
  })

  // Compute statistics
  const users = usersData?.users ?? []
  const totalUsers = users.length
  const adminUsers = users.filter((u: any) => u.role.includes("admin")).length
  const totalOrgs = organizations?.length ?? 0
  const totalMembers = fullOrganizations?.reduce(
    (sum, org) => sum + (org.members?.length ?? 0),
    0
  ) ?? 0
  const activeApiKeys = apiKeys?.filter((k: any) => k.enabled && (!k.expiresAt || new Date(k.expiresAt) > new Date())).length ?? 0
  const pendingInvites = fullOrganizations?.reduce(
    (sum, org) => sum + (org.invitations?.filter((invitation) => invitation.status === "pending").length ?? 0),
    0
  ) ?? 0

  const hasFeature = (feature: Feature) => dashboardConfig.features.includes(feature)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {hasFeature("admin") && (
        <FeatureCard
          icon={Users}
          title={m.dashboard_totalUsers()}
          value={totalUsers}
          subtitle={m.dashboard_adminUsers({ count: adminUsers })}
          isLoading={usersPending || sessionPending}
        />
      )}

      {hasFeature("organizations") && (
        <FeatureCard
          icon={Building2}
          title={m.dashboard_organizations()}
          value={totalOrgs}
          subtitle={m.dashboard_totalMembers({ count: totalMembers })}
          isLoading={orgsPending || fullOrgsPending}
        />
      )}

      {hasFeature("api-key") && (
        <FeatureCard
          icon={Key}
          title={m.dashboard_activeApiKeys()}
          value={activeApiKeys}
          subtitle={m.dashboard_enabledAndValid()}
          isLoading={apiKeysPending}
        />
      )}

      {hasFeature("organizations") && (
        <FeatureCard
          icon={MailCheck}
          title={m.dashboard_pendingInvites()}
          value={pendingInvites}
          subtitle={m.dashboard_awaitingAcceptance()}
          isLoading={orgsPending || fullOrgsPending}
        />
      )}
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  value: number
  subtitle: string
  isLoading?: boolean
}

function FeatureCard({ icon: Icon, title, value, subtitle, isLoading }: FeatureCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" />
          {title}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            value.toLocaleString()
          )}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          {subtitle}
        </div>
      </CardFooter>
    </Card>
  )
}
