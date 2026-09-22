"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, AlertTriangleIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

const DEFAULT_PAGE_SIZE_OPTIONS = [8, 10, 25, 50]

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
  rowClassName,
  selectedIds,
  onToggleRow,
  onToggleAll,
  itemLabel = "data",
  pageSize = DEFAULT_PAGE_SIZE_OPTIONS[0],
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
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
  rowClassName?: (row: T) => string | undefined
  /** Pass to render a leading checkbox column with row selection. */
  selectedIds?: Set<string>
  onToggleRow?: (id: string, checked: boolean) => void
  onToggleAll?: (checked: boolean) => void
  /** Noun used in the "Menampilkan X–Y dari Z ..." footer, e.g. "review", "member". */
  itemLabel?: string
  pageSize?: number
  pageSizeOptions?: number[]
}) {
  const [sort, setSort] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  )
  const [page, setPage] = React.useState(0)
  const [size, setSize] = React.useState(pageSize)

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

  const pageCount = Math.max(1, Math.ceil(sortedData.length / size))
  const clampedPage = Math.min(page, pageCount - 1)
  const pageData = sortedData.slice(clampedPage * size, clampedPage * size + size)
  const rangeStart = sortedData.length === 0 ? 0 : clampedPage * size + 1
  const rangeEnd = Math.min(sortedData.length, clampedPage * size + size)

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
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectedIds && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      pageData.length > 0 && pageData.every((row) => selectedIds.has(getRowId(row)))
                    }
                    onCheckedChange={(checked) => onToggleAll?.(!!checked)}
                  />
                </TableHead>
              )}
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
                  {selectedIds && (
                    <TableCell>
                      <Skeleton className="size-4" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && pageData.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectedIds ? 1 : 0)} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              pageData.map((row) => {
                const rowId = getRowId(row)
                return (
                  <TableRow
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer", rowClassName?.(row))}
                  >
                    {selectedIds && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(rowId)}
                          onCheckedChange={(checked) => onToggleRow?.(rowId, !!checked)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {!isLoading && sortedData.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Menampilkan {rangeStart}–{rangeEnd} dari {sortedData.length} {itemLabel}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {pageCount > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={clampedPage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ‹
                </Button>
                {getPageItems(clampedPage, pageCount).map((item, index) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={item === clampedPage ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setPage(item)}
                    >
                      {item + 1}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={clampedPage >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  ›
                </Button>
              </div>
            )}

            {pageSizeOptions.length > 1 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span>Tampilkan</span>
                <Select
                  value={String(size)}
                  onValueChange={(value) => {
                    setSize(Number(value))
                    setPage(0)
                  }}
                >
                  <SelectTrigger size="sm" className="w-[4.5rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>per halaman</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const items = new Set<number>([0, total - 1, current, current - 1, current + 1])
  const sorted = Array.from(items)
    .filter((n) => n >= 0 && n < total)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis")
    result.push(sorted[i])
  }
  return result
}
