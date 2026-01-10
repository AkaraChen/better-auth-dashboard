"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { authClient } from "@/lib/auth-client"
import type { FullOrganization } from "../types"

const editOrganizationFormSchema = z.object({
  name: z.string().min(1, { message: "Organization name is required" }),
  slug: z.string().min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug must contain only lowercase letters, numbers, and hyphens" }),
  logo: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  metadata: z.string().optional(),
})

export type EditOrganizationFormValues = z.infer<typeof editOrganizationFormSchema>

interface EditOrganizationDialogProps {
  organization: FullOrganization | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditOrganizationDialog({
  organization,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditOrganizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<EditOrganizationFormValues>({
    resolver: zodResolver(editOrganizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      metadata: "",
    },
  })

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo || "",
        metadata: organization.metadata ? JSON.stringify(organization.metadata, null, 2) : "",
      })
    }
  }, [organization, form])

  const handleSubmit = async (values: EditOrganizationFormValues) => {
    if (!organization) return

    try {
      setIsSubmitting(true)

      let metadata: any = undefined
      if (values.metadata) {
        try {
          metadata = JSON.parse(values.metadata)
        } catch {
          throw new Error("Invalid JSON format for metadata")
        }
      }

      const result = await authClient.organization.update({
        organizationId: organization.id,
        data: {
          name: values.name,
          slug: values.slug,
          logo: values.logo || undefined,
          metadata,
        },
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to update organization")
      }

      toast.success("Organization updated successfully")
      setOpen(false)
      form.reset()

      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update organization")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen)
      if (!newOpen) {
        form.reset()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update organization information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="acme-corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metadata (Optional JSON)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='{"key": "value"}'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
