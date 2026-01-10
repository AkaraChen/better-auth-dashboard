"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authClient } from "@/lib/auth-client"
import type { ApiKey } from "../types"

const editApiKeyFormSchema = z.object({
  name: z.string().min(1, { message: m.apiKeys_validation_nameRequired() }),
  enabled: z.boolean(),
  metadata: z.string().optional(),
})

export type EditApiKeyFormValues = z.infer<typeof editApiKeyFormSchema>

interface EditApiKeyDialogProps {
  apiKey: ApiKey | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditApiKeyDialog({
  apiKey,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditApiKeyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<EditApiKeyFormValues>({
    resolver: zodResolver(editApiKeyFormSchema),
    defaultValues: {
      name: "",
      enabled: true,
      metadata: "",
    },
  })

  // Update form when apiKey changes
  useEffect(() => {
    if (apiKey) {
      form.reset({
        name: apiKey.name,
        enabled: apiKey.enabled,
        metadata: apiKey.metadata ? JSON.stringify(apiKey.metadata, null, 2) : "",
      })
    } else {
      form.reset({
        name: "",
        enabled: true,
        metadata: "",
      })
    }
  }, [apiKey, form])

  const handleSubmit = async (values: EditApiKeyFormValues) => {
    if (!apiKey) return

    try {
      setIsSubmitting(true)

      const metadata = values.metadata ? JSON.parse(values.metadata) : undefined

      const result = await authClient.apiKey.update({
        keyId: apiKey.id,
        name: values.name,
        enabled: values.enabled,
        metadata,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to update API key")
      }

      toast.success("API key updated successfully")
      setOpen(false)
      form.reset()

      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update API key")
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
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Update the details of your API key. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.apiKeys_form_name()}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Production API Key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{m.apiKeys_status_active()}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Disabled API keys cannot be used for authentication
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.apiKeys_form_metadata()}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='{"environment": "production"}'
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
                {m.apiKeys_form_buttonCancel()}
              </Button>
              <Button type="submit" disabled={isSubmitting || !apiKey} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
