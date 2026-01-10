"use client"

import { useState } from "react"
import * as m from "@/paraglide/messages"
import { Plus } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const createUserFormSchema = z.object({
  email: z.string().email({ message: m.users_validation_invalidEmail() }),
  password: z.string().min(8, { message: m.users_validation_passwordMin() }),
  name: z.string().min(1, { message: m.users_validation_nameRequired() }),
  role: z.enum(["user", "admin"]).default("user"),
  emailVerified: z.boolean().default(false),
})

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>

interface CreateUserDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit: (values: CreateUserFormValues) => Promise<void>
}

export function CreateUserDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
}: CreateUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "user",
      emailVerified: false,
    },
  })

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
      toast.success(m.users_toast_created())
      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error(m.users_error_createFailed())
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
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 size-4" />
          {m.users_table_addUser()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{m.users_dialog_create_title()}</DialogTitle>
          <DialogDescription>
            {m.users_dialog_create_description()}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.users_form_email()}</FormLabel>
                  <FormControl>
                    <Input placeholder={m.users_form_emailPlaceholder()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.users_form_password()}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={m.users_form_passwordPlaceholder()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.users_form_name()}</FormLabel>
                  <FormControl>
                    <Input placeholder={m.users_form_namePlaceholder()} {...field} />
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
                  <FormLabel>{m.users_form_role()}</FormLabel>
                  <FormControl>
                    <Input placeholder={m.users_form_rolePlaceholder()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{m.users_form_emailVerified()}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
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
                {m.users_form_buttonCancel()}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 size-4" />
                    {m.users_form_buttonSaving()}
                  </>
                ) : (
                  m.users_form_buttonSave()
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
