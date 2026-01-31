"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useQueryClient, useMutation } from "@tanstack/react-query"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authClient } from "@/lib/auth-client"
import * as m from "@/paraglide/messages"

const inviteMemberFormSchema = z.object({
  email: z.string().email({ message: m.orgs_invite_validation_invalidEmail() }),
  role: z.enum(["member", "admin"]),
})

export type InviteMemberFormValues = z.infer<typeof inviteMemberFormSchema>

interface InviteMemberDialogProps {
  organizationId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function InviteMemberDialog({
  organizationId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InviteMemberDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const queryClient = useQueryClient()

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteMemberFormValues) => {
      const response = await authClient.organization.inviteMember({
        organizationId,
        email: values.email,
        role: values.role,
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    onSuccess: () => {
      toast.success(m.orgs_invite_toast_success())
      queryClient.invalidateQueries({
        queryKey: ["organizations", organizationId, "full"],
      })
      setOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (values: InviteMemberFormValues) => {
    await inviteMutation.mutateAsync(values)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{m.orgs_invite_dialog_title()}</DialogTitle>
          <DialogDescription>
            {m.orgs_invite_dialog_description()}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.orgs_invite_form_email()}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={m.orgs_invite_form_emailPlaceholder()}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.orgs_invite_form_role()}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder={m.orgs_invite_form_selectRole()} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">{m.orgs_invite_role_member()}</SelectItem>
                      <SelectItem value="admin">{m.orgs_invite_role_admin()}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={inviteMutation.isPending}
                className="cursor-pointer"
              >
                {m.orgs_invite_form_buttonCancel()}
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="cursor-pointer"
              >
                {inviteMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    {m.orgs_invite_form_buttonSending()}
                  </>
                ) : (
                  m.orgs_invite_form_buttonSend()
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
