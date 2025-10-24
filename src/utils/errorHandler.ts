/**
 * Utility functions để xử lý lỗi network và server
 */

export interface ErrorInfo {
  message: string
  isRetryable: boolean
  statusCode?: number
  errorType: 'network' | 'server' | 'client' | 'unknown'
}

/**
 * Phân tích lỗi và trả về thông tin chi tiết
 */
export const analyzeError = (error: unknown): ErrorInfo => {
  // Lỗi network cơ bản
  if (error instanceof Error) {
    if (error.message.includes('Network') || error.message.includes('timeout')) {
      return {
        message: 'Kết nối mạng không ổn định, vui lòng kiểm tra và thử lại.',
        isRetryable: true,
        errorType: 'network'
      }
    }
  }

  // Lỗi từ axios
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: { message?: string }
      }
      code?: string
    }

    const status = axiosError.response?.status
    const serverMessage = axiosError.response?.data?.message

    // Lỗi server (5xx)
    if (status && status >= 500) {
      const messages: Record<number, string> = {
        500: 'Lỗi server nội bộ, vui lòng thử lại sau.',
        502: 'Server đang bận (Bad Gateway), vui lòng thử lại sau ít phút.',
        503: 'Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau.',
        504: 'Server phản hồi quá chậm (Gateway Timeout), vui lòng thử lại.'
      }

      return {
        message: serverMessage || messages[status] || 'Server đang gặp sự cố, vui lòng thử lại sau.',
        isRetryable: true,
        statusCode: status,
        errorType: 'server'
      }
    }

    // Lỗi client (4xx)
    if (status && status >= 400 && status < 500) {
      const messages: Record<number, string> = {
        400: 'Yêu cầu không hợp lệ.',
        401: 'Bạn cần đăng nhập để thực hiện thao tác này.',
        403: 'Bạn không có quyền thực hiện thao tác này.',
        404: 'Không tìm thấy tài nguyên.',
        409: 'Xung đột dữ liệu.',
        422: 'Dữ liệu không hợp lệ.'
      }

      return {
        message: serverMessage || messages[status] || 'Yêu cầu không thành công.',
        isRetryable: false,
        statusCode: status,
        errorType: 'client'
      }
    }

    // Lỗi network code
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
      return {
        message: 'Không thể kết nối đến server, vui lòng kiểm tra kết nối mạng.',
        isRetryable: true,
        errorType: 'network'
      }
    }
  }

  // Lỗi không xác định
  return {
    message: 'Đã xảy ra lỗi không xác định, vui lòng thử lại.',
    isRetryable: false,
    errorType: 'unknown'
  }
}

/**
 * Kiểm tra xem lỗi có thể retry được không
 */
export const isRetryableError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status

    // Retry cho các lỗi server 5xx
    if (status && status >= 500 && status < 600) {
      return true
    }

    // Retry cho network errors
    const code = (error as { code?: string }).code
    if (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || code === 'ETIMEDOUT') {
      return true
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return true
    }
  }

  return false
}

/**
 * Lấy user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  return analyzeError(error).message
}

/**
 * Retry function với exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: unknown) => void
  } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options

  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error

      // Kiểm tra xem có nên retry không
      if (!isRetryableError(error) || attempt === maxRetries - 1) {
        throw error
      }

      // Tính delay với exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)

      // Callback trước khi retry
      if (onRetry) {
        onRetry(attempt + 1, error)
      }

      console.log(`Retrying after ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)

      // Chờ trước khi retry
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
