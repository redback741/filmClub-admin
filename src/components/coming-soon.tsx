import { Telescope } from 'lucide-react'

export function ComingSoon() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='text-4xl leading-tight font-bold'>功能完善中</h1>
        <p className='text-center text-muted-foreground'>
          该页面还未创建完成。 <br />
          敬请期待！
        </p>
      </div>
    </div>
  )
}
