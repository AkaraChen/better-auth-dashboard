"use client"

import { useState, useEffect } from "react"
import * as m from "@/paraglide/messages"
import {
  Monitor,
  Trash2,
  RefreshCw,
  AlertCircle,
  Laptop,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
import type { BetterAuthUser, UserSession } from "../page"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserSessionsDialogProps {
  user: BetterAuthUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserSessionsDialog({
  user,
  open,
  onOpenChange,
}: UserSessionsDialogProps) {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState<string | "all" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: currentSession } = useSession()

  // Fetch sessions when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchSessions()
    } else {
      // Reset state when dialog closes
      setSessions([])
      setError(null)
    }
  }, [open, user])

  const fetchSessions = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const response = await authClient.admin.listUserSessions({
        userId: user.id,
      })

      if (response.error) {
        setError(response.error.message || m.users_dialog_sessions_failed())
      } else if (response.data) {
        // The response structure should be { sessions: Session[] }
        setSessions(
          (response.data as { sessions?: UserSession[] }).sessions || []
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : m.users_dialog_sessions_failed())
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionToken: string) => {
    try {
      setRevoking(sessionToken)
      const result = await authClient.admin.revokeUserSession({
        sessionToken,
      })

      if (result.error) {
        toast.error(result.error.message || m.users_sessions_revokeFailed())
      } else {
        toast.success(m.users_sessions_revokedSuccess())
        // Refresh the sessions list
        await fetchSessions()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.users_sessions_revokeFailed())
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllSessions = async () => {
    if (!user) return

    try {
      setRevoking("all")
      const result = await authClient.admin.revokeUserSessions({
        userId: user.id,
      })

      if (result.error) {
        toast.error(result.error.message || m.users_sessions_revokeAllFailed())
      } else {
        toast.success(m.users_sessions_allRevokedSuccess())
        // Refresh the sessions list
        await fetchSessions()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : m.users_sessions_revokeAllFailed())
    } finally {
      setRevoking(null)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const getUserAgentDisplay = (userAgent: string | null) => {
    if (!userAgent) return m.users_sessions_unknown()
    const maxLength = 60
    if (userAgent.length <= maxLength) return userAgent
    return userAgent.slice(0, maxLength) + "..."
  }

  const isRevokingCurrentSession = (sessionToken: string) => {
    return currentSession?.session?.token === sessionToken
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="size-5" />
            {m.users_dialog_sessions_title()}
          </DialogTitle>
          <DialogDescription>
            {m.users_dialog_sessions_description({ email: user.name || user.email })}
          </DialogDescription>
        </DialogHeader>

        {/* User info */}
        <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/50">
          <Avatar className="h-12 w-12">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name || user.email} />
            ) : (
              <AvatarFallback className="text-sm font-medium">
                {getAvatarFallback(user.name, user.email)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name || m.users_table_unnamedUser()}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Sessions table */}
        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">{m.users_sessions_ipAddress()}</TableHead>
                <TableHead>{m.users_sessions_userAgent()}</TableHead>
                <TableHead className="w-[140px]">{m.users_sessions_created()}</TableHead>
                <TableHead className="w-[140px]">{m.users_sessions_expires()}</TableHead>
                <TableHead className="w-[80px]">{m.users_sessions_actions()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      {m.users_sessions_loading()}
                    </div>
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Laptop className="size-8" />
                      <p>{m.users_sessions_noResults()}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.token}>
                    <TableCell className="font-mono text-xs">
                      {session.ipAddress || m.users_sessions_unknown()}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help text-left">
                            <span className="block max-w-[200px] truncate">
                              {getUserAgentDisplay(session.userAgent)}
                            </span>
                          </TooltipTrigger>
                          {session.userAgent &&
                            session.userAgent.length > 60 && (
                              <TooltipContent
                                side="bottom"
                                className="max-w-md"
                              >
                                <p className="text-xs">
                                  {session.userAgent}
                                </p>
                              </TooltipContent>
                            )}
                        </Tooltip>
                      </TooltipProvider>
                      {session.impersonatedBy && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-xs text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
                        >
                          {m.users_sessions_impersonated()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(session.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => revokeSession(session.token)}
                        disabled={
                          revoking !== null ||
                          isRevokingCurrentSession(session.token)
                        }
                        title={
                          isRevokingCurrentSession(session.token)
                            ? m.users_sessions_cannotRevoke()
                            : m.users_sessions_revoke()
                        }
                      >
                        {revoking === session.token ? (
                          <RefreshCw className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        <span className="sr-only">{m.users_sessions_revoke()}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={revokeAllSessions}
            disabled={revoking !== null || sessions.length === 0 || loading}
            className="cursor-pointer"
          >
            {revoking === "all" ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                {m.users_sessions_revoking()}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                {m.users_sessions_revokeAll()}
              </>
            )}
          </Button>
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            disabled={revoking !== null}
            className="cursor-pointer"
          >
            {m.users_sessions_close()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
