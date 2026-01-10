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
import * as m from "@/paraglide/messages"

const createOrganizationFormSchema = z.object({
  name: z.string().min(1, { message: m.orgs_validation_nameRequired() }),
  slug: z.string().min(1, { message: m.orgs_validation_slugRequired() })
    .regex(/^[a-z0-9-]+$/, { message: m.orgs_validation_slugInvalid() }),
  logo: z.string().url({ message: m.orgs_validation_logoInvalid() }).optional().or(z.literal("")),
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
          message: m.orgs_validation_slugTaken(),
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
        throw new Error(result.error.message || m.orgs_error_createFailed())
      }

      toast.success(m.orgs_toast_created())
      setOpen(false)
      form.reset()

      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : m.orgs_error_createFailed())
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
          <DialogTitle>{m.orgs_dialog_create_title()}</DialogTitle>
          <DialogDescription>
            {m.orgs_dialog_create_description()}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.orgs_form_name()}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={m.orgs_form_namePlaceholder()}
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
                  <FormLabel>{m.orgs_form_slug()}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={m.orgs_form_slugPlaceholder()}
                      {...field}
                      onBlur={() => checkSlugAvailability(field.value)}
                      disabled={isCheckingSlug}
                    />
                  </FormControl>
                  <FormMessage />
                  {isCheckingSlug && (
                    <p className="text-sm text-muted-foreground">{m.orgs_form_checkingAvailability()}</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.orgs_form_logo()}</FormLabel>
                  <FormControl>
                    <Input placeholder={m.orgs_form_logoPlaceholder()} {...field} />
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
                {m.orgs_form_buttonCancel()}
              </Button>
              <Button type="submit" disabled={isSubmitting || isCheckingSlug} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    {m.orgs_form_buttonCreating()}
                  </>
                ) : (
                  m.orgs_form_buttonCreate()
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
