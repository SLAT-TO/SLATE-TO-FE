import type { ApiCode, ApiResponse, ApiValidationError } from '../types/api'

export function ok<T>(result: T, message = '요청에 성공했습니다.'): ApiResponse<T> {
  return {
    isSuccess: true,
    code: 'COMMON200',
    message,
    result,
  }
}

export function created<T>(result: T, message = '생성에 성공했습니다.'): ApiResponse<T> {
  return {
    isSuccess: true,
    code: 'COMMON201',
    message,
    result,
  }
}

export function fail(
  code: ApiCode,
  message: string,
  result: null | { errors: ApiValidationError[] } = null,
): ApiResponse<null | { errors: ApiValidationError[] }> {
  return {
    isSuccess: false,
    code,
    message,
    result,
  }
}

export function statusOf(code: ApiCode): number {
  const match = code.match(/(\d{3})$/)
  if (match) return Number(match[1])
  return 500
}
