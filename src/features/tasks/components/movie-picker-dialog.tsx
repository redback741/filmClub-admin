import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMovies, type Movie } from '@/api/movies'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type MoviePickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (movie: Movie) => void
}

export function MoviePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: MoviePickerDialogProps) {
  const [keyword, setKeyword] = useState('')
  const params = useMemo(() => {
    const movieName = keyword.trim()
    return movieName ? { movieName } : {}
  }, [keyword])

  const { data: movies = [], isFetching } = useQuery<Movie[]>({
    queryKey: ['movie-picker', params],
    enabled: open,
    queryFn: async () => {
      const res = await getMovies(params)
      return Array.isArray(res.data) ? res.data : []
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: import.meta.env.PROD,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>选择电影</DialogTitle>
          <DialogDescription>
            搜索并选择一条电影数据，自动回填活动中的电影信息。
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2'>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder='搜索电影名'
            className='w-72'
          />
          <div className='text-sm text-muted-foreground'>
            {isFetching ? '加载中...' : `共 ${movies.length} 条`}
          </div>
        </div>

        <div className='overflow-auto rounded-md border'>
          <Table className='min-w-[860px] table-fixed'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[80px]'>编号</TableHead>
                <TableHead className='w-[220px]'>电影名称</TableHead>
                <TableHead className='w-[140px]'>导演</TableHead>
                <TableHead className='w-[220px]'>演员</TableHead>
                <TableHead className='w-[100px]'>豆瓣评分</TableHead>
                <TableHead className='w-[140px] text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.length ? (
                movies.map((m, index) => (
                  <TableRow key={String(m.id ?? index)}>
                    <TableCell>
                      <div className='truncate'>{String(m.id ?? '')}</div>
                    </TableCell>
                    <TableCell>
                      <div className='truncate'>{m.movieName ?? '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className='truncate'>
                        {typeof m.director === 'string' ? m.director : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='truncate'>
                        {typeof m.actor === 'string' ? m.actor : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='truncate'>
                        {typeof m.doubanRating === 'string' ? m.doubanRating : '-'}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        size='sm'
                        onClick={() => {
                          onSelect(m)
                          onOpenChange(false)
                        }}
                      >
                        选择
                      </Button>
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

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
