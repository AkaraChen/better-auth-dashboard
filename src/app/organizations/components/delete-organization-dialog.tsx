"use client"

import { useState } from "react"
import { AlertTriangle, Building2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authClient } from "@/lib/auth-client"
import type { FullOrganization } from "../types"

interface DeleteOrganizationDialogProps {
  organization: FullOrganization | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const handleConfirm = async () => {
    if (!organization) return

    try {
      setIsDeleting(true)

      const result = await authClient.organization.delete({
        organizationId: organization.id,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to delete organization")
      }

      toast.success("Organization deleted successfully")
      onOpenChange(false)

      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete organization")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isDeleting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this organization? This action cannot be undone.
            All members, invitations, and organization data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        {organization && (
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-600 text-white font-semibold">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{organization.name}</span>
              <span className="text-sm text-muted-foreground">@{organization.slug}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="mr-2 size-4" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Delete Organization
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
