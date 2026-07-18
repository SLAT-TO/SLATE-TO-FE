export type CommonSuccessCode = 'COMMON200' | 'COMMON201'

export type CommonErrorCode =
  'COMMON400' | 'COMMON401' | 'COMMON403' | 'COMMON404' | 'COMMON405' | 'COMMON409' | 'COMMON500'

export type DomainErrorCode = 'PROJECT409' | 'INVITE400' | 'FILE400' | 'ONBOARDING409'

export type ApiCode = CommonSuccessCode | CommonErrorCode | DomainErrorCode | (string & {})

export type ApiValidationError = {
  field: string
  reason: string
}

export type ApiResponse<T> = {
  isSuccess: boolean
  code: ApiCode
  message: string
  result: T
}

export class ApiError extends Error {
  readonly code: ApiCode
  readonly errors?: ApiValidationError[]

  constructor(code: ApiCode, message: string, errors?: ApiValidationError[]) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.errors = errors
  }
}
