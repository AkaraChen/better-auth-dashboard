"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import * as m from "@/paraglide/messages"

export function ForgotPasswordForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      setMessage(m.auth_forgotPassword_error())
      console.error("Forgot password error:", error)
    } else {
      setMessage(m.auth_forgotPassword_success())
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{m.auth_forgotPassword_title()}</CardTitle>
          <CardDescription>
            {m.auth_forgotPassword_description()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">{m.auth_forgotPassword_email()}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={m.auth_forgotPassword_emailPlaceholder()}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? m.auth_forgotPassword_buttonSending() : m.auth_forgotPassword_button()}
                </Button>
                {message && (
                  <p className="text-sm text-center text-muted-foreground">{message}</p>
                )}
              </div>
              <div className="text-center text-sm">
                {m.auth_forgotPassword_rememberPassword()}{" "}
                <a href="/auth/sign-in" className="underline underline-offset-4">
                  {m.auth_forgotPassword_backToSignIn()}
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
