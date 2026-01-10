"use client"

import { useState } from "react"
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
import { generateSlug } from "@/lib/slug"

const createOrganizationFormSchema = z.object({
  name: z.string().min(1, { message: "Organization name is required" }),
  slug: z.string().min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug must contain only lowercase letters, numbers, and hyphens" }),
  logo: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  metadata: z.string().optional(),
})

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationFormSchema>

interface CreateOrganizationDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateOrganizationDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateOrganizationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const queryClient = useQueryClient()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      metadata: "",
    },
  })

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name)
    form.setValue("slug", slug)
  }

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) return

    try {
      setIsCheckingSlug(true)
      const result = await authClient.organization.checkSlug({ slug })
      if (result.error) {
        // Slug exists (taken)
        form.setError("slug", {
          type: "manual",
          message: "This slug is already taken",
        })
      } else {
        // Slug is available
        form.clearErrors("slug")
      }
    } catch (error) {
      console.error("Error checking slug:", error)
    } finally {
      setIsCheckingSlug(false)
    }
  }

  const handleSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      setIsSubmitting(true)

      const metadata = values.metadata ? JSON.parse(values.metadata) : undefined

      const result = await authClient.organization.create({
        name: values.name,
        slug: values.slug,
        logo: values.logo || undefined,
        metadata,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to create organization")
      }

      toast.success("Organization created successfully")
      setOpen(false)
      form.reset()

      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization")
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
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Fill in the form to create a new organization. Click save when you're done.
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
                    <Input
                      placeholder="Acme Corporation"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                    />
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
                    <Input
                      placeholder="acme-corporation"
                      {...field}
                      onBlur={() => checkSlugAvailability(field.value)}
                      disabled={isCheckingSlug}
                    />
                  </FormControl>
                  <FormMessage />
                  {isCheckingSlug && (
                    <p className="text-sm text-muted-foreground">Checking availability...</p>
                  )}
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
              <Button type="submit" disabled={isSubmitting || isCheckingSlug} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
