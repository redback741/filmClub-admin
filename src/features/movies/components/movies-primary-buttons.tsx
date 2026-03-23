import { Button } from '@/components/ui/button'
import { useMovies } from './movies-provider'

export function MoviesPrimaryButtons() {
  const { setOpen } = useMovies()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>新增</span>
      </Button>
    </div>
  )
}
