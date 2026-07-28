'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type Movie, createMovie, updateMovie, searchTmdbMovies, getTmdbMovieDetail, getNowPlayingMovies, getUpcomingMovies, type TmdbMovieItem } from '@/api/movies'
import { uploadImageToOss } from '@/api/upload'
import { Search, Loader2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const formSchema = z.object({
  movieName: z.string().min(1, '请输入电影名称'),
  director: z.string().min(1, '请输入导演'),
  actor: z.string().min(1, '请输入演员'),
  screeningTime: z.string().min(1, '请输入上映时间'),
  posterUrl: z.string().min(1, '请上传海报图片'),
  shootingTime: z.string(),
  doubanRating: z
    .string()
    .optional()
    .refine((v) => {
      if (v == null) return true
      const s = v.trim()
      if (!s) return true
      return /^(10(\.0)?|[0-9](\.[0-9])?)$/.test(s)
    }, '请输入0-10分，最多1位小数'),
  overview: z.string().optional(),
})
type MovieForm = z.infer<typeof formSchema>

type MoviesActionDialogProps = {
  currentRow?: Movie
  open: boolean
  onOpenChange: (open: boolean) => void
}

const toDatetimeLocal = (v: unknown) => {
  if (!v) return ''
  const parse = (raw: string) => {
    const s = raw.trim()
    if (!s) return null
    const m1 = s.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
    )
    if (m1) {
      const yyyy = Number(m1[1])
      const MM = Number(m1[2])
      const dd = Number(m1[3])
      const HH = Number(m1[4])
      const mm = Number(m1[5])
      const ss = m1[6] ? Number(m1[6]) : 0
      const d = new Date(yyyy, MM - 1, dd, HH, mm, ss)
      if (!Number.isNaN(d.getTime())) return d
    }
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  const d =
    v instanceof Date
      ? v
      : typeof v === 'string'
        ? parse(v)
        : typeof v === 'number'
          ? new Date(v)
          : null
  if (!d || Number.isNaN(d.getTime())) return ''
  const pad2 = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  const HH = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`
}

const toBackendDateTime = (v: string | undefined) => {
  if (!v) return undefined
  const s = v.trim()
  if (!s) return undefined

  const m1 = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
  )
  const d = m1
    ? new Date(
        Number(m1[1]),
        Number(m1[2]) - 1,
        Number(m1[3]),
        Number(m1[4]),
        Number(m1[5]),
        m1[6] ? Number(m1[6]) : 0
      )
    : new Date(s)
  if (Number.isNaN(d.getTime())) return undefined

  const pad2 = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  const HH = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  const ss = pad2(d.getSeconds())
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
}

// Table 渲染函数（提取到组件外部好复用）
function renderMovieTable(
  movies: TmdbMovieItem[],
  loading: boolean,
  onSelect: (item: TmdbMovieItem) => void,
  renderPoster: (path?: string) => React.ReactNode
) {
  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <p className='text-muted-foreground py-12 text-center text-sm'>
        暂无数据
      </p>
    )
  }

  return (
    <div className='max-h-80 overflow-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-16'>海报</TableHead>
            <TableHead>电影名称</TableHead>
            <TableHead>简介</TableHead>
            <TableHead className='w-24'>上映日期</TableHead>
            <TableHead className='w-16'>评分</TableHead>
            <TableHead className='w-20'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{renderPoster(item.poster_path)}</TableCell>
              <TableCell className='max-w-48  truncate font-medium'>
                {item.title}
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className='max-w-58  line-clamp-2'>
                      {item.overview || '--'}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.overview || '--'}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className='max-w-48 font-medium'>
                {item.release_date || '未知'}
              </TableCell>
              <TableCell>
                {item.vote_average != null ? item.vote_average.toFixed(1) : '-'}
              </TableCell>
              <TableCell>
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  onClick={() => onSelect(item)}
                >
                  选择
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const isOkResponse = (res: unknown) => {
  if (!res || typeof res !== 'object') return false
  const code = (res as Record<string, unknown>).code
  return code === 200 || code === 201
}

export function MoviesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: MoviesActionDialogProps) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const posterInputRef = useRef<HTMLInputElement | null>(null)
  const form = useForm<MovieForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          movieName: currentRow.movieName ?? '',
          director: typeof currentRow.director === 'string' ? currentRow.director : '',
          actor: typeof currentRow.actor === 'string' ? currentRow.actor : '',
          screeningTime: toDatetimeLocal(currentRow.screeningTime),
          posterUrl: typeof currentRow.posterUrl === 'string' ? currentRow.posterUrl : '',
          shootingTime: toDatetimeLocal(currentRow.shootingTime),
          doubanRating: typeof currentRow.doubanRating === 'string' ? currentRow.doubanRating : '',
          overview: typeof currentRow.overview === 'string' ? currentRow.overview : '',
        }
      : {
          movieName: '',
          director: '',
          actor: '',
          screeningTime: '',
          posterUrl: '',
          shootingTime: '',
          doubanRating: '',
          overview: '',
        },
  })
  const posterUrl = form.watch('posterUrl')

  // TMDb 搜索弹窗状态
  const [tmdbDialogOpen, setTmdbDialogOpen] = useState(false)
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('')
  const [tmdbSearchResults, setTmdbSearchResults] = useState<TmdbMovieItem[]>([])
  const [isTmdbSearching, setIsTmdbSearching] = useState(false)
  const [tmdbActiveTab, setTmdbActiveTab] = useState('upcoming')

  // 正在上映 / 即将上映 数据
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TmdbMovieItem[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<TmdbMovieItem[]>([])
  const [isLoadingTab, setIsLoadingTab] = useState(false)
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set())

  const loadTabMovies = async (tab: string) => {
    if (loadedTabs.has(tab)) return
    setIsLoadingTab(true)
    try {
      if (tab === 'now-playing') {
        const res = await getNowPlayingMovies()
        const results = Array.isArray(res?.data) ? res.data : []
        setNowPlayingMovies(results)
      } else {
        const res = await getUpcomingMovies()
        const results = Array.isArray(res?.data) ? res.data : []
        setUpcomingMovies(results)
      }
      setLoadedTabs((prev) => new Set(prev).add(tab))
    } catch {
      toast.error('加载失败，请稍后重试')
    } finally {
      setIsLoadingTab(false)
    }
  }

  // 弹窗打开时默认加载即将上映
  const handleTmdbDialogOpen = (open: boolean) => {
    setTmdbDialogOpen(open)
    if (open) {
      setTmdbActiveTab('upcoming')
      setTmdbSearchQuery('')
      setTmdbSearchResults([])
      setLoadedTabs(new Set())
      // 延迟到下一帧加载，确保 dialog 已渲染
      setTimeout(() => loadTabMovies('upcoming'), 0)
    }
  }

  const handleTabChange = (value: string) => {
    setTmdbActiveTab(value)
    loadTabMovies(value)
  }

  const handleTmdbSearch = async () => {
    const q = tmdbSearchQuery.trim()
    if (!q) {
      setTmdbSearchResults([])
      return
    }
    setIsTmdbSearching(true)
    try {
      const res = await searchTmdbMovies(q)
      const results = Array.isArray(res?.data) ? res.data : []
      setTmdbSearchResults(results)
    } catch {
      toast.error('搜索失败，请稍后重试')
    } finally {
      setIsTmdbSearching(false)
    }
  }

  const handleClearSearch = () => {
    setTmdbSearchQuery('')
    setTmdbSearchResults([])
  }

  const isSearchActive = tmdbSearchResults.length > 0

  const handleTmdbSelect = async (item: TmdbMovieItem) => {
    try {
      const res = await getTmdbMovieDetail(item.id)
      const detail = res?.data
      if (!detail) {
        toast.error('获取电影详情失败')
        return
      }

      const posterUrl =
        detail.poster_path
          ? detail.poster_path.startsWith('http')
            ? detail.poster_path
            : `https://image.tmdb.org/t/p/w500${detail.poster_path}`
          : ''

      const director =
        detail.credits?.crew
          ?.filter((c) => c.job === 'Director')
          .map((c) => c.name)
          .join('、') ?? ''

      const actor =
        detail.credits?.cast
          ?.slice(0, 5)
          .map((c) => c.name)
          .join('、') ?? ''

      const screeningTime = detail.release_date ? `${detail.release_date}T00:00` : ''

      form.setValue('movieName', detail.title ?? '')
      form.setValue('director', director)
      form.setValue('actor', actor)
      if (screeningTime) form.setValue('screeningTime', screeningTime)
      if (posterUrl) form.setValue('posterUrl', posterUrl)
      if (detail.vote_average != null) {
        form.setValue('doubanRating', String(detail.vote_average))
      }
      if (detail.overview) {
        form.setValue('overview', detail.overview)
      }

      setTmdbDialogOpen(false)
      toast.success('已填入电影信息')
    } catch {
      toast.error('获取详情失败')
    }
  }

  const renderTmdbPoster = (path?: string) => {
    if (!path) return <div className='bg-muted flex h-12 w-8 items-center justify-center rounded text-xs text-muted-foreground'>无图</div>
    const src = path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w92${path}`
    return <img src={src} className='h-12 w-8 rounded object-cover' />
  }

  const handlePosterUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    setIsUploadingPoster(true)
    try {
      const url = await uploadImageToOss(file)
      onChange(url)
      toast.success('海报上传成功')
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : '海报上传失败'
      toast.error(message)
    } finally {
      setIsUploadingPoster(false)
    }
  }

  const onSubmit = (values: MovieForm) => {
    const payload = {
      movieName: values.movieName,
      director: values.director?.trim() ? values.director.trim() : undefined,
      actor: values.actor?.trim() ? values.actor.trim() : undefined,
      posterUrl: values.posterUrl?.trim() ? values.posterUrl.trim() : undefined,
      screeningTime: toBackendDateTime(values.screeningTime),
      shootingTime: toBackendDateTime(values.shootingTime),
      doubanRating: values.doubanRating?.trim() ? values.doubanRating.trim() : undefined,
      overview: values.overview?.trim() ? values.overview.trim() : undefined,
    }

    toast.promise(isEdit ? updateMovie(payload, currentRow.id) : createMovie(payload), {
      loading: isEdit ? '更新中...' : '创建中...',
      success: (res) => {
        if (isOkResponse(res)) {
          queryClient.invalidateQueries({ queryKey: ['movieName'] })
          form.reset()
          onOpenChange(false)
          return isEdit ? '更新成功' : '创建成功'
        }
        return isEdit ? '更新失败' : '创建失败'
      },
      error: () => (isEdit ? '更新失败' : '创建失败'),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑电影' : '创建电影'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新电影信息' : '创建新电影'}，点击确定后提交。
          </DialogDescription>
        </DialogHeader>

        <Button
          type='button'
          variant='outline'
          className='mb-2 w-full'
          onClick={() => handleTmdbDialogOpen(true)}
        >
          <Search className='mr-2 h-4 w-4' />
          从 TMDb 搜索电影信息
        </Button>

        <div className='w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='movie-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='movieName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电影名称</FormLabel>
                    <FormControl>
                      <Input placeholder='请输入电影名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='overview'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>简介</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='请输入电影简介'
                        className='resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='director'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>导演</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入导演' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='actor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>演员</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入演员' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='screeningTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上映时间</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              


              <FormField
                control={form.control}
                name='shootingTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>拍摄时间</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='doubanRating'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>豆瓣评分</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='请输入豆瓣评分'
                        type='number'
                        inputMode='decimal'
                        min={0}
                        max={10}
                        step={0.1}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name='posterUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>海报图片</FormLabel>
                    <div className='space-y-3'>
                      <input
                        ref={posterInputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(event) =>
                          void handlePosterUpload(event, field.onChange)
                        }
                      />
                      <div className='flex flex-wrap gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => posterInputRef.current?.click()}
                          disabled={isUploadingPoster}
                        >
                          {isUploadingPoster ? '上传中...' : '上传图片'}
                        </Button>
                        {field.value?.trim() ? (
                          <Button
                            type='button'
                            variant='ghost'
                            onClick={() => field.onChange('')}
                            disabled={isUploadingPoster}
                          >
                            清空图片
                          </Button>
                        ) : null}
                      </div>
                      <FormControl>
                        <Input
                          readOnly
                          value={field.value ?? ''}
                          placeholder='上传成功后自动保存图片地址'
                        />
                      </FormControl>
                      {posterUrl?.trim() ? (
                        <div className='space-y-2 rounded-md border p-3'>
                          <img
                            src={posterUrl}
                            alt={form.getValues('movieName') || '电影海报'}
                            className='h-40 w-auto rounded-md border object-cover'
                          />
                          <p className='text-muted-foreground break-all text-xs'>
                            {posterUrl}
                          </p>
                        </div>
                      ) : (
                        <p className='text-muted-foreground text-sm'>
                          支持上传 jpg、png、webp 等图片，上传成功后自动回填海报地址。
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='movie-form' disabled={isUploadingPoster}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* TMDb 搜索弹窗 */}
      <Dialog open={tmdbDialogOpen} onOpenChange={handleTmdbDialogOpen}>
        <DialogContent className='sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle>TMDb 搜索电影</DialogTitle>
            <DialogDescription>
              通过 TMDb 搜索电影信息，点击"选择"自动填入表单。
            </DialogDescription>
          </DialogHeader>

          {/* 搜索栏 */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Input
                placeholder='输入电影名称搜索...'
                value={tmdbSearchQuery}
                onChange={(e) => {
                  setTmdbSearchQuery(e.target.value)
                  if (e.target.value === '') setTmdbSearchResults([])
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTmdbSearch()
                }}
              />
              {isSearchActive && (
                <button
                  type='button'
                  onClick={handleClearSearch}
                  className='text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 text-xs'
                >
                  清除
                </button>
              )}
            </div>
            <Button
              type='button'
              onClick={handleTmdbSearch}
              disabled={isTmdbSearching}
            >
              {isTmdbSearching ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                '搜索'
              )}
            </Button>
          </div>

          {/* Tabs + 表格 */}
          {!isSearchActive ? (
            <Tabs value={tmdbActiveTab} onValueChange={handleTabChange}>
              <TabsList className='w-full'>
                <TabsTrigger value='now-playing' className='flex-1'>
                  正在上映
                </TabsTrigger>
                <TabsTrigger value='upcoming' className='flex-1'>
                  即将上映
                </TabsTrigger>
              </TabsList>

              <TabsContent value='now-playing' className='mt-0'>
                {renderMovieTable(
                  nowPlayingMovies,
                  isLoadingTab && tmdbActiveTab === 'now-playing',
                  handleTmdbSelect,
                  renderTmdbPoster
                )}
              </TabsContent>
              <TabsContent value='upcoming' className='mt-0'>
                {renderMovieTable(
                  upcomingMovies,
                  isLoadingTab && tmdbActiveTab === 'upcoming',
                  handleTmdbSelect,
                  renderTmdbPoster
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  搜索结果（{tmdbSearchResults.length}）
                </span>
              </div>
              {renderMovieTable(
                tmdbSearchResults,
                isTmdbSearching,
                handleTmdbSelect,
                renderTmdbPoster
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
