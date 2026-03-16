import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
// import { tasks } from './data/tasks'
import { getActivities } from '@/api/activies'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'



export function Tasks() {
  const [name, setName] = useState('')
  const [keyword, setKeyword] = useState('')
  // 使用 React Query 进行数据请求，避免开发模式下 StrictMode 导致 useEffect 调用两次
  const { data: _activities = [] } = useQuery<unknown[]>({
    queryKey: ['activities', name],
    queryFn: async () => {
      const params = name.trim() ? { name: name.trim() } : {}
      const res = await getActivities(params)
      const list = res.data
      return list.length ? list : []
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: import.meta.env.PROD,
  })

  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>活动列表</h2>
            <p className='text-muted-foreground'>
              {/* Here&apos;s a list of your tasks for this month! */}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setName(keyword.trim())
                }
              }}
              placeholder='搜索活动名'
              className='w-60'
            />
            <Button onClick={() => setName(keyword.trim())}>搜索</Button>
            <TasksPrimaryButtons />
          </div>
        </div>
        <TasksTable data={_activities} />
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
