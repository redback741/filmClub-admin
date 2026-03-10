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
  return http.get<ApiResponse<unknown[]>>('/activity/list', { params })
}

export async function createActivity(data: Activity) {
  return http.post<ApiResponse<Activity>>('/activity/create', data)
}
export async function deleteActivity(id: string) {
  return http.delete<ApiResponse<Activity>>('/activity/delete', {
    params: { id },
  })
}

export async function updateActivity(data: Activity) {
  return http.post<ApiResponse<Activity>>('/activity/update', data)
}
export async function updateActivityStatus(
  id: number,
  status: number
) {
  return http.post<ApiResponse<Activity>>('/activity/update-status', {
    id: id,
    status: status,
  })
}
