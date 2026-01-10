"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle } from "lucide-react"

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

      toast.success("API key deleted successfully")
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
            Delete API Key
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this API key? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {apiKey && (
          <div className="py-4">
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{apiKey.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Key Prefix:</span>
                <span className="text-sm font-mono">{apiKey.startsWith}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">
                  {new Date(apiKey.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Any applications using this API key will immediately lose access.
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
            Cancel
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
                Deleting...
              </>
            ) : (
              "Delete API Key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
