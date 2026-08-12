import {
  ALLOWED_APPLICATION_FILE_TYPES,
  MAX_APPLICATION_FILE_SIZE,
} from '../constants/applicationFile'

/** BE가 MIME과 확장자를 모두 검사하므로 프론트도 같은 기준으로 미리 거른다 */
export function validateApplicationFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const allowedMimes = ALLOWED_APPLICATION_FILE_TYPES[ext]

  if (!allowedMimes) return '지원하지 않는 형식입니다. (pdf, jpg, png, webp, zip, mp4)'
  if (!allowedMimes.includes(file.type)) return '파일 형식이 확장자와 일치하지 않습니다.'
  if (file.size > MAX_APPLICATION_FILE_SIZE) return '파일당 최대 100MB까지 첨부할 수 있습니다.'

  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
