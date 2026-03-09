import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import dashboardDark from './assets/dashboard-dark.png'
import dashboardLight from './assets/dashboard-light.png'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn2() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-xl font-medium'>FilmClub Admin</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>登录</h2>
            <p className='text-sm text-muted-foreground'>
              请输入您的邮箱和密码以登录您的账号
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            点击登录，您同意我们的{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              服务条款
            </a>{' '}
            和{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              隐私政策
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-full overflow-hidden bg-muted max-lg:hidden',
          '[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none'
        )}
      >
        <img
          src={dashboardLight}
          className='dark:hidden'
          width={1024}
          height={1151}
          alt='FilmClub-Admin'
        />
        <img
          src={dashboardDark}
          className='hidden dark:block'
          width={1024}
          height={1138}
          alt='FilmClub-Admin'
        />
      </div>
    </div>
  )
}
