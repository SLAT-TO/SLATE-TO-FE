import axios, { type AxiosRequestConfig, isAxiosError } from 'axios'
import { ApiError, type ApiCode, type ApiResponse, type ApiValidationError } from '../types/api'

const ACCESS_TOKEN_KEY = 'slate_access_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string | null): void {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function toApiError(payload: { code?: ApiCode; message?: string; result?: unknown }): ApiError {
  const result = payload.result
  const errors =
    result &&
    typeof result === 'object' &&
    'errors' in result &&
    Array.isArray((result as { errors: ApiValidationError[] }).errors)
      ? (result as { errors: ApiValidationError[] }).errors
      : undefined

  return new ApiError(
    payload.code ?? 'COMMON500',
    payload.message ?? '요청 처리 중 오류가 발생했습니다.',
    errors,
  )
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config)
    const body = response.data

    if (body == null || typeof body !== 'object' || !('isSuccess' in body)) {
      return body as T
    }

    if (!body.isSuccess) {
      throw toApiError(body)
    }

    return body.result
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (isAxiosError(error)) {
      const data = error.response?.data as ApiResponse<unknown> | undefined
      if (data && typeof data === 'object' && 'isSuccess' in data) {
        throw toApiError(data)
      }
      throw new ApiError('COMMON500', error.message || '네트워크 오류가 발생했습니다.')
    }

    throw error
  }
}
