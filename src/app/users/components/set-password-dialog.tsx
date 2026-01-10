"use client"

import { useState } from "react"
import * as m from "@/paraglide/messages"
import { Key } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { BetterAuthUser } from "../page"

const setPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, m.users_password_minLength()),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: m.users_password_noMatch(),
    path: ["confirmPassword"],
  })

export type SetPasswordFormValues = z.infer<typeof setPasswordFormSchema>

interface SetPasswordDialogProps {
  user: BetterAuthUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userId: string, values: SetPasswordFormValues) => Promise<void>
}

export function SetPasswordDialog({
  user,
  open,
  onOpenChange,
  onSubmit,
}: SetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const handleSubmit = async (values: SetPasswordFormValues) => {
    if (!user) return

    try {
      setIsSubmitting(true)
      await onSubmit(user.id, values)
      toast.success(m.users_password_success())
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the parent component and shown via toast
      console.error(error)
    } finally {
      setIsSubmitting(false)
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
    <Dialog open={open} onOpenChange={(newOpen) => !isSubmitting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            {m.users_dialog_password_title()}
          </DialogTitle>
          <DialogDescription>
            {m.users_dialog_password_description({
              name: user?.name || m.users_table_unnamedUser(),
            })}
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/50">
            <Avatar className="h-12 w-12">
              {user.image ? (
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.users_password_newPassword()}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={m.users_password_newPasswordPlaceholder()}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.users_password_confirmPassword()}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={m.users_password_confirmPasswordPlaceholder()}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {m.users_password_close()}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    {m.users_password_setting()}
                  </>
                ) : (
                  <>
                    <Key className="mr-2 size-4" />
                    {m.users_password_set()}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
