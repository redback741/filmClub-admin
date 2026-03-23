import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
// import { tasks } from './data/tasks'
import { getMovies, type Movie } from '@/api/movies'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MoviesProvider } from './components/movies-provider'
import { MoviesTable } from './components/movies-table'
import { MoviesPrimaryButtons } from './components/movies-primary-buttons'
import { MoviesDialogs } from './components/movies-dialogs'

export function Movies() {
  const [name, setName] = useState('')
  const [keyword, setKeyword] = useState('')
  const queryClient = useQueryClient()
  // 使用 React Query 进行数据请求，避免开发模式下 StrictMode 导致 useEffect 调用两次
  const { data: movies = [] } = useQuery<Movie[]>({
    queryKey: ['movieName', name],
    queryFn: async () => {
      const params = name.trim() ? { movieName: name.trim() } : {}
      const res = await getMovies(params)
      const list = Array.isArray(res.data) ? res.data : []
      return list.map((raw, index) => {
        const r = raw as Record<string, unknown>
        const id = String(r.id ?? r.movieId ?? index)
        return { ...raw, id }
      })
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: import.meta.env.PROD,
  })

  const handleReset = () => {
    setKeyword('')
    setName('')
    queryClient.invalidateQueries({ queryKey: ['movieName'] })
  }

  return (
    <MoviesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>电影列表</h2>
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
              placeholder='搜索电影名'
              className='w-60'
            />
            <Button onClick={() => setName(keyword.trim())}>搜索</Button>
            {/* 重置 刷新*/}
            <Button onClick={handleReset}>重置</Button>
            <MoviesPrimaryButtons />
          </div>
        </div>
        <MoviesTable data={movies} />
      </Main>

      <MoviesDialogs />
    </MoviesProvider>
  )
}
