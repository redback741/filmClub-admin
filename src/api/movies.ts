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
  shootingTime?: string
  createTime?: string
  updateTime?: string
  director?: string
  doubanRating?: string
  [key: string]: unknown
}
export async function getMovies(params: Record<string, unknown>) {
  return http.get<ApiResponse<Movie[]>>('/movie/list', { params })
}

export type MovieUpsert = Omit<Movie, 'id'> & { id?: string }

export async function createMovie(data: MovieUpsert) {
  return http.post<ApiResponse<Movie>>('/movie/create', data)
}

export async function updateMovie(data: MovieUpsert, id: string) {
  return http.post<ApiResponse<Movie>>('/movie/update?id=' + id, data)
}
