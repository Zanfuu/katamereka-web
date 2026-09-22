"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, AlertTriangleIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

export interface ResourceTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  headerClassName?: string
}

const PAGE_SIZE = 8

export function ResourceTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  isLoading = false,
  error,
  emptyTitle = "Belum ada data.",
  emptyDescription,
  emptyAction,
}: {
  data: T[]
  columns: ResourceTableColumn<T>[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  isLoading?: boolean
  error?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}) {
  const [sort, setSort] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  )
  const [page, setPage] = React.useState(0)

  const sortedData = React.useMemo(() => {
    if (!sort) return data
    const column = columns.find((c) => c.key === sort.key)
    if (!column?.sortValue) return data
    const copy = [...data]
    copy.sort((a, b) => {
      const va = column.sortValue!(a)
      const vb = column.sortValue!(b)
      if (va < vb) return sort.direction === "asc" ? -1 : 1
      if (va > vb) return sort.direction === "asc" ? 1 : -1
      return 0
    })
    return copy
  }, [data, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE))
  const clampedPage = Math.min(page, pageCount - 1)
  const pageData = sortedData.slice(
    clampedPage * PAGE_SIZE,
    clampedPage * PAGE_SIZE + PAGE_SIZE
  )

  function toggleSort(key: string) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" }
      if (current.direction === "asc") return { key, direction: "desc" }
      return null
    })
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border">
        <EmptyState
          icon={AlertTriangleIcon}
          title="Gagal memuat data"
          description={error}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      {column.header}
                      {sort?.key === column.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUpIcon className="size-3.5" />
                        ) : (
                          <ArrowDownIcon className="size-3.5" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="size-3.5 text-muted-foreground/50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && pageData.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              pageData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && sortedData.length > 0 && pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Halaman {clampedPage + 1} dari {pageCount} · {sortedData.length} data
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={clampedPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={clampedPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
