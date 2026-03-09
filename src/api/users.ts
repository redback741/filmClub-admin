import { request } from '@/lib/request'

export async function emailLogin(params: Record<string, any>) {
  return request.post('/user/email-login', params)
}
