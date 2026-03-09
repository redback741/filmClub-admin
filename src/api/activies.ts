import { http } from '@/lib/request'

export type Activity = {
  id?: string
  title?: string
  description?: string
  [key: string]: unknown
}

export type ApiResponse<T> = {
  code: number
  data: T
  message?: string
}

export async function getActivities(params: Record<string, unknown>) {
  return http.get<ApiResponse<Activity[]>>('/activity/list', { params })
}
