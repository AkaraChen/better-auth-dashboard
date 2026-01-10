"use client"

import { useState } from "react"
import * as m from "@/paraglide/messages"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-client"
import type { BetterAuthUser } from "../page"

interface UserDeleteDialogProps {
  user: BetterAuthUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (userId: string) => Promise<void>
}

export function UserDeleteDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: UserDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const isDeletingSelf = user?.id === currentUserId

  const handleConfirm = async () => {
    if (!user) return

    try {
      setIsDeleting(true)
      await onConfirm(user.id)
      toast.success(m.users_toast_deleted())
      onOpenChange(false)
    } catch (error) {
      toast.error(m.users_error_deleteFailed())
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getAvatarFallback = (name: string | null, email: string) => {
    if (name) {
      const names = name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isDeleting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            {isDeletingSelf ? m.users_dialog_delete_title() : m.users_dialog_delete_title()}
          </DialogTitle>
          <DialogDescription>
            {isDeletingSelf
              ? m.users_dialog_delete_ownAccount()
              : m.users_dialog_delete_description()}
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/50">
            <Avatar className="h-12 w-12">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || user.email} />
              ) : (
                <AvatarFallback className="text-sm font-medium">
                  {getAvatarFallback(user.name, user.email)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name || m.users_table_unnamedUser()}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
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
            {m.users_form_buttonCancel()}
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
                {m.users_form_buttonDeleting()}
              </>
            ) : (
              m.users_form_buttonDelete()
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
