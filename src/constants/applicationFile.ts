export const MAX_APPLICATION_FILES = 10
export const MAX_APPLICATION_FILE_SIZE = 100 * 1024 * 1024

/** 확장자 → 허용 MIME. BE가 둘 다 검사하므로 프론트도 같은 기준으로 거른다 */
export const ALLOWED_APPLICATION_FILE_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  zip: ['application/zip', 'application/x-zip-compressed'],
  mp4: ['video/mp4'],
}
