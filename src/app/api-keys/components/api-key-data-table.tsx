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
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { ApiKey } from "../types"

interface ApiKeyDataTableProps {
  apiKeys: ApiKey[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onCreate?: () => void
  onEdit: (apiKey: ApiKey) => void
  onDelete: (apiKeyId: string) => void
  onToggleEnabled: (apiKey: ApiKey) => void
}

export function ApiKeyDataTable({
  apiKeys,
  loading,
  error,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onToggleEnabled,
}: ApiKeyDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const getTimeRemaining = (expiresAt: Date | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`
    return "< 1 hour"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const columns: ColumnDef<ApiKey>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const apiKey = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{apiKey.name}</span>
            <span className="text-sm text-muted-foreground font-mono">{apiKey.startsWith}...</span>
          </div>
        )
      },
    },
    {
      accessorKey: "enabled",
      header: "Status",
      cell: ({ row }) => {
        const apiKey = row.original
        const expired = isExpired(apiKey.expiresAt)
        const statusColor = expired
          ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
          : apiKey.enabled
            ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
            : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"

        const statusText = expired ? "Expired" : apiKey.enabled ? "Active" : "Disabled"

        return (
          <Badge variant="secondary" className={statusColor}>
            {statusText}
          </Badge>
        )
      },
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => {
        const apiKey = row.original
        const timeRemaining = getTimeRemaining(apiKey.expiresAt)
        return (
          <div className="flex flex-col">
            <span className="text-sm">{formatDate(apiKey.expiresAt)}</span>
            {timeRemaining && (
              <span className="text-xs text-muted-foreground">{timeRemaining}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "lastUsedAt",
      header: "Last Used",
      cell: ({ row }) => {
        const apiKey = row.original
        return <span className="text-sm">{formatDate(apiKey.lastUsedAt)}</span>
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const apiKey = row.original
        return <span className="text-sm">{formatDate(apiKey.createdAt)}</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const apiKey = row.original
        const expired = isExpired(apiKey.expiresAt)

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-pointer"
              onClick={() => copyToClipboard(apiKey.startsWith)}
              title="Copy key prefix"
            >
              <Copy className="size-4" />
              <span className="sr-only">Copy</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onToggleEnabled(apiKey)}
              disabled={expired}
              title={apiKey.enabled ? "Disable" : "Enable"}
            >
              {apiKey.enabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              <span className="sr-only">{apiKey.enabled ? "Disable" : "Enable"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEdit(apiKey)}
              title="Edit"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 cursor-pointer">
                  <ChevronDown className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDelete(apiKey.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete API Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: apiKeys,
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
              placeholder="Search API keys..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-9"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button
              onClick={onCreate}
              disabled={loading}
              className="cursor-pointer"
            >
              <Plus className="mr-2 size-4" />
              Add API Key
            </Button>
          )}
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
                    Loading API keys...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No API keys found.
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
