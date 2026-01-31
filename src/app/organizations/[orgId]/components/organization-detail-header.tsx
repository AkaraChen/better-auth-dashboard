"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Copy, Edit, MoreVertical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditOrganizationDialog } from "../../components/edit-organization-dialog"
import type { FullOrganization } from "../../types"
import * as m from "@/paraglide/messages"

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

  const copyOrgId = () => {
    navigator.clipboard.writeText(organization.id)
    toast.success("Organization ID copied to clipboard")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link to="/organizations">
        <Button variant="ghost" size="sm" className="cursor-pointer -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {m.orgs_detail_back()}
        </Button>
      </Link>

      {/* Organization identity */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src={organization.logo || undefined} />
            <AvatarFallback className="rounded-lg text-lg">
              {getInitials(organization.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{organization.name}</h1>
            <p className="text-muted-foreground">@{organization.slug}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {m.orgs_detail_createdAt()} {formatDate(organization.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            {m.orgs_detail_edit()}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyOrgId} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                Copy Organization ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRefresh} className="cursor-pointer">
                Refresh
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditOrganizationDialog
        organization={organization}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  )
}
