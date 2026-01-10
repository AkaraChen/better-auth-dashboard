"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle } from "lucide-react"
import * as m from "@/paraglide/messages"

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
import type { ApiKey } from "../types"

interface DeleteApiKeyDialogProps {
  apiKey: ApiKey | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteApiKeyDialog({
  apiKey,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteApiKeyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const handleDelete = async () => {
    if (!apiKey) return

    try {
      setIsSubmitting(true)

      const result = await authClient.apiKey.delete({
        keyId: apiKey.id,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to delete API key")
      }

      toast.success(m.apiKeys_toast_deleted())
      setOpen(false)

      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete API key")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {m.apiKeys_dialog_delete_title()}
          </DialogTitle>
          <DialogDescription>
            {m.apiKeys_dialog_delete_confirm()}
          </DialogDescription>
        </DialogHeader>
        {apiKey && (
          <div className="py-4">
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.apiKeys_dialog_delete_nameLabel()}</span>
                <span className="text-sm">{apiKey.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.apiKeys_dialog_delete_prefixLabel()}</span>
                <span className="text-sm font-mono">{apiKey.startsWith}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.apiKeys_dialog_delete_createdLabel()}</span>
                <span className="text-sm">
                  {new Date(apiKey.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {m.apiKeys_dialog_delete_warning()}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {m.apiKeys_form_buttonCancel()}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || !apiKey}
            className="cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2 size-4" />
                {m.apiKeys_form_buttonDeleting()}
              </>
            ) : (
              m.apiKeys_form_buttonDelete()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
