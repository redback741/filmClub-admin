import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { createActivity, type Activity, updateActivity} from '@/api/activies'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Task, ActivityType, HallType } from '../data/schema'

const cityOptions = [
  { label: '北京', value: 'Beijing' },
  { label: '上海', value: 'Shanghai' },
  { label: '广州', value: 'Guangzhou' },
  { label: '深圳', value: 'Shenzhen' },
  { label: '杭州', value: 'Hangzhou' },
  { label: '成都', value: 'Chengdu' },
  { label: '武汉', value: 'Wuhan' },
  { label: '南京', value: 'Nanjing' },
  { label: '西安', value: "Xi'an" },
  { label: '重庆', value: 'Chongqing' },
  { label: '天津', value: 'Tianjin' },
  { label: '苏州', value: 'Suzhou' },
]

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

type ActivityForm = {
  name: string
  type: string
  director: string
  actor: string
  shootingTime: string
  doubanRating: string
  hallType: string
  startTime: Date
  screeningTime: Date
  city: string
  address: string
  movieName: string
  posterUrl?: string
  price: number
  recruiterName: string
  recruiterContact?: string
  benefitFree?: string
  benefitLottery?: string
  registrationLink?: string
  feedbackLink?: string
  maxRegistrations: number
  currentRegistrations: number
  guests?: string
}

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow
  const queryClient = useQueryClient()

  const coerceEnumNumber = (value: string, fallback: number) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
  }

  const toOptionalString = (value: string | undefined) => {
    const v = value?.trim()
    return v ? v : undefined
  }

  const form = useForm<ActivityForm>({
    defaultValues: {
      name: currentRow?.name ?? '',
      type:
        (typeof currentRow?.type === 'number'
          ? String(currentRow.type)
          : (currentRow?.type as string)) ?? `${ActivityType.KOUBEI}`,
      hallType:
        (typeof currentRow?.hallType === 'number'
          ? String(currentRow.hallType)
          : (currentRow?.hallType as string)) ?? `${HallType.STANDARD}`,
      startTime:
        (typeof currentRow?.startTime === 'string'
          ? new Date(currentRow.startTime)
          : (currentRow?.startTime as Date)) || new Date(),
      screeningTime:
        (typeof currentRow?.screeningTime === 'string'
          ? new Date(currentRow.screeningTime)
          : (currentRow?.screeningTime as Date)) || new Date(),
      city: currentRow?.city ?? '',
      address: currentRow?.address ?? '',
      movieName: currentRow?.movieName ?? '',
      director: currentRow?.director ?? '',
      actor: currentRow?.actor ?? '',
      shootingTime: currentRow?.shootingTime ?? '',
      doubanRating: currentRow?.doubanRating ?? '',
      posterUrl: currentRow?.posterUrl ?? '',
      price:
        typeof currentRow?.price === 'number'
          ? currentRow.price
          : Number(currentRow?.price ?? 0),
      recruiterName: currentRow?.recruiterName ?? '',
      recruiterContact: currentRow?.recruiterContact ?? '',
      benefitFree: currentRow?.benefitFree ?? '',
      benefitLottery: currentRow?.benefitLottery ?? '',
      registrationLink: currentRow?.registrationLink ?? '',
      feedbackLink: currentRow?.feedbackLink ?? '',
      maxRegistrations:
        typeof currentRow?.maxRegistrations === 'number'
          ? currentRow.maxRegistrations
          : Number(currentRow?.maxRegistrations ?? 0),
      currentRegistrations:
        typeof currentRow?.currentRegistrations === 'number'
          ? currentRow.currentRegistrations
          : Number(currentRow?.currentRegistrations ?? 0),
      guests:
        (currentRow as unknown as { guests?: string } | undefined)?.guests ?? '',
    },
  })

  const onSubmit = (data: ActivityForm) => {
    // if (isUpdate) {
    //   onOpenChange(false)
    //   form.reset()
    // }

    // 新增的电影字段
    const payload: Activity = {
      name: data.name,
      type: coerceEnumNumber(data.type, ActivityType.KOUBEI),
      hallType: coerceEnumNumber(data.hallType, HallType.STANDARD),
      startTime: data.startTime,
      screeningTime: data.screeningTime,
      city: data.city,
      address: data.address,
      movieName: data.movieName,
      posterUrl: toOptionalString(data.posterUrl),
      price: data.price,
      recruiterName: data.recruiterName,
      recruiterContact: toOptionalString(data.recruiterContact),
      benefitFree: toOptionalString(data.benefitFree),
      benefitLottery: toOptionalString(data.benefitLottery),
      registrationLink: toOptionalString(data.registrationLink),
      feedbackLink: toOptionalString(data.feedbackLink),
      maxRegistrations: data.maxRegistrations,
      currentRegistrations: data.currentRegistrations,
      director: data.director,
      actor: data.actor,
      shootingTime: data.shootingTime,
      doubanRating: data.doubanRating,
      guests: toOptionalString(data.guests),
    }
    // 增加更新活动相关逻辑
    if (isUpdate) {
      payload.id = currentRow.id
      toast.promise(updateActivity(payload), {
        loading: '更新中...',
        success: (res) => {
          if (res.code === 200 || res.code === 201) {
            queryClient.invalidateQueries({ queryKey: ['activities'] })
            onOpenChange(false)
            form.reset()
            showSubmittedData(data, '已更新活动：')
            return '更新成功'
          }
          return '更新失败'
        },
        error: () => {
          return '更新失败'
        },
      })
      return
    }

    toast.promise(createActivity(payload), {
      loading: '创建中...',
      success: (res) => {
        if (res.code === 200 || res.code === 201) {
          queryClient.invalidateQueries({ queryKey: ['activities'] })
          onOpenChange(false)
          form.reset()
          showSubmittedData(data, '已创建活动：')
          return '创建成功'
        }
        return '创建失败'
      },
      error: () => {
        return '创建失败'
      },
    })


  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <DialogContent className='flex max-h-[80vh] flex-col sm:max-w-4xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isUpdate ? '更新活动' : '创建活动'}</DialogTitle>
          <DialogDescription>
            {isUpdate ? '更新活动信息' : '添加新活动'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto pr-1'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>活动名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入活动名称' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>活动类型</FormLabel>
                    <SelectDropdown
                      defaultValue={`${field.value}`}
                      onValueChange={field.onChange}
                      placeholder='请选择活动类型'
                      items={[
                        { label: '口碑场', value: `${ActivityType.KOUBEI}` },
                        { label: '粉丝专场', value: `${ActivityType.FANS}` },
                        { label: '路演场', value: `${ActivityType.ROADSHOW}` },
                        { label: '首映礼', value: `${ActivityType.PREMIERE}` },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hallType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>影厅类型</FormLabel>
                    <SelectDropdown
                      defaultValue={`${field.value}`}
                      onValueChange={field.onChange}
                      placeholder='请选择影厅类型'
                      items={[
                        { label: '普通厅', value: `${HallType.STANDARD}` },
                        { label: 'IMAX', value: `${HallType.IMAX}` },
                        { label: '杜比', value: `${HallType.DOLBY}` },
                        { label: 'CINITY', value: `${HallType.CINITY}` },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='startTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>活动开始时间</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='screeningTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>放映开始时间</FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>城市</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择城市'
                        className='w-full'
                        items={cityOptions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地址</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入地址' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='movieName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电影名称</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入电影名称' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='director'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>导演</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入导演' />
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
                      <Input {...field} placeholder='请输入演员' />
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
                      <Input {...field} placeholder='请输入拍摄时间(年份)' />
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
                      <Input {...field} placeholder='请输入豆瓣评分' />
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
                      <Input {...field} placeholder='请输入海报链接' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>价格</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder='0 表示免费'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='guests'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>交流人员</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入交流人员名单' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='recruiterName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>招募方名称</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入招募方名称' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='recruiterContact'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>招募方联系方式</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入联系方式' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='benefitFree'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>免费周边</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入免费周边' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='benefitLottery'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>抽奖礼品</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入抽奖礼品' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='registrationLink'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>报名链接</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入报名链接' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='feedbackLink'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>反馈链接</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入反馈链接' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='maxRegistrations'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大报名人数</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder='0 表示无限制'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='currentRegistrations'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>当前报名人数</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>取消</Button>
          </DialogClose>
          <Button form='tasks-form' type='submit'>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
