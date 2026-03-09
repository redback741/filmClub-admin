import { useEffect, useMemo, useState } from 'react'
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
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  return String(value)
}

const statusText: Record<number, string> = {
  [ActivityStatus.PENDING]: 'backlog',
  [ActivityStatus.PUBLISHED]: 'in progress',
  [ActivityStatus.ENDED]: 'done',
}

export function TasksTable({ data }: DataTableProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

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

      let status = ''
      const rawStatus = src.status
      if (typeof rawStatus === 'number') {
        status = statusText[rawStatus] ?? String(rawStatus)
      } else if (typeof rawStatus === 'string') {
        status = rawStatus
      }

      return {
        ...(src as object),
        id,
        title,
        status,
      } as unknown as Task
    })
  }, [data])

  const totalRows = rows.length
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  const currentPage = Math.min(pageCount, Math.max(1, pageIndex + 1))
  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, pageCount),
    [currentPage, pageCount]
  )

  useEffect(() => {
    if (pageIndex > pageCount - 1) setPageIndex(0)
  }, [pageCount, pageIndex])

  const pageRows = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return rows.slice(start, end)
  }, [pageIndex, pageSize, rows])

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
  ]

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <div className='overflow-auto rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={String(c.key)}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  {columns.map((c) => {
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
            disabled={pageIndex <= 0}
          >
            首页
          </Button>
          <Button
            variant='outline'
            className='h-8 px-3'
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex <= 0}
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
            disabled={pageIndex >= pageCount - 1}
          >
            下一页
          </Button>
          <Button
            variant='outline'
            className='h-8 px-3'
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            末页
          </Button>
        </div>
      </div>
    </div>
  )
}
