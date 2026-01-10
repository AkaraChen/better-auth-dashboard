"use client"

import { useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authClient } from "@/lib/auth-client"
import type { OrganizationMember } from "../../types"

const updateMemberRoleFormSchema = z.object({
  role: z.enum(["member", "admin"]),
})

export type UpdateMemberRoleFormValues = z.infer<
  typeof updateMemberRoleFormSchema
>

interface UpdateMemberRoleDialogProps {
  member: OrganizationMember | null
  organizationId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpdateMemberRoleDialog({
  member,
  organizationId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: UpdateMemberRoleDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateMemberRoleFormValues>({
    resolver: zodResolver(updateMemberRoleFormSchema),
    defaultValues: {
      role: "member",
    },
  })

  useEffect(() => {
    if (member) {
      form.setValue("role", member.role as "member" | "admin")
    }
  }, [member, form])

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateMemberRoleFormValues) => {
      if (!member) throw new Error("No member selected")

      const response = await authClient.organization.updateMemberRole({
        organizationId,
        memberId: member.id,
        role: values.role,
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      return response.data
    },
    onSuccess: () => {
      toast.success("Member role updated successfully")
      queryClient.invalidateQueries({
        queryKey: ["organizations", organizationId, "full"],
      })
      controlledOnOpenChange?.(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = async (values: UpdateMemberRoleFormValues) => {
    await updateMutation.mutateAsync(values)
  }

  return (
    <Dialog open={controlledOpen} onOpenChange={controlledOnOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Member Role</DialogTitle>
          <DialogDescription>
            {member && (
              <>
                Change role for{" "}
                <span className="font-medium">{member.user.email}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
                onClick={() => controlledOnOpenChange?.(false)}
                disabled={updateMutation.isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    Updating...
                  </>
                ) : (
                  "Update Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
