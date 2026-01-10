"use client"

import { useState } from "react"
import * as m from "@/paraglide/messages"
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
  Ban,
  ChevronDown,
  EllipsisVertical,
  Key,
  Monitor,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Undo2,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import type { BetterAuthUser } from "../page"

interface AdminDataTableProps {
  users: BetterAuthUser[]
  loading: boolean
  error: string | null
  totalCount: number
  onCreateUser: () => void
  onUpdateUser: (user: BetterAuthUser) => void
  onDeleteUser: (userId: string) => void
  onBanUser: (userId: string) => void
  onUnbanUser: (userId: string) => void
  onManageSessions?: (user: BetterAuthUser) => void
  onSetPassword?: (user: BetterAuthUser) => void
  onRefresh: () => void
  onPaginationChange: (limit: number, offset: number) => void
}

export function AdminDataTable({
  users,
  loading,
  error,
  totalCount,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onBanUser,
  onUnbanUser,
  onManageSessions,
  onSetPassword,
  onRefresh,
  onPaginationChange,
}: AdminDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const getStatusColor = (banned: boolean) => {
    return banned
      ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      : "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const columns: ColumnDef<BetterAuthUser>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: m.users_table_header_user(),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || user.email} />
              ) : (
                <AvatarFallback className="text-xs font-medium">
                  {getAvatarFallback(user.name, user.email)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name || m.users_table_unnamedUser()}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "emailVerified",
      header: m.users_table_header_emailVerified(),
      cell: ({ row }) => {
        const verified = row.getValue("emailVerified") as boolean
        return (
          <Badge
            variant="secondary"
            className={
              verified
                ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
                : "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
            }
          >
            {verified ? m.users_table_statusVerified() : m.users_table_statusPending()}
          </Badge>
        )
      },
    },
    {
      accessorKey: "role",
      header: m.users_table_header_roles(),
      cell: ({ row }) => {
        const role = (row.original as any).role as string | undefined
        if (!role) {
          return <span className="text-muted-foreground text-sm">user</span>
        }
        const roles = role.split(',').map(r => r.trim()).filter(Boolean)
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs font-normal"
              >
                {r}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "banned",
      header: m.users_table_header_status(),
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean
        return (
          <Badge variant="secondary" className={getStatusColor(banned)}>
            {banned ? (
              <>
                <ShieldX className="mr-1 size-3" />
                {m.users_table_statusBanned()}
              </>
            ) : (
              <>
                <ShieldCheck className="mr-1 size-3" />
                {m.users_table_statusActive()}
              </>
            )}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === (value === "banned")
      },
    },
    {
      accessorKey: "createdAt",
      header: m.users_table_header_created(),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return <span className="text-sm">{formatDate(date)}</span>
      },
    },
    {
      accessorKey: "updatedAt",
      header: m.users_table_header_updated(),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as Date
        return <span className="text-sm">{formatDate(date)}</span>
      },
    },
    {
      id: "actions",
      header: m.users_table_header_actions(),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onUpdateUser(user)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">{m.users_table_actionEdit()}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">{m.users_table_actionMore()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.banned ? (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onUnbanUser(user.id)}
                  >
                    <Undo2 className="mr-2 size-4" />
                    {m.users_table_actionUnban()}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onBanUser(user.id)}
                  >
                    <Ban className="mr-2 size-4" />
                    {m.users_table_actionBan()}
                  </DropdownMenuItem>
                )}
                {onManageSessions && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onManageSessions(user)}
                    >
                      <Monitor className="mr-2 size-4" />
                      {m.users_table_actionSessions()}
                    </DropdownMenuItem>
                  </>
                )}
                {onSetPassword && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onSetPassword(user)}
                    >
                      <Key className="mr-2 size-4" />
                      {m.users_table_actionPassword()}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  {m.users_table_actionDelete()}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
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

  const statusFilter = table.getColumn("banned")?.getFilterValue() as boolean | undefined

  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number(newPageSize)
    table.setPageSize(size)
    onPaginationChange(size, 0)
  }

  const handlePageChange = (direction: "next" | "previous") => {
    const newPageIndex =
      direction === "next"
        ? table.getState().pagination.pageIndex + 1
        : table.getState().pagination.pageIndex - 1
    const newOffset = newPageIndex * table.getState().pagination.pageSize
    onPaginationChange(table.getState().pagination.pageSize, newOffset)
  }

  const handleStatusFilterChange = (value: string) => {
    table.getColumn("banned")?.setFilterValue(value === "all" ? undefined : value === "banned")
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={m.users_table_search()}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onCreateUser} className="cursor-pointer">
            <Pencil className="mr-2 size-4" />
            {m.users_table_addUser()}
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="cursor-pointer"
          >
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {m.users_table_refresh()}
          </Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={statusFilter ? (statusFilter === true ? "banned" : "active") : "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{m.users_table_filterAll()}</SelectItem>
              <SelectItem value="active">{m.users_table_filterActive()}</SelectItem>
              <SelectItem value="banned">{m.users_table_filterBanned()}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            {m.users_table_columnVisibility()}
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
              <Button variant="outline" className="cursor-pointer w-full">
                {m.users_table_columns()} <ChevronDown className="ml-2 size-4" />
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
                    {m.users_table_loading()}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {m.users_table_noResults()}
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
            {m.users_table_show()}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
          {table.getFilteredSelectedRowModel().rows.length} {m.users_table_of()}{" "}
          {table.getFilteredRowModel().rows.length} {m.users_table_rowSelected()}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2 hidden sm:flex">
            <p className="text-sm font-medium">{m.users_table_page()}</p>
            <strong className="text-sm">
              {table.getState().pagination.pageIndex + 1} {m.users_table_of()} {Math.ceil(totalCount / table.getState().pagination.pageSize)}
            </strong>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("previous")}
              disabled={!table.getCanPreviousPage() || loading}
              className="cursor-pointer"
            >
              {m.users_table_previous()}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={!table.getCanNextPage() || loading}
              className="cursor-pointer"
            >
              {m.users_table_next()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
