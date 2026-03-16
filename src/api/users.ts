import { request } from '@/lib/request'

export type EmailLoginParams = {
  email: string
  password: string
}

export async function emailLogin(params: EmailLoginParams) {
  return request.post('/user/email-login', params)
}

export async function getUserList(params: Record<string, unknown>) {
  return request.get('/user/list', { params })
}
