import { http } from '@/lib/request'


export type ApiResponse<T> = {
  code: number
  data: T
  message?: string
}

export type Movie = {
  id: string
  movieName?: string
  posterUrl?: string
  screeningTime?: string
  actor?: string
  createTime?: string
  updateTime?: string
  director?: string
  [key: string]: unknown
}
export async function getMovies(params: Record<string, unknown>) {
  return http.get<ApiResponse<Movie[]>>('/movie/list', { params })
}
