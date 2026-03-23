'use client'

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
import { type Movie, createMovie, updateMovie } from '@/api/movies'

const formSchema = z.object({
  movieName: z.string().min(1, '请输入电影名称'),
  director: z.string().optional(),
  actor: z.string().optional(),
  screeningTime: z.string().optional(),
  posterUrl: z.string().optional(),
  shootingTime: z.string().optional(),
  doubanRating: z
    .string()
    .optional()
    .refine((v) => {
      if (v == null) return true
      const s = v.trim()
      if (!s) return true
      return /^(10(\.0)?|[0-9](\.[0-9])?)$/.test(s)
    }, '请输入0-10分，最多1位小数'),
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
        }
      : {
          movieName: '',
          director: '',
          actor: '',
          screeningTime: '',
          posterUrl: '',
          shootingTime: '',
          doubanRating: '',
        },
  })

  const onSubmit = (values: MovieForm) => {
    const payload = {
      movieName: values.movieName,
      director: values.director?.trim() ? values.director.trim() : undefined,
      actor: values.actor?.trim() ? values.actor.trim() : undefined,
      posterUrl: values.posterUrl?.trim() ? values.posterUrl.trim() : undefined,
      screeningTime: toBackendDateTime(values.screeningTime),
      shootingTime: toBackendDateTime(values.shootingTime),
      doubanRating: values.doubanRating?.trim() ? values.doubanRating.trim() : undefined,
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑电影' : '创建电影'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新电影信息' : '创建新电影'}，点击确定后提交。
          </DialogDescription>
        </DialogHeader>

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
                    <FormLabel>海报地址</FormLabel>
                    <FormControl>
                      <Input placeholder='请输入海报链接' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='movie-form'>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
