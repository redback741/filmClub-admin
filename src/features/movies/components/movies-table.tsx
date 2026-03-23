// 生成表格组件 仿照tasks-table‘
import type { Movie } from '@/api/movies'
import { useMemo, useState } from 'react'
import { cn, getPageNumbers } from '@/lib/utils'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function MoviesTable({ data = [] }: { data: Movie[] }) {
  const toCellText = (v: unknown) => {
    if (v == null) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    return ''
  }

  const toDateTimeText = (v: unknown) => {
    if (v == null) return ''
    const d =
      v instanceof Date
        ? v
        : typeof v === 'string' || typeof v === 'number'
          ? new Date(v)
          : null
    if (!d || Number.isNaN(d.getTime())) return ''

    const pad2 = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const MM = pad2(d.getMonth() + 1)
    const dd = pad2(d.getDate())
    const HH = pad2(d.getHours())
    const mm = pad2(d.getMinutes())
    const ss = pad2(d.getSeconds())
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
  }

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const totalRows = data.length
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
    return data.slice(start, end)
  }, [data, pageIndexClamped, pageSize])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <div className='overflow-auto rounded-md border'>
        <Table className='min-w-[960px] table-fixed'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[240px]'>电影名称</TableHead>
              <TableHead className='w-[140px]'>导演</TableHead>
              <TableHead className='w-[220px]'>演员</TableHead>
              <TableHead className='w-[180px]'>上映时间</TableHead>
              <TableHead className='w-[160px]'>海报</TableHead>
              <TableHead className='sticky right-0 w-[120px] bg-muted text-right'>
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((item, index) => (
                <TableRow key={String(item.id ?? item.movieId ?? index)}>
                  <TableCell>
                    <div className='truncate'>
                      {toCellText(item.movieName ?? item.name)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='truncate'>{toCellText(item.director)}</div>
                  </TableCell>
                  <TableCell>
                    <div className='truncate'>
                      {toCellText(item.actor ?? item.actors)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='truncate'>
                      {toDateTimeText(item.screeningTime) || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof item.posterUrl === 'string' && item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={toCellText(item.movieName)}
                        className='h-14 w-10 rounded object-cover'
                      />
                    ) : (
                      <div className='h-14 w-10 rounded bg-muted' />
                    )}
                  </TableCell>
                  <TableCell className='sticky right-0 bg-background text-right'>
                    <Button size='sm'>编辑</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  暂无数据
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
                  <span
                    key={`dots-${i}`}
                    className='px-1 text-sm text-muted-foreground'
                  >
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
