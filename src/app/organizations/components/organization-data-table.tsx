"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Building2,
  ChevronDown,
  Eye,
  RefreshCw,
  Search,
  Users,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { FullOrganization } from "../page"

interface OrganizationDataTableProps {
  organizations: FullOrganization[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function OrganizationDataTable({
  organizations,
  loading,
  error,
  onRefresh,
}: OrganizationDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20"
      case "admin":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      case "member":
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
      case "accepted":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "rejected":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      case "canceled":
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const getInvitationStatusIcon = (status: string): LucideIcon => {
    switch (status) {
      case "pending":
        return Clock
      case "accepted":
        return CheckCircle
      case "rejected":
      case "canceled":
        return XCircle
      default:
        return Clock
    }
  }

  const columns: ColumnDef<FullOrganization>[] = [
    {
      accessorKey: "name",
      header: "Organization",
      cell: ({ row }) => {
        const org = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {org.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{org.name}</span>
              <span className="text-sm text-muted-foreground">@{org.slug}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "members",
      header: "Members",
      cell: ({ row }) => {
        const members = row.original.members
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{members.length}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "invitations",
      header: "Pending Invitations",
      cell: ({ row }) => {
        const pendingInvitations = row.original.invitations.filter(
          (inv) => inv.status === "pending"
        )
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{pendingInvitations.length}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return <span className="text-sm">{formatDate(date)}</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const org = row.original
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 cursor-pointer"
            onClick={() => setExpandedOrgId(expandedOrgId === org.id ? null : org.id)}
          >
            <Eye className="size-4" />
            <span className="sr-only">View details</span>
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: organizations,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="cursor-pointer"
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Column visibility */}
      <div className="grid gap-2 sm:grid-cols-1 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            Column Visibility
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
              <Button variant="outline" className="cursor-pointer w-full sm:w-auto">
                Columns <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 size-4 animate-spin" />
                    Loading organizations...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const org = row.original
                const isExpanded = expandedOrgId === org.id
                const StatusIcon = getInvitationStatusIcon("pending")
                return (
                  <>
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${row.id}-details`}>
                        <TableCell colSpan={columns.length} className="bg-muted/50">
                          <Collapsible open={isExpanded} onOpenChange={(open) => {
                            if (!open) setExpandedOrgId(null)
                          }}>
                            <CollapsibleContent className="space-y-6 py-4">
                              {/* Organization Details */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Organization Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">ID: </span>
                                      <span className="font-mono">{org.id}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Name: </span>
                                      <span>{org.name}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Slug: </span>
                                      <span className="font-mono">@{org.slug}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Created: </span>
                                      <span>{formatDateTime(org.createdAt)}</span>
                                    </div>
                                    {org.logo && (
                                      <div className="md:col-span-2">
                                        <span className="text-muted-foreground">Logo: </span>
                                        <span>{org.logo}</span>
                                      </div>
                                    )}
                                    {org.metadata && Object.keys(org.metadata).length > 0 && (
                                      <div className="md:col-span-2">
                                        <span className="text-muted-foreground">Metadata: </span>
                                        <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
                                          {JSON.stringify(org.metadata, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Members */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Members ({org.members.length})
                                  </h4>
                                  {org.members.length > 0 ? (
                                    <div className="space-y-2">
                                      {org.members.map((member) => (
                                        <div
                                          key={member.id}
                                          className="flex items-center justify-between rounded-lg border bg-background p-3"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs font-semibold">
                                              {member.user.name?.substring(0, 2).toUpperCase() ||
                                               member.user.email.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                              <div className="font-medium">
                                                {member.user.name || "Unnamed User"}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {member.user.email}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className={getRoleColor(member.role)}>
                                              {member.role}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              Joined {formatDate(member.createdAt)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No members yet</p>
                                  )}
                                </div>

                                {/* Invitations */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Invitations ({org.invitations.length})
                                  </h4>
                                  {org.invitations.length > 0 ? (
                                    <div className="space-y-2">
                                      {org.invitations.map((invitation) => {
                                        const StatusIcon = getInvitationStatusIcon(invitation.status)
                                        return (
                                          <div
                                            key={invitation.id}
                                            className="flex items-center justify-between rounded-lg border bg-background p-3"
                                          >
                                            <div className="flex items-center gap-3">
                                              <StatusIcon className={`h-5 w-5 ${getInvitationStatusColor(invitation.status).split(' ')[0]}`} />
                                              <div>
                                                <div className="font-medium">{invitation.email}</div>
                                                <div className="text-sm text-muted-foreground">
                                                  Role: {invitation.role}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <Badge variant="secondary" className={getInvitationStatusColor(invitation.status)}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {invitation.status}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                Sent {formatDateTime(invitation.createdAt)}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No invitations</p>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const size = Number(value)
              table.setPageSize(size)
            }}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 hidden sm:flex">
            <p className="text-sm font-medium">Page</p>
            <strong className="text-sm">
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
