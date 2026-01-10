"use client"

import { useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
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
import * as m from "@/paraglide/messages"

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
        throw new Error(result.error.message || m.orgs_error_deleteFailed())
      }

      toast.success(m.orgs_toast_deleted())
      onOpenChange(false)

      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : m.orgs_error_deleteFailed())
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
            {m.orgs_dialog_delete_title()}
          </DialogTitle>
          <DialogDescription>
            {m.orgs_dialog_delete_confirm()}
          </DialogDescription>
        </DialogHeader>

        {organization && (
          <div className="rounded-lg border p-4 bg-muted/50">
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
            {m.orgs_form_buttonCancel()}
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
                {m.orgs_form_buttonDeleting()}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                {m.orgs_form_buttonDelete()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
