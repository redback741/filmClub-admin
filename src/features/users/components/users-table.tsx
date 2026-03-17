import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes } from '../data/data'
import { type User } from '../data/schema'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { deleteUser, getUserList } from '@/api/users'

type DataTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
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
  const username = toString(raw.username ?? raw.email)
  const email = toString(raw.email ?? raw.mail)
  const phoneNumber = toString(raw.phoneNumber ?? raw.phone ?? raw.mobile)
  const nickName = toString(raw.nickName ?? raw.nickname ?? '')
  const isFrozen =
    raw.isFrozen === true ||
    raw.isFrozen === 1 ||
    raw.isFrozen === '1' ||
    raw.isFrozen === 'true'
  const isAdmin =
    raw.isAdmin === true ||
    raw.isAdmin === 1 ||
    raw.isAdmin === '1' ||
    raw.isAdmin === 'true'
  const role = isAdmin ? 'admin' : 'cashier'
  const createdAt = toDate(raw.createdAt ?? raw.createTime ?? raw.created_time)
  const updatedAt = toDate(raw.updatedAt ?? raw.updateTime ?? raw.updated_time)

  return {
    id: id || `${Date.now()}`,
    nickName,
    username,
    email,
    phoneNumber,
    isFrozen,
    role,
    createdAt,
    updatedAt,
  }
}

function UserDeleteAction({
  userId,
  disabled,
}: {
  userId: string
  disabled: boolean
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isOkResponse = (res: unknown) => {
    if (!res || typeof res !== 'object') return false
    const code = (res as Record<string, unknown>).code
    return code === 200 || code === 201
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    toast.promise(deleteUser({id: userId}), {
      loading: '删除中...',
      success: (res: unknown) => {
        setIsLoading(false)
        if (isOkResponse(res)) {
          queryClient.invalidateQueries({ queryKey: ['users'] })
          setOpen(false)
          return '删除成功'
        }
        return '删除失败'
      },
      error: () => {
        setIsLoading(false)
        return '删除失败'
      },
    })
  }

  return (
    <>
      <Button
        variant='destructive'
        size='icon'
        className='h-8 w-8'
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label='删除用户'
        title={disabled ? '管理员不可删除' : '删除用户'}
      >
        <Trash2 size={16} />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='确认删除'
        desc='确认删除该用户吗？删除后无法恢复。'
        confirmText='删除'
        cancelBtnText='取消'
        destructive
        isLoading={isLoading}
        handleConfirm={handleConfirm}
        className='sm:max-w-sm'
      />
    </>
  )
}

const columns: ColumnDef<User>[] = [
  {
     accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('id')}</LongText>
    ),
    // enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nickName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='昵称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('nickName')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-0 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户名' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='邮箱' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'phoneNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='手机号' />
    ),
    cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'isFrozen',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const isFrozen = !!row.original.isFrozen
      const badgeColor = callTypes.get(isFrozen ? 'suspended' : 'active')
      const label = isFrozen ? '冻结' : '启用'
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      const v = row.getValue(id)
      const frozen = v === true
      const wantFrozen = value.includes('true')
      const wantEnabled = value.includes('false')
      if (wantFrozen && wantEnabled) return true
      if (wantFrozen) return frozen
      if (wantEnabled) return !frozen
      return true
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='角色' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      return (
        <div className='flex items-center gap-x-2'>
          <span className='text-sm'>
            {role === 'admin' ? '管理员' : '用户'}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const userId = String(row.original.id ?? '')
      const disabled = row.original.role === 'admin'
      return (
        <div className='flex justify-end'>
          <UserDeleteAction userId={userId} disabled={disabled} />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

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
      { columnId: 'nickName', searchKey: 'nickName', type: 'string' },
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'isFrozen', searchKey: 'isFrozen', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })

  const requestParams = useMemo(() => {
    const nickName = columnFilters.find((f) => f.id === 'nickName')?.value
    const username = columnFilters.find((f) => f.id === 'username')?.value
    const isFrozenFilter = columnFilters.find((f) => f.id === 'isFrozen')?.value
    const role = columnFilters.find((f) => f.id === 'role')?.value
    const isFrozen =
      Array.isArray(isFrozenFilter) && isFrozenFilter.length === 1
        ? isFrozenFilter[0] === 'true'
        : undefined

    return {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      nickName: typeof nickName === 'string' ? nickName : undefined,
      username: typeof username === 'string' ? username : undefined,
      isFrozen,
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
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
    pageCount,
    onPaginationChange,
    onColumnFiltersChange,
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
            columnId: 'isFrozen',
            title: '状态',
            options: [
              { label: '启用', value: 'false' },
              { label: '冻结', value: 'true' },
            ],
          },
          {
            columnId: 'role',
            title: 'Role',
            options: [
              { label: '管理员', value: 'admin' },
              { label: '用户', value: 'cashier' },
            ],
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
    </div>
  )
}
