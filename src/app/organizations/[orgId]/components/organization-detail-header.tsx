"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Building2, Edit, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { EditOrganizationDialog } from "../../components/edit-organization-dialog"
import type { FullOrganization } from "../../types"

interface OrganizationDetailHeaderProps {
  organization: FullOrganization
  onRefresh: () => void
}

export function OrganizationDetailHeader({
  organization,
  onRefresh,
}: OrganizationDetailHeaderProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <Link to="/organizations">
            <Button variant="ghost" size="sm" className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt=""
                  className="h-12 w-12 rounded"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{organization.name}</h1>
                <p className="text-sm text-muted-foreground">@{organization.slug}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Button variant="outline" onClick={onRefresh} className="cursor-pointer">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => setEditDialogOpen(true)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">ID:</span>
            <code className="text-xs">{organization.id}</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Members:</span>
            <Badge variant="secondary">{organization.members.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Invitations:</span>
            <Badge variant="secondary">
              {organization.invitations.filter((i: { status: string }) => i.status === "pending").length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(organization.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <EditOrganizationDialog
        organization={organization}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Card>
  )
}
