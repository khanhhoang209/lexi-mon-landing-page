export interface ApiResponse<T = unknown> {
  succeeded: boolean
  status: number
  message?: string
  data?: T
}

export interface PaginatedResponse<T> {
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: T[]
}

