import { request } from '@/lib/request'

export type EmailLoginParams = {
  email: string
  password: string
}
export type RegisterParams = {
  email: string
  password: string
  username: string
}

export async function emailLogin(params: EmailLoginParams) {
  return request.post('/user/email-login', params)
}

export async function getUserList(params: Record<string, unknown>) {
  return request.get('/user/list', { params })
}

export async function emailRegister(params: RegisterParams) {
  return request.post('/user/register', params)
}

export async function deleteUser(params: any) {
  return request.delete('/user/delete?id=' + params.id)
}
