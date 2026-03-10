import { useMemo, useState } from 'react'
import { cn, getPageNumbers } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Task, taskSchema, ActivityStatus } from '../data/schema'
import { useTasks } from './tasks-provider'

type DataTableProps = {
  data: unknown[]
}

function formatValue(key: string, value: unknown): string {
  if (value == null) return ''
  if (key.endsWith('Time')) {
    if (value instanceof Date) return value.toLocaleString()
    if (typeof value === 'string' || typeof value === 'number') {
      const d = new Date(value)
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString()
    }
  }
  if (key === 'status') {
    if (typeof value === 'number') return statusText[value] ?? String(value)
    if (typeof value === 'string') {
      const n = Number(value)
      if (Number.isFinite(n)) return statusText[n] ?? String(value)
      return value
    }
    return String(value)
  }
  if (key === 'isDeleted') {
    if (typeof value === 'boolean') return value ? '是' : '否'
    if (typeof value === 'number') return value ? '是' : '否'
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase()
      if (v === 'true' || v === '1') return '是'
      if (v === 'false' || v === '0') return '否'
    }
    return String(value)
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return String(value)
}

const statusText: Record<number, string> = {
  [ActivityStatus.PENDING]: '待发布',
  [ActivityStatus.PUBLISHED]: '报名中',
  [ActivityStatus.ENDED]: '已结束',
}

export function TasksTable({ data }: DataTableProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const { setOpen, setCurrentRow } = useTasks()

  const getStatusCode = (value: unknown) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const n = Number(value)
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  const rows = useMemo<Task[]>(() => {
    return data.map((item) => {
      const parsed = taskSchema.safeParse(item)
      const src: Record<string, unknown> = parsed.success
        ? (parsed.data as unknown as Record<string, unknown>)
        : (item as Record<string, unknown>)

      let id = ''
      const idVal = src.id
      if (typeof idVal === 'string' || typeof idVal === 'number') {
        id = String(idVal)
      }

      const title =
        typeof src.title === 'string'
          ? src.title
          : typeof src.name === 'string'
            ? src.name
            : ''

      const rawStatus = src.status
      const statusCode = getStatusCode(rawStatus)

      return {
        ...(src as object),
        id,
        title,
        status: statusCode ?? rawStatus,
      } as unknown as Task
    })
  }, [data])

  const totalRows = rows.length
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageIndexClamped = Math.min(Math.max(0, pageIndex), pageCount - 1)
  const currentPage = Math.min(pageCount, Math.max(1, pageIndexClamped + 1))
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, pageCount),
    [currentPage, pageCount]
  )

  const pageRows = useMemo(() => {
    const start = pageIndexClamped * pageSize
    const end = start + pageSize
    return rows.slice(start, end)
  }, [pageIndexClamped, pageSize, rows])

  const columns: { key: keyof Task | string; label: string }[] = [
    { key: 'id', label: '编号' },
    { key: 'label', label: '标签' },
    // { key: 'priority', label: '优先级' },
    { key: 'name', label: '名称' },
    { key: 'type', label: '活动类型' },
    { key: 'hallType', label: '影厅类型' },
    { key: 'startTime', label: '活动开始时间' },
    { key: 'screeningTime', label: '放映开始时间' },
    { key: 'createTime', label: '创建时间' },
    { key: 'updateTime', label: '更新时间' },
    { key: 'movieName', label: '电影名称' },
    { key: 'posterUrl', label: '海报地址' },
    { key: 'city', label: '城市' },
    { key: 'address', label: '地址' },
    { key: 'recruiterName', label: '招募方名称' },
    { key: 'recruiterContact', label: '招募方联系方式' },
    { key: 'price', label: '价格' },
    { key: 'guests', label: '交流人员' },
    { key: 'benefitFree', label: '免费周边' },
    { key: 'benefitLottery', label: '抽奖礼品' },
    { key: 'registrationLink', label: '报名链接' },
    { key: 'feedbackLink', label: '反馈链接' },
    { key: 'maxRegistrations', label: '最大报名人数' },
    { key: 'currentRegistrations', label: '当前报名人数' },
    { key: 'isDeleted', label: '是否删除' },
    { key: 'status', label: '状态' },
    { key: '__actions__', label: '操作' },
  ]

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <div className='overflow-auto rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={String(c.key)}
                  className={c.key === '__actions__' ? 'text-right' : undefined}
                >
                  {c.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  {columns.map((c) => {
                    if (c.key === '__actions__') {
                      const isDeleted = !!row.isDeleted
                      const currentStatusCode = getStatusCode(
                        (row as Record<string, unknown>).status
                      )
                      const nextStatus =
                        currentStatusCode === ActivityStatus.PENDING
                          ? ActivityStatus.PUBLISHED
                          : currentStatusCode === ActivityStatus.PUBLISHED
                            ? ActivityStatus.ENDED
                            : null

                      return (
                        <TableCell
                          key={String(c.key)}
                          className='whitespace-nowrap text-right'
                        >
                          <div className='flex justify-end gap-2'>
                            {!isDeleted && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  setCurrentRow(row)
                                  setOpen('update')
                                }}
                              >
                                修改
                              </Button>
                            )}
                            {!isDeleted && (
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => {
                                  setCurrentRow(row)
                                  setOpen('delete')
                                }}
                              >
                                删除
                              </Button>
                            )}
                            <Button
                              size='sm'
                              variant='outline'
                              disabled={isDeleted || nextStatus == null}
                              onClick={() => {
                                setCurrentRow(row)
                                setOpen('status')
                              }}
                            >
                              {formatValue('status', currentStatusCode ?? row.status)}
                            </Button>
                          </div>
                        </TableCell>
                      )
                    }
                    const v = (row as Record<string, unknown>)[c.key as string]
                    return (
                      <TableCell key={String(c.key)}>
                        {formatValue(c.key as string, v)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between overflow-clip px-2'>
        <div className='flex items-center gap-2'>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const nextSize = Number(value)
              setPageSize(nextSize)
              setPageIndex(0)
            }}
          >
            <SelectTrigger className='h-8 w-[92px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size} / 页
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='text-sm text-muted-foreground'>
            共 {totalRows} 条，第 {currentPage} / {pageCount} 页
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            className='h-8 px-3'
            onClick={() => setPageIndex(0)}
            disabled={pageIndexClamped <= 0}
          >
            首页
          </Button>
          <Button
            variant='outline'
            className='h-8 px-3'
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndexClamped <= 0}
          >
            上一页
          </Button>

          <div className='flex items-center gap-1'>
            {pageNumbers.map((p, i) => {
              if (p === '...') {
                return (
                  <span key={`dots-${i}`} className='px-1 text-sm text-muted-foreground'>
                    ...
                  </span>
                )
              }
              const page = p as number
              const active = page === currentPage
              return (
                <Button
                  key={`page-${page}-${i}`}
                  variant={active ? 'default' : 'outline'}
                  className='h-8 min-w-8 px-2'
                  onClick={() => setPageIndex(page - 1)}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant='outline'
            className='h-8 px-3'
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageIndexClamped >= pageCount - 1}
          >
            下一页
          </Button>
          <Button
            variant='outline'
            className='h-8 px-3'
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndexClamped >= pageCount - 1}
          >
            末页
          </Button>
        </div>
      </div>
    </div>
  )
}
