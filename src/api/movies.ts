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
  overview?: string
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

// ---------- TMDb ----------

export type TmdbMovieItem = {
  id: number
  title: string
  poster_path?: string
  release_date?: string
  overview?: string
  vote_average?: number
}

export type TmdbMovieDetail = {
  id: number
  title: string
  poster_path?: string
  release_date?: string
  overview?: string
  vote_average?: number
  runtime?: number
  genres?: { id: number; name: string }[]
  credits?: {
    cast?: { name: string; character?: string }[]
    crew?: { name: string; job: string }[]
  }
}

export type TmdbSearchResult = {
  page: number
  results: TmdbMovieItem[]
  total_pages: number
  total_results: number
}

/** TMDb 搜索电影 */
export async function searchTmdbMovies(query: string, page = 1) {
  return http.get<ApiResponse<TmdbMovieItem[]>>('/movie/tmdb/search', {
    params: { query, page },
  })
}

/** TMDb 获取电影详情 */
export async function getTmdbMovieDetail(movieId: number) {
  return http.get<ApiResponse<TmdbMovieDetail>>('/movie/tmdb/detail', {
    params: { movieId },
  })
}

/** TMDb 正在上映 */
export async function getNowPlayingMovies(region = 'CN') {
  return http.get<ApiResponse<TmdbMovieItem[]>>('/movie/tmdb/now-playing', {
    params: { region },
  })
}

/** TMDb 即将上映 */
export async function getUpcomingMovies(region = 'CN') {
  return http.get<ApiResponse<TmdbMovieItem[]>>('/movie/tmdb/upcoming', {
    params: { region },
  })
}


