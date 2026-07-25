export type CommonSuccessCode = 'COMMON200' | 'COMMON201'

export type CommonErrorCode =
  | 'COMMON400'
  | 'COMMON401'
  | 'COMMON403'
  | 'COMMON404'
  | 'COMMON405'
  | 'COMMON409'
  | 'COMMON500'

/** BE AuthErrorCode */
export type AuthErrorCode = 'AUTH401'

/** BE UserErrorCode */
export type UserErrorCode = 'ONBOARDING409'

/** BE ProjectErrorCode */
export type ProjectErrorCode =
  | 'PROJECT400'
  | 'PROJECT403'
  | 'PROJECT404'
  | 'PROJECT409'
  | 'PROJECT_ADMIN403'
  | 'PROJECT_MEMBER404'
  | 'PROJECT_MEMBER409'
  | 'PROJECT_INVITATION404'
  | 'PROJECT_INVITATION409'
  | 'PROJECT_INVITATION_EXPIRED400'
  | 'PROJECT_NOTICE404'
  | 'PROJECT_FILE404'
  | 'PROJECT_FILE_EMPTY400'
  | 'PROJECT_FILE_INVALID_TYPE400'
  | 'PROJECT_FILE_SIZE400'

export type ApiCode =
  | CommonSuccessCode
  | CommonErrorCode
  | AuthErrorCode
  | UserErrorCode
  | ProjectErrorCode
  | (string & {})

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
