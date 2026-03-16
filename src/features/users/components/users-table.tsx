import { useEffect, useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'
import { getUserList } from '@/api/users'

type DataTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

const userStatuses = ['active', 'inactive', 'invited', 'suspended'] as const
const userRoles = ['superadmin', 'admin', 'cashier', 'manager'] as const

type UserStatus = (typeof userStatuses)[number]
type UserRole = (typeof userRoles)[number]

const isUserStatus = (v: unknown): v is UserStatus => {
  return typeof v === 'string' && userStatuses.includes(v as UserStatus)
}

const isUserRole = (v: unknown): v is UserRole => {
  return typeof v === 'string' && userRoles.includes(v as UserRole)
}

const toDate = (v: unknown) => {
  if (v instanceof Date) return v
  if (typeof v === 'number' || typeof v === 'string') {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? new Date() : d
  }
  return new Date()
}

const toString = (v: unknown) => {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

const normalizeUser = (raw: Record<string, unknown>): User => {
  const id = toString(raw.id ?? raw.userId ?? raw.uid ?? raw._id)
  const username = toString(raw.username ?? raw.name ?? raw.nickName ?? raw.email)
  const email = toString(raw.email ?? raw.mail)
  const phoneNumber = toString(raw.phoneNumber ?? raw.phone ?? raw.mobile)
  const firstName = toString(raw.firstName ?? raw.givenName ?? raw.nickname ?? '')
  const lastName = toString(raw.lastName ?? raw.familyName ?? '')
  const status = isUserStatus(raw.status) ? raw.status : 'active'
  const role = isUserRole(raw.role) ? raw.role : 'admin'
  const createdAt = toDate(raw.createdAt ?? raw.createTime ?? raw.created_time)
  const updatedAt = toDate(raw.updatedAt ?? raw.updateTime ?? raw.updated_time)

  return {
    id: id || `${Date.now()}`,
    firstName,
    lastName,
    username,
    email,
    phoneNumber,
    status,
    role,
    createdAt,
    updatedAt,
  }
}

const getListFromResponse = (res: unknown): unknown[] => {
  if (Array.isArray(res)) return res
  if (!res || typeof res !== 'object') return []

  const r = res as Record<string, unknown>
  const data = r.data

  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (Array.isArray(d.list)) return d.list
    if (Array.isArray(d.records)) return d.records
    if (Array.isArray(d.items)) return d.items
  }

  if (Array.isArray(r.list)) return r.list as unknown[]
  return []
}

const getTotalFromResponse = (res: unknown): number | null => {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  const data = r.data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const total = d.total ?? d.count
    if (typeof total === 'number') return total
    if (typeof total === 'string') {
      const n = Number(total)
      return Number.isFinite(n) ? n : null
    }
  }
  const total = r.total ?? r.count
  if (typeof total === 'number') return total
  if (typeof total === 'string') {
    const n = Number(total)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function UsersTable({ search, navigate }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror users route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      // username per-column text filter
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })

  const requestParams = useMemo(() => {
    const username = columnFilters.find((f) => f.id === 'username')?.value
    const status = columnFilters.find((f) => f.id === 'status')?.value
    const role = columnFilters.find((f) => f.id === 'role')?.value

    return {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      username: typeof username === 'string' ? username : undefined,
      status: Array.isArray(status) ? status : undefined,
      role: Array.isArray(role) ? role : undefined,
    }
  }, [columnFilters, pagination.pageIndex, pagination.pageSize])

  const listQuery = useQuery({
    queryKey: ['users', requestParams],
    queryFn: async () => {
      const res = await getUserList(requestParams)
      const list = getListFromResponse(res)
      const total = getTotalFromResponse(res)
      return { list, total }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: import.meta.env.PROD,
  })

  const users = useMemo<User[]>(() => {
    const list = listQuery.data?.list ?? []
    return list
      .filter((item): item is Record<string, unknown> => {
        return !!item && typeof item === 'object'
      })
      .map(normalizeUser)
  }, [listQuery.data?.list])

  const total = useMemo(() => {
    const t = listQuery.data?.total
    return typeof t === 'number' ? t : users.length
  }, [listQuery.data?.total, users.length])

  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
    pageCount,
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter users...'
        searchKey='username'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Invited', value: 'invited' },
              { label: 'Suspended', value: 'suspended' },
            ],
          },
          {
            columnId: 'role',
            title: 'Role',
            options: roles.map((role) => ({ ...role })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {listQuery.isLoading
                    ? '加载中...'
                    : listQuery.isError
                      ? '加载失败'
                      : '暂无数据'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
