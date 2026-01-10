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
import { signIn } from "@/lib/auth-client"
import * as m from "@/paraglide/messages"

const loginFormSchema = z.object({
  email: z.string().email(m.auth_signIn_validation_invalidEmail()),
  password: z.string().min(6, m.auth_signIn_validation_passwordMin()),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormValues) {
    const { error } = await signIn.email({
      email: data.email,
      password: data.password,
    })

    if (error) {
      console.error("Sign in error:", error)
      // TODO: Show error to user
      return
    }

    window.location.href = "/"
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{m.auth_signIn_title()}</CardTitle>
          <CardDescription>
            {m.auth_signIn_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{m.auth_signIn_email()}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={m.auth_signIn_emailPlaceholder()}
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
                        <div className="flex items-center">
                          <FormLabel>{m.auth_signIn_password()}</FormLabel>
                          <a
                            href="/auth/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            {m.auth_signIn_forgotPassword()}
                          </a>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full cursor-pointer">
                    {m.auth_signIn_button()}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {m.auth_signIn_noAccount()}{" "}
                  <a href="/auth/sign-up" className="underline underline-offset-4">
                    {m.auth_signIn_signUpLink()}
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        {m.auth_signIn_terms()} <a href="#">{m.auth_signIn_termsLink()}</a>{" "}
        {m.auth_signIn_and()} <a href="#">{m.auth_signIn_privacyLink()}</a>.
      </div>
    </div>
  )
}
