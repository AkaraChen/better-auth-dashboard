"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { KeyRound } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { authClient } from "@/lib/auth-client"

const createApiKeyFormSchema = z.object({
  name: z.string().min(1, { message: m.apiKeys_validation_nameRequired() }),
  expiresIn: z.string().optional(),
  metadata: z.string().optional(),
})

export type CreateApiKeyFormValues = z.infer<typeof createApiKeyFormSchema>

const EXPIRATION_OPTIONS = [
  { label: m.apiKeys_form_expirationNever(), value: "never" },
  { label: m.apiKeys_form_expirationDay(), value: "86400" }, // 24 * 60 * 60
  { label: m.apiKeys_form_expirationDays({ days: 7 }), value: "604800" }, // 7 * 24 * 60 * 60
  { label: m.apiKeys_form_expirationDays({ days: 30 }), value: "2592000" }, // 30 * 24 * 60 * 60
  { label: m.apiKeys_form_expirationDays({ days: 90 }), value: "7776000" }, // 90 * 24 * 60 * 60
  { label: m.apiKeys_form_expirationDays({ days: 365 }), value: "31536000" }, // 365 * 24 * 60 * 60
]

interface CreateApiKeyDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateApiKeyDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateApiKeyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeyFormSchema),
    defaultValues: {
      name: "",
      expiresIn: "never",
      metadata: "",
    },
  })

  const handleSubmit = async (values: CreateApiKeyFormValues) => {
    try {
      setIsSubmitting(true)

      const metadata = values.metadata ? JSON.parse(values.metadata) : undefined
      const expiresIn = values.expiresIn && values.expiresIn !== "never"
        ? Number.parseInt(values.expiresIn, 10)
        : undefined

      const result = await authClient.apiKey.create({
        name: values.name,
        expiresIn,
        metadata,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to create API key")
      }

      // Store the full key for display
      setCreatedKey(result.data?.key || null)

      // Don't close the dialog yet - show the key first
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : m.apiKeys_error_createFailed())
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey)
      toast.success(m.apiKeys_toast_copied())
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false)
      setCreatedKey(null)
      form.reset()

      // Invalidate and refetch API keys
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting && !createdKey) {
      setOpen(newOpen)
      if (!newOpen) {
        form.reset()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {createdKey ? (
          // Show created key
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-green-600" />
                {m.apiKeys_dialog_created_title()}
              </DialogTitle>
              <DialogDescription>
                {m.apiKeys_dialog_created_description()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="created-key">{m.apiKeys_dialog_created_label()}</Label>
                <div className="flex gap-2">
                  <Input
                    id="created-key"
                    value={createdKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyKey}
                    className="cursor-pointer"
                  >
                    {m.apiKeys_dialog_created_copy()}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.apiKeys_dialog_created_warning()}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleClose}
                className="cursor-pointer"
              >
                {m.apiKeys_dialog_created_done()}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Create form
          <>
            <DialogHeader>
              <DialogTitle>{m.apiKeys_dialog_create_title()}</DialogTitle>
              <DialogDescription>
                {m.apiKeys_dialog_create_description()}
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
                  name="expiresIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{m.apiKeys_form_expiration()}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder={m.apiKeys_form_selectExpiration()} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPIRATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                  <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2 size-4" />
                        {m.apiKeys_form_buttonCreating()}
                      </>
                    ) : (
                      m.apiKeys_form_buttonCreate()
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
