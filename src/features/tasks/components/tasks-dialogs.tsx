import { ConfirmDialog } from '@/components/confirm-dialog'
import { TasksImportDialog } from './tasks-import-dialog'
import { TasksMutateDrawer } from './tasks-mutate-drawer'
import { useTasks } from './tasks-provider'
import { deleteActivity, updateActivityStatus } from '@/api/activies'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ActivityStatus } from '../data/schema'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks()
  const queryClient = useQueryClient()

  const getStatusCode = (value: unknown) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const n = Number(value)
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  const currentStatusCode = getStatusCode(currentRow?.status)
  const nextStatus =
    currentStatusCode === ActivityStatus.PENDING
      ? ActivityStatus.PUBLISHED
      : currentStatusCode === ActivityStatus.PUBLISHED
        ? ActivityStatus.ENDED
        : null

  const statusText: Record<number, string> = {
    [ActivityStatus.PENDING]: '待发布',
    [ActivityStatus.PUBLISHED]: '报名中',
    [ActivityStatus.ENDED]: '已结束',
  }

  return (
    <>
      <TasksMutateDrawer
        key='task-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              const id = String(currentRow.id ?? '')
              toast.promise(deleteActivity(id), {
                loading: '删除中...',
                success: (res) => {
                  if ([200, 204].includes(res.code)) {
                    queryClient.invalidateQueries({ queryKey: ['activities'] })
                    setOpen(null)
                    setTimeout(() => {
                      setCurrentRow(null)
                    }, 500)
                    return '删除成功'
                  }
                  return '删除失败'
                },
                error: () => '删除失败',
              })
            }}
            className='max-w-md'
            title={`删除活动: ${currentRow.name} ?`}
            desc={
              <>
                你确定要删除活动 <strong>{currentRow.name}</strong> 吗？ <br />
                这个操作不能撤销。
              </>
            }
            confirmText='删除'
            cancelBtnText='取消'
          />

          <ConfirmDialog
            key='task-status'
            open={open === 'status'}
            onOpenChange={() => {
              setOpen('status')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            disabled={!!currentRow.isDeleted || nextStatus == null}
            handleConfirm={() => {
              const id = Number(currentRow.id ?? '')
              if (!id || nextStatus == null) return

              toast.promise(updateActivityStatus(id, nextStatus), {
                loading: '更新中...',
                success: (res) => {
                  if (res.code === 200 || res.code === 201) {
                    queryClient.invalidateQueries({ queryKey: ['activities'] })
                    setOpen(null)
                    setTimeout(() => {
                      setCurrentRow(null)
                    }, 500)
                    return `已更新为：${statusText[nextStatus]}`
                  }
                  return '更新失败'
                },
                error: () => '更新失败',
              })
            }}
            className='max-w-md'
            title='更新活动状态'
            desc={
              <>
                当前状态：<strong>{statusText[currentStatusCode ?? -1] ?? '未知'}</strong>
                <br />
                将更新为：<strong>{nextStatus == null ? '不可更新' : statusText[nextStatus]}</strong>
              </>
            }
            confirmText='确认更新'
            cancelBtnText='取消'
          />
        </>
      )}
    </>
  )
}
