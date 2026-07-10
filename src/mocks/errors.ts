import { HttpResponse } from 'msw'
import { fail, statusOf } from './response'

export function unauthorized() {
  const body = fail('COMMON401', '인증이 필요합니다.')
  return HttpResponse.json(body, { status: statusOf('COMMON401') })
}

export function notFound(message = '요청한 리소스를 찾을 수 없습니다.') {
  const body = fail('COMMON404', message)
  return HttpResponse.json(body, { status: statusOf('COMMON404') })
}

export function badRequest(message = '요청 값이 올바르지 않습니다.') {
  const body = fail('COMMON400', message)
  return HttpResponse.json(body, { status: statusOf('COMMON400') })
}

export function conflict(message = '요청이 현재 상태와 충돌합니다.') {
  const body = fail('COMMON409', message)
  return HttpResponse.json(body, { status: statusOf('COMMON409') })
}

export function forbidden(message = '접근 권한이 없습니다.') {
  const body = fail('COMMON403', message)
  return HttpResponse.json(body, { status: statusOf('COMMON403') })
}
