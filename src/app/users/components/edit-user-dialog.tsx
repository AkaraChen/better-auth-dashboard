"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox"
import type { BetterAuthUser } from "../page"
import config from "~/dashboard.config"

const editUserFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  role: z.string().min(1, { message: "At least one role is required" }),
  emailVerified: z.boolean(),
})

export type EditUserFormValues = z.infer<typeof editUserFormSchema>

interface EditUserDialogProps {
  user: BetterAuthUser | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit: (userId: string, values: EditUserFormValues) => Promise<void>
}

// Parse comma-separated roles to array
const parseRoles = (roleString?: string): string[] => {
  if (!roleString) return ['user']
  return roleString.split(',').map(r => r.trim()).filter(Boolean)
}

// Convert array to comma-separated string
const serializeRoles = (roles: string[]): string => {
  return roles.join(',')
}

// Get all available roles (default + custom from config)
const getAllRoles = (): string[] => {
  const defaultRoles = ['user', 'admin']
  const customRoles = config.customRoles || []
  return [...new Set([...defaultRoles, ...customRoles])]
}

export function EditUserDialog({
  user,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
}: EditUserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [roleArray, setRoleArray] = useState<string[]>(['user'])

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      role: serializeRoles(['user']),
      emailVerified: user?.emailVerified || false,
    },
  })

  useEffect(() => {
    if (user) {
      const parsedRoles = parseRoles((user as any)?.role)
      setRoleArray(parsedRoles)
      form.reset({
        email: user.email,
        name: user.name || "",
        role: serializeRoles(parsedRoles),
        emailVerified: user.emailVerified || false,
      })
    }
  }, [user, form])

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!user) return

    try {
      setIsSubmitting(true)
      // Override role with the serialized array
      await onSubmit(user.id, {
        ...values,
        role: serializeRoles(roleArray),
      })
      toast.success("User updated successfully")
      setOpen(false)
      form.reset()
      setRoleArray(['user'])
    } catch (error) {
      toast.error("Failed to update user")
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
        setRoleArray(['user'])
      }
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {user && (
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || user.email} />
                ) : (
                  <AvatarFallback className="text-sm font-medium">
                    {getAvatarFallback(user.name, user.email)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <DialogTitle>Edit User</DialogTitle>
              </div>
            </div>
          )}
          <DialogDescription>
            Update user information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      value={roleArray}
                      onChange={(values) => {
                        setRoleArray(values)
                        field.onChange(serializeRoles(values))
                      }}
                      options={getAllRoles()}
                      placeholder="Select roles..."
                      allowCustom={true}
                      disabled={isSubmitting}
                    />
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
                    <FormLabel>Email Verified</FormLabel>
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
