import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios'
import { ApiError, type ApiCode, type ApiResponse, type ApiValidationError } from '../types/api'
import { paths } from './paths'
import { navigate } from '../utils/navigation'

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// TODO(논의 필요): 현재 명세는 JSON accessToken + Bearer라 localStorage에 저장.
// XSS에 취약하므로 httpOnly 쿠키 세션이 더 나을 수 있음 — 백/명세 확정 후 재검토.
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
  // refreshToken HttpOnly 쿠키 송수신 (path=/api/v1/auth)
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 동시에 여러 요청이 401을 맞아도 리프레시는 한 번만 나가도록 진행 중인 요청을 공유
let refreshPromise: Promise<string> | null = null

/** POST /api/v1/auth/refresh — refreshToken은 HttpOnly 쿠키로 자동 전송, 본문 없음 */
async function refreshAccessToken(): Promise<string> {
  const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
    paths.auth.refresh,
    undefined,
    { withCredentials: true },
  )
  const accessToken = response.data.result.accessToken
  setAccessToken(accessToken)
  return accessToken
}

// 액세스 토큰 만료(401) 시 자동으로 재발급받아 원래 요청을 한 번 재시도.
// 리프레시 자체가 실패하면(리프레시 토큰도 만료) 로그인 페이지로 보낸다.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined
    if (!originalRequest || originalRequest.url === paths.auth.refresh || originalRequest._retry) {
      return Promise.reject(error)
    }
    originalRequest._retry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const accessToken = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient.request(originalRequest)
    } catch {
      setAccessToken(null)
      navigate('/login')
      return Promise.reject(error)
    }
  },
)

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

/** 바이너리(파일 다운로드) 응답 전용 — isSuccess 래핑 없이 그대로 내려오므로 request()와 분리 */
export async function requestBlob(config: AxiosRequestConfig): Promise<Blob> {
  try {
    const response = await apiClient.request<Blob>({ ...config, responseType: 'blob' })
    return response.data
  } catch (error) {
    if (isAxiosError(error)) {
      throw new ApiError('COMMON500', error.message || '파일을 다운로드하지 못했습니다.')
    }
    throw error
  }
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
