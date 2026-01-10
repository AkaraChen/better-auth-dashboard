"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { signUp } from "@/lib/auth-client"
import * as m from "@/paraglide/messages"

const getSchema = () => z.object({
  firstName: z.string().min(1, m.auth_signUp_validation_firstNameRequired()),
  lastName: z.string().min(1, m.auth_signUp_validation_lastNameRequired()),
  email: z.string().email(m.auth_signUp_validation_invalidEmail()),
  password: z.string().min(6, m.auth_signUp_validation_passwordMin()),
  confirmPassword: z.string().min(6, m.auth_signUp_validation_confirmPassword()),
  terms: z.boolean().refine(val => val === true, m.auth_signUp_validation_termsRequired()),
}).refine((data) => data.password === data.confirmPassword, {
  message: m.auth_signUp_validation_passwordsNotMatch(),
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<ReturnType<typeof getSchema>>

export function SignupForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  async function onSubmit(data: SignupFormValues) {
    const { error } = await signUp.email({
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
    })

    if (error) {
      console.error("Sign up error:", error)
      // TODO: Show error to user
      return
    }

    window.location.href = "/"
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{m.auth_signUp_title()}</CardTitle>
          <CardDescription>
            {m.auth_signUp_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{m.auth_signUp_firstName()}</FormLabel>
                          <FormControl>
                            <Input placeholder={m.auth_signUp_firstNamePlaceholder()} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{m.auth_signUp_lastName()}</FormLabel>
                          <FormControl>
                            <Input placeholder={m.auth_signUp_lastNamePlaceholder()} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{m.auth_signUp_email()}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={m.auth_signUp_emailPlaceholder()}
                            {...field}
                          />
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
                        <FormLabel>{m.auth_signUp_password()}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
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
                        <FormLabel>{m.auth_signUp_confirmPassword()}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <FormLabel className="text-sm">
                          {m.auth_signUp_terms()}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full cursor-pointer">
                    {m.auth_signUp_button()}
                  </Button>

                  <Button variant="outline" className="w-full cursor-pointer" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    {m.auth_signUp_googleButton()}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {m.auth_signUp_hasAccount()}{" "}
                  <a href="/auth/sign-in" className="underline underline-offset-4">
                    {m.auth_signUp_signInLink()}
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {m.auth_signUp_termsService()} <a href="#">{m.auth_signUp_termsLink()}</a>{" "}
        {m.auth_signUp_and()} <a href="#">{m.auth_signUp_privacyLink()}</a>.
      </div>
    </div>
  )
}
